import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CheckCircle2, MapPin, Wallet, ArrowRight, Crosshair, Search } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { formatMoney } from '../utils/format';

const MAPTILER_KEY = 'syjCNnyOD6Et3yv7rAh0';
const MAPTILER_STYLE_URL = `https://api.maptiler.com/maps/019f1188-ee8e-7e08-bb69-8570824bc377/style.json?key=${MAPTILER_KEY}`;
const INDIA_CENTER = [78.9629, 22.5937];

const INDIAN_LOCATIONS = [
  { id: 'delhi', name: 'Delhi', state: 'National Capital Region', coordinates: [77.209, 28.6139] },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', coordinates: [72.8777, 19.076] },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', coordinates: [77.5946, 12.9716] },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', coordinates: [78.4867, 17.385] },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', coordinates: [88.3639, 22.5726] },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', coordinates: [80.2707, 13.0827] },
];

const getFeatureState = (feature) => {
  const context = feature?.context || [];
  return context.find((item) => item.id?.startsWith('region'))?.text || 'India';
};

const buildLocationFromFeature = (feature) => ({
  id: `address-${Date.now()}`,
  name: feature?.text || feature?.place_name?.split(',')[0] || 'Selected Location',
  state: getFeatureState(feature),
  address: feature?.place_name || feature?.text || 'Selected address',
  coordinates: feature?.center || feature?.geometry?.coordinates,
  source: 'address-search',
});

const buildCurrentLocation = (longitude, latitude) => ({
  id: `current-${Date.now()}`,
  name: 'Current Location',
  state: 'India',
  address: 'Detected from browser location access',
  coordinates: [longitude, latitude],
  source: 'browser-geolocation',
});

