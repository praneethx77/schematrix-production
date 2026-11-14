'use client';

// ==============================================================================
// SCHEMATRIX - Nearby Government Office Locator
//
// Live discovery backed by /api/offices/nearby, which combines curated official
// records (MongoDB) with community-mapped OpenStreetMap data (Overpass). Uses the
// browser's real coordinates (with permission) or a manually entered point, and
// supports radius expansion, category filters, name/locality search and distance
// sorting. Never fabricates records, phone numbers or coordinates.
// ==============================================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { OfficeCard } from './OfficeCard';
import { OfficeDetailModal } from './OfficeDetailModal';
import { useLanguage } from '@/context/LanguageContext';
import { fetchNearbyOffices, NearbyResponse, NearbySource } from '@/lib/offices';
import { PublicOffice } from '@/lib/types';
import { OFFICE_CATEGORY_IDS, OfficeCategoryId } from '@/lib/overpass-query';
import {
  Search,
  MapPin,
  LocateFixed,
  AlertCircle,
  Loader2,
  RotateCcw,
  Building2,
  ShieldCheck,
  Database,
  Navigation,
} from 'lucide-react';

const RADIUS_OPTIONS = [5, 10, 25];

const CATEGORY_LABEL_KEY: Record<OfficeCategoryId, 'nearbyAll' | 'nearbyGovernment' | 'nearbyMunicipal' | 'nearbyPanchayat' | 'nearbyRevenue' | 'nearbyCsc' | 'nearbyPost' | 'nearbyHealth' | 'nearbyPolice'> = {
  all: 'nearbyAll',
  government: 'nearbyGovernment',
  municipal: 'nearbyMunicipal',
  panchayat: 'nearbyPanchayat',
  revenue: 'nearbyRevenue',
  csc: 'nearbyCsc',
  post: 'nearbyPost',
  health: 'nearbyHealth',
  police: 'nearbyPolice',
};

/** Map a record to one of our category ids (handles legacy official labels). */
function categoryOf(office: PublicOffice): OfficeCategoryId {
  if (office.sourceType === 'osm') {
    return (OFFICE_CATEGORY_IDS as string[]).includes(office.category)
      ? (office.category as OfficeCategoryId)
      : 'government';
  }
  const c = office.category.toLowerCase();
  if (c.includes('post office')) return 'post';
  if (c.includes('health') || c.includes('hospital')) return 'health';
  if (c.includes('panchayat')) return 'panchayat';
  if (c.includes('mandal') || c.includes('tahsildar') || c.includes('revenue')) return 'revenue';
  if (c.includes('common service') || c.includes('csc')) return 'csc';
  if (c.includes('municipal') || c.includes('municipality') || c.includes('corporation')) return 'municipal';
  return 'government';
}

