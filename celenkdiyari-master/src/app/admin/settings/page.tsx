'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Save,
  Globe,
  Palette,
  Phone,
  Share2,
  DollarSign,
  Eye,
  RefreshCw,
  Calendar,
  ShoppingCart,
  X
} from 'lucide-react';
import { SiteSettings, SettingsUpdateRequest } from '@/types/settings';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const checkAuthentication = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();
      
      if (data.success && data.authenticated) {
        setIsAuthenticated(true);
        loadSettings();
      } else {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = '/admin/login';
    } finally {
      setIsLoadingAuth(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      } else {
        setErrorMessage('Site ayarları yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setErrorMessage('Site ayarları yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      setErrorMessage('');

      const updateData: SettingsUpdateRequest = {
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        siteKeywords: settings.siteKeywords,
        siteUrl: settings.siteUrl,
        logoUrl: settings.logoUrl,
        faviconUrl: settings.faviconUrl,
        contact: settings.contact,
        socialMedia: settings.socialMedia,
        seo: settings.seo,
        theme: settings.theme,
        business: settings.business,
        notifications: settings.notifications,
        security: settings.security,
        holidayClosure: settings.holidayClosure,
        orderBlockedDays: settings.orderBlockedDays
      };

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        const error = await response.json();
        setErrorMessage(error.error || 'Ayarlar kaydedilirken hata oluştu');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrorMessage('Ayarlar kaydedilirken hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = (updates: Partial<SiteSettings>) => {
    if (settings) {
      // Deep merge for nested objects
      const updatedSettings = { ...settings };
      
      // Handle nested objects properly
      if (updates.contact) {
        updatedSettings.contact = { ...settings.contact, ...updates.contact };
      }
      if (updates.socialMedia) {
        updatedSettings.socialMedia = { ...settings.socialMedia, ...updates.socialMedia };
      }
      if (updates.seo) {
        updatedSettings.seo = { ...settings.seo, ...updates.seo };
      }
      if (updates.theme) {
        updatedSettings.theme = { ...settings.theme, ...updates.theme };
      }
      if (updates.business) {
        updatedSettings.business = { ...settings.business, ...updates.business };
      }
      if (updates.notifications) {
        updatedSettings.notifications = { ...settings.notifications, ...updates.notifications };
      }
      if (updates.security) {
        updatedSettings.security = { ...settings.security, ...updates.security };
      }
      if (updates.holidayClosure) {
        // Ensure holidayClosure exists before spreading
        updatedSettings.holidayClosure = { 
          ...(settings.holidayClosure || {
            isEnabled: false,
            startDate: '',
            endDate: '',
            message: 'Özel günlerde hizmet vermiyoruz. Anlayışınız için teşekkür ederiz.',
            showCountdown: true
          }), 
          ...updates.holidayClosure 
        };
      }
      
      if (updates.orderBlockedDays !== undefined) {
        updatedSettings.orderBlockedDays = updates.orderBlockedDays;
      }
      
      // Merge other top-level updates
      Object.keys(updates).forEach(key => {
        if (!['contact', 'socialMedia', 'seo', 'theme', 'business', 'notifications', 'security', 'holidayClosure', 'orderBlockedDays'].includes(key)) {
          (updatedSettings as any)[key] = (updates as any)[key];
        }
      });
      
      setSettings(updatedSettings);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-lg">Kimlik doğrulanıyor...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-lg">Site ayarları yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Hata</h1>
          <p className="text-gray-600">{errorMessage}</p>
          <Button onClick={loadSettings} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
            <Settings className="h-6 w-6 lg:h-8 lg:w-8 mr-3 text-green-600" />
            Site Ayarları
          </h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">Sitenizin genel ayarlarını yönetin</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700 w-full lg:w-auto"
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </Button>
      </div>

      {showSuccessMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          ✅ Site ayarları başarıyla kaydedildi!
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          ❌ {errorMessage}
        </div>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general" className="flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            Genel
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center">
            <Phone className="h-4 w-4 mr-2" />
            İletişim
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center">
            <Share2 className="h-4 w-4 mr-2" />
            Sosyal Medya
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center">
            <Palette className="h-4 w-4 mr-2" />
            Tema
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            İş
          </TabsTrigger>
          <TabsTrigger value="holiday" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Özel Günler
          </TabsTrigger>
        </TabsList>

        {/* Genel Ayarlar */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Genel Site Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Adı</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => updateSettings({ siteName: e.target.value })}
                    placeholder="Site adını girin"
                  />
                </div>
                <div>
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={settings.siteUrl}
                    onChange={(e) => updateSettings({ siteUrl: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="siteDescription">Site Açıklaması</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => updateSettings({ siteDescription: e.target.value })}
                  placeholder="Sitenizin açıklamasını girin"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="siteKeywords">Anahtar Kelimeler</Label>
                <Input
                  id="siteKeywords"
                  value={settings.siteKeywords}
                  onChange={(e) => updateSettings({ siteKeywords: e.target.value })}
                  placeholder="çelenk, çiçek, açılış (virgülle ayırın)"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={settings.logoUrl}
                    onChange={(e) => updateSettings({ logoUrl: e.target.value })}
                    placeholder="/images/logo.png"
                  />
                </div>
                <div>
                  <Label htmlFor="faviconUrl">Favicon URL</Label>
                  <Input
                    id="faviconUrl"
                    value={settings.faviconUrl}
                    onChange={(e) => updateSettings({ faviconUrl: e.target.value })}
                    placeholder="/favicon.ico"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* İletişim Bilgileri */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>İletişim Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={settings.contact.phone}
                    onChange={(e) => updateSettings({ 
                      contact: { ...settings.contact, phone: e.target.value }
                    })}
                    placeholder="+90 555 123 45 67"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.contact.email}
                    onChange={(e) => updateSettings({ 
                      contact: { ...settings.contact, email: e.target.value }
                    })}
                    placeholder="info@example.com"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Adres</Label>
                <Textarea
                  id="address"
                  value={settings.contact.address}
                  onChange={(e) => updateSettings({ 
                    contact: { ...settings.contact, address: e.target.value }
                  })}
                  placeholder="Tam adres bilgisi"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={settings.contact.whatsapp}
                    onChange={(e) => updateSettings({ 
                      contact: { ...settings.contact, whatsapp: e.target.value }
                    })}
                    placeholder="+90 555 123 45 67"
                  />
                </div>
                <div>
                  <Label htmlFor="workingHours">Çalışma Saatleri</Label>
                  <Input
                    id="workingHours"
                    value={settings.contact.workingHours}
                    onChange={(e) => updateSettings({ 
                      contact: { ...settings.contact, workingHours: e.target.value }
                    })}
                    placeholder="Pazartesi - Cumartesi: 09:00 - 18:00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sosyal Medya */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sosyal Medya Hesapları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={settings.socialMedia.facebook || ''}
                    onChange={(e) => updateSettings({ 
                      socialMedia: { ...settings.socialMedia, facebook: e.target.value }
                    })}
                    placeholder="https://facebook.com/username"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={settings.socialMedia.instagram || ''}
                    onChange={(e) => updateSettings({ 
                      socialMedia: { ...settings.socialMedia, instagram: e.target.value }
                    })}
                    placeholder="https://instagram.com/username"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={settings.socialMedia.twitter || ''}
                    onChange={(e) => updateSettings({ 
                      socialMedia: { ...settings.socialMedia, twitter: e.target.value }
                    })}
                    placeholder="https://twitter.com/username"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={settings.socialMedia.linkedin || ''}
                    onChange={(e) => updateSettings({ 
                      socialMedia: { ...settings.socialMedia, linkedin: e.target.value }
                    })}
                    placeholder="https://linkedin.com/company/username"
                  />
                </div>
                <div>
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={settings.socialMedia.youtube || ''}
                    onChange={(e) => updateSettings({ 
                      socialMedia: { ...settings.socialMedia, youtube: e.target.value }
                    })}
                    placeholder="https://youtube.com/channel/username"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Ayarları */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Başlık</Label>
                <Input
                  id="metaTitle"
                  value={settings.seo.metaTitle}
                  onChange={(e) => updateSettings({ 
                    seo: { ...settings.seo, metaTitle: e.target.value }
                  })}
                  placeholder="Site başlığı (SEO için)"
                />
              </div>
              
              <div>
                <Label htmlFor="metaDescription">Meta Açıklama</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.seo.metaDescription}
                  onChange={(e) => updateSettings({ 
                    seo: { ...settings.seo, metaDescription: e.target.value }
                  })}
                  placeholder="Site açıklaması (SEO için)"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="metaKeywords">Meta Anahtar Kelimeler</Label>
                <Input
                  id="metaKeywords"
                  value={settings.seo.metaKeywords}
                  onChange={(e) => updateSettings({ 
                    seo: { ...settings.seo, metaKeywords: e.target.value }
                  })}
                  placeholder="anahtar, kelimeler, virgülle, ayırın"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
                  <Input
                    id="googleAnalytics"
                    value={settings.seo.googleAnalytics || ''}
                    onChange={(e) => updateSettings({ 
                      seo: { ...settings.seo, googleAnalytics: e.target.value }
                    })}
                    placeholder="GA-XXXXXXXXX-X"
                  />
                </div>
                <div>
                  <Label htmlFor="facebookPixel">Facebook Pixel ID</Label>
                  <Input
                    id="facebookPixel"
                    value={settings.seo.facebookPixel || ''}
                    onChange={(e) => updateSettings({ 
                      seo: { ...settings.seo, facebookPixel: e.target.value }
                    })}
                    placeholder="123456789012345"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tema Ayarları */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tema Renkleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Ana Renk</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.theme.primaryColor}
                      onChange={(e) => updateSettings({ 
                        theme: { ...settings.theme, primaryColor: e.target.value }
                      })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.theme.primaryColor}
                      onChange={(e) => updateSettings({ 
                        theme: { ...settings.theme, primaryColor: e.target.value }
                      })}
                      placeholder="#16a34a"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">İkincil Renk</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.theme.secondaryColor}
                      onChange={(e) => updateSettings({ 
                        theme: { ...settings.theme, secondaryColor: e.target.value }
                      })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.theme.secondaryColor}
                      onChange={(e) => updateSettings({ 
                        theme: { ...settings.theme, secondaryColor: e.target.value }
                      })}
                      placeholder="#059669"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Vurgu Rengi</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={settings.theme.accentColor}
                      onChange={(e) => updateSettings({ 
                        theme: { ...settings.theme, accentColor: e.target.value }
                      })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.theme.accentColor}
                      onChange={(e) => updateSettings({ 
                        theme: { ...settings.theme, accentColor: e.target.value }
                      })}
                      placeholder="#10b981"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* İş Ayarları */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>İş Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Para Birimi</Label>
                  <Input
                    id="currency"
                    value={settings.business.currency}
                    onChange={(e) => updateSettings({ 
                      business: { ...settings.business, currency: e.target.value }
                    })}
                    placeholder="TL"
                  />
                </div>
                <div>
                  <Label htmlFor="taxRate">KDV Oranı (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={settings.business.taxRate}
                    onChange={(e) => updateSettings({ 
                      business: { ...settings.business, taxRate: Number(e.target.value) }
                    })}
                    placeholder="18"
                  />
                </div>
                <div>
                  <Label htmlFor="shippingCost">Kargo Ücreti</Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    value={settings.business.shippingCost}
                    onChange={(e) => updateSettings({ 
                      business: { ...settings.business, shippingCost: Number(e.target.value) }
                    })}
                    placeholder="50"
                  />
                </div>
                <div>
                  <Label htmlFor="freeShippingThreshold">Ücretsiz Kargo Limiti</Label>
                  <Input
                    id="freeShippingThreshold"
                    type="number"
                    value={settings.business.freeShippingThreshold}
                    onChange={(e) => updateSettings({ 
                      business: { ...settings.business, freeShippingThreshold: Number(e.target.value) }
                    })}
                    placeholder="500"
                  />
                </div>
                <div>
                  <Label htmlFor="minOrderAmount">Minimum Sipariş Tutarı</Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    value={settings.business.minOrderAmount}
                    onChange={(e) => updateSettings({ 
                      business: { ...settings.business, minOrderAmount: Number(e.target.value) }
                    })}
                    placeholder="100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Havale/EFT Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle>Havale/EFT Bilgileri</CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                Havale/EFT ile ödeme yapan müşterilere gösterilecek banka bilgileri
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Banka Adı</Label>
                  <Input
                    id="bankName"
                    value={settings.business.bankTransferInfo?.bankName || ''}
                    onChange={(e) => updateSettings({ 
                      business: { 
                        ...settings.business, 
                        bankTransferInfo: {
                          ...settings.business.bankTransferInfo,
                          bankName: e.target.value,
                          iban: settings.business.bankTransferInfo?.iban || '',
                          accountHolder: settings.business.bankTransferInfo?.accountHolder || ''
                        }
                      }
                    })}
                    placeholder="Örn: Ziraat Bankası"
                  />
                </div>
                <div>
                  <Label htmlFor="accountHolder">Hesap Sahibi</Label>
                  <Input
                    id="accountHolder"
                    value={settings.business.bankTransferInfo?.accountHolder || ''}
                    onChange={(e) => updateSettings({ 
                      business: { 
                        ...settings.business, 
                        bankTransferInfo: {
                          ...settings.business.bankTransferInfo,
                          bankName: settings.business.bankTransferInfo?.bankName || '',
                          iban: settings.business.bankTransferInfo?.iban || '',
                          accountHolder: e.target.value
                        }
                      }
                    })}
                    placeholder="Hesap sahibi adı"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    value={settings.business.bankTransferInfo?.iban || ''}
                    onChange={(e) => updateSettings({ 
                      business: { 
                        ...settings.business, 
                        bankTransferInfo: {
                          ...settings.business.bankTransferInfo,
                          bankName: settings.business.bankTransferInfo?.bankName || '',
                          iban: e.target.value,
                          accountHolder: settings.business.bankTransferInfo?.accountHolder || ''
                        }
                      }
                    })}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                  />
                </div>
                <div>
                  <Label htmlFor="branchName">Şube Adı (Opsiyonel)</Label>
                  <Input
                    id="branchName"
                    value={settings.business.bankTransferInfo?.branchName || ''}
                    onChange={(e) => updateSettings({ 
                      business: { 
                        ...settings.business, 
                        bankTransferInfo: {
                          ...settings.business.bankTransferInfo,
                          bankName: settings.business.bankTransferInfo?.bankName || '',
                          iban: settings.business.bankTransferInfo?.iban || '',
                          accountHolder: settings.business.bankTransferInfo?.accountHolder || '',
                          branchName: e.target.value
                        }
                      }
                    })}
                    placeholder="Şube adı"
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Hesap No (Opsiyonel)</Label>
                  <Input
                    id="accountNumber"
                    value={settings.business.bankTransferInfo?.accountNumber || ''}
                    onChange={(e) => updateSettings({ 
                      business: { 
                        ...settings.business, 
                        bankTransferInfo: {
                          ...settings.business.bankTransferInfo,
                          bankName: settings.business.bankTransferInfo?.bankName || '',
                          iban: settings.business.bankTransferInfo?.iban || '',
                          accountHolder: settings.business.bankTransferInfo?.accountHolder || '',
                          accountNumber: e.target.value
                        }
                      }
                    })}
                    placeholder="Hesap numarası"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Özel Günler - Site Kapanış Ayarları */}
        <TabsContent value="holiday" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Özel Günler - Site Kapanış Ayarları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="holidayEnabled"
                      checked={settings.holidayClosure?.isEnabled || false}
                      onChange={(e) => updateSettings({ 
                        holidayClosure: { 
                          ...settings.holidayClosure, 
                          isEnabled: e.target.checked 
                        }
                      })}
                      className="rounded"
                    />
                    <Label htmlFor="holidayEnabled">Özel Günlerde Site Kapanışını Etkinleştir</Label>
                  </div>
                  
                  <div>
                    <Label htmlFor="startDate">Kapanış Başlangıç Tarihi</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={settings.holidayClosure?.startDate ? new Date(settings.holidayClosure.startDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => updateSettings({ 
                        holidayClosure: { 
                          ...(settings.holidayClosure || {
                            isEnabled: false,
                            startDate: '',
                            endDate: '',
                            message: 'Özel günlerde hizmet vermiyoruz. Anlayışınız için teşekkür ederiz.',
                            showCountdown: true
                          }), 
                          startDate: e.target.value 
                        }
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="endDate">Kapanış Bitiş Tarihi</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={settings.holidayClosure?.endDate ? new Date(settings.holidayClosure.endDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => updateSettings({ 
                        holidayClosure: { 
                          ...(settings.holidayClosure || {
                            isEnabled: false,
                            startDate: '',
                            endDate: '',
                            message: 'Özel günlerde hizmet vermiyoruz. Anlayışınız için teşekkür ederiz.',
                            showCountdown: true
                          }), 
                          endDate: e.target.value 
                        }
                      })}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="holidayMessage">Kapanış Mesajı</Label>
                    <Textarea
                      id="holidayMessage"
                      value={settings.holidayClosure?.message || ''}
                      onChange={(e) => updateSettings({ 
                        holidayClosure: { 
                          ...settings.holidayClosure, 
                          message: e.target.value 
                        }
                      })}
                      placeholder="Özel günlerde hizmet vermiyoruz. Anlayışınız için teşekkür ederiz."
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showCountdown"
                      checked={settings.holidayClosure?.showCountdown || false}
                      onChange={(e) => updateSettings({ 
                        holidayClosure: { 
                          ...settings.holidayClosure, 
                          showCountdown: e.target.checked 
                        }
                      })}
                      className="rounded"
                    />
                    <Label htmlFor="showCountdown">Geri Sayım Göster</Label>
                  </div>
                </div>
              </div>
              
              {settings.holidayClosure?.isEnabled && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">Önizleme</h3>
                  <p className="text-sm text-yellow-700">
                    Site kapanışı aktif olduğunda, ziyaretçiler özel bir sayfa görecek ve site işlevselliği sınırlanacaktır.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sipariş Engelleme - Özel Günler */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Sipariş Engelleme - Özel Günler
              </CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                Belirlediğiniz özel günlerde sipariş alımını engelleyebilirsiniz. Bu günlerde müşteriler sipariş veremez.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Özel Günler Listesi</h3>
                <Button
                  onClick={() => {
                    const newDay = {
                      id: Date.now().toString(),
                      name: '',
                      startDate: '',
                      endDate: '',
                      message: 'Bu özel günde sipariş alımı kapalıdır. Anlayışınız için teşekkür ederiz.',
                      isActive: true
                    };
                    const currentDays = settings.orderBlockedDays || [];
                    updateSettings({ orderBlockedDays: [...currentDays, newDay] });
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Yeni Özel Gün Ekle
                </Button>
              </div>

              {(!settings.orderBlockedDays || settings.orderBlockedDays.length === 0) ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Henüz özel gün eklenmemiş.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {settings.orderBlockedDays.map((day, index) => (
                    <Card key={day.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={day.isActive}
                              onChange={(e) => {
                                const updatedDays = [...settings.orderBlockedDays];
                                updatedDays[index] = { ...day, isActive: e.target.checked };
                                updateSettings({ orderBlockedDays: updatedDays });
                              }}
                              className="rounded"
                            />
                            <Label className="font-semibold">Aktif</Label>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const updatedDays = settings.orderBlockedDays.filter(d => d.id !== day.id);
                              updateSettings({ orderBlockedDays: updatedDays });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`day-name-${day.id}`}>Özel Gün Adı</Label>
                            <Input
                              id={`day-name-${day.id}`}
                              value={day.name}
                              onChange={(e) => {
                                const updatedDays = [...settings.orderBlockedDays];
                                updatedDays[index] = { ...day, name: e.target.value };
                                updateSettings({ orderBlockedDays: updatedDays });
                              }}
                              placeholder="Örn: Kurban Bayramı, Yılbaşı"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`day-start-${day.id}`}>Başlangıç Tarihi</Label>
                            <Input
                              id={`day-start-${day.id}`}
                              type="date"
                              value={day.startDate ? new Date(day.startDate).toISOString().slice(0, 10) : ''}
                              onChange={(e) => {
                                const updatedDays = [...settings.orderBlockedDays];
                                // Tarihi günün başlangıcı olarak ayarla (00:00:00)
                                const date = new Date(e.target.value);
                                date.setHours(0, 0, 0, 0);
                                updatedDays[index] = { ...day, startDate: date.toISOString() };
                                updateSettings({ orderBlockedDays: updatedDays });
                              }}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`day-end-${day.id}`}>Bitiş Tarihi</Label>
                            <Input
                              id={`day-end-${day.id}`}
                              type="date"
                              value={day.endDate ? new Date(day.endDate).toISOString().slice(0, 10) : ''}
                              onChange={(e) => {
                                const updatedDays = [...settings.orderBlockedDays];
                                // Tarihi günün sonu olarak ayarla (23:59:59)
                                const date = new Date(e.target.value);
                                date.setHours(23, 59, 59, 999);
                                updatedDays[index] = { ...day, endDate: date.toISOString() };
                                updateSettings({ orderBlockedDays: updatedDays });
                              }}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`day-message-${day.id}`}>Mesaj</Label>
                            <Textarea
                              id={`day-message-${day.id}`}
                              value={day.message}
                              onChange={(e) => {
                                const updatedDays = [...settings.orderBlockedDays];
                                updatedDays[index] = { ...day, message: e.target.value };
                                updateSettings({ orderBlockedDays: updatedDays });
                              }}
                              placeholder="Müşterilere gösterilecek mesaj"
                              rows={2}
                            />
                          </div>
                        </div>

                        {day.startDate && day.endDate && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <strong>Kapanış Süresi:</strong>{' '}
                              {new Date(day.startDate).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}{' '}
                              -{' '}
                              {new Date(day.endDate).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
