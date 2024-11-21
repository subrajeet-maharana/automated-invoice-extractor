import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import * as xlsx from 'xlsx/xlsx';
import fs from 'fs/promises';
import path from 'path';

class GeminiFileExtractor {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('Gemini API key is required');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.fileManager = new GoogleAIFileManager(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
        });
    }

    async uploadToGemini(file) {
        try {
            const tempFilePath = path.join(process.cwd(), 'temp', file.name);

            await fs.writeFile(tempFilePath, Buffer.from(await file.arrayBuffer()));

            const uploadResult = await this.fileManager.uploadFile(tempFilePath, {
                mimeType: file.type,
                displayName: file.name,
            });

            await fs.unlink(tempFilePath);

            console.log(`Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.name}`);
            return uploadResult.file;

        } catch (uploadError) {
            console.error("Error uploading file:", uploadError);
            throw uploadError;
        }
    }

    async waitForFilesActive(files) {
        console.log("Waiting for file processing...");
        for (const name of files.map((file) => file.name)) {
            let file = await this.fileManager.getFile(name);
            while (file.state === "PROCESSING") {
                process.stdout.write(".")
                await new Promise((resolve) => setTimeout(resolve, 10_000));
                file = await this.fileManager.getFile(name)
            }
            if (file.state !== "ACTIVE") {
                throw Error(`File ${file.name} failed to process`);
            }
        }
        console.log("...all files ready\n");
    }

    async extractFromPDF(file) {
        const uploadedFile = await this.uploadToGemini(file);
        await this.waitForFilesActive([uploadedFile]);

        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
        };

        const chatSession = this.model.startChat({
            generationConfig,
            history: [
                {
                    role: "user",
                    parts: [
                        {
                            fileData: {
                                mimeType: uploadedFile.mimeType,
                                fileUri: uploadedFile.uri,
                            },
                        },
                        {
                            text: "Extract structured data from this PDF document:\n" +
                                "- **Invoice Details:** Invoice Number, Invoice Date, Customer Name, Customer Address, Billing Address, Shipping Address, Payment Terms, Total Amount\n" +
                                "- **Product Details:** name, quantity, unit_price, total_price\n" +
                                "- **Customer Details:** Customer Name, Customer ID, Customer Email, Customer Phone Number\n" +
                                "\nReturn the data in this format: { invoices: [], products: [], customers: [] }"
                        },
                    ],
                },
            ],
        });

        const result = await chatSession.sendMessage("Extract data from the uploaded PDF");
        console.log("Extracted PDF data:", result.response.text());
        const extractedData = JSON.parse(result.response.text());

        return {
            invoices: extractedData.invoices || extractedData["Invoice Details"] ? [extractedData["Invoice Details"]] : [],
            products: extractedData.products || extractedData["Product Details"] || [],
            customers: extractedData.customers || extractedData["Customer Details"] ? [extractedData["Customer Details"]] : []
        };
    }

    async extractFromExcel(file) {
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        const uploadedFile = await this.uploadToGemini(file);
        await this.waitForFilesActive([uploadedFile]);

        const chatSession = this.model.startChat({
            history: [
                {
                    role: "user",
                    parts: [
                        { text: JSON.stringify(data) },
                        {
                            text: "Analyze this data and structure it into invoices, products, and customers. " +
                                "Return in the format: { invoices: [], products: [], customers: [] }"
                        },
                    ],
                },
            ],
        });

        const result = await chatSession.sendMessage("Structure this data");
        const extractedData = JSON.parse(result.response.text());

        return {
            invoices: extractedData.invoices || [],
            products: extractedData.products || [],
            customers: extractedData.customers || []
        };
    }

    async extractFromImage(file) {
        const uploadedFile = await this.uploadToGemini(file);
        await this.waitForFilesActive([uploadedFile]);

        const chatSession = this.model.startChat({
            history: [
                {
                    role: "user",
                    parts: [
                        {
                            fileData: {
                                mimeType: uploadedFile.mimeType,
                                fileUri: uploadedFile.uri,
                            },
                        },
                        {
                            text: "Extract structured data from this image:\n" +
                                "- Look for invoice details, product information, and customer data\n" +
                                "Return the data in this format: { invoices: [], products: [], customers: [] }"
                        },
                    ],
                },
            ],
        });

        const result = await chatSession.sendMessage("Extract data from the uploaded image");
        const extractedData = JSON.parse(result.response.text());

        return {
            invoices: extractedData.invoices || [],
            products: extractedData.products || [],
            customers: extractedData.customers || []
        };
    }

    async extractDataFromFile(file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();

        switch (fileExtension) {
            case 'xlsx':
            case 'xls':
                return this.extractFromExcel(file);
            case 'pdf':
                return this.extractFromPDF(file);
            case 'png':
            case 'jpg':
            case 'jpeg':
                return this.extractFromImage(file);
            default:
                throw new Error('Unsupported file type');
        }
    }
}

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const apiKey = formData.get('apiKey');

        if (!file || !apiKey) {
            throw new Error('File and API key are required');
        }
        console.log(`Extracting data from file: ${file.name} and API key is: ${apiKey}`);
        const extractor = new GeminiFileExtractor(apiKey);
        const result = await extractor.extractDataFromFile(file);

        return new NextResponse(JSON.stringify({ success: true, data: result }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new NextResponse(JSON.stringify({ success: false, error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
