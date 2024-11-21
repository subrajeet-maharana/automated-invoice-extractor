import React from 'react';
import { useSelector } from 'react-redux';

const ProductsTab = () => {
    const products = useSelector(state => state.invoice.products);

    return (
        <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded">
                <thead>
                    <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Name</th>
                        <th className="py-3 px-6 text-left">Quantity</th>
                        <th className="py-3 px-6 text-left">Unit Price</th>
                        <th className="py-3 px-6 text-left">Tax</th>
                        <th className="py-3 px-6 text-left">Price with Tax</th>
                        <th className="py-3 px-6 text-left">Discount</th>
                    </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                    {products.map((product, index) => (
                        product && (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left">{product.name}</td>
                                <td className="py-3 px-6 text-left">{product.quantity}</td>
                                <td className="py-3 px-6 text-left">{product.unitPrice}</td>
                                <td className="py-3 px-6 text-left">{product.tax}</td>
                                <td className="py-3 px-6 text-left">{product.priceWithTax}</td>
                                <td className="py-3 px-6 text-left">{product.discount || 'N/A'}</td>
                            </tr>
                        )
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductsTab;