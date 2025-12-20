import Link from 'next/link';
import Image from 'next/image';
import { blogPosts } from '@/lib/blog-data';
import { Metadata } from 'next';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Blog | Çelenk Diyarı - Çiçek ve Çelenk Dünyasından Haberler',
    description: 'Çelenk, cenaze çelengi, düğün çelengi, açılış çiçekleri ve daha fazlası hakkında rehber niteliğinde makaleler. İstanbul çelenk siparişi ipuçları.',
    keywords: ['çelenk blog', 'çiçek bakımı', 'cenaze çelengi yazıları', 'düğün çelengi modelleri', 'çelenk diyari blog'],
};

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <section className="bg-gray-900 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20">
                    <Image
                        src="https://images.unsplash.com/photo-1596627670783-6f8cb7b0d912?q=80&w=1200"
                        alt="Blog Hero"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <Badge className="bg-green-600 hover:bg-green-700 mb-4 px-4 py-1 text-sm">Güncel Blog</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Çiçek ve Çelenk Dünyası</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Özel günleriniz için rehber niteliğinde makaleler, ipuçları ve trendler.
                    </p>
                </div>
            </section>

            {/* Blog List Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                        <Card key={post.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full rounded-2xl overflow-hidden group">
                            <CardHeader className="p-0">
                                <div className="relative h-64 w-full overflow-hidden">
                                    <Image
                                        src={post.coverImage}
                                        alt={post.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                        {post.tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="bg-white/90 text-gray-800 backdrop-blur-sm shadow-sm">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-6">
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(post.date).toLocaleDateString('tr-TR')}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {post.readTime}
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
                                    <Link href={`/blog/${post.slug}`}>
                                        {post.title}
                                    </Link>
                                </h2>
                                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                                    {post.excerpt}
                                </p>
                            </CardContent>
                            <CardFooter className="p-6 pt-0 mt-auto">
                                <Link href={`/blog/${post.slug}`} className="w-full">
                                    <Button variant="outline" className="w-full group hover:bg-green-50 hover:text-green-600 hover:border-green-200 justify-between">
                                        Devamını Oku
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
