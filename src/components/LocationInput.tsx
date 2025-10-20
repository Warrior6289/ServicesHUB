import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Location } from '../types/serviceRequest';

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

type LocationInputProps = {
  value: Location | null;
  onChange: (location: Location) => void;
  error?: string;
};

// Component to handle map clicks
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const LocationInput: React.FC<LocationInputProps> = ({ value, onChange, error }) => {
  const [showMap, setShowMap] = useState(false);
  const [address, setAddress] = useState(value?.address || '');
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]); // Default to NYC
  const addressInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      setAddress(value.address);
      setMapCenter([value.lat, value.lng]);
    }
  }, [value]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleAddressBlur = () => {
    // Simple validation: if user entered an address, create a location
    // In a real app, you'd use a geocoding service here
    if (address && address !== value?.address) {
      onChange({
        lat: mapCenter[0],
        lng: mapCenter[1],
        address: address,
      });
    }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    // Reverse geocoding would go here
    // For now, we'll create a simple address string
    const simpleAddress = `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    
    const newLocation: Location = {
      lat,
      lng,
      address: address || simpleAddress,
    };
    
    setMapCenter([lat, lng]);
    onChange(newLocation);
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newAddress = `Current Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          
          setMapCenter([lat, lng]);
          setAddress(newAddress);
          onChange({
            lat,
            lng,
            address: newAddress,
          });
          setShowMap(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please enter manually or select on map.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Service Location
        </label>
        <div className="flex gap-2">
          <input
            ref={addressInputRef}
            type="text"
            value={address}
            onChange={handleAddressChange}
            onBlur={handleAddressBlur}
            placeholder="Enter your address"
            className={`flex-1 rounded-lg border ${
              error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white`}
          />
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors whitespace-nowrap"
          >
            Use Current
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          {showMap ? 'Hide Map' : 'Select Location on Map'}
        </button>
      </div>

      {showMap && (
        <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '300px', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onClick={handleMapClick} />
            {value && <Marker position={[value.lat, value.lng]} />}
          </MapContainer>
          <div className="bg-gray-50 dark:bg-slate-800 px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
            Click on the map to select your location
          </div>
        </div>
      )}

      {value && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Selected: {value.address} ({value.lat.toFixed(4)}, {value.lng.toFixed(4)})
        </div>
      )}
    </div>
  );
};