const FullPageLocationMap = ({ selectedLocation, onSelect, onConfirm }) => {
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapStatus, setMapStatus] = useState('Loading map...');

  useEffect(() => {
    if (!mapNodeRef.current || mapRef.current) return undefined;

    const map = new maplibregl.Map({
      container: mapNodeRef.current,
      style: MAPTILER_STYLE_URL,
      center: INDIA_CENTER,
      zoom: 4.1,
      attributionControl: false,
    });

    mapRef.current = map;
    markerRef.current = new maplibregl.Marker({ color: '#22d3ee' });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      setMapStatus('');
      map.resize();
    });

    map.on('error', () => {
      setMapStatus('Map style could not load. Check internet access or MapTiler key.');
    });

    map.on('click', (event) => {
      onSelect({
        id: `map-${Date.now()}`,
        name: 'Pinned Location',
        state: 'India',
        address: `${event.lngLat.lat.toFixed(5)}, ${event.lngLat.lng.toFixed(5)}`,
        coordinates: [event.lngLat.lng, event.lngLat.lat],
        source: 'map-click',
      });
    });

    const resizeTimer = window.setTimeout(() => map.resize(), 250);

    return () => {
      window.clearTimeout(resizeTimer);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [onSelect]);

  useEffect(() => {
    const coordinates = selectedLocation?.coordinates;
    if (!coordinates || !mapRef.current || !markerRef.current) return;

    markerRef.current.setLngLat(coordinates).addTo(mapRef.current);
    mapRef.current.flyTo({
      center: coordinates,
      zoom: 14,
      speed: 1.1,
      curve: 1.2,
      essential: true,
    });
  }, [selectedLocation]);

  const searchAddress = async (event) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setIsSearching(true);
    setMapStatus('');

    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(trimmedQuery)}.json?key=${MAPTILER_KEY}&country=in&limit=5`
      );
      const data = await response.json();
      const nextSuggestions = data.features || [];
      setSuggestions(nextSuggestions);

      if (nextSuggestions.length > 0) {
        onSelect(buildLocationFromFeature(nextSuggestions[0]));
      } else {
        setMapStatus('No matching Indian address found.');
      }
    } catch (error) {
      console.error(error);
      setMapStatus('Address search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMapStatus('Location access is not supported in this browser.');
      return;
    }

    setIsLocating(true);
    setMapStatus('Requesting location access...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        onSelect(buildCurrentLocation(longitude, latitude));
        setMapStatus('');
        setIsLocating(false);
      },
      () => {
        setMapStatus('Location permission was blocked or unavailable.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  return (
    <motion.div
      key="location"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[110] bg-slate-950"
    >
      <div ref={mapNodeRef} className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-slate-950/90 via-slate-950/45 to-transparent p-4 sm:p-6">
        <div className="pointer-events-auto mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-start">
          <div className="glass-panel rounded-2xl border border-cyan-400/20 p-4 shadow-2xl lg:min-w-[620px]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-300">
              India Home Base
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
              Find your owner location
            </h2>
            <form onSubmit={searchAddress} className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Write your address in India"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/95 py-3 pl-10 pr-3 text-sm font-semibold text-white shadow-xl outline-none transition focus:border-cyan-400"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="rounded-xl bg-cyan-500 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-950 transition hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500"
              >
                {isSearching ? 'Finding' : 'Search'}
              </button>
            </form>
          </div>

          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={isLocating}
            className="pointer-events-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400 px-5 py-4 text-xs font-extrabold uppercase tracking-wider text-slate-950 shadow-2xl transition hover:bg-emerald-300 disabled:bg-slate-800 disabled:text-slate-500"
          >
            <Crosshair className="h-4 w-4" />
            {isLocating ? 'Locating' : 'Access Location'}
          </button>
        </div>
      </div>

      {mapStatus && (
        <div className="absolute left-4 top-40 z-20 max-w-sm rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-2 text-xs font-bold text-slate-300 shadow-xl sm:left-6">
          {mapStatus}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="absolute left-4 right-4 top-48 z-20 mx-auto grid max-w-5xl gap-2 sm:grid-cols-2 lg:top-44 lg:grid-cols-4">
          {suggestions.slice(0, 4).map((feature) => {
            const location = buildLocationFromFeature(feature);

            return (
              <button
                type="button"
                key={feature.id}
                onClick={() => onSelect(location)}
                className="rounded-xl border border-slate-800 bg-slate-950/85 px-3 py-2 text-left text-xs font-semibold text-slate-300 shadow-xl transition hover:border-cyan-400/50 hover:text-white"
              >
                {feature.place_name}
              </button>
            );
          })}
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 z-20 mx-auto grid max-w-6xl gap-3 lg:grid-cols-[1fr_360px]">
        <div className="glass-panel rounded-2xl border border-slate-800/80 p-3 shadow-2xl">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {INDIAN_LOCATIONS.map((location) => (
              <button
                type="button"
                key={location.id}
                onClick={() => onSelect(location)}
                className={`rounded-xl border px-3 py-2 text-left text-xs font-bold transition ${
                  selectedLocation?.id === location.id
                    ? 'border-emerald-400 bg-emerald-400/15 text-emerald-200'
                    : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-cyan-400/50'
                }`}
              >
                {location.name}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-cyan-400/20 p-5 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">
              <MapPin className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-black text-white">
                {selectedLocation ? selectedLocation.name : 'No location selected'}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                {selectedLocation
                  ? selectedLocation.address || selectedLocation.state
                  : 'Search your address, use current location, or tap on the map.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!selectedLocation}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-950 transition hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500"
          >
            Start In This Location
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const OnboardingModal = () => {
  const { player, completeOnboarding } = useGameStore();
  const [step, setStep] = useState('welcome');
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleConfirmLocation = () => {
    if (!selectedLocation) return;
    completeOnboarding(selectedLocation);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-xl">
      <AnimatePresence mode="wait">
        {step === 'welcome' ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="glass-card w-full max-w-lg rounded-2xl border border-emerald-500/20 p-8 text-center shadow-2xl"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-300" />
            </div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-300">
              Account Created
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
              Congratulations
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Welcome to the "Funder World". Your current balance is ready for your first move.
            </p>
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
              <div className="flex items-center justify-center gap-3">
                <Wallet className="h-5 w-5 text-emerald-300" />
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Current Balance
                </span>
              </div>
              <div className="mt-2 text-4xl font-black text-emerald-300">
                {formatMoney(player.funds)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep('location')}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-950 transition hover:bg-emerald-400"
            >
              Select Your Location
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        ) : (
          <FullPageLocationMap
            selectedLocation={selectedLocation}
            onSelect={setSelectedLocation}
            onConfirm={handleConfirmLocation}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingModal;
