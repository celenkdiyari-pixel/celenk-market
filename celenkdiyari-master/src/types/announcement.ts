export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  isActive: boolean;
  priority: number; // 1-10, yüksek sayı öncelikli
  startDate: string;
  endDate?: string;
  targetPages: string[]; // ['home', 'products', 'cart'] gibi
  backgroundColor?: string;
  textColor?: string;
  showCloseButton: boolean;
  autoHide: boolean;
  autoHideDelay?: number; // milisaniye
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AnnouncementSettings {
  showOnHomepage: boolean;
  showOnProducts: boolean;
  showOnCart: boolean;
  showOnCheckout: boolean;
  maxAnnouncements: number;
  animationType: 'slide' | 'fade' | 'bounce';
  position: 'top' | 'bottom';
}
