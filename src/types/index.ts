import { OrderStatus, PaymentMethod } from '@/lib/constants';
export type { OrderStatus, PaymentMethod };

// Temel Müşteri Bilgisi
export interface CustomerInfo {
    firstName: string;
    lastName: string;
    name?: string; // Bazı eski kayıtlarda olabilir
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        district: string;
        postalCode: string;
        country: string;
        fullAddress?: string; // Bazı kısımlarda tek string olarak tutulmuş olabilir
    };
    notes?: string;
}

// Alıcı Bilgisi (Teslim Edilecek Kişi)
export interface RecipientInfo {
    name: string;
    phone: string;
    city: string;
    district: string;
    address: string;
    notes: string;
    deliveryTime?: string; // Eski kayıtlarda olmayabilir
    wreathText?: string;
}

// Sipariş Kalemi
export interface OrderItem {
    productId: string;
    productName: string;
    name?: string; // Legacy support
    variantId?: string;
    variantName?: string;
    quantity: number;
    price: number;
    image?: string;
    productImage?: string; // Bazı yerlerde productImage diye geçiyor
}

// Ödeme Detayları
export interface PaymentDetails {
    paytrTransactionId?: string;
    paymentType?: string;
    paymentAmount?: number;
    currency?: string;
    testMode?: boolean;
    failedReasonCode?: string;
    failedReasonMsg?: string;
    processedAt?: string;
}

// Sipariş Modeli (Firestore'dan gelen ham veriye uygun)
export interface Order {
    id: string;
    orderNumber: string;
    sender?: CustomerInfo;
    recipient?: RecipientInfo; // Backend'de opsiyonel olabilir
    customer: CustomerInfo; // Legacy destek için
    items: OrderItem[];
    subtotal: number;
    shippingCost: number;
    total: number;
    status: OrderStatus;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentMethod: PaymentMethod;
    shippingMethod: 'standard' | 'express' | 'pickup';
    notes?: string;
    createdAt: string;
    updatedAt: string;
    delivery_time?: string;
    delivery_date?: string; // Yeni eklenen alan
    delivery_place_type?: string;
    paymentDetails?: PaymentDetails;
    wreath_text?: string;
}
