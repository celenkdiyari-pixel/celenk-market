'use client';

// Force dynamic rendering - prevent pre-rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  X, 
  Eye, 
  Tag,
  Calendar,
  User,
  FileText,
  ArrowLeft,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  status: 'draft' | 'published';
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
}

export default function CreateBlogPost() {
  const [post, setPost] = useState<BlogPost>({
    title: '',
    content: '',
    excerpt: '',
    category: 'Genel',
    tags: [],
    author: 'Admin',
    status: 'draft',
    featured: false,
    seoTitle: '',
    seoDescription: ''
  });
  
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const checkAuthentication = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();
      
      if (data.success && data.authenticated) {
        setIsAuthenticated(true);
      } else {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = '/admin/login';
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const categories = [
    'Açılış & Tören',
    'Cenaze Çelenkleri',
    'Ferforjeler',
    'Fuar & Stand',
    'Ofis & Saksı Bitkileri',
    'Söz & Nişan',
    'Çiçek Bakımı',
    'Dekorasyon',
    'Etkinlik',
    'Genel'
  ];

  const handleAddTag = () => {
    if (newTag.trim() && !post.tags.includes(newTag.trim())) {
      setPost(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      });
      
      if (response.ok) {
        alert('Blog yazısı başarıyla oluşturuldu!');
        // Admin blog sayfasına yönlendir
        window.location.href = '/admin/blog';
      } else {
        alert('Blog yazısı oluşturulamadı!');
      }
    } catch (error) {
      console.error('Error creating blog post:', error);
      alert('Bir hata oluştu!');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    setPreview(!preview);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Kimlik doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/blog" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri Dön
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Yeni Blog Yazısı</h1>
          </div>
          <p className="text-gray-600">Blog yazısı oluşturun ve yayınlayın</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Blog Yazısı Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Başlık */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlık *
                  </label>
                  <Input
                    value={post.title}
                    onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Blog yazısı başlığı"
                    className="text-lg"
                  />
                </div>

                {/* İçerik */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İçerik *
                  </label>
                  <Textarea
                    value={post.content}
                    onChange={(e) => setPost(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Blog yazısı içeriği"
                    rows={15}
                    className="resize-none"
                  />
                </div>

                {/* Özet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Özet
                  </label>
                  <Textarea
                    value={post.excerpt}
                    onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Blog yazısı özeti"
                    rows={3}
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={post.category}
                    onChange={(e) => setPost(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Etiketler */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiketler
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Etiket ekle"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button onClick={handleAddTag} variant="outline">
                      <Tag className="h-4 w-4 mr-1" />
                      Ekle
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Yazar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yazar
                  </label>
                  <Input
                    value={post.author}
                    onChange={(e) => setPost(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Yazar adı"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Durum */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Yayın Durumu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum
                  </label>
                  <select
                    value={post.status}
                    onChange={(e) => setPost(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="draft">Taslak</option>
                    <option value="published">Yayınlanmış</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={post.featured}
                    onChange={(e) => setPost(prev => ({ ...prev, featured: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                    Öne çıkan yazı
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SEO Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Başlığı
                  </label>
                  <Input
                    value={post.seoTitle}
                    onChange={(e) => setPost(prev => ({ ...prev, seoTitle: e.target.value }))}
                    placeholder="SEO başlığı"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Açıklaması
                  </label>
                  <Textarea
                    value={post.seoDescription}
                    onChange={(e) => setPost(prev => ({ ...prev, seoDescription: e.target.value }))}
                    placeholder="SEO açıklaması"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button 
                    onClick={handleSave} 
                    className="w-full"
                    disabled={!post.title || !post.content || isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                  
                  <Button 
                    onClick={handlePreview} 
                    variant="outline" 
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {preview ? 'Düzenle' : 'Önizleme'}
                  </Button>
                  
                  <Link href="/admin/blog" className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <X className="h-4 w-4 mr-2" />
                    İptal
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Önizleme</CardTitle>
            </CardHeader>
            <CardContent>
              <article className="prose max-w-none">
                <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date().toLocaleDateString('tr-TR')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {Math.ceil(post.content.split(' ').length / 200)} dk okuma
                  </span>
                </div>
                <div className="whitespace-pre-wrap">{post.content}</div>
              </article>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
