'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Save, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

interface ProductFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        price: initialData?.price || 0,
        categories: initialData?.categories || (initialData?.category ? [initialData.category] : []),
        category: initialData?.category || '',
        inStock: initialData?.inStock ?? true,
        images: initialData?.images || [] as string[],
        seoTitle: initialData?.seoTitle || '',
        seoDescription: initialData?.seoDescription || '',
        seoKeywords: initialData?.seoKeywords || ''
    });

    const [imagePreviews, setImagePreviews] = useState<string[]>(initialData?.images || []);

    const categories = [
        'Açılış & Tören',
        'Cenaze Çelenkleri',
        'Ferforjeler',
        'Fuar & Stand',
        'Ofis & Saksı Bitkileri',
        'Söz & Nişan'
    ];

    const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new window.Image();

            img.onload = () => {
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;

                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };

            img.src = URL.createObjectURL(file);
        });
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newImages: string[] = [];
        const newPreviews: string[] = [];

        for (let i = 0; i < Math.min(files.length, 4); i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                try {
                    const compressedImage = await compressImage(file);
                    newImages.push(compressedImage);
                    newPreviews.push(compressedImage);
                } catch (error) {
                    console.error('Image compression failed:', error);
                }
            }
        }

        setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.description || !formData.price || formData.categories.length === 0) {
            setErrorMessage('Lütfen tüm gerekli alanları doldurun ve en az bir kategori seçin');
            return;
        }

        try {
            setIsLoading(true);
            setErrorMessage('');

            const productData = {
                ...formData,
                updatedAt: new Date().toISOString()
            };

            if (!isEditing) {
                // @ts-ignore
                productData.createdAt = new Date().toISOString();
            }

            // Ensure category is populated (primary category = first selected)
            productData.category = productData.categories[0] || '';

            const url = isEditing ? `/api/products/${initialData.id}` : '/api/products';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            if (response.ok) {
                router.push('/admin/products');
                router.refresh();
            } else {
                const error = await response.json();
                setErrorMessage(error.error || 'Ürün kaydedilirken hata oluştu');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            setErrorMessage('Ürün kaydedilirken hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    {errorMessage}
                </div>
            )}

            <Card>
                <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ürün Adı *
                            </label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Ürün adını girin"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kategori *
                            </label>
                            <div className="space-y-2 border border-gray-200 rounded-md p-3 max-h-48 overflow-y-auto">
                                {categories.map((category) => (
                                    <label key={category} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            checked={formData.categories.includes(category)}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setFormData(prev => {
                                                    const newCategories = checked
                                                        ? [...prev.categories, category]
                                                        : prev.categories.filter(c => c !== category);
                                                    return {
                                                        ...prev,
                                                        categories: newCategories,
                                                        category: newCategories.length > 0 ? newCategories[0] : ''
                                                    };
                                                });
                                            }}
                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        <span className="text-sm text-gray-700">{category}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Açıklama *
                        </label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Ürün açıklamasını girin"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fiyat (₺) *
                            </label>
                            <Input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                placeholder="0"
                            />
                        </div>
                        <div className="flex items-center space-x-4 pt-8">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.inStock}
                                    onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Stokta Var</span>
                            </label>
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Ayarları</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SEO Başlığı
                                </label>
                                <Input
                                    value={formData.seoTitle}
                                    onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                                    placeholder="SEO için özel başlık"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SEO Açıklaması
                                </label>
                                <Textarea
                                    value={formData.seoDescription}
                                    onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                                    placeholder="SEO için özel açıklama"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SEO Anahtar Kelimeler
                                </label>
                                <Input
                                    value={formData.seoKeywords}
                                    onChange={(e) => setFormData(prev => ({ ...prev, seoKeywords: e.target.value }))}
                                    placeholder="anahtar, kelime, virgülle, ayırın"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ürün Görselleri (Maksimum 4 adet)
                        </label>
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                ref={fileInputRef}
                            />
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Görsel yüklemek için tıklayın</p>
                        </div>

                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <Image
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            width={150}
                                            height={150}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeImage(index)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                >
                    İptal
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                >
                    {isLoading ? (
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Kaydediliyor...
                        </div>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            {isEditing ? 'Güncelle' : 'Kaydet'}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
