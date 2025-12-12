'use client';

// Force dynamic rendering - prevent pre-rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cities, getDistrictsByCity } from '@/data/cities';
import { DistrictPricing, CityPricing } from '@/types/pricing';

export default function PricingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [districts, setDistricts] = useState<DistrictPricing[]>([]);
  const [cityPricings, setCityPricings] = useState<CityPricing[]>([]);
  const [defaultConfig, setDefaultConfig] = useState({ defaultPrice: 25, defaultExpressPrice: 50 });
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: 'district' | 'city' | 'config'; id?: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [formData, setFormData] = useState({
    city: '',
    district: '',
    basePrice: '',
    expressPrice: '',
    isActive: true
  });
  const [configData, setConfigData] = useState({
    defaultPrice: '',
    defaultExpressPrice: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const checkAuthentication = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();
      
      if (data.success && data.authenticated) {
        setIsAuthenticated(true);
        loadPricing();
      } else {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = '/admin/login';
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const loadPricing = async () => {
    try {
      const response = await fetch('/api/pricing');
      if (response.ok) {
        const data = await response.json();
        setDistricts(data.districts || []);
        setCityPricings(data.cities || []);
        if (data.config) {
          setDefaultConfig(data.config);
          setConfigData({
            defaultPrice: data.config.defaultPrice.toString(),
            defaultExpressPrice: data.config.defaultExpressPrice.toString()
          });
        }
      }
    } catch (error) {
      console.error('Error loading pricing:', error);
      setErrorMessage('Fiyatlandırma verileri yüklenirken hata oluştu');
    }
  };

  const handleSaveDistrict = async () => {
    try {
      setIsSaving(true);
      setErrorMessage('');

      if (!formData.city || !formData.district || !formData.basePrice) {
        setErrorMessage('Şehir, ilçe ve temel fiyat zorunludur');
        return;
      }

      const pricingData: DistrictPricing = {
        city: formData.city,
        district: formData.district,
        basePrice: parseFloat(formData.basePrice),
        expressPrice: formData.expressPrice ? parseFloat(formData.expressPrice) : undefined,
        isActive: formData.isActive
      };

      const response = editingItem?.id
        ? await fetch('/api/pricing', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'district',
              id: editingItem.id,
              pricing: pricingData
            })
          })
        : await fetch('/api/pricing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'district',
              pricing: pricingData
            })
          });

      if (response.ok) {
        setSuccessMessage(editingItem?.id ? 'İlçe fiyatı güncellendi' : 'İlçe fiyatı eklendi');
        setTimeout(() => setSuccessMessage(''), 3000);
        resetForm();
        await loadPricing();
      } else {
        const error = await response.json();
        setErrorMessage(error.error || 'Kayıt sırasında hata oluştu');
      }
    } catch (error) {
      console.error('Error saving district pricing:', error);
      setErrorMessage('Kayıt sırasında hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCity = async () => {
    try {
      setIsSaving(true);
      setErrorMessage('');

      if (!formData.city || !formData.basePrice) {
        setErrorMessage('Şehir ve temel fiyat zorunludur');
        return;
      }

      const pricingData: CityPricing = {
        city: formData.city,
        basePrice: parseFloat(formData.basePrice),
        expressPrice: formData.expressPrice ? parseFloat(formData.expressPrice) : undefined,
        isActive: formData.isActive
      };

      const response = editingItem?.id
        ? await fetch('/api/pricing', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'city',
              id: editingItem.id,
              pricing: pricingData
            })
          })
        : await fetch('/api/pricing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'city',
              pricing: pricingData
            })
          });

      if (response.ok) {
        setSuccessMessage(editingItem?.id ? 'Şehir fiyatı güncellendi' : 'Şehir fiyatı eklendi');
        setTimeout(() => setSuccessMessage(''), 3000);
        resetForm();
        await loadPricing();
      } else {
        const error = await response.json();
        setErrorMessage(error.error || 'Kayıt sırasında hata oluştu');
      }
    } catch (error) {
      console.error('Error saving city pricing:', error);
      setErrorMessage('Kayıt sırasında hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setIsSaving(true);
      setErrorMessage('');

      if (!configData.defaultPrice || !configData.defaultExpressPrice) {
        setErrorMessage('Varsayılan fiyatlar zorunludur');
        return;
      }

      const response = await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'config',
          pricing: {
            defaultPrice: parseFloat(configData.defaultPrice),
            defaultExpressPrice: parseFloat(configData.defaultExpressPrice)
          }
        })
      });

      if (response.ok) {
        setSuccessMessage('Varsayılan fiyatlar güncellendi');
        setTimeout(() => setSuccessMessage(''), 3000);
        await loadPricing();
      } else {
        const error = await response.json();
        setErrorMessage(error.error || 'Kayıt sırasında hata oluştu');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setErrorMessage('Kayıt sırasında hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (type: 'district' | 'city', id: string) => {
    if (!confirm('Bu fiyatlandırmayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/pricing?type=${type}&id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccessMessage('Fiyatlandırma silindi');
        setTimeout(() => setSuccessMessage(''), 3000);
        await loadPricing();
      } else {
        const error = await response.json();
        setErrorMessage(error.error || 'Silme işlemi sırasında hata oluştu');
      }
    } catch (error) {
      console.error('Error deleting pricing:', error);
      setErrorMessage('Silme işlemi sırasında hata oluştu');
    }
  };

  const handleEdit = (type: 'district' | 'city', item: DistrictPricing | CityPricing) => {
    setFormData({
      city: item.city,
      district: type === 'district' ? (item as DistrictPricing).district : '',
      basePrice: item.basePrice.toString(),
      expressPrice: item.expressPrice?.toString() || '',
      isActive: item.isActive
    });
    setEditingItem({ type, id: type === 'district' ? `${item.city}_${(item as DistrictPricing).district}` : item.city });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      city: '',
      district: '',
      basePrice: '',
      expressPrice: '',
      isActive: true
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const filteredDistricts = districts.filter(d => {
    const matchesSearch = d.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !selectedCity || d.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const filteredCities = cityPricings.filter(c => {
    const matchesSearch = c.city.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fiyatlandırma Yönetimi</h1>
              <p className="text-gray-600 mt-1">Şehir ve ilçe bazlı teslimat fiyatlarını yönetin</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={loadPricing}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Yenile
              </Button>
              <Button onClick={() => setShowForm(!showForm)} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Fiyatlandırma
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Varsayılan Fiyatlar */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Varsayılan Fiyatlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Varsayılan Standart Teslimat (₺)</Label>
                <Input
                  type="number"
                  value={configData.defaultPrice}
                  onChange={(e) => setConfigData({ ...configData, defaultPrice: e.target.value })}
                  placeholder="25"
                />
              </div>
              <div>
                <Label>Varsayılan Hızlı Teslimat (₺)</Label>
                <Input
                  type="number"
                  value={configData.defaultExpressPrice}
                  onChange={(e) => setConfigData({ ...configData, defaultExpressPrice: e.target.value })}
                  placeholder="50"
                />
              </div>
            </div>
            <Button onClick={handleSaveConfig} disabled={isSaving} className="mt-4 bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Kaydet
            </Button>
          </CardContent>
        </Card>

        {/* Form */}
        {showForm && (
          <Card className="mb-8 border-2 border-green-500">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-green-600" />
                {editingItem ? 'Fiyatlandırmayı Düzenle' : 'Yeni Fiyatlandırma Ekle'}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                İl ve ilçe seçerek o bölge için teslimat fiyatını belirleyin
              </p>
            </CardHeader>
            <CardContent className="mt-6">
              <div className="space-y-6">
                {/* İl ve İlçe Seçimi */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-green-600" />
                    Bölge Seçimi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-base font-medium">İl Seçin *</Label>
                      <select
                        value={formData.city}
                        onChange={(e) => {
                          setFormData({ ...formData, city: e.target.value, district: '' });
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                        required
                      >
                        <option value="">-- İl Seçiniz --</option>
                        {cities.map(city => (
                          <option key={city.name} value={city.name}>{city.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-base font-medium">
                        {editingItem?.type === 'city' ? 'Şehir Fiyatı (İlçe belirtilmeyecek)' : 'İlçe Seçin *'}
                      </Label>
                      <select
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                        required={!editingItem || editingItem.type === 'district'}
                        disabled={!formData.city || editingItem?.type === 'city'}
                      >
                        <option value="">-- İlçe Seçiniz --</option>
                        {formData.city && getDistrictsByCity(formData.city).map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                      {editingItem?.type === 'city' && (
                        <p className="text-xs text-gray-500 mt-1">
                          Şehir fiyatı: Tüm ilçeler için geçerli (özel ilçe fiyatı yoksa)
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fiyat Girişi */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                    Fiyatlandırma
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-base font-medium">Standart Teslimat Fiyatı (₺) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.basePrice}
                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                        placeholder="Örn: 25.00"
                        required
                        className="text-lg px-4 py-3 border-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Normal teslimat için fiyat
                      </p>
                    </div>
                    <div>
                      <Label className="text-base font-medium">Hızlı Teslimat Fiyatı (₺)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.expressPrice}
                        onChange={(e) => setFormData({ ...formData, expressPrice: e.target.value })}
                        placeholder="Örn: 50.00"
                        className="text-lg px-4 py-3 border-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Hızlı teslimat için fiyat (opsiyonel)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Durum */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <Label htmlFor="isActive" className="text-base font-medium cursor-pointer">
                    Bu fiyatlandırma aktif olsun
                  </Label>
                </div>

                {/* Bilgi Mesajı */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Not:</strong> İlçe belirtirseniz sadece o ilçe için geçerli olur. 
                    İlçe belirtmezseniz tüm il için geçerli olur. Daha spesifik fiyatlandırma (ilçe) önceliklidir.
                  </p>
                </div>

                {/* Butonlar */}
                <div className="flex space-x-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      if (editingItem?.type === 'district' || (!editingItem && formData.district)) {
                        handleSaveDistrict();
                      } else if (editingItem?.type === 'city' || (!editingItem && formData.city && !formData.district)) {
                        handleSaveCity();
                      } else {
                        setErrorMessage('Lütfen en azından şehir seçin');
                      }
                    }}
                    disabled={isSaving || !formData.city}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-base"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingItem ? 'Fiyatı Güncelle' : 'Fiyatı Kaydet'}
                  </Button>
                  <Button variant="outline" onClick={resetForm} className="py-3 text-base">
                    <X className="h-4 w-4 mr-2" />
                    İptal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Şehir veya ilçe ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tüm Şehirler</option>
            {cities.map(city => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </select>
        </div>

        {/* İlçe Fiyatlandırmaları */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              İlçe Fiyatlandırmaları ({filteredDistricts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Şehir</th>
                    <th className="text-left p-2">İlçe</th>
                    <th className="text-left p-2">Standart (₺)</th>
                    <th className="text-left p-2">Hızlı (₺)</th>
                    <th className="text-left p-2">Durum</th>
                    <th className="text-left p-2">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDistricts.map((district) => (
                    <tr key={`${district.city}_${district.district}`} className="border-b">
                      <td className="p-2">{district.city}</td>
                      <td className="p-2">{district.district}</td>
                      <td className="p-2">{district.basePrice.toFixed(2)}</td>
                      <td className="p-2">{district.expressPrice?.toFixed(2) || '-'}</td>
                      <td className="p-2">
                        <Badge variant={district.isActive ? 'default' : 'secondary'}>
                          {district.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit('district', district)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete('district', `${district.city}_${district.district}`)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredDistricts.length === 0 && (
                <div className="text-center py-8 text-gray-500">İlçe fiyatlandırması bulunamadı</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Şehir Fiyatlandırmaları */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Şehir Fiyatlandırmaları ({filteredCities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Şehir</th>
                    <th className="text-left p-2">Standart (₺)</th>
                    <th className="text-left p-2">Hızlı (₺)</th>
                    <th className="text-left p-2">Durum</th>
                    <th className="text-left p-2">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCities.map((city) => (
                    <tr key={city.city} className="border-b">
                      <td className="p-2">{city.city}</td>
                      <td className="p-2">{city.basePrice.toFixed(2)}</td>
                      <td className="p-2">{city.expressPrice?.toFixed(2) || '-'}</td>
                      <td className="p-2">
                        <Badge variant={city.isActive ? 'default' : 'secondary'}>
                          {city.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit('city', city)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete('city', city.city)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCities.length === 0 && (
                <div className="text-center py-8 text-gray-500">Şehir fiyatlandırması bulunamadı</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

