import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section Skeleton */}
            <div className="relative h-96 bg-gray-200 animate-pulse overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center flex-col space-y-4">
                    <Skeleton className="h-16 w-16 rounded-full bg-white/20" />
                    <Skeleton className="h-12 w-64 bg-white/20" />
                    <Skeleton className="h-6 w-96 bg-white/20" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Breadcrumb Skeleton */}
                <div className="flex items-center space-x-2 mb-8">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                </div>

                {/* Filters Skeleton */}
                <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between">
                        <Skeleton className="h-10 flex-1 max-w-md" />
                        <div className="flex space-x-4">
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </div>
                </div>

                {/* Products Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-[33px] overflow-hidden shadow-md h-[500px] flex flex-col">
                            <Skeleton className="aspect-[9/16] w-full" />
                            <div className="p-5 flex-1 flex flex-col items-center space-y-4 justify-between">
                                <div className="w-full space-y-2 flex flex-col items-center">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <div className="w-full space-y-2 flex flex-col items-center">
                                    <Skeleton className="h-8 w-24" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
