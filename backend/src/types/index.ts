export interface Pharmacy {
  id?: string;
  name: string;
  address: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  isOpen: boolean;
  dayOfWeek: number;
  updatedAt: number;
}

export interface ScrapedPharmacy {
  name: string;
  address: string;
  phone: string;
  dayOfWeek: number;
}

export interface NearestPharmacyRequest {
  latitude: number;
  longitude: number;
}

export interface NearestPharmacyResponse {
  pharmacy: Pharmacy;
  distance: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PharmaciesResponse {
  pharmacies: Pharmacy[];
  count: number;
  updatedAt: number;
}
