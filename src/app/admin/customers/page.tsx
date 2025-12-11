'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  Search,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingCart,
  DollarSign,
  Filter,
  Plus,
  UserPlus,
  ArrowLeft,
  Home,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    district: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  registrationDate: string;
  status: 'active' | 'inactive' | 'vip';
  tags: string[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      district: '',
      postalCode: '',
      country: 'Türkiye'
    },
    notes: '',
    status: 'active' as Customer['status'],
    tags: [] as string[]
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: '1',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        email: 'ahmet@example.com',
        phone: '+90 555 123 45 67',
        address: {
          street: 'Atatürk Caddesi No: 123',
          city: 'İstanbul',
          district: 'Kadıköy',
          postalCode: '34710',
          country: 'Türkiye'
        },
        notes: 'VIP müşteri, özel günlerde sık sipariş verir',
        totalOrders: 15,
        totalSpent: 4500.00,
        lastOrderDate: '2024-01-15',
        registrationDate: '2023-06-10',
        status: 'vip',
        tags: ['VIP', 'Düzenli Müşteri']
      },
      {
        id: '2',
        firstName: 'Ayşe',
        lastName: 'Demir',
        email: 'ayse@example.com',
        phone: '+90 555 234 56 78',
        address: {
          street: 'Cumhuriyet Mahallesi No: 45',
          city: 'Ankara',
          district: 'Çankaya',
          postalCode: '06420',
          country: 'Türkiye'
        },
        totalOrders: 8,
        totalSpent: 1200.00,
        lastOrderDate: '2024-01-10',
        registrationDate: '2023-08-20',
        status: 'active',
        tags: ['Yeni Müşteri']
      },
      {
        id: '3',
        firstName: 'Mehmet',
        lastName: 'Kaya',
        email: 'mehmet@example.com',
        phone: '+90 555 345 67 89',
        address: {
          street: 'İnönü Bulvarı No: 78',
          city: 'İzmir',
          district: 'Konak',
          postalCode: '35250',
          country: 'Türkiye'
        },
        totalOrders: 3,
        totalSpent: 680.00,
        lastOrderDate: '2023-12-20',
        registrationDate: '2023-11-15',
        status: 'inactive',
        tags: []
      }
    ];
    
    setCustomers(mockCustomers);
    setIsLoading(false);
  }, []);

  const getStatusBadge = (status: Customer['status']) => {
    const statusConfig = {
      active: { label: 'Aktif', color: 'bg-green-100 text-green-800' },
      inactive: { label: 'Pasif', color: 'bg-gray-100 text-gray-800' },
      vip: { label: 'VIP', color: 'bg-purple-100 text-purple-800' }
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSaveCustomer = async () => {
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email) {
      setErrorMessage('Ad, soyad ve e-posta gereklidir');
      return;
    }

    try {
      // Mock save operation
      const customerData = {
        ...newCustomer,
        id: isEditingCustomer ? editingCustomerId : Date.now().toString(),
        totalOrders: 0,
        totalSpent: 0,
        registrationDate: new Date().toISOString(),
        lastOrderDate: undefined
      };

      if (isEditingCustomer) {
        setCustomers(prev => prev.map(c => c.id === editingCustomerId ? customerData : c));
      } else {
        setCustomers(prev => [...prev, customerData]);
      }

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      setIsAddingCustomer(false);
      setIsEditingCustomer(false);
      setEditingCustomerId('');
      setNewCustomer({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          district: '',
          postalCode: '',
          country: 'Türkiye'
        },
        notes: '',
        status: 'active',
        tags: []
      });
    } catch (error) {
      console.error('Error saving customer:', error);
      setErrorMessage('Müşteri kaydedilirken hata oluştu');
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomerId(customer.id);
    setIsEditingCustomer(true);
    setIsAddingCustomer(false);
    setNewCustomer({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes || '',
      status: customer.status,
      tags: customer.tags
    });
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setCustomers(prev => prev.filter(c => c.id !== customerId));
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Müşteri silinirken hata oluştu');
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Müşteri Yönetimi</h1>
              <p className="text-gray-600 mt-1">Müşteri bilgilerini yönetin ve takip edin</p>
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
            <p className="text-green-800">Müşteri başarıyla kaydedildi!</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Add/Edit Customer Form */}
        {(isAddingCustomer || isEditingCustomer) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {isEditingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad *
                  </label>
                  <Input
                    value={newCustomer.firstName}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Müşteri adı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soyad *
                  </label>
                  <Input
                    value={newCustomer.lastName}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Müşteri soyadı"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta *
                  </label>
                  <Input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="ornek@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <Input
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+90 555 123 45 67"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={newCustomer.address.street}
                    onChange={(e) => setNewCustomer(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, street: e.target.value }
                    }))}
                    placeholder="Sokak/Mahalle"
                  />
                  <Input
                    value={newCustomer.address.district}
                    onChange={(e) => setNewCustomer(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, district: e.target.value }
                    }))}
                    placeholder="İlçe"
                  />
                  <Input
                    value={newCustomer.address.city}
                    onChange={(e) => setNewCustomer(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    placeholder="İl"
                  />
                  <Input
                    value={newCustomer.address.postalCode}
                    onChange={(e) => setNewCustomer(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, postalCode: e.target.value }
                    }))}
                    placeholder="Posta Kodu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum
                  </label>
                  <select
                    value={newCustomer.status}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, status: e.target.value as Customer['status'] }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notlar
                  </label>
                  <Textarea
                    value={newCustomer.notes}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Müşteri hakkında notlar"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleSaveCustomer}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isEditingCustomer ? 'Güncelle' : 'Kaydet'}
                </Button>
                <Button
                  onClick={() => {
                    setIsAddingCustomer(false);
                    setIsEditingCustomer(false);
                    setEditingCustomerId('');
                    setErrorMessage('');
                  }}
                  variant="outline"
                >
                  İptal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Ad, soyad, e-posta veya telefon ile ara..."
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
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mb-6">
          <Button 
            onClick={() => {
              setIsAddingCustomer(true);
              setIsEditingCustomer(false);
              setEditingCustomerId('');
              setErrorMessage('');
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Yeni Müşteri Ekle
          </Button>
        </div>

        {/* Customers List */}
        <div className="space-y-4">
          {filteredCustomers.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Müşteri Bulunamadı</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Arama kriterlerinize uygun müşteri bulunamadı.'
                    : 'Henüz hiç müşteri kaydı yok.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredCustomers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        {getStatusBadge(customer.status)}
                        {customer.status === 'vip' && (
                          <Star className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{customer.address.city}, {customer.address.district}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Kayıt: {new Date(customer.registrationDate).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-1">
                          <ShoppingCart className="h-4 w-4 text-blue-600" />
                          <span>{customer.totalOrders} sipariş</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span>₺{customer.totalSpent.toFixed(2)}</span>
                        </div>
                        {customer.lastOrderDate && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <span>Son sipariş: {new Date(customer.lastOrderDate).toLocaleDateString('tr-TR')}</span>
                          </div>
                        )}
                      </div>

                      {customer.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {customer.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowCustomerModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCustomer(customer.id)}
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

      {/* Customer Detail Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setShowCustomerModal(false)}
                >
                  Kapat
                </Button>
              </div>

              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">İletişim Bilgileri</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                          <p>{selectedCustomer.address.street}</p>
                          <p>{selectedCustomer.address.district}, {selectedCustomer.address.city}</p>
                          <p>{selectedCustomer.address.postalCode} {selectedCustomer.address.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Müşteri Bilgileri</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Durum:</span>
                        {getStatusBadge(selectedCustomer.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Toplam Sipariş:</span>
                        <span className="font-medium">{selectedCustomer.totalOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Toplam Harcama:</span>
                        <span className="font-medium text-green-600">₺{selectedCustomer.totalSpent.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kayıt Tarihi:</span>
                        <span>{new Date(selectedCustomer.registrationDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                      {selectedCustomer.lastOrderDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Son Sipariş:</span>
                          <span>{new Date(selectedCustomer.lastOrderDate).toLocaleDateString('tr-TR')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedCustomer.notes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Notlar</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedCustomer.notes}
                    </p>
                  </div>
                )}

                {selectedCustomer.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Etiketler</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCustomer.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
