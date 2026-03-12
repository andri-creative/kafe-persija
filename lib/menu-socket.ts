// lib/menu-socket.ts
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
let menuSocket: Socket | null = null;

export const getMenuSocket = (token?: string, userId?: string): Socket => {
    if (!menuSocket) {
        menuSocket = io(SOCKET_URL, {
            path: '/socket.io',
            transports: ['polling', 'websocket'],
            extraHeaders: {
                'client': 'KafeMonitor-Menu',
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

        menuSocket.on('connect', () => {
            console.log('✅ Menu Socket connected:', menuSocket?.id);
        });

        menuSocket.on('disconnect', (reason) => {
            console.log('❌ Menu Socket disconnected:', reason);
        });

        menuSocket.on('connect_error', (error) => {
            console.error('⚠️ Menu Socket connection error:', error);
        });
    } else if (token || userId) {
        const currentAuth = menuSocket.auth as any;
        if (currentAuth.token !== token || currentAuth.userId !== userId) {
            menuSocket.auth = {
                token: token || currentAuth.token || '',
                userId: userId || currentAuth.userId || ''
            };

            if (token && menuSocket.connected) {
                menuSocket.disconnect().connect();
            }
        }
    }

    return menuSocket;
};

export const disconnectMenuSocket = () => {
    if (menuSocket) {
        menuSocket.disconnect();
        menuSocket = null;
    }
};

export default getMenuSocket;
