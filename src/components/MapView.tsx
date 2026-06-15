import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { Room } from '../firebase/mockData';
import { GeoCoords } from '../hooks/useGeolocation';
import { Navigation } from 'lucide-react';

interface MapViewProps {
  rooms: Room[];
  userCoords?: GeoCoords;
  selectedRoomId?: string;
  onSelectRoom?: (room: Room) => void;
  height?: string;
}

export const MapView: React.FC<MapViewProps> = ({ 
  rooms, 
  userCoords, 
  selectedRoomId, 
  onSelectRoom,
  height = '500px' 
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const navigate = useNavigate();

  // Custom SVG Markers to avoid missing Webpack/Vite image URLs
  const createCustomIcon = (isAvailable: boolean, isSelected: boolean) => {
    const color = isSelected ? '#4f46e5' : isAvailable ? '#10b981' : '#f43f5e';
    const scale = isSelected ? 'scale(1.25)' : 'scale(1)';
    const shadow = isSelected ? 'drop-shadow(0 10px 15px rgba(79,70,229,0.5))' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))';

    const svgIcon = `
      <div style="transform: ${scale}; filter: ${shadow}; transition: all 0.3s ease; cursor: pointer;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 52" width="36" height="48">
          <path d="M19 0C8.5 0 0 8.5 0 19C0 33.2 19 52 19 52C19 52 38 33.2 38 19C38 8.5 29.5 0 19 0Z" fill="${color}" />
          <circle cx="19" cy="19" r="10" fill="white" />
          <text x="19" y="23" font-size="11" font-weight="900" font-family="sans-serif" text-anchor="middle" fill="${color}">₹</text>
        </svg>
      </div>
    `;

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: svgIcon,
      iconSize: [36, 48],
      iconAnchor: [18, 48],
      popupAnchor: [0, -44],
    });
  };

  const userGpsIcon = L.divIcon({
    className: 'user-gps-marker',
    html: `
      <div style="display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; relative;">
        <div style="position: absolute; width: 100%; height: 100%; background-color: #3b82f6; border-radius: 50%; opacity: 0.3; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 20px; height: 20px; background-color: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center to Delhi coordinates or first room or userCoords
    const initialLat = userCoords?.lat || rooms[0]?.coordinates?.lat || 28.6985;
    const initialLng = userCoords?.lng || rooms[0]?.coordinates?.lng || 77.2029;

    const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 13);
    mapInstanceRef.current = map;

    // Premium OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors'
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // single init

  // Update Markers when rooms or selectedRoom changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add User GPS Pin & Radius Circle if available
    if (userCoords) {
      const uMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userGpsIcon, zIndexOffset: 1000 }).addTo(map);
      uMarker.bindPopup('<div class="font-bold text-sm text-indigo-900">📍 You Are Here</div><div class="text-[10px] text-slate-500">Showing search radius near your GPS coordinate</div>');
      markersRef.current['user_gps'] = uMarker;

      // Add 3km blue radius circle
      L.circle([userCoords.lat, userCoords.lng], {
        color: '#4f46e5',
        fillColor: '#6366f1',
        fillOpacity: 0.08,
        radius: 3000 // 3km in meters
      }).addTo(map);
    }

    // Add Room Markers
    const bounds = L.latLngBounds([]);
    if (userCoords) bounds.extend([userCoords.lat, userCoords.lng]);

    rooms.forEach(room => {
      const isSelected = room.id === selectedRoomId;
      const marker = L.marker([room.coordinates.lat, room.coordinates.lng], {
        icon: createCustomIcon(room.available, isSelected),
        zIndexOffset: isSelected ? 500 : (room.available ? 100 : 0)
      }).addTo(map);

      bounds.extend([room.coordinates.lat, room.coordinates.lng]);

      // Create rich HTML interactive popup
      const popupContent = `
        <div class="p-2 max-w-xs font-sans">
          <div class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 inline-block mb-1">
            ${room.wardNo}
          </div>
          <h4 class="font-extrabold text-sm text-indigo-950 leading-tight mb-1">${room.title}</h4>
          <div class="text-xs text-slate-600 mb-2">${room.locationText}</div>
          <div class="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
            <div>
              <div class="text-[9px] text-slate-400 uppercase">Rent</div>
              <div class="font-black text-indigo-700 text-sm">₹${room.rent}/mo</div>
            </div>
            <button 
              id="popup-btn-${room.id}"
              class="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              Inspect
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280, className: 'premium-map-popup' });

      // Add DOM event listener inside Leaflet popup when opened
      marker.on('popupopen', () => {
        if (onSelectRoom) onSelectRoom(room);
        const btn = document.getElementById(`popup-btn-${room.id}`);
        if (btn) {
          btn.onclick = () => {
            navigate(`/room/${room.id}`);
          };
        }
      });

      markersRef.current[room.id] = marker;
    });

    // Fit map to bounds if we have rooms
    if (rooms.length > 0 && map) {
      try {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } catch (e) {
        console.warn("Leaflet fitBounds minor issue:", e);
      }
    }
  }, [rooms, userCoords, selectedRoomId]);

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
      {/* Interactive Map Box */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-10" />

      {/* Top Floating Map Legend overlay */}
      <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-4 text-xs font-bold flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block shadow"></span>
          <span className="text-slate-700">Available Room</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 inline-block shadow"></span>
          <span className="text-slate-700">Selected / Active</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-rose-500 inline-block shadow"></span>
          <span className="text-slate-700">Rented Out</span>
        </span>
        {userCoords && (
          <span className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-xl text-blue-800 border border-blue-200">
            <Navigation className="w-3 h-3 animate-spin text-blue-600" />
            <span>Showing 3km Near GPS</span>
          </span>
        )}
      </div>
    </div>
  );
};