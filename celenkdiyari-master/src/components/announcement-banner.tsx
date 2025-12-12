'use client';

import { useState, useEffect } from 'react';
import { X, Info, CheckCircle, AlertTriangle, AlertCircle, Gift } from 'lucide-react';
import { Announcement } from '@/types/announcement';

interface AnnouncementBannerProps {
  page?: string;
  maxAnnouncements?: number;
}

export default function AnnouncementBanner({ 
  page = 'home', 
  maxAnnouncements = 3 
}: AnnouncementBannerProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hiddenAnnouncements, setHiddenAnnouncements] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`/api/announcements?page=${page}&active=true`);
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data.announcements.slice(0, maxAnnouncements));
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, [page, maxAnnouncements]);

  const hideAnnouncement = (id: string) => {
    setHiddenAnnouncements(prev => new Set([...prev, id]));
  };

  const getTypeIcon = (type: Announcement['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'promotion':
        return <Gift className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getTypeStyles = (type: Announcement['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          icon: 'text-green-600'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-600'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: 'text-red-600'
        };
      case 'promotion':
        return {
          bg: 'bg-purple-50 border-purple-200',
          text: 'text-purple-800',
          icon: 'text-purple-600'
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-600'
        };
    }
  };

  if (isLoading) {
    return null;
  }

  const visibleAnnouncements = announcements.filter(
    announcement => !hiddenAnnouncements.has(announcement.id)
  );

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-2">
      {visibleAnnouncements.map((announcement) => {
        const styles = getTypeStyles(announcement.type);
        const customBg = announcement.backgroundColor;
        const customText = announcement.textColor;

        return (
          <div
            key={announcement.id}
            className={`
              relative w-full p-4 rounded-lg border-l-4 shadow-sm
              ${customBg ? '' : styles.bg}
              ${customText ? '' : styles.text}
              animate-in slide-in-from-top-2 duration-500
            `}
            style={{
              backgroundColor: customBg || undefined,
              color: customText || undefined
            }}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 ${customText ? '' : styles.icon}`}>
                {getTypeIcon(announcement.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1">
                  {announcement.title}
                </h3>
                <p className="text-sm leading-relaxed">
                  {announcement.content}
                </p>
              </div>
              
              {announcement.showCloseButton && (
                <button
                  onClick={() => hideAnnouncement(announcement.id)}
                  className={`
                    flex-shrink-0 p-1 rounded-full hover:bg-black/10 
                    transition-colors duration-200
                    ${customText ? 'text-current' : styles.text}
                  `}
                  aria-label="Duyuruyu kapat"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
