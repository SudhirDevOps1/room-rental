import { useState, useCallback } from 'react';

export interface GeoCoords {
  lat: number;
  lng: number;
}

// Preset Indian tech & educational hubs for immediate fallback or simulation
export const CITY_COORDINATES: Record<string, GeoCoords> = {
  'Delhi': { lat: 28.6985, lng: 77.2029 },       // Near North Campus / Mukherjee Nagar
  'Bengaluru': { lat: 12.9345, lng: 77.6261 },   // Koramangala / HSR Hub
  'Mumbai': { lat: 19.1244, lng: 72.8311 },      // Andheri Hub
  'Pune': { lat: 18.5679, lng: 73.9143 },        // Viman Nagar Hub
  'Noida': { lat: 28.6256, lng: 77.3770 },       // Sector 62
  'Kota': { lat: 25.1825, lng: 75.8391 }         // Coaching Hub
};

// Haversine formula to calculate crow-fly distance in km
export const calculateDistance = (coord1: GeoCoords, coord2: GeoCoords): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLon = (coord2.lng - coord1.lng) * (Math.PI / 180);
  const lat1 = coord1.lat * (Math.PI / 180);
  const lat2 = coord2.lat * (Math.PI / 180);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Number((R * c).toFixed(1));
};

export const useGeolocation = (defaultCity = 'Delhi') => {
  const [coords, setCoords] = useState<GeoCoords>(() => CITY_COORDINATES[defaultCity] || CITY_COORDINATES['Delhi']);
  const [locationName, setLocationName] = useState<string>(defaultCity);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const detectLocation = useCallback(() => {
    setIsDetecting(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detected = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCoords(detected);
        setLocationName("📍 Precise GPS (Near You)");
        setIsDetecting(false);
      },
      (err) => {
        console.warn("Geolocation permission error:", err);
        setError("Could not auto-detect GPS. Using default city center.");
        // Use default city fallback
        setCoords(CITY_COORDINATES[defaultCity] || CITY_COORDINATES['Delhi']);
        setLocationName(defaultCity);
        setIsDetecting(false);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  }, [defaultCity]);

  const setCityLocation = useCallback((cityName: string) => {
    if (CITY_COORDINATES[cityName]) {
      setCoords(CITY_COORDINATES[cityName]);
      setLocationName(cityName);
      setError(null);
    }
  }, []);

  return {
    coords,
    setCoords,
    locationName,
    setLocationName,
    detectLocation,
    setCityLocation,
    isDetecting,
    error
  };
};