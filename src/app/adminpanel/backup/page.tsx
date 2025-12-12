'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  HardDrive,
  Shield,
  ArrowLeft,
  Home,
  Trash2,
  Eye,
  Calendar,
  Settings,
  Cloud,
  Server
} from 'lucide-react';
import Link from 'next/link';

interface BackupFile {
  id: string;
  name: string;
  type: 'full' | 'products' | 'orders' | 'customers' | 'settings';
  size: string;
  createdAt: string;
  status: 'completed' | 'failed' | 'in_progress';
  description?: string;
}

interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  retentionDays: number;
  includeImages: boolean;
  compressionLevel: 'low' | 'medium' | 'high';
  cloudStorage: boolean;
  emailNotifications: boolean;
}

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [selectedBackupType, setSelectedBackupType] = useState<BackupFile['type']>('full');
  const [backupDescription, setBackupDescription] = useState('');
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupFile | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settings, setSettings] = useState<BackupSettings>({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: 30,
    includeImages: true,
    compressionLevel: 'medium',
    cloudStorage: false,
    emailNotifications: true
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadBackups = async () => {
      try {
        setIsLoading(true);
        // TODO: Implement real API call to fetch backups
        // const response = await fetch('/api/backups');
        // if (response.ok) {
        //   const data = await response.json();
        //   setBackups(data.backups || []);
        // }
        setBackups([]);
      } catch (error) {
        console.error('Error loading backups:', error);
        setBackups([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBackups();
  }, []);

  const getBackupTypeLabel = (type: BackupFile['type']) => {
    const labels = {
      full: 'Tam Yedek',
      products: 'Ürünler',
      orders: 'Siparişler',
      customers: 'Müşteriler',
      settings: 'Ayarlar'
    };
    return labels[type];
  };

  const getBackupTypeIcon = (type: BackupFile['type']) => {
    const icons = {
      full: Database,
      products: FileText,
      orders: FileText,
      customers: FileText,
      settings: Settings
    };
    return icons[type];
  };

  const getStatusBadge = (status: BackupFile['status']) => {
    const statusConfig = {
      completed: { label: 'Tamamlandı', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { label: 'Başarısız', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      in_progress: { label: 'Devam Ediyor', color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    };

    const config = statusConfig[status] || statusConfig.completed;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleCreateBackup = async () => {
    try {
      setIsCreatingBackup(true);
      setErrorMessage('');

      // TODO: Implement real API call to create backup
      // const response = await fetch('/api/backups', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ type: selectedBackupType, description: backupDescription })
      // });
      // if (!response.ok) throw new Error('Failed to create backup');
      
      const newBackup: BackupFile = {
        id: Date.now().toString(),
        name: `${selectedBackupType}_backup_${new Date().toISOString().split('T')[0]}`,
        type: selectedBackupType,
        size: '0 KB',
        createdAt: new Date().toISOString(),
        status: 'in_progress',
        description: backupDescription
      };

      setBackups(prev => [newBackup, ...prev]);

      // Simulate backup process
      setTimeout(() => {
        setBackups(prev => prev.map(backup => 
          backup.id === newBackup.id 
            ? { ...backup, status: 'completed', size: '1.8 MB' }
            : backup
        ));
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }, 3000);

      setBackupDescription('');
    } catch (error) {
      console.error('Error creating backup:', error);
      setErrorMessage('Yedekleme oluşturulurken hata oluştu');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleDownloadBackup = async (backup: BackupFile) => {
    try {
      // TODO: Implement real API call to download backup
      // const response = await fetch(`/api/backups/${backup.id}/download`);
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const element = document.createElement('a');
      // element.href = url;
      // element.download = `${backup.name}.json`;
      // document.body.appendChild(element);
      // element.click();
      // document.body.removeChild(element);
      // window.URL.revokeObjectURL(url);
      
      const element = document.createElement('a');
      const file = new Blob(['Backup data'], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `${backup.name}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Bu yedeği silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setBackups(prev => prev.filter(backup => backup.id !== backupId));
    } catch (error) {
      console.error('Error deleting backup:', error);
      alert('Yedek silinirken hata oluştu');
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;

    try {
      // TODO: Implement real API call to restore backup
      // const response = await fetch(`/api/backups/${selectedBackup.id}/restore`, {
      //   method: 'POST'
      // });
      // if (!response.ok) throw new Error('Failed to restore backup');
      
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      setShowRestoreModal(false);
      setSelectedBackup(null);
    } catch (error) {
      console.error('Error restoring backup:', error);
      setErrorMessage('Yedek geri yüklenirken hata oluştu');
    }
  };

  const handleSaveSettings = async () => {
    try {
      // TODO: Implement real API call to save backup settings
      // const response = await fetch('/api/backups/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      // if (!response.ok) throw new Error('Failed to save settings');
      
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrorMessage('Ayarlar kaydedilirken hata oluştu');
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
              <h1 className="text-3xl font-bold text-gray-900">Yedekleme & Geri Yükleme</h1>
              <p className="text-gray-600 mt-1">Veri güvenliği ve yedekleme yönetimi</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={() => setShowSettingsModal(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Ayarlar
              </Button>
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
            <p className="text-green-800">İşlem başarıyla tamamlandı!</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Backup Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Yedek</p>
                  <p className="text-3xl font-bold text-gray-900">{backups.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Database className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Başarılı</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {backups.filter(b => b.status === 'completed').length}
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
                  <p className="text-sm font-medium text-gray-600">Toplam Boyut</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {backups.reduce((sum, backup) => {
                      const size = parseFloat(backup.size);
                      return sum + (isNaN(size) ? 0 : size);
                    }, 0).toFixed(1)} MB
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <HardDrive className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Son Yedek</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {backups.length > 0 ? new Date(backups[0].createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : '-'}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Backup */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Yeni Yedek Oluştur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yedek Türü
                </label>
                <select
                  value={selectedBackupType}
                  onChange={(e) => setSelectedBackupType(e.target.value as BackupFile['type'])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="full">Tam Yedek (Tüm Veriler)</option>
                  <option value="products">Ürün Verileri</option>
                  <option value="orders">Sipariş Verileri</option>
                  <option value="customers">Müşteri Verileri</option>
                  <option value="settings">Site Ayarları</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama (Opsiyonel)
                </label>
                <Input
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  placeholder="Yedek açıklaması"
                />
              </div>
            </div>
            <Button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCreatingBackup ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              {isCreatingBackup ? 'Yedekleme Oluşturuluyor...' : 'Yedek Oluştur'}
            </Button>
          </CardContent>
        </Card>

        {/* Backup List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Yedek Dosyaları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {backups.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Yedek Yok</h3>
                  <p className="text-gray-500">İlk yedeğinizi oluşturarak başlayın</p>
                </div>
              ) : (
                backups.map((backup) => {
                  const Icon = getBackupTypeIcon(backup.type);
                  return (
                    <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{backup.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{getBackupTypeLabel(backup.type)}</span>
                            <span>•</span>
                            <span>{backup.size}</span>
                            <span>•</span>
                            <span>{new Date(backup.createdAt).toLocaleString('tr-TR')}</span>
                          </div>
                          {backup.description && (
                            <p className="text-sm text-gray-500 mt-1">{backup.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(backup.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadBackup(backup)}
                          disabled={backup.status !== 'completed'}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBackup(backup);
                            setShowRestoreModal(true);
                          }}
                          disabled={backup.status !== 'completed'}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBackup(backup.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Restore Modal */}
      {showRestoreModal && selectedBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Yedek Geri Yükle</h2>
            <p className="text-gray-600 mb-4">
              <strong>{selectedBackup.name}</strong> yedeğini geri yüklemek istediğinizden emin misiniz?
            </p>
            <p className="text-sm text-red-600 mb-6">
              ⚠️ Bu işlem mevcut verileri değiştirecektir. Geri alınamaz!
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={handleRestoreBackup}
                className="bg-red-600 hover:bg-red-700 flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Geri Yükle
              </Button>
              <Button
                onClick={() => {
                  setShowRestoreModal(false);
                  setSelectedBackup(null);
                }}
                variant="outline"
                className="flex-1"
              >
                İptal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6">Yedekleme Ayarları</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.autoBackup}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoBackup: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Otomatik Yedekleme</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yedekleme Sıklığı
                  </label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => setSettings(prev => ({ ...prev, backupFrequency: e.target.value as BackupSettings['backupFrequency'] }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="daily">Günlük</option>
                    <option value="weekly">Haftalık</option>
                    <option value="monthly">Aylık</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yedek Saklama Süresi (Gün)
                  </label>
                  <Input
                    type="number"
                    value={settings.retentionDays}
                    onChange={(e) => setSettings(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.includeImages}
                      onChange={(e) => setSettings(prev => ({ ...prev, includeImages: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Görselleri Dahil Et</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sıkıştırma Seviyesi
                  </label>
                  <select
                    value={settings.compressionLevel}
                    onChange={(e) => setSettings(prev => ({ ...prev, compressionLevel: e.target.value as BackupSettings['compressionLevel'] }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="low">Düşük (Hızlı)</option>
                    <option value="medium">Orta (Dengeli)</option>
                    <option value="high">Yüksek (Küçük Dosya)</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.cloudStorage}
                      onChange={(e) => setSettings(prev => ({ ...prev, cloudStorage: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Bulut Depolama</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">E-posta Bildirimleri</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={handleSaveSettings}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Ayarları Kaydet
                </Button>
                <Button
                  onClick={() => setShowSettingsModal(false)}
                  variant="outline"
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
  );
}
