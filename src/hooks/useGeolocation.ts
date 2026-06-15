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
  'Kota': { lat: 25.1825, lng: 75.8391 },        // Coaching Hub
  'Bhabua': { lat: 25.0439, lng: 83.6079 },
  'Patna': { lat: 25.5941, lng: 85.1376 },
  'Varanasi': { lat: 25.3176, lng: 82.9739 },
  'Lucknow': { lat: 26.8467, lng: 80.9462 },
  'Jaipur': { lat: 26.9124, lng: 75.7873 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Surat': { lat: 21.1702, lng: 72.8311 },
  'Indore': { lat: 22.7196, lng: 75.8577 },
  'Bhopal': { lat: 23.2599, lng: 77.4126 },
  'Ranchi': { lat: 23.3441, lng: 85.3096 },
  'Gurugram': { lat: 28.4595, lng: 77.0266 },
  'Chandigarh': { lat: 30.7333, lng: 76.7794 },
  'Dehradun': { lat: 30.3165, lng: 78.0322 }
};

export const LOCATION_SUGGESTIONS = [
  'Bhabua, Kaimur, Bihar', 'Patna, Bihar', 'Gaya, Bihar', 'Muzaffarpur, Bihar',
  'Delhi', 'Mukherjee Nagar, Delhi', 'GTB Nagar, Delhi', 'Noida, Uttar Pradesh',
  'Gurugram, Haryana', 'Varanasi, Uttar Pradesh', 'Lucknow, Uttar Pradesh',
  'Kota, Rajasthan', 'Jaipur, Rajasthan', 'Bengaluru, Karnataka', 'Koramangala, Bengaluru',
  'Mumbai, Maharashtra', 'Andheri, Mumbai', 'Pune, Maharashtra', 'Hyderabad, Telangana',
  'Chennai, Tamil Nadu', 'Kolkata, West Bengal', 'Ahmedabad, Gujarat', 'Ranchi, Jharkhand',
  'Indore, Madhya Pradesh', 'Bhopal, Madhya Pradesh', 'Chandigarh', 'Dehradun, Uttarakhand'
];

export const inferStateFromLocation = (value: string): string => {
  const v = value.toLowerCase();
  if (v.includes('bihar') || v.includes('bhabua') || v.includes('patna') || v.includes('gaya')) return 'Bihar';
  if (v.includes('delhi')) return 'Delhi NCT';
  if (v.includes('karnataka') || v.includes('bengaluru') || v.includes('bangalore')) return 'Karnataka';
  if (v.includes('maharashtra') || v.includes('mumbai') || v.includes('pune')) return 'Maharashtra';
  if (v.includes('uttar pradesh') || v.includes('noida') || v.includes('lucknow') || v.includes('varanasi')) return 'Uttar Pradesh';
  if (v.includes('rajasthan') || v.includes('kota') || v.includes('jaipur')) return 'Rajasthan';
  if (v.includes('telangana') || v.includes('hyderabad')) return 'Telangana';
  if (v.includes('tamil nadu') || v.includes('chennai')) return 'Tamil Nadu';
  if (v.includes('west bengal') || v.includes('kolkata')) return 'West Bengal';
  if (v.includes('gujarat') || v.includes('ahmedabad') || v.includes('surat')) return 'Gujarat';
  if (v.includes('jharkhand') || v.includes('ranchi')) return 'Jharkhand';
  if (v.includes('madhya pradesh') || v.includes('indore') || v.includes('bhopal')) return 'Madhya Pradesh';
  if (v.includes('haryana') || v.includes('gurugram')) return 'Haryana';
  if (v.includes('uttarakhand') || v.includes('dehradun')) return 'Uttarakhand';
  return 'India';
};

export const geocodeLocationName = async (place: string): Promise<GeoCoords | null> => {
  const trimmed = place.trim();
  if (!trimmed) return null;
  const presetKey = Object.keys(CITY_COORDINATES).find(k => trimmed.toLowerCase().includes(k.toLowerCase()));
  if (presetKey) return CITY_COORDINATES[presetKey];

  try {
    const query = encodeURIComponent(`${trimmed}, India`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`);
    const data = await res.json();
    if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
      return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
    }
  } catch (err) {
    console.warn('Location geocoding failed, continuing with manual text search.', err);
  }
  return null;
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
    } else {
      setLocationName(cityName || 'Custom Location');
    }
  }, []);

  const resolveLocationName = useCallback(async (place: string) => {
    setIsDetecting(true);
    setError(null);
    const resolved = await geocodeLocationName(place);
    if (resolved) {
      setCoords(resolved);
      setLocationName(place);
    } else {
      setLocationName(place || 'Custom Location');
      setError('Could not geocode this place. Text search will still work.');
    }
    setIsDetecting(false);
    return resolved;
  }, []);

  return {
    coords,
    setCoords,
    locationName,
    setLocationName,
    detectLocation,
    setCityLocation,
    resolveLocationName,
    isDetecting,
    error
  };
};