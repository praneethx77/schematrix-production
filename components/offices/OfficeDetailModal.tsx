'use client';

// ==============================================================================
// SCHEMATRIX - Government Office Detail Modal
// Full office details with map links, contact, working hours, and services.
// ==============================================================================

import React, { useCallback } from 'react';
import { PublicOffice } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  googleMapsUrl,
  openStreetMapUrl,
  googleMapsCoordsUrl,
  googleMapsDirectionsUrl,
  openStreetMapCoordsUrl,
  formatVerifiedDate,
} from '@/lib/offices';
import {
  X,
  MapPin,
  Phone,
  Clock,
  Building2,
  ExternalLink,
  Globe,
  Navigation,
  CalendarCheck,
} from 'lucide-react';

interface OfficeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  office: PublicOffice | null;
  distanceKm?: number;
}

export function OfficeDetailModal({ isOpen, onClose, office, distanceKm }: OfficeDetailModalProps) {
  const { t, language } = useLanguage();

  // All hooks must be called unconditionally, before any early return,
  // so the hook order is identical on every render.
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    },
    [handleClose]
  );

  if (!isOpen || !office) return null;

  const displayName =
    language === 'hi' && office.nameHi
      ? office.nameHi
      : language === 'te' && office.nameTe
        ? office.nameTe
        : office.name;

  const fullAddress = [office.address, office.district, office.state, office.pinCode]
    .filter(Boolean)
    .join(', ');
  const isOsm = office.sourceType === 'osm';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Office Details"
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" aria-hidden="true" />
      <div
        className="fixed inset-0 z-40 bg-white/10 backdrop-blur-md"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-auto p-4 sm:p-6">
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {displayName}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{office.category}</p>
                {distanceKm !== undefined && (
                  <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {distanceKm} {t('distanceKm')}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
              aria-label={t('close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  Address
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                  {fullAddress}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  {t('contactNumber')}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300">{office.phone || '—'}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  {t('workingHours')}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300">{office.workingHours || '—'}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4" aria-hidden="true" />
                  {isOsm ? t('communitySource') : t('officialSource')}
                </h3>
                {office.sourceUrl ? (
                  <a
                    href={office.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 hover:underline break-words"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    {office.officialSource}
                  </a>
                ) : (
                  <p className="text-neutral-600 dark:text-neutral-300 break-words">{office.officialSource}</p>
                )}
                {formatVerifiedDate(office.lastReviewedAt) && (
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <CalendarCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    {isOsm ? t('fetchedOn') : t('lastVerifiedOn')} {formatVerifiedDate(office.lastReviewedAt)}
                  </p>
                )}
                {isOsm && office.attribution && (
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{office.attribution}</p>
                )}
              </div>
            </div>

            {office.availableServices && office.availableServices.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4" aria-hidden="true" />
                  {t('availableServicesAtOffice')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {office.availableServices.map((service, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl text-sm font-medium bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4" aria-hidden="true" />
                {t('getDirections')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={office.latitude !== undefined && office.longitude !== undefined ? googleMapsCoordsUrl(office.latitude, office.longitude) : googleMapsUrl(fullAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
                >
                  <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  <span className="text-sm font-semibold">{t('openInMaps')}</span>
                </a>
                {office.latitude !== undefined && office.longitude !== undefined && (
                  <a
                    href={googleMapsDirectionsUrl(office.latitude, office.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 outline-none"
                  >
                    <Navigation className="w-4 h-4" aria-hidden="true" />
                    <span className="text-sm font-bold">{t('getDirections')}</span>
                  </a>
                )}
                <a
                  href={office.latitude !== undefined && office.longitude !== undefined ? openStreetMapCoordsUrl(office.latitude, office.longitude) : openStreetMapUrl(fullAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
                >
                  <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  <span className="text-sm font-semibold">OpenStreetMap</span>
                </a>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {t('officeLocatorDisclaimer')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}