export function GovernmentOfficeLocator(): React.ReactElement {
  const { t } = useLanguage();

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [category, setCategory] = useState<OfficeCategoryId>('all');
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');

  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  const [result, setResult] = useState<NearbyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedOffice, setSelectedOffice] = useState<PublicOffice | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const expandedRef = useRef(false);

  const requestNearby = useCallback(
    async (lat: number, lng: number, radiusM: number, allowExpand: boolean) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNearbyOffices({ lat, lng, radius: radiusM, signal: controller.signal });
        if (controller.signal.aborted) return;
        setResult(data);
        setCoords({ lat, lng });

        // Expand to 25 km once when very few results are found nearby.
        if (
          allowExpand &&
          data.source !== 'unavailable' &&
          data.count < 3 &&
          radiusM < 25_000 &&
          !expandedRef.current
        ) {
          expandedRef.current = true;
          setRadiusKm(25);
          void requestNearby(lat, lng, 25_000, false);
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        // Surface an honest, consistent message; keep the detail server-side.
        setError(t('nearbyError'));
        setResult(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleUseMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError(t('locationUnavailable'));
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        expandedRef.current = false;
        setRadiusKm(10);
        void requestNearby(pos.coords.latitude, pos.coords.longitude, 10_000, true);
      },
      (err) => {
        setLocating(false);
        setError(err.code === err.PERMISSION_DENIED ? t('locationDenied') : t('locationUnavailable'));
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
    );
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = Number(manualLat);
    const lng = Number(manualLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError(t('invalidCoords'));
      return;
    }
    expandedRef.current = false;
    setRadiusKm(10);
    void requestNearby(lat, lng, 10_000, true);
  };

  const handleRadiusChange = (km: number) => {
    setRadiusKm(km);
    if (coords) {
      expandedRef.current = true;
      void requestNearby(coords.lat, coords.lng, km * 1000, false);
    }
  };

  const handleRetry = () => {
    if (coords) {
      expandedRef.current = false;
      void requestNearby(coords.lat, coords.lng, radiusKm * 1000, false);
    } else {
      handleUseMyLocation();
    }
  };

  const offices = result?.offices ?? [];
  const filtered = offices.filter((o) => {
    if (category !== 'all' && categoryOf(o) !== category) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const hay = `${o.name} ${o.address} ${o.district} ${o.state} ${o.pinCode}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (stateFilter.trim()) {
      if (!o.state.toLowerCase().includes(stateFilter.trim().toLowerCase())) return false;
    }
    if (districtFilter.trim()) {
      if (!o.district.toLowerCase().includes(districtFilter.trim().toLowerCase())) return false;
    }
    return true;
  });

  const source: NearbySource | null = result?.source ?? null;
  const hasOsm = offices.some((o) => o.sourceType === 'osm');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
            <Navigation className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
              {t('nearbyGovtOffices')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              {t('nearbyGovtOfficesSubtitle')}
            </p>
          </div>
        </div>

        {source && source !== 'unavailable' && (
          <div className="flex items-center gap-2 self-start md:self-end">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                source === 'cache'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              }`}
            >
              {source === 'cache' ? <Database className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              <span>{source === 'cache' ? t('nearbyCached') : t('nearbyLive')}</span>
            </span>
          </div>
        )}
      </div>

      {/* Location + controls */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={locating || loading}
            className="flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 disabled:opacity-50 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 outline-none"
          >
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
            <span>{t('useMyLocation')}</span>
          </button>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
              {t('radiusLabel')}
            </label>
            <div className="flex gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800">
              {RADIUS_OPTIONS.map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => handleRadiusChange(km)}
                  aria-pressed={radiusKm === km}
                  className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-bold transition-colors ${
                    radiusKm === km
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {km} km
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Manual location */}
        <form onSubmit={handleManualSearch} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {t('latitude')}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              placeholder="17.3850"
              className="w-full px-3 py-2.5 min-h-[44px] bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-500/20 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {t('longitude')}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              placeholder="78.4867"
              className="w-full px-3 py-2.5 min-h-[44px] bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-500/20 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 disabled:opacity-50 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
          >
            <Search className="w-4 h-4" />
            <span>{t('searchNearby')}</span>
          </button>
        </form>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{t('nearbyHint')}</p>

        {/* Name + locality search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('nearbySearchPlaceholder')}
              className="w-full pl-9 pr-3 py-2.5 min-h-[44px] bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-500/20 outline-none"
            />
          </div>
          <input
            type="text"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            placeholder={t('filterByState')}
            className="w-full px-3 py-2.5 min-h-[44px] bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-500/20 outline-none"
          />
          <input
            type="text"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            placeholder={t('filterByDistrict')}
            className="w-full px-3 py-2.5 min-h-[44px] bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-500/20 outline-none"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {OFFICE_CATEGORY_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setCategory(id)}
              aria-pressed={category === id}
              className={`shrink-0 px-3 py-2 min-h-[40px] rounded-lg text-xs font-bold transition-colors ${
                category === id
                  ? 'bg-amber-500 text-neutral-950'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {t(CATEGORY_LABEL_KEY[id])}
            </button>
          ))}
        </div>
      </div>

      {/* Warning (provider unavailable, using cache) */}
      {result?.warning && (
        <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs text-amber-700 dark:text-amber-300">
            <p>{result.warning}</p>
            {result.code === 'rate_limited' && <p className="mt-1">{t('nearbyBusyHint')}</p>}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
          <div className="flex items-start gap-2 flex-1">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('nearbyRetry')}</span>
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-500 dark:text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm font-semibold">{t('nearbySearching')}</p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        result === null ? (
          <div className="py-16 px-6 text-center rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Navigation className="w-8 h-8" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{t('nearbyGetStarted')}</h3>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">{t('nearbyGetStartedHint')}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              <span>
                {t('nearbyResults')}: <strong className="text-neutral-900 dark:text-white">{filtered.length}</strong> / {offices.length}
              </span>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list" aria-label={t('nearbyGovtOffices')}>
                {filtered.map((office) => (
                  <OfficeCard
                    key={office.id}
                    office={office}
                    distanceKm={office.distanceKm}
                    onSelect={(o) => setSelectedOffice(o)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 px-6 text-center rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-4">
                <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 flex items-center justify-center mx-auto">
                  <Building2 className="w-8 h-8" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{t('nearbyEmpty')}</h3>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">{t('nearbyEmptyHint')}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950"
                  >
                    <LocateFixed className="w-4 h-4" />
                    <span>{t('useMyLocation')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{t('nearbyRetry')}</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )
      )}

      {/* Attribution */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
        <span>{t('osmAttribution')}</span>
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline"
        >
          <MapPin className="w-3 h-3" />
          OpenStreetMap
        </a>
      </div>
      {hasOsm && <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{t('communityMapped')}</p>}

      <OfficeDetailModal
        office={selectedOffice}
        isOpen={selectedOffice !== null}
        onClose={() => setSelectedOffice(null)}
      />
    </div>
  );
}