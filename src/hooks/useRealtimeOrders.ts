import { useState, useEffect, useCallback } from 'react';
import { OrderService } from '@/firebase/firestore';
import { auth } from '@/firebase/config';
import { authService } from '@/firebase/auth';

export interface Order {
  id: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status:
    | 'pending'
    | 'processing'
    | 'on_the_way'
    | 'delivered'
    | 'awaiting_confirmation'
    | 'confirmed';
  createdAt: string;
  deliveryAddress: string;
  customerConfirmed?: boolean;
}

function toIso(v: unknown): string {
  if (v == null) return new Date().toISOString();
  if (typeof v === 'string') return v;
  if (
    typeof v === 'object' &&
    v !== null &&
    'toDate' in v &&
    typeof (v as { toDate: () => Date }).toDate === 'function'
  ) {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

function normalizeStatus(raw: string | undefined): Order['status'] {
  const s = (raw || 'pending').toLowerCase().replace(/\s+/g, '_');
  if (s === 'preparing' || s === 'cooking') return 'processing';
  if (s === 'pending') return 'pending';
  if (s === 'processing') return 'processing';
  if (s === 'on_the_way' || s === 'on-the-way') return 'on_the_way';
  if (s === 'delivered') return 'delivered';
  if (s === 'awaiting_confirmation') return 'awaiting_confirmation';
  if (s === 'confirmed') return 'confirmed';
  return 'pending';
}

function docToOrder(doc: Record<string, unknown>): Order {
  const id = String(doc.id ?? '');
  const address =
    (doc.deliveryAddress as string) || (doc.address as string) || '';
  return {
    id,
    customerName: (doc.customerName as string) || 'Guest',
    items: (doc.items as Order['items']) || [],
    total: Number(doc.total) || 0,
    status: normalizeStatus(doc.status as string),
    createdAt: toIso(doc.createdAt),
    deliveryAddress: address,
    customerConfirmed: doc.customerConfirmed === true,
  };
}

export const useRealtimeOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const unsub = OrderService.subscribe((data) => {
      setOrders(data.map((d) => docToOrder(d as Record<string, unknown>)));
    });
    return () => unsub();
  }, []);

  const addOrder = useCallback(async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const user = auth.currentUser;
    const payload = {
      ...orderData,
      customerName: orderData.customerName || user?.displayName || 'Guest',
      customerEmail: user?.email || '',
      userId: user?.uid || null,
      deliveryAddress: orderData.deliveryAddress,
      items: orderData.items,
      total: orderData.total,
      status: orderData.status || 'pending',
    };
    const result = await OrderService.create(payload);
    if (!result.success) {
      console.error('Failed to create order', result.error);
      throw new Error('Failed to create order');
    }
    if (user) {
      try {
        await authService.updateCustomerStats(user.uid, orderData.total);
      } catch (e) {
        console.warn('updateCustomerStats failed', e);
      }
    }
    return {
      ...orderData,
      id: result.id as string,
      createdAt: new Date().toISOString(),
    } as Order;
  }, []);

  const updateStatus = useCallback(async (orderId: string, newStatus: Order['status']) => {
    const r = await OrderService.update(orderId, { status: newStatus });
    return r.success;
  }, []);

  const confirmDelivery = useCallback(async (orderId: string) => {
    const r = await OrderService.update(orderId, {
      customerConfirmed: true,
      status: 'delivered',
    });
    return r.success;
  }, []);

  return {
    orders,
    addOrder,
    updateStatus,
    confirmDelivery,
  };
};

export const useAdminOrders = () => {
  const { orders, updateStatus, confirmDelivery } = useRealtimeOrders();

  return {
    orders,
    updateStatus,
    confirmDelivery,
  };
};

export const useCustomerOrders = (customerName?: string) => {
  const { orders, confirmDelivery } = useRealtimeOrders();

  const customerOrders = customerName
    ? orders.filter((order) => order.customerName === customerName)
    : orders;

  const confirmOrderDelivery = async (orderId: string) => {
    const success = await confirmDelivery(orderId);
    if (success) {
      console.log(`Customer confirmed delivery for order ${orderId}`);
    }
    return success;
  };

  return {
    orders: customerOrders,
    confirmDelivery: confirmOrderDelivery,
  };
};
