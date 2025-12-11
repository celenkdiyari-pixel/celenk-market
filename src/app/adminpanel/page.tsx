'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Save, 
  Package, 
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  X,
  Trash2,
  Edit,
  Settings,
  Megaphone,
  ShoppingCart,
  FileText,
  Users,
  BarChart3,
  Home,
  Eye,
  EyeOff,
  Shield,
  Database
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export default function AdminPanel() {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    inStock: true,
    images: [] as string[],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });
  
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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

    setNewProduct(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setErrorMessage('Ürünler yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setErrorMessage('Ürünler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.description || !newProduct.price || !newProduct.category) {
      setErrorMessage('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const productData = {
        ...newProduct,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const url = isEditingProduct ? `/api/products/${editingProductId}` : '/api/products';
      const method = isEditingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
        
        setIsAddingProduct(false);
        setIsEditingProduct(false);
        setEditingProductId('');
        setNewProduct({
          name: '',
          description: '',
          price: 0,
          category: '',
          inStock: true,
          images: [],
          seoTitle: '',
          seoDescription: '',
          seoKeywords: ''
        });
        setImagePreviews([]);
        
        await loadProducts();
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

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setIsEditingProduct(true);
    setIsAddingProduct(false);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      inStock: product.inStock,
      images: product.images,
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
      seoKeywords: product.seoKeywords || ''
    });
    setImagePreviews(product.images);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadProducts();
      } else {
        alert('Ürün silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Ürün silinirken hata oluştu');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600 mt-1">Çelenk Diyarı Yönetim Paneli</p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Ana Sayfa
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Ürün</p>
                  <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                  <p className="text-xs text-green-600 mt-1">+12% bu ay</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stokta</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {products.filter(p => p.inStock).length}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    %{Math.round((products.filter(p => p.inStock).length / products.length) * 100)} stok oranı
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stokta Yok</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {products.filter(p => !p.inStock).length}
                  </p>
                  <p className="text-xs text-red-600 mt-1">Yeniden stok gerekli</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Kategoriler</p>
                  <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
                  <p className="text-xs text-blue-600 mt-1">Aktif kategoriler</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Orders */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Son Siparişler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">#ORD-2024-001</p>
                    <p className="text-sm text-gray-600">Ahmet Yılmaz</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₺450.00</p>
                    <Badge className="bg-yellow-100 text-yellow-800">Beklemede</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">#ORD-2024-002</p>
                    <p className="text-sm text-gray-600">Ayşe Demir</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₺320.00</p>
                    <Badge className="bg-green-100 text-green-800">Onaylandı</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">#ORD-2024-003</p>
                    <p className="text-sm text-gray-600">Mehmet Kaya</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₺680.00</p>
                    <Badge className="bg-blue-100 text-blue-800">Hazırlanıyor</Badge>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href="/admin/orders">
                  <Button variant="outline" className="w-full">
                    Tüm Siparişleri Görüntüle
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Hızlı İşlemler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => {
                  setIsAddingProduct(true);
                  setIsEditingProduct(false);
                  setEditingProductId('');
                  setNewProduct({
                    name: '',
                    description: '',
                    price: 0,
                    category: '',
                    inStock: true,
                    images: [],
                    seoTitle: '',
                    seoDescription: '',
                    seoKeywords: ''
                  });
                  setImagePreviews([]);
                }}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Ürün Ekle
              </Button>
              
              <Link href="/admin/announcements">
                <Button variant="outline" className="w-full">
                  <Megaphone className="h-4 w-4 mr-2" />
                  Duyuru Ekle
                </Button>
              </Link>
              
              <Link href="/admin/settings">
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Site Ayarları
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open('/', '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Siteyi Görüntüle
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Category Performance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Kategori Performansı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const categoryProducts = products.filter(p => p.category === category);
                const inStockCount = categoryProducts.filter(p => p.inStock).length;
                const totalValue = categoryProducts.reduce((sum, p) => sum + p.price, 0);
                
                return (
                  <div key={category} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 mb-2">{category}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ürün Sayısı:</span>
                        <span className="font-medium">{categoryProducts.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Stokta:</span>
                        <span className="font-medium text-green-600">{inStockCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Toplam Değer:</span>
                        <span className="font-medium text-blue-600">₺{totalValue.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <ShoppingCart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Siparişler</h3>
                <p className="text-gray-600 text-sm">Siparişleri yönet</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/customers">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Müşteriler</h3>
                <p className="text-gray-600 text-sm">Müşteri bilgilerini yönet</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/inventory">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Stok Yönetimi</h3>
                <p className="text-gray-600 text-sm">Envanter takibi</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analitik</h3>
                <p className="text-gray-600 text-sm">Raporlar ve analiz</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Kullanıcılar</h3>
                <p className="text-gray-600 text-sm">Yetki yönetimi</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/announcements">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Megaphone className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Duyurular</h3>
                <p className="text-gray-600 text-sm">Site duyurularını yönet</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/backup">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Database className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Yedekleme</h3>
                <p className="text-gray-600 text-sm">Veri güvenliği</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/settings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Settings className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Site Ayarları</h3>
                <p className="text-gray-600 text-sm">Genel ayarları yönet</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.open('/', '_blank')}>
            <CardContent className="p-6 text-center">
              <Eye className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Siteyi Görüntüle</h3>
              <p className="text-gray-600 text-sm">Müşteri görünümü</p>
            </CardContent>
          </Card>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">Ürün başarıyla kaydedildi!</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Add/Edit Product Form */}
        {(isAddingProduct || isEditingProduct) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {isEditingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ürün Adı *
                  </label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ürün adını girin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Kategori seçin</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama *
                </label>
                <Textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
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
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newProduct.inStock}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, inStock: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Stokta</span>
                  </label>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Ayarları</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Başlığı
                    </label>
                    <Input
                      value={newProduct.seoTitle}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, seoTitle: e.target.value }))}
                      placeholder="SEO için özel başlık"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Açıklaması
                    </label>
                    <Textarea
                      value={newProduct.seoDescription}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, seoDescription: e.target.value }))}
                      placeholder="SEO için özel açıklama"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Anahtar Kelimeler
                    </label>
                    <Input
                      value={newProduct.seoKeywords}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, seoKeywords: e.target.value }))}
                      placeholder="anahtar, kelime, virgülle, ayırın"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Görselleri (Maksimum 4 adet)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Görsel yüklemek için tıklayın</p>
                  </label>
                </div>
                
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          width={150}
                          height={150}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleSaveProduct}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Kaydediliyor...' : (isEditingProduct ? 'Güncelle' : 'Kaydet')}
                </Button>
                <Button
                  onClick={() => {
                    setIsAddingProduct(false);
                    setIsEditingProduct(false);
                    setEditingProductId('');
                    setNewProduct({
                      name: '',
                      description: '',
                      price: 0,
                      category: '',
                      inStock: true,
                      images: [],
                      seoTitle: '',
                      seoDescription: '',
                      seoKeywords: ''
                    });
                    setImagePreviews([]);
                  }}
                  variant="outline"
                >
                  İptal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex justify-between items-center">
          <Button 
            onClick={() => {
              setIsAddingProduct(true);
              setIsEditingProduct(false);
              setEditingProductId('');
              setNewProduct({
                name: '',
                description: '',
                price: 0,
                category: '',
                inStock: true,
                images: [],
                seoTitle: '',
                seoDescription: '',
                seoKeywords: ''
              });
              setImagePreviews([]);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Ürün Ekle
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Ürün Bulunamadı' : 'Henüz Ürün Yok'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Arama kriterlerinize uygun ürün bulunamadı.' : 'İlk ürününüzü ekleyerek başlayın.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <Badge variant="outline">{product.category}</Badge>
                        <Badge className={`${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} border-0`}>
                          {product.inStock ? 'Stokta' : 'Stokta Yok'}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="font-semibold text-green-600">{product.price} ₺</span>
                        <span>•</span>
                        <span>{product.images.length} görsel</span>
                        {product.createdAt && (
                          <>
                            <span>•</span>
                            <span>{new Date(product.createdAt).toLocaleDateString('tr-TR')}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}