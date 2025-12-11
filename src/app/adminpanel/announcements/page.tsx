'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Target,
  Settings,
  ArrowLeft,
  Home
} from 'lucide-react';
import Link from 'next/link';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  isActive: boolean;
  priority: number;
  startDate: string;
  endDate?: string;
  targetPages: string[];
  createdAt: string;
  updatedAt: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'info' as Announcement['type'],
    isActive: true,
    priority: 5,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    targetPages: ['home'] as string[]
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setIsLoading(true);
      console.log('📢 Loading announcements...');
      const response = await fetch('/api/announcements');
      console.log('📢 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📢 Loaded announcements:', data);
        setAnnouncements(data.announcements || []);
      } else {
        const error = await response.json();
        console.error('❌ Failed to load announcements:', error);
        setErrorMessage('Duyurular yüklenirken hata oluştu: ' + (error.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('❌ Error loading announcements:', error);
      setErrorMessage('Duyurular yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAnnouncement = async () => {
    try {
      if (!newAnnouncement.title || !newAnnouncement.content) {
        setErrorMessage('Başlık ve içerik gereklidir');
        return;
      }

      const url = isEditingAnnouncement 
        ? `/api/announcements/${editingAnnouncementId}`
        : '/api/announcements';
      
      const method = isEditingAnnouncement ? 'PUT' : 'POST';

      console.log('📢 Saving announcement:', newAnnouncement);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAnnouncement),
      });

      console.log('📢 Save response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Announcement saved successfully:', result);
        
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
        
        setIsAddingAnnouncement(false);
        setIsEditingAnnouncement(false);
        setEditingAnnouncementId('');
        setNewAnnouncement({
          title: '',
          content: '',
          type: 'info',
          isActive: true,
          priority: 5,
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          targetPages: ['home']
        });
        
        await loadAnnouncements();
      } else {
        const error = await response.json();
        console.error('❌ Error response:', error);
        setErrorMessage(error.error || error.details || 'Duyuru kaydedilirken hata oluştu');
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      setErrorMessage('Duyuru kaydedilirken hata oluştu');
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncementId(announcement.id);
    setIsEditingAnnouncement(true);
    setIsAddingAnnouncement(false);
    setNewAnnouncement({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      isActive: announcement.isActive,
      priority: announcement.priority,
      startDate: announcement.startDate.split('T')[0],
      endDate: announcement.endDate ? announcement.endDate.split('T')[0] : '',
      targetPages: announcement.targetPages
    });
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadAnnouncements();
      } else {
        alert('Duyuru silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Duyuru silinirken hata oluştu');
    }
  };

  const toggleAnnouncementStatus = async (announcementId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        await loadAnnouncements();
      } else {
        alert('Duyuru durumu güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error updating announcement status:', error);
      alert('Duyuru durumu güncellenirken hata oluştu');
    }
  };

  const getTypeBadge = (type: Announcement['type']) => {
    const typeConfig = {
      info: { label: 'Bilgi', color: 'bg-blue-100 text-blue-800' },
      success: { label: 'Başarı', color: 'bg-green-100 text-green-800' },
      warning: { label: 'Uyarı', color: 'bg-yellow-100 text-yellow-800' },
      error: { label: 'Hata', color: 'bg-red-100 text-red-800' },
      promotion: { label: 'Kampanya', color: 'bg-purple-100 text-purple-800' }
    };

    const config = typeConfig[type] || typeConfig.info;
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
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
              <h1 className="text-3xl font-bold text-gray-900">Duyuru Yönetimi</h1>
              <p className="text-gray-600 mt-1">Site duyurularını yönetin ve yayınlayın</p>
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
            <p className="text-green-800">Duyuru başarıyla kaydedildi!</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Add/Edit Announcement Form */}
        {(isAddingAnnouncement || isEditingAnnouncement) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {isEditingAnnouncement ? 'Duyuru Düzenle' : 'Yeni Duyuru Ekle'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlık *
                  </label>
                  <Input
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Duyuru başlığı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tip
                  </label>
                  <select
                    value={newAnnouncement.type}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, type: e.target.value as Announcement['type'] }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="info">Bilgi</option>
                    <option value="success">Başarı</option>
                    <option value="warning">Uyarı</option>
                    <option value="error">Hata</option>
                    <option value="promotion">Kampanya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İçerik *
                </label>
                <Textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Duyuru içeriği"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Öncelik (1-10)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlangıç Tarihi
                  </label>
                  <Input
                    type="date"
                    value={newAnnouncement.startDate}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bitiş Tarihi (Opsiyonel)
                  </label>
                  <Input
                    type="date"
                    value={newAnnouncement.endDate}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hedef Sayfalar
                </label>
                <div className="flex flex-wrap gap-2">
                  {['home', 'products', 'cart', 'checkout'].map((page) => (
                    <label key={page} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newAnnouncement.targetPages.includes(page)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewAnnouncement(prev => ({
                              ...prev,
                              targetPages: [...prev.targetPages, page]
                            }));
                          } else {
                            setNewAnnouncement(prev => ({
                              ...prev,
                              targetPages: prev.targetPages.filter(p => p !== page)
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{page}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newAnnouncement.isActive}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Aktif</span>
                </label>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleSaveAnnouncement}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isEditingAnnouncement ? 'Güncelle' : 'Kaydet'}
                </Button>
                <Button
                  onClick={() => {
                    setIsAddingAnnouncement(false);
                    setIsEditingAnnouncement(false);
                    setEditingAnnouncementId('');
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

        {/* Action Buttons */}
        <div className="mb-6">
          <Button 
            onClick={() => {
              setIsAddingAnnouncement(true);
              setIsEditingAnnouncement(false);
              setEditingAnnouncementId('');
              setErrorMessage('');
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Duyuru Ekle
          </Button>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Duyuru Yok</h3>
                <p className="text-gray-500">İlk duyurunuzu ekleyerek başlayın</p>
              </CardContent>
            </Card>
          ) : (
            announcements.map((announcement) => (
              <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {announcement.title}
                        </h3>
                        {getTypeBadge(announcement.type)}
                        <Badge className={`${announcement.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} border-0`}>
                          {announcement.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {announcement.content}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(announcement.startDate).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4" />
                          <span>{announcement.targetPages.join(', ')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Settings className="h-4 w-4" />
                          <span>Öncelik: {announcement.priority}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAnnouncementStatus(announcement.id, announcement.isActive)}
                      >
                        {announcement.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAnnouncement(announcement)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
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