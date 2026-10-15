import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

export const TripMap = ({ plan }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState('all');

  // Fallback center if destination coordinates are missing
  const defaultLat = 15.2993; // Goa
  const defaultLng = 74.1240;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix default Leaflet icon paths
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 11,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when plan or selectedDay changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const bounds = [];

    // Helper to create colored custom div icons
    const createCustomIcon = (bgColor, text) => {
      return L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="background-color: ${bgColor}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
            ${text}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
    };

    // 1. Arrival Station / Airport Marker
    const arrivalLoc = plan.selectedOutbound?.arrivalLocation || 'Arrival Point';
    const arrivalLat = 15.3808;
    const arrivalLng = 73.8314;
    bounds.push([arrivalLat, arrivalLng]);

    const arrivalMarker = L.marker([arrivalLat, arrivalLng], {
      icon: createCustomIcon('#0284c7', '✈️'),
    });
    arrivalMarker.bindPopup(`
      <div style="font-family: inherit; padding: 4px;">
        <div style="font-size: 10px; font-weight: bold; color: #0284c7; text-transform: uppercase;">Arrival Hub</div>
        <div style="font-weight: bold; font-size: 13px; margin: 2px 0;">${arrivalLoc}</div>
        <div style="font-size: 11px; color: #64748b;">Arrival Time: ${plan.selectedOutbound?.arrivalTime || '14:00'}</div>
      </div>
    `);
    layer.addLayer(arrivalMarker);

    // 2. Accommodation Marker
    if (plan.selectedAccommodation) {
      const hotelLat = 15.5553;
      const hotelLng = 73.7517;
      bounds.push([hotelLat, hotelLng]);

      const hotelMarker = L.marker([hotelLat, hotelLng], {
        icon: createCustomIcon('#059669', '🏨'),
      });
      hotelMarker.bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <div style="font-size: 10px; font-weight: bold; color: #059669; text-transform: uppercase;">Accommodation</div>
          <div style="font-weight: bold; font-size: 13px; margin: 2px 0;">${plan.selectedAccommodation.propertyName}</div>
          <div style="font-size: 11px; color: #64748b;">${plan.selectedAccommodation.location}</div>
          <div style="font-size: 11px; font-weight: bold; color: #0f172a; margin-top: 4px;">₹${plan.selectedAccommodation.nightlyRate}/night</div>
        </div>
      `);
      layer.addLayer(hotelMarker);
    }

    // 3. Day-wise Attraction Markers
    const daysToShow = selectedDay === 'all'
      ? plan.itinerary?.days || []
      : plan.itinerary?.days?.filter((d) => d.dayNumber === selectedDay) || [];

    const dayColors = ['#e11d48', '#d97706', '#2563eb', '#7c3aed', '#059669', '#0891b2', '#db2777'];

    daysToShow.forEach((day) => {
      const color = dayColors[(day.dayNumber - 1) % dayColors.length];
      day.activities?.forEach((act) => {
        if (act.coordinates && act.coordinates.lat && act.coordinates.lng) {
          const lat = act.coordinates.lat;
          const lng = act.coordinates.lng;
          bounds.push([lat, lng]);

          const marker = L.marker([lat, lng], {
            icon: createCustomIcon(color, `D${day.dayNumber}`),
          });

          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

          marker.bindPopup(`
            <div style="font-family: inherit; max-width: 240px; padding: 4px;">
              <div style="font-size: 10px; font-weight: bold; color: ${color}; text-transform: uppercase;">Day ${day.dayNumber} • ${act.timeSlot}</div>
              <div style="font-weight: bold; font-size: 13px; margin: 2px 0;">${act.title}</div>
              <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">${act.locationName}</div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">${act.description.substring(0, 100)}...</div>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
                <span>Est. Cost: <strong>₹${act.costPerPerson}</strong></span>
                <a href="${directionsUrl}" target="_blank" rel="noreferrer" style="color: #0284c7; font-weight: bold; text-decoration: none;">Directions ↗</a>
              </div>
            </div>
          `);
          layer.addLayer(marker);
        }
      });
    });

    if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 13 });
    }
  }, [plan, selectedDay]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Map Control Toolbar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Route & Sightseeing Map: {plan.destination}
          </span>
        </div>

        {/* Day Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedDay === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Days
          </button>
          {plan.itinerary?.days?.map((day) => (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDay(day.dayNumber)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDay === day.dayNumber
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Day {day.dayNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="h-96 w-full z-0" />

      {/* Map Legend */}
      <div className="p-3 bg-white border-t border-slate-100 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-sky-600" />
          <span>Airport / Railway Junction</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-600" />
          <span>Accommodation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-600" />
          <span>Daily Attractions (Numbered)</span>
        </div>
      </div>
    </div>
  );
};
