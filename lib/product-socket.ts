import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://api.dev.accolaplay.id';
let productSocket: Socket | null = null;

export const getProductSocket = (token?: string, userId?: string): Socket => {
    if (!productSocket) {
        productSocket = io(SOCKET_URL, {
            path: '/v2/kafe/dashboard/socket.io',
            transports: ['polling', 'websocket'],
            extraHeaders: {
                'client': 'KafeMonitor-Product',
                'platform': 'web',
                'user-id': userId || ''
            },
            auth: {
                token: token || '',
                userId: userId || ''
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
        });

        productSocket.on('connect', () => {
            // console.log('✅ Product Socket connected:', productSocket?.id);
        });

        productSocket.on('disconnect', (reason) => {
            // console.log('❌ Product Socket disconnected:', reason);
        });

        productSocket.on('connect_error', (error) => {
            // console.error('⚠️ Product Socket connection error:', error);
        });
    } else if (token || userId) {
        // Update auth if provided and different
        const currentAuth = productSocket.auth as any;
        if (currentAuth.token !== token || currentAuth.userId !== userId) {
            productSocket.auth = {
                token: token || currentAuth.token || '',
                userId: userId || currentAuth.userId || ''
            };
            
            if (token && productSocket.connected) {
                productSocket.disconnect().connect();
            }
        }
    }

    return productSocket;
};

export const disconnectProductSocket = () => {
    if (productSocket) {
        productSocket.disconnect();
        productSocket = null;
    }
};

export default getProductSocket;
