'use client';

import { useState, useEffect, useCallback } from 'react';
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
  X,
  Trash2,
  Edit,
  ShoppingCart,
  Shield,
  FileText,
  Home,
  Upload,
  Users,
  Settings,
  Eye,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  Clock,
  DollarSign,
  Activity,
  Star
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string | string[]; // Tek kategori veya çoklu kategori
  inStock: boolean;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminPanel() {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Browser extension hatalarını filtrele
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;
    
    const isExtensionMessage = (message: string) => {
      return message.includes('One Click Image Downloader') || 
             message.includes('content_script') ||
             message.includes('7880f8283a6f3daf.js') ||
             message.includes('b1e8249f0d46c9fe.js') ||
             message.includes('DebugTmp') ||
             message.includes('Debug') ||
             message.includes('画像監視') ||
             message.includes('DownloadButtonsManager') ||
             message.includes('TimerEvent') ||
             message.includes('monitor_start') ||
             message.includes('timer_tick') ||
             message.includes('画像検出') ||
             message.includes('ボタンの相対位置') ||
             message.includes('画像サイズ') ||
             message.includes('初期設定データ読み込み完了') ||
             message.includes('画像監視を開始') ||
             message.includes('実行 (eventType:') ||
             message.includes('サイトプロパティ') ||
             message.includes('SettingData.get received') ||
             message.includes('subscribeFromContentScript') ||
             message.includes('handleEnebleRead');
    };
    
    console.error = (...args) => {
      const message = args.join(' ');
      if (isExtensionMessage(message)) {
        return; // Extension hatalarını görmezden gel
      }
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      const message = args.join(' ');
      if (isExtensionMessage(message)) {
        return; // Extension uyarılarını görmezden gel
      }
      originalWarn.apply(console, args);
    };
    
    console.log = (...args) => {
      const message = args.join(' ');
      if (isExtensionMessage(message)) {
        return; // Extension log'larını görmezden gel
      }
      originalLog.apply(console, args);
    };
    
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
    };
  }, []);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Array<{
    id: string;
    customerName: string;
    customerEmail: string;
    totalAmount: string;
    status: string;
    createdAt: string;
  }>>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [adminUsername, setAdminUsername] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    features: '',
    price: '',
    category: [] as string[], // Çoklu kategori için array
    inStock: true,
    images: ['']
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      const ts = Date.now();
      const response = await fetch(`/api/products?t=${ts}`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        console.log('✅ Products loaded:', data);
      } else {
        console.error('❌ Error loading products');
        setProducts([]);
      }
        } catch (error) {
      console.error('❌ Error loading products:', error);
      setProducts([]);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        console.log('✅ Orders loaded:', data);
      } else {
        console.error('❌ Error loading orders');
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      setOrders([]);
    }
  }, []);

  const loadSystemHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/system-health');
      if (response.ok) {
        const data = await response.json();
        setSystemHealth(data);
        console.log('✅ System health loaded:', data);
      } else {
        console.error('❌ Error loading system health');
      }
    } catch (error) {
      console.error('❌ Error loading system health:', error);
    }
  }, []);

  const checkAuthentication = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();
      
      if (data.success && data.authenticated) {
        setIsAuthenticated(true);
        setAdminUsername(data.username || 'Admin');
        await loadProducts();
        await loadOrders();
        await loadSystemHealth();
      } else {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = '/admin/login';
    } finally {
      setIsLoading(false);
    }
  }, [loadProducts, loadOrders, loadSystemHealth]);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const handleAddProduct = async () => {
    try {
      // Validation: Ürün adı
      if (!newProduct.name || newProduct.name.trim() === '') {
        alert('Lütfen ürün adını girin!');
        return;
      }

      // Validation: Açıklama
      if (!newProduct.description || newProduct.description.trim() === '') {
        alert('Lütfen ürün açıklamasını girin!');
        return;
      }

      // Validation: Fiyat
      if (!newProduct.price || isNaN(parseFloat(newProduct.price)) || parseFloat(newProduct.price) <= 0) {
        alert('Lütfen geçerli bir fiyat girin!');
        return;
      }

      // Validation: En az bir kategori seçilmeli
      if (newProduct.category.length === 0) {
        alert('Lütfen en az bir kategori seçin!');
        return;
      }

      // Validation: En az bir görsel
      const validImages = newProduct.images.filter(img => img.trim() !== '');
      if (validImages.length === 0) {
        alert('Lütfen en az bir görsel yükleyin!');
        return;
      }

      const productData = {
        ...newProduct,
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        features: newProduct.features?.trim() || '',
        price: parseFloat(newProduct.price),
        images: validImages,
        category: newProduct.category // Array olarak gönder
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Cache'i temizle - hem client-side hem de API cache
        try {
          // Client-side cache'i temizle
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('products_cache');
          }
          
          // API cache'i bypass etmek için timestamp ekle
          await fetch('/api/products?t=' + Date.now(), {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
        } catch (cacheError) {
          console.warn('Cache temizleme hatası (önemli değil):', cacheError);
        }
        
        // Başarı mesajını göster
        setSuccessMessage('Ürün başarıyla eklendi! Sayfada görünmesi için birkaç saniye bekleyin.');
        setShowSuccessMessage(true);
        
        // 3 saniye sonra mesajı gizle
        setTimeout(() => {
          setShowSuccessMessage(false);
          setSuccessMessage('');
        }, 5000);
        
        setNewProduct({
          name: '',
          description: '',
          features: '',
          price: '',
          category: [], // Array olarak reset
          inStock: true,
          images: ['']
        });
        setIsAddingProduct(false);
        await loadProducts();
      } else {
        // Hata mesajını al ve göster
        const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
        const errorMessage = errorData.error || errorData.details || 'Ürün eklenirken bir hata oluştu';
        console.error('Failed to add product:', errorData);
        alert(`Hata: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ürün eklenirken bir hata oluştu';
      alert(`Hata: ${errorMessage}`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    const uploadedImageUrls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Dosya boyutunu kontrol et (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} dosyası çok büyük. Maksimum 5MB olmalıdır.`);
          continue;
        }

        // Dosya tipini kontrol et
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} geçerli bir görsel dosyası değil.`);
          continue;
        }

        // Firebase Storage'a yükle
        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/upload/image', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            let errorMessage = 'Görsel yüklenemedi';
            let errorDetails = '';
            
            try {
              const error = await response.json();
              errorMessage = error.error || errorMessage;
              errorDetails = error.details || '';
            } catch (parseError) {
              errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
            
            throw new Error(errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage);
          }

          const result = await response.json();
          if (result.success && result.url) {
            uploadedImageUrls.push(result.url);
            console.log(`✅ ${file.name} başarıyla yüklendi:`, result.url);
          } else {
            throw new Error('Görsel yüklendi ancak URL alınamadı');
          }
          
        } catch (error) {
          console.error(`❌ Error uploading ${file.name}:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
          alert(`${file.name} yüklenirken hata oluştu:\n${errorMessage}`);
        }
      }
      
      // Tüm dosyalar işlendikten sonra state'i güncelle
      if (uploadedImageUrls.length > 0) {
        setNewProduct(prev => ({
          ...prev,
          images: [...prev.images.filter(img => img.trim() !== ''), ...uploadedImageUrls]
        }));
      }
      
    } catch (error) {
      console.error('Error in image upload:', error);
      alert('Görseller yüklenirken hata oluştu');
    } finally {
      setIsUploadingImages(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleEditProduct = (product: any) => {
    setNewProduct({
      name: product.name,
      description: product.description,
      features: product.features || '',
      price: product.price.toString(),
      category: Array.isArray(product.category)
        ? product.category
        : (product.category ? [product.category] : []),
      inStock: product.inStock,
      images: product.images || ['']
    });
    setEditingProductId(product.id);
    setIsAddingProduct(true);
  };

  const handleUpdateProduct = async () => {
    try {
      // Validation: Ürün adı
      if (!newProduct.name || newProduct.name.trim() === '') {
        alert('Lütfen ürün adını girin!');
        return;
      }

      // Validation: Açıklama
      if (!newProduct.description || newProduct.description.trim() === '') {
        alert('Lütfen ürün açıklamasını girin!');
        return;
      }

      // Validation: Fiyat
      if (!newProduct.price || isNaN(parseFloat(newProduct.price)) || parseFloat(newProduct.price) <= 0) {
        alert('Lütfen geçerli bir fiyat girin!');
        return;
      }

      // Validation: En az bir kategori seçilmeli
      if (newProduct.category.length === 0) {
        alert('Lütfen en az bir kategori seçin!');
        return;
      }

      // Validation: En az bir görsel
      const validImages = newProduct.images.filter(img => img.trim() !== '');
      if (validImages.length === 0) {
        alert('Lütfen en az bir görsel yükleyin!');
        return;
      }

      const productData = {
        ...newProduct,
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        features: newProduct.features?.trim() || '',
        price: parseFloat(newProduct.price),
        images: validImages,
        category: newProduct.category // Array olarak gönder
      };

      const response = await fetch(`/api/products/${editingProductId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        // Cache'i temizle - hem client-side hem de API cache
        try {
          // Client-side cache'i temizle
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('products_cache');
          }
          
          // API cache'i bypass etmek için timestamp ekle
          await fetch('/api/products?t=' + Date.now(), {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
        } catch (cacheError) {
          console.warn('Cache temizleme hatası (önemli değil):', cacheError);
        }
        
        // Başarı mesajını göster
        setSuccessMessage('Ürün başarıyla güncellendi! Sayfada görünmesi için birkaç saniye bekleyin.');
        setShowSuccessMessage(true);
        
        // 3 saniye sonra mesajı gizle
        setTimeout(() => {
          setShowSuccessMessage(false);
          setSuccessMessage('');
        }, 5000);
        
        setNewProduct({
          name: '',
          description: '',
          features: '',
          price: '',
          category: [],
          inStock: true,
          images: ['']
        });
        setEditingProductId('');
        setIsAddingProduct(false);
        await loadProducts();
      } else {
        // Hata mesajını al ve göster
        const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
        const errorMessage = errorData.error || errorData.details || 'Ürün güncellenirken bir hata oluştu';
        console.error('Failed to update product:', errorData);
        alert(`Hata: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ürün güncellenirken bir hata oluştu';
      alert(`Hata: ${errorMessage}`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Başarı mesajını göster
        setSuccessMessage('Ürün başarıyla silindi!');
        setShowSuccessMessage(true);
        
        // 3 saniye sonra mesajı gizle
        setTimeout(() => {
          setShowSuccessMessage(false);
          setSuccessMessage('');
        }, 3000);
        
        await loadProducts();
      } else {
        // Hata mesajını al ve göster
        const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
        const errorMessage = errorData.error || errorData.details || 'Ürün silinirken bir hata oluştu';
        console.error('Failed to delete product:', errorData);
        alert(`Hata: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ürün silinirken bir hata oluştu';
      alert(`Hata: ${errorMessage}`);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' ||
      (Array.isArray(product.category)
        ? product.category.includes(filterCategory)
        : product.category === filterCategory);
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Yetkisiz Erişim</h1>
          <p className="text-gray-600 mb-6">Bu sayfaya erişim için giriş yapmanız gerekiyor.</p>
          <Link href="/admin/login">
            <Button className="bg-green-600 hover:bg-green-700">
              Giriş Yap
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message Toast */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-right duration-300">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">{successMessage}</span>
          <button
            onClick={() => {
              setShowSuccessMessage(false);
              setSuccessMessage('');
            }}
            className="ml-2 hover:bg-green-600 rounded-full p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-elegant font-bold text-gray-900">Admin Paneli</h1>
              <p className="text-gray-600 mt-1">Hoş geldiniz, {adminUsername}</p>
            </div>
            <div className="flex items-center space-x-4">
            <Link href="/">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Ana Sayfa</span>
              </Button>
            </Link>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Yenile</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* System Health */}
        {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-green-600">Sistem Durumu</p>
                    <p className="text-2xl font-bold text-green-900">
                      {systemHealth.status === 'healthy' ? 'Sağlıklı' : 'Sorunlu'}
                    </p>
                </div>
                  <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

            <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-blue-600">Toplam Ürün</p>
                    <p className="text-2xl font-bold text-blue-900">{products.length}</p>
                </div>
                  <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

            <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-purple-600">Toplam Sipariş</p>
                    <p className="text-2xl font-bold text-purple-900">{orders.length}</p>
                </div>
                  <ShoppingCart className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

        </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Sipariş Yönetimi</h3>
                    <p className="text-sm text-gray-600">Siparişleri görüntüle ve yönet</p>
                  </div>
                  </div>
              </CardContent>
            </Card>
          </Link>


          <Link href="/admin/customers">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Müşteri Yönetimi</h3>
                    <p className="text-sm text-gray-600">Müşteri bilgilerini yönet</p>
                  </div>
                  </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/blog">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <FileText className="h-6 w-6 text-orange-600" />
                </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Blog Yönetimi</h3>
                    <p className="text-sm text-gray-600">Blog yazılarını yönet</p>
              </div>
              </div>
            </CardContent>
          </Card>
          </Link>

          <Link href="/admin/pricing">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Fiyatlandırma Yönetimi</h3>
                    <p className="text-sm text-gray-600">Şehir/ilçe fiyatlandırmalarını yönet</p>
              </div>
              </div>
            </CardContent>
          </Card>
          </Link>

          <Link href="/admin/settings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Settings className="h-6 w-6 text-gray-600" />
                </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Site Ayarları</h3>
                    <p className="text-sm text-gray-600">Genel site ayarlarını yönet</p>
              </div>
              </div>
            </CardContent>
          </Card>
          </Link>
        </div>

        {/* Products Section */}
        <Card className="mb-8">
            <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <CardTitle className="text-2xl font-bold">Ürün Yönetimi</CardTitle>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Button 
                  onClick={() => setIsAddingProduct(true)}
                  className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Ürün Ekle
              </Button>
        </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Ürün ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                      </div>
                      </div>
              <div className="sm:w-48">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">Tüm Kategoriler</option>
                  <option value="Açılış & Tören">Açılış & Tören</option>
                  <option value="Cenaze Çelenkleri">Cenaze Çelenkleri</option>
                  <option value="Ferforjeler">Ferforjeler</option>
                  <option value="Fuar & Stand">Fuar & Stand</option>
                  <option value="Ofis & Saksı Bitkileri">Ofis & Saksı Bitkileri</option>
                  <option value="Söz & Nişan">Söz & Nişan</option>
                </select>
                      </div>
                    </div>

            {/* Products Grid - Anasayfa stili */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 flex flex-col">
                  {/* Product Image - Çiçekçi sitesi stili: büyük ve net görsel */}
                  <div className="relative h-80 overflow-hidden bg-gray-50">
                    {product.images && product.images.length > 0 && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                        <Package className="h-20 w-20 text-green-400" />
                      </div>
                    )}
                    
                    {/* Stock Badge - Çiçekçi sitesi stili: minimal ve şık */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        product.inStock 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {product.inStock ? 'Stokta' : 'Tükendi'}
                      </span>
                    </div>
                  </div>

                  {/* Product Info - Çiçekçi sitesi stili: sade ve net */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Product Name - Çiçekçi sitesi stili: büyük ve belirgin */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>

                    {/* Description - Çiçekçi sitesi stili: kısa ve öz */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Category */}
                    <p className="text-xs text-gray-500 mb-3">
                      {Array.isArray(product.category)
                        ? product.category.join(', ')
                        : product.category}
                    </p>

                    {/* Price - Çiçekçi sitesi stili: büyük ve belirgin */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xl font-bold text-green-600">
                        ₺{product.price.toFixed(2)}
                      </div>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= 4 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">(4.0)</span>
                      </div>
                    </div>

                    {/* Admin Actions - Düzenle ve Sil Butonları */}
                    <div className="flex space-x-2 mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Düzenle
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Sil
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün bulunamadı</h3>
                <p className="text-gray-600">Arama kriterlerinize uygun ürün bulunamadı.</p>
          </div>
        )}
          </CardContent>
        </Card>

        {/* Add Product Modal */}
        {isAddingProduct && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-2xl h-[95vh] sm:h-[90vh] flex flex-col">
              {/* Modal Header - Fixed */}
              <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {editingProductId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProductId('');
                    setNewProduct({
                      name: '',
                      description: '',
                      features: '',
                      price: '',
                        category: [],
                      inStock: true,
                      images: ['']
                    });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pr-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Adı</label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Ürün adını girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Açıklaması</label>
                  <Textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Ürün hakkında detaylı açıklama yazın..."
                    rows={4}
                  />
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Özellikleri</label>
                <Textarea
                    value={newProduct.features}
                    onChange={(e) => setNewProduct({ ...newProduct, features: e.target.value })}
                    placeholder="Ürün özelliklerini madde madde yazın (her satıra bir özellik)..."
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Her satıra bir özellik yazın. Örnek: %100 Doğal Malzeme
                  </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fiyat</label>
                  <Input
                    type="number"
                    value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="0.00"
                    />
              </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kategoriler</label>
                    <div className="space-y-2">
                      {[
                        "Açılış & Tören",
                        "Cenaze Çelenkleri", 
                        "Ferforjeler",
                        "Fuar & Stand",
                        "Ofis & Saksı Bitkileri",
                        "Söz & Nişan"
                      ].map((category) => (
                        <label key={category} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newProduct.category.includes(category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewProduct({
                                  ...newProduct,
                                  category: [...newProduct.category, category]
                                });
                              } else {
                                setNewProduct({
                                  ...newProduct,
                                  category: newProduct.category.filter(cat => cat !== category)
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-700">{category}</span>
                        </label>
                      ))}
                    </div>
                    {newProduct.category.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Seçilen kategoriler:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {newProduct.category.map((cat, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Görselleri</label>
                  
                  {/* Dosya Yükleme */}
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploadingImages}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {isUploadingImages && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                          <div className="flex items-center space-x-2 text-green-600">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span className="text-sm font-medium">Yükleniyor...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {isUploadingImages 
                        ? 'Görseller Firebase Storage\'a yükleniyor...' 
                        : 'Birden fazla görsel seçebilirsiniz (JPG, PNG, GIF - Max 5MB)'}
                    </p>
                  </div>
                
                  {/* Yüklenen Görseller */}
                  {newProduct.images.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Yüklenen Görseller:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {newProduct.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Ürün görseli ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <Button
                              type="button"
                          variant="destructive"
                              size="sm"
                              onClick={() => {
                                const newImages = newProduct.images.filter((_, i) => i !== index);
                                setNewProduct({ ...newProduct, images: newImages });
                              }}
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                      </div>
                  </div>
                )}
              </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={newProduct.inStock}
                    onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
                    Stokta var
                  </label>
                </div>

              </div>

              {/* Modal Footer - Fixed */}
              <div className="flex-shrink-0 pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <Button
                    onClick={editingProductId ? handleUpdateProduct : handleAddProduct}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingProductId ? 'Ürünü Güncelle' : 'Ürün Ekle'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingProduct(false);
                      setEditingProductId('');
                      setNewProduct({
                        name: '',
                        description: '',
                        features: '',
                        price: '',
                        category: [],
                        inStock: true,
                        images: ['']
                      });
                    }}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}