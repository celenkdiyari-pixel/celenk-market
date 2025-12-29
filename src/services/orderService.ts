import { Order, OrderStatus } from '@/types';

const API_BASE = '/api/orders';

interface OrdersResponse {
    orders: Order[];
    total: number;
}

export const OrderService = {
    // Tüm siparişleri getir
    async getAllOrders(statusFilter?: string, search?: string): Promise<Order[]> {
        const params = new URLSearchParams();
        if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
        if (search) params.append('search', search);

        const res = await fetch(`${API_BASE}?${params.toString()}`);
        if (!res.ok) throw new Error('Siparişler getirilemedi.');

        const data = await res.json();
        // Backend { orders: [...] } dönüyor, bazen direkt array dönebilir, kontrol et
        return data.orders || [];
    },

    // Tekil sipariş getir
    async getOrderById(id: string): Promise<Order | null> {
        const res = await fetch(`${API_BASE}/${id}`);
        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error('Sipariş detayı alınamadı.');
        }
        const data = await res.json();
        return data.order || data;
    },

    // Sipariş durumu güncelle
    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, updatedAt: new Date().toISOString() }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Güncelleme başarısız.');
        }

        const data = await res.json();
        return data.order;
    },

    // Sipariş sil
    async deleteOrder(id: string): Promise<void> {
        const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Silme işlemi başarısız.');
        }
    },

    // Tümünü sil (DİKKAT)
    async deleteAll(): Promise<void> {
        const res = await fetch(`${API_BASE}?action=deleteAll`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Toplu silme başarısız.');
    }
};
