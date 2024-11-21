import React from 'react';
import { useSelector } from 'react-redux';

const CustomersTab = () => {
    const customers = useSelector(state => state.invoice.customers);

    return (
        <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded">
                <thead>
                    <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Customer Name</th>
                        <th className="py-3 px-6 text-left">Phone Number</th>
                        <th className="py-3 px-6 text-left">Total Purchase Amount</th>
                        <th className="py-3 px-6 text-left">Number of Invoices</th>
                    </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                    {customers.map((customer, index) => (
                        customer && (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left">{customer.name}</td>
                                <td className="py-3 px-6 text-left">{customer.phoneNumber}</td>
                                <td className="py-3 px-6 text-left">{customer.totalPurchaseAmount}</td>
                                <td className="py-3 px-6 text-left">{customer.invoiceCount}</td>
                            </tr>
                        )
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CustomersTab;