import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    addCustomers,
    addInvoices,
    addProducts
} from '../redux/invoiceSlice.js';

const FileUploader = () => {
    const [error, setError] = useState(null);
    const dispatch = useDispatch();

    const extractFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('apiKey', "");
        console.log(`The API KEY from FileUploader UI is: ${process.env.GEMINI_API_KEY}`)
        const response = await fetch('/api/geminiFileExtractor', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        console.log(data);
        if (data.success) {
            const { invoices, products, customers } = data.data;
            dispatch(addInvoices(invoices));
            dispatch(addProducts(products));
            dispatch(addCustomers(customers));
            setError(null);
        } else {
            setError('Error processing file. Please try again.');
            console.error('Error:', data.error);
        }
    };

    const handleFileUpload = async (event) => {
        const uploadedFile = event.target.files[0];
        try {
            await extractFile(uploadedFile);
        } catch (err) {
            setError('Error processing file. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="mb-4">
            <input
                type="file"
                accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="w-full p-2 border rounded"
            />
            {error && (
                <div className="text-red-500 mt-2">{error}</div>
            )}
        </div>
    );
};

export default FileUploader;
