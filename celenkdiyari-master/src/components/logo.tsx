'use client';

import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export default function Logo({ size = 'md', className = '', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Image */}
      <div className={`${sizeClasses[size]} relative`}>
        <Image
          src="/images/logo-removebg-preview.png"
          alt="Çelenk Diyarı Logo"
          fill
          className="object-contain"
          priority={true}
          sizes="(max-width: 768px) 32px, (max-width: 1200px) 48px, 64px"
          quality={90}
        />
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className={`font-elegant italic font-light bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent ${textSizes[size]}`} style={{ fontFamily: 'var(--font-dancing)', fontWeight: 300, fontStyle: 'italic' }}>
          Çelenk Diyarı
        </span>
      )}
    </div>
  );
}
