'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Package,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Filter,
  ArrowLeft,
  Home,
  Edit,
  Save,
  X,
  BarChart3,
  Package2,
  Truck,
  Clock,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitCost: number;
  totalValue: number;
  lastRestocked: string;
  supplier: string;
  location: string;
  notes?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
}

interface StockMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  date: string;
  user: string;
  notes?: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showRemoveStockModal, setShowRemoveStockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [stockReason, setStockReason] = useState('');
  const [stockNotes, setStockNotes] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const categories = [
    'Açılış & Tören',
    'Cenaze Çelenkleri',
    'Ferforjeler',
    'Fuar & Stand',
    'Ofis & Saksı Bitkileri',
    'Söz & Nişan'
  ];

  // Mock data for demonstration
  useEffect(() => {
    const mockInventory: InventoryItem[] = [
      {
        id: '1',
        productId: 'prod-1',
        productName: 'Açılış Çelengi - Büyük',
        category: 'Açılış & Tören',
        currentStock: 25,
        minStockLevel: 10,
        maxStockLevel: 50,
        unitCost: 150.00,
        totalValue: 3750.00,
        lastRestocked: '2024-01-10',
        supplier: 'Çiçek Toptan',
        location: 'Depo A-1',
        status: 'in_stock'
      },
      {
        id: '2',
        productId: 'prod-2',
        productName: 'Cenaze Çelengi - Orta',
        category: 'Cenaze Çelenkleri',
        currentStock: 5,
        minStockLevel: 8,
        maxStockLevel: 30,
        unitCost: 200.00,
        totalValue: 1000.00,
        lastRestocked: '2024-01-05',
        supplier: 'Çelenk Merkezi',
        location: 'Depo B-2',
        status: 'low_stock'
      },
      {
        id: '3',
        productId: 'prod-3',
        productName: 'Ferforje Saksı - Küçük',
        category: 'Ferforjeler',
        currentStock: 0,
        minStockLevel: 5,
        maxStockLevel: 20,
        unitCost: 80.00,
        totalValue: 0.00,
        lastRestocked: '2023-12-20',
        supplier: 'Metal İşleri',
        location: 'Depo C-3',
        status: 'out_of_stock'
      }
    ];

    const mockMovements: StockMovement[] = [
      {
        id: '1',
        itemId: '1',
        type: 'in',
        quantity: 20,
        reason: 'Yeni Sipariş',
        date: '2024-01-10',
        user: 'Admin',
        notes: 'Toptan alım'
      },
      {
        id: '2',
        itemId: '2',
        type: 'out',
        quantity: 3,
        reason: 'Satış',
        date: '2024-01-12',
        user: 'Admin'
      }
    ];

    setInventory(mockInventory);
    setStockMovements(mockMovements);
    setIsLoading(false);
  }, []);

  const getStatusBadge = (status: InventoryItem['status']) => {
    const statusConfig = {
      in_stock: { label: 'Stokta', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      low_stock: { label: 'Düşük Stok', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      out_of_stock: { label: 'Stokta Yok', color: 'bg-red-100 text-red-800', icon: XCircle },
      discontinued: { label: 'Üretim Durduruldu', color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.in_stock;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getMovementIcon = (type: StockMovement['type']) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjustment':
        return <Edit className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleStockUpdate = async (type: 'in' | 'out' | 'adjustment') => {
    if (!selectedItem || stockQuantity <= 0) {
      setErrorMessage('Geçerli bir miktar girin');
      return;
    }

    try {
      const newStock = type === 'in' 
        ? selectedItem.currentStock + stockQuantity
        : type === 'out'
        ? selectedItem.currentStock - stockQuantity
        : stockQuantity;

      if (newStock < 0) {
        setErrorMessage('Stok miktarı negatif olamaz');
        return;
      }

      // Update inventory
      setInventory(prev => prev.map(item => 
        item.id === selectedItem.id 
          ? { 
              ...item, 
              currentStock: newStock,
              totalValue: newStock * item.unitCost,
              status: newStock === 0 ? 'out_of_stock' : 
                     newStock <= item.minStockLevel ? 'low_stock' : 'in_stock'
            }
          : item
      ));

      // Add stock movement
      const newMovement: StockMovement = {
        id: Date.now().toString(),
        itemId: selectedItem.id,
        type,
        quantity: stockQuantity,
        reason: stockReason,
        date: new Date().toISOString(),
        user: 'Admin',
        notes: stockNotes
      };

      setStockMovements(prev => [newMovement, ...prev]);

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      setShowAddStockModal(false);
      setShowRemoveStockModal(false);
      setSelectedItem(null);
      setStockQuantity(0);
      setStockReason('');
      setStockNotes('');
    } catch (error) {
      console.error('Error updating stock:', error);
      setErrorMessage('Stok güncellenirken hata oluştu');
    }
  };

  const getTotalInventoryValue = () => {
    return inventory.reduce((sum, item) => sum + item.totalValue, 0);
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stok Yönetimi</h1>
              <p className="text-gray-600 mt-1">Envanter takibi ve stok yönetimi</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/admin">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Ana Sayfa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">Stok başarıyla güncellendi!</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Ürün</p>
                  <p className="text-3xl font-bold text-gray-900">{inventory.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Toplam Değer</p>
                  <p className="text-3xl font-bold text-gray-900">₺{getTotalInventoryValue().toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Düşük Stok</p>
                  <p className="text-3xl font-bold text-gray-900">{getLowStockItems().length}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
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
                    {inventory.filter(item => item.status === 'out_of_stock').length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Ürün adı, kategori veya tedarikçi ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="in_stock">Stokta</option>
                  <option value="low_stock">Düşük Stok</option>
                  <option value="out_of_stock">Stokta Yok</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">Tüm Kategoriler</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory List */}
        <div className="space-y-4">
          {filteredInventory.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün Bulunamadı</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                    ? 'Arama kriterlerinize uygun ürün bulunamadı.'
                    : 'Henüz hiç ürün kaydı yok.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredInventory.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.productName}
                        </h3>
                        {getStatusBadge(item.status)}
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Package2 className="h-4 w-4" />
                          <span>Mevcut: {item.currentStock}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Min: {item.minStockLevel}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Birim: ₺{item.unitCost.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4" />
                          <span>{item.supplier}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span>Toplam Değer: ₺{item.totalValue.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-600" />
                          <span>Son Stok: {new Date(item.lastRestocked).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span>Konum: {item.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowAddStockModal(true);
                          setStockQuantity(0);
                          setStockReason('');
                          setStockNotes('');
                        }}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowRemoveStockModal(true);
                          setStockQuantity(0);
                          setStockReason('');
                          setStockNotes('');
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Recent Stock Movements */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Son Stok Hareketleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stockMovements.slice(0, 10).map((movement) => {
                const item = inventory.find(i => i.id === movement.itemId);
                return (
                  <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getMovementIcon(movement.type)}
                      <div>
                        <p className="font-medium">{item?.productName}</p>
                        <p className="text-sm text-gray-600">{movement.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${movement.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(movement.date).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Stock Modal */}
      {showAddStockModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Stok Ekle - {selectedItem.productName}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miktar
                </label>
                <Input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sebep
                </label>
                <Input
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  placeholder="Stok ekleme sebebi"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notlar
                </label>
                <Textarea
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  placeholder="Ek notlar"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={() => handleStockUpdate('in')}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Stok Ekle
              </Button>
              <Button
                onClick={() => {
                  setShowAddStockModal(false);
                  setSelectedItem(null);
                  setStockQuantity(0);
                  setStockReason('');
                  setStockNotes('');
                }}
                variant="outline"
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                İptal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Stock Modal */}
      {showRemoveStockModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Stok Çıkar - {selectedItem.productName}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miktar (Mevcut: {selectedItem.currentStock})
                </label>
                <Input
                  type="number"
                  max={selectedItem.currentStock}
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sebep
                </label>
                <Input
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  placeholder="Stok çıkarma sebebi"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notlar
                </label>
                <Textarea
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  placeholder="Ek notlar"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={() => handleStockUpdate('out')}
                className="bg-red-600 hover:bg-red-700 flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Stok Çıkar
              </Button>
              <Button
                onClick={() => {
                  setShowRemoveStockModal(false);
                  setSelectedItem(null);
                  setStockQuantity(0);
                  setStockReason('');
                  setStockNotes('');
                }}
                variant="outline"
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                İptal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
