'use client';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

interface Prison {
  id: string;
  name: string;
  lat: number;
  lng: number;
  eligible_count: number;
  total_count: number;
  state: string;
  district: string;
}

function getColor(eligible: number) {
  if (eligible > 200) return '#EF4444';
  if (eligible > 100) return '#F59E0B';
  return '#10B981';
}

function getRadius(eligible: number) {
  if (eligible > 250) return 22;
  if (eligible > 150) return 18;
  if (eligible > 100) return 14;
  return 10;
}

export default function PrisonMap({ prisons }: { prisons: Prison[] }) {
  return (
    <MapContainer
      center={[22.5, 80.0]}
      zoom={5}
      className="w-full h-[600px] rounded-xl"
      style={{ background: '#0F172A' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {prisons.map((prison) => (
        <CircleMarker
          key={prison.id}
          center={[prison.lat, prison.lng]}
          radius={getRadius(prison.eligible_count)}
          pathOptions={{
            color: getColor(prison.eligible_count),
            fillColor: getColor(prison.eligible_count),
            fillOpacity: 0.5,
            weight: 2,
          }}
        >
          <Popup>
            <div className="text-xs space-y-1.5 min-w-[180px]">
              <p className="font-bold text-sm text-jg-text">{prison.name}</p>
              <p className="text-jg-text-secondary">{prison.district}, {prison.state}</p>
              <hr className="border-jg-border" />
              <div className="flex justify-between">
                <span className="text-jg-text-secondary">Eligible:</span>
                <span className="font-bold" style={{ color: getColor(prison.eligible_count) }}>{prison.eligible_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-jg-text-secondary">Total:</span>
                <span className="font-medium text-jg-text">{prison.total_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-jg-text-secondary">Eligible %:</span>
                <span className="font-bold text-jg-amber">{((prison.eligible_count / prison.total_count) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
