'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  User, 
  Eye, 
  Clock,
  ArrowLeft,
  Share2,
  Bookmark,
  Tag,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check
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
  readTime: number;
  views: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadBlogPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBlogPost = async () => {
    try {
      setIsLoading(true);
      const { slug } = await params;
      
      if (!slug || typeof slug !== 'string' || slug.trim() === '') {
        router.push('/blog');
        return;
      }
      
      const encodedSlug = encodeURIComponent(slug);
      const response = await fetch(`/api/blog/${encodedSlug}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.error) {
          router.push('/blog');
          return;
        }
        
        setPost(data.post);
        setRelatedPosts(data.relatedPosts || []);
      } else {
        router.push('/blog');
      }
    } catch (error) {
      router.push('/blog');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async (platform?: string) => {
    const url = window.location.href;
    const title = post?.title || '';
    const text = post?.excerpt || '';

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Copy failed:', error);
      }
      return;
    }

    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      return;
    }

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
      return;
    }

    if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
      return;
    }

    // Native share
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Copy failed:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mb-4"></div>
          </div>
          <p className="text-gray-600 font-medium">Blog yazısı yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!post && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Tag className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog yazısı bulunamadı</h2>
          <p className="text-gray-600 mb-6">Aradığınız yazı mevcut değil veya kaldırılmış olabilir.</p>
          <Link href="/blog">
            <Button className="bg-green-600 hover:bg-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Blog'a Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Header - Modern */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/blog">
            <Button 
              variant="ghost" 
              size="sm"
              className="mb-6 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Blog'a Dön
            </Button>
          </Link>

          <div className="mb-6">
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 mb-4">
              {post.category}
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-green-50 mb-8 leading-relaxed">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <User className="h-4 w-4" />
              <span className="font-medium">{post.author}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Clock className="h-4 w-4" />
              <span>{post.readTime || 5} dk okuma</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Eye className="h-4 w-4" />
              <span>{post.views} görüntüleme</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-0">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-3">
            {/* Featured Image */}
            {post.featuredImage && (
              <div className="relative h-96 w-full overflow-hidden rounded-2xl mb-8 shadow-2xl">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            )}

            {/* Content */}
            <Card className="shadow-xl border-0">
              <CardContent className="p-8 md:p-12">
                <div 
                  className="prose prose-lg prose-green max-w-none
                    prose-headings:font-bold prose-headings:text-gray-900
                    prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
                    prose-p:text-gray-700 prose-p:leading-relaxed
                    prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900
                    prose-ul:list-disc prose-ol:list-decimal
                    prose-li:text-gray-700
                    prose-img:rounded-xl prose-img:shadow-lg
                    prose-blockquote:border-l-4 prose-blockquote:border-green-500 prose-blockquote:pl-4 prose-blockquote:italic
                    prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                    prose-pre:bg-gray-900 prose-pre:text-white"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Share Section - Enhanced */}
                <div className="mt-12 pt-8 border-t-2 border-gray-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Bu yazıyı paylaş</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => handleShare('facebook')}
                          variant="outline"
                          size="sm"
                          className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                        >
                          <Facebook className="h-4 w-4 mr-2" />
                          Facebook
                        </Button>
                        <Button
                          onClick={() => handleShare('twitter')}
                          variant="outline"
                          size="sm"
                          className="hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600"
                        >
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter
                        </Button>
                        <Button
                          onClick={() => handleShare('linkedin')}
                          variant="outline"
                          size="sm"
                          className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                        >
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </Button>
                        <Button
                          onClick={() => handleShare('copy')}
                          variant="outline"
                          size="sm"
                          className="hover:bg-gray-50"
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4 mr-2 text-green-600" />
                              Kopyalandı!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Link Kopyala
                            </>
                          )}
                        </Button>
                        {navigator.share && (
                          <Button
                            onClick={() => handleShare()}
                            variant="outline"
                            size="sm"
                            className="hover:bg-green-50 hover:border-green-300 hover:text-green-600"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Paylaş
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <p>Son güncelleme:</p>
                      <p className="font-medium text-gray-700">{formatDate(post.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Author Card - Enhanced */}
              <Card className="border-2 border-green-100 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Yazar Hakkında</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{post.author}</h4>
                      <p className="text-sm text-green-600 font-medium">Çiçek Uzmanı</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Çiçek bakımı ve dekorasyon konularında 10+ yıllık deneyime sahip uzman. 
                    Doğal ve sürdürülebilir çözümler konusunda tutkulu.
                  </p>
                </CardContent>
              </Card>

              {/* Related Posts - Enhanced */}
              {relatedPosts.length > 0 && (
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">İlgili Yazılar</h3>
                    <div className="space-y-4">
                      {relatedPosts.map((relatedPost) => (
                        <Link 
                          key={relatedPost.id} 
                          href={`/blog/${relatedPost.slug}`}
                          className="block group"
                        >
                          <div className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            {relatedPost.featuredImage && (
                              <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                                <Image
                                  src={relatedPost.featuredImage}
                                  alt={relatedPost.title}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                                  sizes="80px"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 group-hover:text-green-600 line-clamp-2 transition-colors mb-1">
                                {relatedPost.title}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {formatDate(relatedPost.publishedAt)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tags - Enhanced */}
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Etiketler</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-xs px-3 py-1.5 cursor-pointer hover:bg-green-100 hover:text-green-800 hover:border-green-300 transition-all"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
