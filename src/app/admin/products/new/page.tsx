'use client';

import ProductForm from '@/components/admin/ProductForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center mb-6">
                        <Link href="/admin/products" className="mr-4">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Geri Dön
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
                    </div>

                    <ProductForm />
                </div>
            </div>
        </div>
    );
}
