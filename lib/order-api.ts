import axios from 'axios';

// const BASE_URL = 'https://api.dev.accolaplay.id/v2/kafe/dashboard';

const BASE_URL = process.env.NEXT_PUBLIC_API_ORDERS;

const orderApi = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

export const getOrders = async () => {
    const response = await orderApi.get('/orders');
    return response.data;
};

export const updateOrderStatus = async (payload: { order_number: string; [key: string]: any }) => {
    const response = await orderApi.put('/orders', payload);
    return response.data;
};

export default orderApi;
