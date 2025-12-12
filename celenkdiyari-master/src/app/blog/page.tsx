'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar, 
  User, 
  Eye, 
  Tag,
  ArrowRight,
  Clock,
  TrendingUp,
  Sparkles,
  Filter,
  X
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  category: string;
  featuredImage?: string;
  readTime?: number;
  readingTime?: number;
  views: number;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'all',
    'Açılış & Tören',
    'Cenaze Çelenkleri',
    'Ferforjeler',
    'Fuar & Stand',
    'Ofis & Saksı Bitkileri',
    'Söz & Nişan',
    'Çiçek Bakımı',
    'Dekorasyon',
    'Etkinlik'
  ];

  const tags = [
    'çiçek bakımı',
    'dekorasyon',
    'bahçıvanlık',
    'hediye',
    'etkinlik',
    'sezonluk',
    'çelenk',
    'buket',
    'saksı bitkileri'
  ];

  useEffect(() => {
    loadBlogPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, selectedCategory]);

  const loadBlogPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/blog?status=published');
      if (response.ok) {
        const data = await response.json();
        const posts = data.blogPosts || data.posts || data || [];
        
        if (Array.isArray(posts)) {
          setPosts(posts);
        } else {
          setPosts([]);
        }
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('❌ Error loading blog posts:', error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = posts;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Featured post (ilk featured post veya en çok görüntülenen)
  const featuredPost = filteredPosts.find(post => post.featured) || 
                       filteredPosts.sort((a, b) => (b.views || 0) - (a.views || 0))[0];
  
  const regularPosts = filteredPosts.filter(post => post.id !== featuredPost?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mb-4"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-green-600 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium mt-4">Blog yazıları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Section - Modern ve Çekici */}
      <div className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Uzman Tavsiyeleri</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Çelenk Diyarı{' '}
              <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                Blog
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-green-50 mb-8 leading-relaxed">
              Çiçek bakımı, dekorasyon ve bahçıvanlık konularında uzman tavsiyeleri ve ipuçları
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <TrendingUp className="h-4 w-4" />
                <span>{posts.length} Yazı</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Eye className="h-4 w-4" />
                <span>{posts.reduce((sum, p) => sum + (p.views || 0), 0)} Görüntüleme</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters - Modern Design */}
        <div className="mb-12">
          {/* Search Bar - Prominent */}
          <div className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Blog yazılarında ara... (başlık, içerik, etiket)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg border-2 border-gray-200 focus:border-green-500 rounded-xl shadow-sm hover:shadow-md transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter - Modern Pills */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Kategoriler</h3>
              </div>
              {selectedCategory !== 'all' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="h-4 w-4 mr-1" />
                  Filtreyi Temizle
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-200 scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-green-300 hover:shadow-md'
                  }`}
                >
                  {category === 'all' ? 'Tümü' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Tags - Interactive */}
          {!searchTerm && selectedCategory === 'all' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Popüler Etiketler:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-green-100 hover:text-green-800 hover:border-green-300 transition-all px-3 py-1.5 text-sm"
                    onClick={() => setSearchTerm(tag)}
                  >
                    <Tag className="h-3 w-3 mr-1.5" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        {filteredPosts.length > 0 && (
          <div className="mb-8 text-center">
            <p className="text-gray-600">
              <span className="font-semibold text-green-600">{filteredPosts.length}</span> yazı bulundu
            </p>
          </div>
        )}

        {/* Blog Posts */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Arama kriterlerinize uygun yazı bulunamadı' 
                : 'Henüz blog yazısı bulunmuyor'
              }
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm || selectedCategory !== 'all'
                ? 'Farklı arama terimleri deneyin veya filtreleri temizleyin'
                : 'Yakında harika içeriklerle burada olacağız!'
              }
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Filtreleri Temizle
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Featured Post - Large Hero Card */}
            {featuredPost && (
              <div className="mb-12 animate-fade-in-up">
                <Link href={`/blog/${featuredPost.slug}`}>
                  <Card className="group overflow-hidden border-2 border-green-200 hover:border-green-400 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <div className="grid md:grid-cols-2 gap-0">
                      {featuredPost.featuredImage && (
                        <div className="relative h-64 md:h-full min-h-[400px] overflow-hidden">
                          <Image
                            src={featuredPost.featuredImage}
                            alt={featuredPost.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Öne Çıkan
                            </Badge>
                          </div>
                        </div>
                      )}
                      <CardContent className="p-8 md:p-12 flex flex-col justify-center">
                        <Badge variant="outline" className="w-fit mb-4 border-green-300 text-green-700">
                          {featuredPost.category}
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors line-clamp-3">
                          {featuredPost.title}
                        </h2>
                        <p className="text-lg text-gray-600 mb-6 line-clamp-3">
                          {featuredPost.excerpt}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(featuredPost.publishedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span>{(featuredPost.readTime || featuredPost.readingTime || 5)} dk</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Eye className="h-4 w-4" />
                            <span>{featuredPost.views} görüntüleme</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {featuredPost.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button className="w-fit bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg group-hover:shadow-xl transition-all">
                          Devamını Oku
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              </div>
            )}

            {/* Regular Posts Grid - Modern Cards */}
            {regularPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map((post, index) => (
                  <Link 
                    key={post.id} 
                    href={`/blog/${post.slug}`}
                    className="group animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Card className="h-full flex flex-col overflow-hidden border border-gray-200 hover:border-green-300 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      {post.featuredImage && (
                        <div className="relative h-56 w-full overflow-hidden">
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-white/90 backdrop-blur-sm text-gray-800 border-0">
                              {post.category}
                            </Badge>
                          </div>
                        </div>
                      )}
                      <CardContent className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(post.publishedAt)}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{(post.readTime || post.readingTime || 5)} dk</span>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
                          {post.title}
                        </h3>

                        <p className="text-gray-600 mb-4 line-clamp-3 flex-1 text-sm leading-relaxed">
                          {post.excerpt}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                              {tag}
                            </Badge>
                          ))}
                          {post.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                              +{post.tags.length - 3}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{post.author}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-600 font-medium group-hover:gap-3 transition-all">
                            <span>Oku</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Load More / Pagination - Future Enhancement */}
        {filteredPosts.length > 0 && filteredPosts.length >= 9 && (
          <div className="text-center mt-16">
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 px-8 py-6 text-base font-medium"
            >
              Daha Fazla Yazı Yükle
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
