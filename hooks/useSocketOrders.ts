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
            console.log('🔌 Admin Hook: Connected to socket', socket.id);
            setIsConnected(true);
        }

        function onDisconnect() {
            console.log('❌ Admin Hook: Disconnected');
            setIsConnected(false);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        // Check initial state
        if (socket.connected) {
            console.log('🔌 Admin Hook: Already connected', socket.id);
            setIsConnected(true);
        }

        const handleOrderUpdate = (data: OrderUpdatedEvent | any) => {
            console.log('📡 Admin Hook: Received order update event', data);

            if (!data) return;

            // Handle both wrapped { order: ... } and direct order object
            const updatedOrder = data.order || data;

            // Determine action: if explicitly provided, use it. 
            // If it's the 'order_created' event, treat as 'created' if action missing.
            let action = data.action;
            if (!action) {
                // We'll trust the logic below to determine if it's a new order
                action = 'updated';
            }

            console.log(`📝 Admin Hook: Processing order ${updatedOrder.order_number} as ${action}`);

            setOrders((prevOrders) => {
                if (action === 'deleted') {
                    return prevOrders.filter(
                        (order) => order._id !== updatedOrder._id && order.order_number !== updatedOrder.order_number
                    );
                }

                // For created OR updated, try to find existing first
                const exists = prevOrders.some(
                    (order) => (updatedOrder._id && order._id === updatedOrder._id) ||
                        (updatedOrder.order_number && order.order_number === updatedOrder.order_number)
                );

                if (exists) {
                    return prevOrders.map((order) =>
                        (updatedOrder._id && order._id === updatedOrder._id) ||
                            (updatedOrder.order_number && order.order_number === updatedOrder.order_number)
                            ? { ...order, ...updatedOrder }
                            : order
                    );
                }

                // If it doesn't exist, and it's 'created' or 'updated' (with actual data), add it
                if (action === 'created' || action === 'updated') {
                    console.log(`✨ Admin Hook: Adding NEW order ${updatedOrder.order_number} to list`);
                    return [...prevOrders, updatedOrder];
                }

                return prevOrders;
            });
        };

        socket.on('orderUpdated', handleOrderUpdate);
        socket.on('order:updated', handleOrderUpdate);
        socket.on('order_updated', handleOrderUpdate);
        socket.on('order_created', handleOrderUpdate);
        socket.on('updateOrder', handleOrderUpdate);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('orderUpdated', handleOrderUpdate);
            socket.off('order:updated', handleOrderUpdate);
            socket.off('order_updated', handleOrderUpdate);
            socket.off('order_created', handleOrderUpdate);
            socket.off('updateOrder', handleOrderUpdate);
        };
    }, [session, status]);

    return { orders, isConnected };
};

export default useSocketOrders;
