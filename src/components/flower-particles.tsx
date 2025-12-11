'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  type: 'petal' | 'leaf' | 'flower';
}

export default function FlowerParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas boyutunu ayarla
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Partikül oluştur
    const createParticle = (): Particle => {
      const types: ('petal' | 'leaf' | 'flower')[] = ['petal', 'leaf', 'flower'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      return {
        id: Math.random(),
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 8 + 4,
        opacity: Math.random() * 0.6 + 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        type
      };
    };

    // İlk partikülleri oluştur
    for (let i = 0; i < 15; i++) {
      particlesRef.current.push(createParticle());
    }

    // Partikül çiz
    const drawParticle = (particle: Particle) => {
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.globalAlpha = particle.opacity;

      if (particle.type === 'petal') {
        // Yaprak şekli
        ctx.fillStyle = '#10b981'; // Emerald
        ctx.beginPath();
        ctx.ellipse(0, 0, particle.size, particle.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (particle.type === 'leaf') {
        // Yaprak şekli
        ctx.fillStyle = '#059669'; // Green
        ctx.beginPath();
        ctx.ellipse(0, 0, particle.size * 0.8, particle.size, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (particle.type === 'flower') {
        // Çiçek şekli
        ctx.fillStyle = '#ec4899'; // Pink
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5;
          const x = Math.cos(angle) * particle.size;
          const y = Math.sin(angle) * particle.size;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.fill();
        
        // Çiçek merkezi
        ctx.fillStyle = '#fbbf24'; // Yellow
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    // Animasyon döngüsü
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Partikülü güncelle
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;

        // Yavaşça aşağı düş
        particle.vy += 0.001;

        // Opacity'yi yavaşça azalt
        particle.opacity -= 0.002;

        // Partikülü çiz
        drawParticle(particle);

        // Partikül ekrandan çıktıysa veya opacity çok düştüyse yenile
        if (particle.y > canvas.height + 50 || particle.opacity <= 0) {
          particlesRef.current[index] = createParticle();
        }
      });

      // Yeni partikül ekle (rastgele)
      if (Math.random() < 0.02) {
        particlesRef.current.push(createParticle());
      }

      // Partikül sayısını sınırla
      if (particlesRef.current.length > 20) {
        particlesRef.current.shift();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ background: 'transparent' }}
    />
  );
}
