import React from 'react';
import { useSelector } from 'react-redux';

const InvoicesTab = () => {
    const invoices = useSelector(state => state.invoice.invoices);

    return (
        <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded">
                <thead>
                    <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Serial Number</th>
                        <th className="py-3 px-6 text-left">Customer Name</th>
                        <th className="py-3 px-6 text-left">Product Name</th>
                        <th className="py-3 px-6 text-left">Quantity</th>
                        <th className="py-3 px-6 text-left">Tax</th>
                        <th className="py-3 px-6 text-left">Total Amount</th>
                        <th className="py-3 px-6 text-left">Date</th>
                    </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                    {invoices.map((invoice, index) => (
                        invoice && (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left">{invoice.serialNumber}</td>
                                <td className="py-3 px-6 text-left">{invoice.customerName}</td>
                                <td className="py-3 px-6 text-left">{invoice.productName}</td>
                                <td className="py-3 px-6 text-left">{invoice.quantity}</td>
                                <td className="py-3 px-6 text-left">{invoice.tax}</td>
                                <td className="py-3 px-6 text-left">{invoice.totalAmount}</td>
                                <td className="py-3 px-6 text-left">{invoice.date}</td>
                            </tr>
                        )
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InvoicesTab;