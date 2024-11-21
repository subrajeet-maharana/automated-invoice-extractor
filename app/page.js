"use client";

import React, { useState } from 'react';
import { Provider } from 'react-redux';
import store from '@/redux/store';
import FileUploader from '@/components/FileUploader';
import InvoicesTab from '@/components/InvoicesTab';
import ProductsTab from '@/components/ProductsTab';
import CustomersTab from '@/components/CustomersTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState('invoices');

  const tabs = [
    { key: 'invoices', label: 'Invoices' },
    { key: 'products', label: 'Products' },
    { key: 'customers', label: 'Customers' }
  ];

  return (
    <Provider store={store}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Swipe Invoice Management</h1>

        <FileUploader />

        <div className="flex mb-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`px-4 py-2 mr-2 ${activeTab === tab.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
                }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'invoices' && <InvoicesTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'customers' && <CustomersTab />}
      </div>
    </Provider>
  );
}
