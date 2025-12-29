'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, Package, Calendar, Clock, MapPin, Truck, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

// Types (simplified from Order)
interface OrderResult {
    orderNumber: string;
    status: string;
    paymentStatus: string;
    items: Array<{
        name: string;
        productName?: string;
        quantity: number;
        price: number;
        image?: string;
    }>;
    total: number;
    createdAt: string;
    delivery_time?: string;
    delivery_date?: string;
}

const steps = [
    { id: 'pending', label: 'Sipariş Alındı', icon: Calendar },
    { id: 'confirmed', label: 'Onaylandı', icon: CheckCircle },
    { id: 'preparing', label: 'Hazırlanıyor', icon: Package },
    { id: 'shipped', label: 'Dağıtımda', icon: Truck },
    { id: 'delivered', label: 'Teslim Edildi', icon: MapPin },
];

export default function OrderTrackingPage() {
    const [orderNumber, setOrderNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [order, setOrder] = useState<OrderResult | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderNumber.trim()) return;

        setLoading(true);
        setError('');
        setOrder(null);

        try {
            // Fetch order by number
            const response = await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber.trim())}`);
            const data = await response.json();

            if (response.ok && data.orders && data.orders.length > 0) {
                setOrder(data.orders[0]);
            } else {
                setError('Sipariş bulunamadı. Lütfen sipariş numaranızı kontrol ediniz.');
            }
        } catch (err) {
            console.error(err);
            setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.');
        } finally {
            setLoading(false);
        }
    };

    const getCurrentStepIndex = (status: string) => {
        switch (status) {
            case 'pending': return 0;
            case 'confirmed': return 1;
            case 'preparing': return 2;
            case 'shipped': return 3;
            case 'delivered': return 4;
            case 'cancelled': return -1;
            default: return 0;
        }
    };

    const currentStep = order ? getCurrentStepIndex(order.status) : 0;
    const isCancelled = order?.status === 'cancelled';

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Siparişiniz alındı, onay bekleniyor.';
            case 'confirmed': return 'Siparişiniz onaylandı, hazırlık sırasına alındı.';
            case 'preparing': return 'Siparişiniz özenle hazırlanıyor.';
            case 'shipped': return 'Siparişiniz yola çıktı (Dağıtımda).';
            case 'delivered': return 'Siparişiniz başarıyla teslim edildi.';
            case 'cancelled': return 'Siparişiniz iptal edildi.';
            default: return 'Durum bilgisi alınamadı.';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header Block */}
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Sipariş Takibi
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Size gönderilen maildeki veya SMS'teki sipariş numarasını giriniz.
                    </p>
                </div>

                {/* Search Card */}
                <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
                    <CardContent className="p-8">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    type="text"
                                    placeholder="Sipariş Numaranız (Örn: 1234)"
                                    value={orderNumber}
                                    onChange={(e) => setOrderNumber(e.target.value)}
                                    className="pl-10 h-12 text-lg rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-12 px-8 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sorgula'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Error State */}
                {error && (
                    <div className="rounded-xl bg-red-50 p-4 flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-bottom-4">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {/* Result Card */}
                {order && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8">

                        {/* Status Timeline */}
                        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                            <CardHeader className="bg-white border-b border-gray-100 pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <Package className="w-6 h-6 text-green-600" />
                                            Sipariş #{order.orderNumber}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            {new Date(order.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </CardDescription>
                                    </div>
                                    {isCancelled ? (
                                        <Badge className="bg-red-100 text-red-800 text-sm px-3 py-1">İptal Edildi</Badge>
                                    ) : (
                                        <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
                                            {steps[currentStep]?.label || order.status}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 md:p-8">
                                {isCancelled ? (
                                    <div className="text-center text-red-600 py-4">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                                        <p className="text-lg font-bold">Bu sipariş iptal edilmiştir.</p>
                                        <p className="text-sm opacity-80">İade ve detaylı bilgi için bizimle iletişime geçebilirsiniz.</p>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        {/* Progress Bar Background */}
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 hidden md:block" />

                                        {/* Active Progress Bar */}
                                        <div
                                            className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 transition-all duration-1000 hidden md:block"
                                            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                                        />

                                        {/* Steps */}
                                        <div className="relative flex justify-between">
                                            {steps.map((step, index) => {
                                                const isActive = index <= currentStep;
                                                const isCurrent = index === currentStep;
                                                const StepIcon = step.icon;

                                                return (
                                                    <div key={step.id} className="flex flex-col items-center group">
                                                        <div
                                                            className={`
                                                w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-4 z-10 transition-all duration-300
                                                ${isActive ? 'bg-green-500 border-green-500 text-white shadow-lg scale-110' : 'bg-white border-gray-200 text-gray-400'}
                                                ${isCurrent ? 'ring-4 ring-green-100' : ''}
                                            `}
                                                        >
                                                            <StepIcon className="w-5 h-5 md:w-6 md:h-6" />
                                                        </div>
                                                        <span
                                                            className={`
                                                mt-3 text-xs md:text-sm font-medium transition-colors duration-300 text-center max-w-[80px]
                                                ${isActive ? 'text-green-700 font-bold' : 'text-gray-400'}
                                            `}
                                                        >
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-8 p-4 bg-green-50 rounded-xl text-center text-green-800 border border-green-100">
                                            <p className="font-medium">{getStatusText(order.status)}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Order Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Items */}
                            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden flex-1">
                                <CardHeader className="bg-white border-b border-gray-100">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Package className="w-5 h-5 text-gray-400" />
                                        Sipariş İçeriği
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                            <div className="relative w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                                                {item.image ? (
                                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                ) : (
                                                    <Package className="w-8 h-8 text-gray-400 m-auto mt-4" />
                                                )}
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <h4 className="font-bold text-gray-800 text-sm line-clamp-2">{item.productName || item.name}</h4>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-sm text-gray-500">Adet: {item.quantity}</span>
                                                    <span className="font-bold text-green-600">{(item.price || 0).toFixed(2)} ₺</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="p-4 bg-gray-50 flex justify-between items-center border-t border-gray-100">
                                        <span className="font-medium text-gray-600">Toplam Tutar</span>
                                        <span className="font-bold text-xl text-green-600">{order.total?.toFixed(2)} ₺</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Delivery Info */}
                            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden flex-1">
                                <CardHeader className="bg-white border-b border-gray-100">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-gray-400" />
                                        Teslimat Bilgisi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <span className="block text-sm font-medium text-gray-500">Teslimat Tarihi</span>
                                            <span className="text-gray-900 font-medium">
                                                {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) : 'Belirtilmedi'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <span className="block text-sm font-medium text-gray-500">Teslimat Saati</span>
                                            <span className="text-gray-900 font-medium">{order.delivery_time || 'Belirtilmedi'}</span>
                                        </div>
                                    </div>
                                    {order.delivery_time && (
                                        <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">
                                            Teslimatınız belirtilen saat aralığı içerisinde gerçekleştirilecektir.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
