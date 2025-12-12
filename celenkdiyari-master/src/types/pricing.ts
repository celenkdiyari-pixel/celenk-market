export interface DistrictPricing {
  id?: string;
  city: string;
  district: string;
  basePrice: number; // Temel teslimat fiyatı
  expressPrice?: number; // Hızlı teslimat fiyatı
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CityPricing {
  id?: string;
  city: string;
  basePrice: number; // Şehir geneli fiyat (ilçe fiyatı yoksa kullanılır)
  expressPrice?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PricingConfig {
  defaultPrice: number; // Varsayılan fiyat (hiçbir eşleşme yoksa)
  defaultExpressPrice: number;
  districts: DistrictPricing[];
  cities: CityPricing[];
}

