export interface SiteSettings {
  id: string;

  // Genel Ayarlar
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  siteUrl: string;

  // Logo ve Görsel
  logoUrl: string;
  faviconUrl: string;

  // İletişim Bilgileri
  contact: {
    phone: string;
    email: string;
    address: string;
    whatsapp: string;
    workingHours: string;
  };

  // Sosyal Medya
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };

  // SEO Ayarları
  seo: {
    googleAnalytics?: string;
    googleTagManager?: string;
    facebookPixel?: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    ogImage?: string;
  };

  // Tema Ayarları
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  };

  // İş Ayarları
  business: {
    currency: string;
    taxRate: number;
    shippingCost: number;
    freeShippingThreshold: number;
    minOrderAmount: number;
  };

  // Bildirim Ayarları
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    orderNotifications: boolean;
    stockNotifications: boolean;
  };

  // Güvenlik
  security: {
    maintenanceMode: boolean;
    allowRegistration: boolean;
    requireEmailVerification: boolean;
  };

  // Bakım ve Özel Günler
  maintenance: {
    isActive: boolean;
    message: string;
    specialDays: string[]; // YYYY-MM-DD
  };

  // Tarih
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface SettingsUpdateRequest {
  siteName?: string;
  siteDescription?: string;
  siteKeywords?: string;
  siteUrl?: string;
  logoUrl?: string;
  faviconUrl?: string;
  contact?: Partial<SiteSettings['contact']>;
  socialMedia?: Partial<SiteSettings['socialMedia']>;
  seo?: Partial<SiteSettings['seo']>;
  theme?: Partial<SiteSettings['theme']>;
  business?: Partial<SiteSettings['business']>;
  notifications?: Partial<SiteSettings['notifications']>;
  security?: Partial<SiteSettings['security']>;
  maintenance?: Partial<SiteSettings['maintenance']>;
}
