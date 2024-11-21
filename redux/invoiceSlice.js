import { createSlice } from '@reduxjs/toolkit';

const invoiceSlice = createSlice({
    name: 'invoice',
    initialState: {
        invoices: [],
        products: [],
        customers: []
    },
    reducers: {
        addInvoices: (state, action) => {
            state.invoices = [...state.invoices, ...action.payload];
        },
        addProducts: (state, action) => {
            state.products = [...state.products, ...action.payload];
        },
        addCustomers: (state, action) => {
            state.customers = [...state.customers, ...action.payload];
        },
        updateProduct: (state, action) => {
            const index = state.products.findIndex(
                product => product.name === action.payload.name
            );
            if (index !== -1) {
                state.products[index] = action.payload;

                // Sync changes with invoices
                state.invoices = state.invoices.map(invoice =>
                    invoice.productName === action.payload.name
                        ? { ...invoice, productName: action.payload.name }
                        : invoice
                );
            }
        }
    }
});

export const {
    addInvoices,
    addProducts,
    addCustomers,
    updateProduct
} = invoiceSlice.actions;

export default invoiceSlice.reducer;