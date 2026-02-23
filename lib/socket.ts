import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://api.dev.accolaplay.id';
let socket: Socket | null = null;

export const getSocket = (token?: string, userId?: string): Socket => {
    if (!socket) {
        // console.log('🔌 Initializing Socket with Query Params:', {
        //     auth: token,
        //     'user-id': userId
        // });

        socket = io(SOCKET_URL, {
            path: '/v2/kafe/dashboard/socket.io',
            transports: ['polling', 'websocket'],
            extraHeaders: {
                'client': 'KafeMonitor',
                'platform': 'web',
                // 'auth': token || '',
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



        socket.on('order_updated', (data: OrderUpdatedEvent) => {
            // console.log('✅ Socket.IO connected:', socket?.id);
        });

        socket.on('disconnect', (reason) => {
            // console.log('❌ Socket.IO disconnected:', reason);
        });

        socket.on('connect_error', (error) => {

        });

        socket.on('reconnect', (attemptNumber) => {
            // console.log('🔄 Socket.IO reconnected after', attemptNumber, 'attempts');
        });
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export interface OrderUpdatedEvent {
    order: any;
    action: 'created' | 'updated' | 'deleted';
}

export default getSocket;
