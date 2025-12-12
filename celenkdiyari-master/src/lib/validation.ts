import { z } from 'zod';

// Product validation schema
export const productSchema = z.object({
  name: z.string().min(1, 'Ürün adı gerekli').max(100, 'Ürün adı çok uzun'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalı').max(1000, 'Açıklama çok uzun'),
  price: z.number().min(0, 'Fiyat negatif olamaz').max(100000, 'Fiyat çok yüksek'),
  category: z.string().min(1, 'Kategori gerekli'),
  inStock: z.boolean(),
  images: z.array(z.string().url('Geçerli bir resim URL\'si gerekli')).min(1, 'En az bir resim gerekli'),
});

// Order validation schema
export const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(2, 'İsim en az 2 karakter olmalı').max(50, 'İsim çok uzun'),
    email: z.string().email('Geçerli bir email adresi gerekli'),
    phone: z.string().min(10, 'Telefon numarası en az 10 karakter olmalı').max(15, 'Telefon numarası çok uzun'),
  }),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    quantity: z.number().min(1, 'Miktar en az 1 olmalı'),
    price: z.number().min(0, 'Fiyat negatif olamaz'),
  })).min(1, 'En az bir ürün gerekli'),
  totalAmount: z.number().min(0, 'Toplam tutar negatif olamaz'),
  deliveryAddress: z.string().optional(),
});

// Contact form validation
export const contactSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı').max(50, 'İsim çok uzun'),
  email: z.string().email('Geçerli bir email adresi gerekli'),
  phone: z.string().min(10, 'Telefon numarası en az 10 karakter olmalı').max(15, 'Telefon numarası çok uzun').optional().or(z.literal('')),
  subject: z.string().min(5, 'Konu en az 5 karakter olmalı').max(100, 'Konu çok uzun'),
  message: z.string().min(10, 'Mesaj en az 10 karakter olmalı').max(1000, 'Mesaj çok uzun'),
});

// Sanitize HTML input
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Validate and sanitize input
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map(err => err.message)
      };
    }
    return {
      success: false,
      errors: ['Beklenmeyen bir hata oluştu']
    };
  }
}
