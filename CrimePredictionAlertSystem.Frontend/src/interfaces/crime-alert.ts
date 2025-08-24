export interface CrimeAlert {
  lat: number;
  lng: number;
  address?: string; // Optional field for reverse geocoded address
  timestamp: string;
}
