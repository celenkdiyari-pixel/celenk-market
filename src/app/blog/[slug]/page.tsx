import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPostBySlug, blogPosts } from '@/lib/blog-data';
import { Metadata } from 'next';
import { Calendar, Clock, User, ArrowLeft, Share2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        return {
            title: 'Yazı Bulunamadı',
        };
    }

    return {
        title: `${post.title} | Çelenk Diyarı Blog`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: [{ url: post.coverImage }],
            type: 'article',
            publishedTime: post.date,
            authors: [post.author],
        },
        keywords: post.tags,
    };
}

// Generate static params for all blog posts to improve performance
export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return (
        <article className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Header */}
            <div className="relative h-[60vh] min-h-[400px] w-full bg-gray-900">
                <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 lg:p-12">
                    <div className="container mx-auto max-w-4xl">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map(tag => (
                                <Badge key={tag} className="bg-green-600 hover:bg-green-700 text-white border-0">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm md:text-base">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600">
                                    <User className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-white">{post.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                {new Date(post.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                {post.readTime} okuma süresi
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 relative z-10">
                <div className="max-w-4xl mx-auto">
                    {/* Back Link */}
                    <div className="mb-4">
                        <Link href="/blog">
                            <Button variant="secondary" className="bg-white/90 backdrop-blur hover:bg-white shadow-lg text-gray-800 rounded-full">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Blog'a Dön
                            </Button>
                        </Link>
                    </div>

                    {/* Content Card */}
                    <Card className="border-0 shadow-2xl p-8 md:p-12 bg-white rounded-3xl">
                        <div
                            className="prose prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-green-600 prose-img:rounded-xl"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </Card>

                    {/* Tags Footer */}
                    <div className="mt-12 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-500 font-medium mr-2">Etiketler:</span>
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-gray-600 border-gray-300 px-3 py-1">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
