'use client';

// ==============================================================================
// SCHEMATRIX - Government Office Card
// Displays office details, contact info, working hours, services, and map links.
// Every record shows its official source and the date it was last verified.
// ==============================================================================

import React from 'react';
import { PublicOffice } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  googleMapsUrl,
  googleMapsCoordsUrl,
  googleMapsDirectionsUrl,
  openStreetMapUrl,
  openStreetMapCoordsUrl,
  formatVerifiedDate,
} from '@/lib/offices';
import {
  MapPin,
  Phone,
  Clock,
  Building2,
  ExternalLink,
  ChevronRight,
  Navigation,
  CalendarCheck,
} from 'lucide-react';

interface OfficeCardProps {
  office: PublicOffice;
  distanceKm?: number;
  onSelect?: (office: PublicOffice) => void;
}

export function OfficeCard({ office, distanceKm, onSelect }: OfficeCardProps) {
  const { t, language } = useLanguage();
  const isOsm = office.sourceType === 'osm';

  const displayName =
    language === 'hi' && office.nameHi
      ? office.nameHi
      : language === 'te' && office.nameTe
        ? office.nameTe
        : office.name;

  const fullAddress = [office.address, office.district, office.state, office.pinCode]
    .filter(Boolean)
    .join(', ');

  return (
    <article
      className="flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-all group focus-within:ring-2 focus-within:ring-amber-500 outline-none"
      tabIndex={0}
      role="listitem"
    >
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white truncate">
                {displayName}
              </h3>
              {distanceKm !== undefined && (
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {distanceKm} {t('distanceKm')}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{office.category}</p>
              {isOsm ? (
                <a
                  href={office.sourceUrl || 'https://www.openstreetmap.org/copyright'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                >
                  <MapPin className="w-3 h-3" aria-hidden="true" />
                  {t('communitySource')}
                </a>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  {t('officialSource')}
                </span>
              )}
            </div>

            <div className="flex items-start gap-2 mb-2">
              <MapPin className="w-4 h-4 text-neutral-500 dark:text-neutral-500 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {fullAddress}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                <Phone className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {t('contactNumber')}
                  </p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">{office.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                <Clock className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {t('workingHours')}
                  </p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">{office.workingHours || '—'}</p>
                </div>
              </div>
            </div>

            {office.availableServices && office.availableServices.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                  {t('availableServicesAtOffice')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {office.availableServices.map((service, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 mb-3 text-xs">
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="leading-relaxed">
                <p className="font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {isOsm ? t('communitySource') : t('officialSource')}
                </p>
                {office.sourceUrl ? (
                  <a
                    href={office.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-700 dark:text-amber-400 hover:underline break-words"
                  >
                    {office.officialSource}
                  </a>
                ) : (
                  <p className="text-neutral-700 dark:text-neutral-300 break-words">{office.officialSource}</p>
                )}
                {formatVerifiedDate(office.lastReviewedAt) && (
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    <CalendarCheck className="w-3 h-3" aria-hidden="true" />
                    {isOsm ? t('fetchedOn') : t('lastVerifiedOn')} {formatVerifiedDate(office.lastReviewedAt)}
                  </p>
                )}
                {isOsm && office.attribution && (
                  <p className="mt-1 text-[10px] text-neutral-500 dark:text-neutral-400">
                    {office.attribution}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:shrink-0">
            <button
              type="button"
              onClick={() => onSelect?.(office)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
            >
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('viewDetails')}</span>
            </button>

            <div className="flex gap-2">
              <a
                href={office.latitude !== undefined && office.longitude !== undefined ? googleMapsCoordsUrl(office.latitude, office.longitude) : googleMapsUrl(fullAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 outline-none"
              >
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('openInMaps')}</span>
              </a>
              {office.latitude !== undefined && office.longitude !== undefined && (
                <a
                  href={googleMapsDirectionsUrl(office.latitude, office.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:opacity-90 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
                >
                  <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t('getDirections')}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}