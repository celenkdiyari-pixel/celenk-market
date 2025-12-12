// PayTR Payment Integration
// PayTR entegrasyonu aktif - Test modunda çalışıyor

export interface PayTRConfig {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  testMode: boolean;
  baseUrl: string;
}

export interface PayTRPaymentRequest {
  merchant_id: string;
  user_ip: string;
  merchant_oid: string;
  email: string;
  payment_amount: number;
  paytr_token: string;
  user_basket: string;
  debug_on: number;
  no_installment: number;
  max_installment: number;
  user_name: string;
  user_address: string;
  user_phone: string;
  merchant_ok_url: string;
  merchant_fail_url: string;
  timeout_limit: number;
  currency: string;
  test_mode: number;
}

export interface PayTRPaymentResponse {
  status: string;
  reason: string;
  token: string;
  paytr_token: string;
}

export interface PayTRCallbackData {
  merchant_oid: string;
  status: string;
  total_amount: number;
  hash: string;
  failed_reason_code?: string;
  failed_reason_msg?: string;
  test_mode: string;
  payment_type: string;
  currency: string;
  payment_amount: number;
}

// PayTR konfigürasyonu - environment variables'dan gelecek
export const getPayTRConfig = (): PayTRConfig => {
  return {
    merchantId: process.env.PAYTR_MERCHANT_ID || '',
    merchantKey: process.env.PAYTR_MERCHANT_KEY || '',
    merchantSalt: process.env.PAYTR_MERCHANT_SALT || '',
    testMode: process.env.PAYTR_TEST_MODE === 'true',
    baseUrl: process.env.PAYTR_BASE_URL || 'https://www.paytr.com'
  };
};

// PayTR token oluşturma fonksiyonu
export const generatePayTRToken = (config: PayTRConfig, paymentData: PayTRPaymentRequest): string => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('crypto');
  
  // PayTR token oluşturma algoritması - PHP örneğine göre düzeltildi
  const hashString = 
    config.merchantId +
    paymentData.user_ip +
    paymentData.merchant_oid +
    paymentData.email +
    paymentData.payment_amount +
    paymentData.user_basket +
    paymentData.no_installment +
    paymentData.max_installment +
    paymentData.currency +
    paymentData.test_mode;
  
  console.log('🔐 PayTR Hash String:', hashString);
  
  // HMAC SHA256 ile hash oluştur ve base64 encode et
  const hmac = crypto.createHmac('sha256', config.merchantKey);
  hmac.update(hashString + config.merchantSalt);
  const token = hmac.digest('base64');
  
  console.log('🔑 Generated PayTR Token:', token);
  
  return token;
};

// PayTR ödeme isteği oluşturma
export const createPayTRPayment = async (
  config: PayTRConfig,
  paymentData: PayTRPaymentRequest
): Promise<PayTRPaymentResponse> => {
  try {
    console.log('🔗 PayTR API URL:', `${config.baseUrl}/odeme/api/get-token`);
    console.log('📝 PayTR Request Data:', paymentData);
    
    const response = await fetch(`${config.baseUrl}/odeme/api/get-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(paymentData as unknown as Record<string, string>)
    });

    console.log('📊 PayTR Response Status:', response.status);
    const result = await response.json();
    console.log('📄 PayTR Response Data:', result);
    
    if (!response.ok) {
      console.error('❌ PayTR API Error:', result);
      return {
        status: 'error',
        reason: result.error || 'PayTR API error',
        token: null,
        paytr_token: null
      };
    }
    
    return result;
  } catch (error) {
    console.error('PayTR payment creation error:', error);
    throw new Error('PayTR ödeme isteği oluşturulamadı');
  }
};

// PayTR callback doğrulama
export const verifyPayTRCallback = (config: PayTRConfig, callbackData: PayTRCallbackData): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('crypto');
  
  // PayTR callback hash doğrulama algoritması - PayTR dokümantasyonuna göre
  const hashString = 
    callbackData.merchant_oid +
    config.merchantSalt +
    callbackData.status +
    callbackData.total_amount;
  
  // PayTR callback hash'i HMAC SHA256 ile hesapla ve base64 encode et
  const hmac = crypto.createHmac('sha256', config.merchantKey);
  hmac.update(hashString);
  const calculatedHash = hmac.digest('base64');
  
  console.log('🔐 PayTR Callback Hash String:', hashString);
  console.log('🔑 Calculated Hash (Base64):', calculatedHash);
  console.log('🔑 Received Hash:', callbackData.hash);
  
  return calculatedHash === callbackData.hash;
};

// PayTR iFrame URL oluşturma
export const getPayTRIframeUrl = (token: string): string => {
  return `https://www.paytr.com/odeme/guvenli/${token}`;
};

// PayTR ödeme durumları
export const PAYTR_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  PENDING: 'pending'
} as const;

// PayTR hata kodları
export const PAYTR_ERROR_CODES = {
  '1': 'Banka tarafından kart reddedildi',
  '2': 'Kart limiti yetersiz',
  '3': 'Kart bilgileri hatalı',
  '4': 'Kart süresi dolmuş',
  '5': 'Kart sahibi tarafından işlem iptal edildi',
  '6': 'Banka tarafından işlem reddedildi',
  '7': 'Kart sahibi tarafından işlem iptal edildi',
  '8': 'Kart sahibi tarafından işlem iptal edildi',
  '9': 'Kart sahibi tarafından işlem iptal edildi',
  '10': 'Kart sahibi tarafından işlem iptal edildi'
} as const;
