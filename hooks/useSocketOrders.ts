import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getSocket, OrderUpdatedEvent } from '@/lib/socket';

/**
 * Custom hook for real-time order updates via Socket.IO
 * 
 * @param initialOrders - Initial orders array from API
 * @returns Updated orders array that automatically syncs with Socket.IO events
 */
export const useSocketOrders = (initialOrders: any[] = []) => {
    const { data: session, status } = useSession();
    const [orders, setOrders] = useState<any[]>(initialOrders);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        setOrders(initialOrders);
    }, [initialOrders]);

    useEffect(() => {
        // Wait for session to load
        if (status === 'loading') return;

        // If no session, potentially don't connect or connect anonymously?
        // User requested auth_token, so we assume auth is needed.
        // We pass session data if available.
        const token = session?.user?.auth_token;
        const userId = session?.user?.id;

        // console.log('👤 Socket Session Data (from DB):', {
        //     auth_token: token,
        //     id: userId
        // });

        const socket = getSocket(token, userId);

        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        // Check initial state
        if (socket.connected) {
            setIsConnected(true);
        }

        const handleOrderUpdate = (data: OrderUpdatedEvent | any) => {
            console.log('📡 Received order update:', data);
            const updatedOrder = data.order || data;
            const action = data.action || 'updated';

            setOrders((prevOrders) => {
                if (action === 'deleted') {
                    return prevOrders.filter(
                        (order) => order._id !== updatedOrder._id && order.order_number !== updatedOrder.order_number
                    );
                } else if (action === 'created') {
                    const exists = prevOrders.some(
                        (order) => order._id === updatedOrder._id || order.order_number === updatedOrder.order_number
                    );
                    if (exists) {
                        return prevOrders.map((order) =>
                            order._id === updatedOrder._id || order.order_number === updatedOrder.order_number
                                ? { ...order, ...updatedOrder }
                                : order
                        );
                    }
                    return [...prevOrders, updatedOrder];
                } else {
                    return prevOrders.map((order) =>
                        order._id === updatedOrder._id || order.order_number === updatedOrder.order_number
                            ? { ...order, ...updatedOrder }
                            : order
                    );
                }
            });
        };

        socket.on('orderUpdated', handleOrderUpdate);
        socket.on('order:updated', handleOrderUpdate);
        socket.on('order_updated', handleOrderUpdate);
        socket.on('updateOrder', handleOrderUpdate);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('orderUpdated', handleOrderUpdate);
            socket.off('order:updated', handleOrderUpdate);
            socket.off('order_updated', handleOrderUpdate);
            socket.off('updateOrder', handleOrderUpdate);
        };
    }, [session, status]);

    return { orders, isConnected };
};

export default useSocketOrders;
