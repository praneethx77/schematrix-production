import { test, expect } from '@playwright/test';
import {
  buildOverpassQuery,
  classifyOffice,
  parseOverpassElements,
  OSM_ATTRIBUTION,
} from '../../lib/overpass-query';
import { haversineKm, attachDistances, dedupeOffices } from '../../lib/geo';
import type { PublicOffice } from '../../lib/types';

test.describe('overpass query builder', () => {
  test('builds a bounded query with government selectors', () => {
    const q = buildOverpassQuery(17.385, 78.4867, 10000);
    expect(q).toContain('[out:json]');
    expect(q).toContain('around:10000,17.385,78.4867');
    expect(q).toContain('["office"="government"]');
    expect(q).toContain('["amenity"="post_office"]');
    expect(q).toContain('out center tags;');
  });
});

test.describe('classifyOffice', () => {
  test('maps OSM tags to categories', () => {
    expect(classifyOffice({ amenity: 'post_office' })).toBe('post');
    expect(classifyOffice({ amenity: 'hospital' })).toBe('health');
    expect(classifyOffice({ amenity: 'police' })).toBe('police');
    expect(classifyOffice({ amenity: 'townhall' })).toBe('municipal');
    expect(classifyOffice({ office: 'government', name: 'Mandal Revenue Office' })).toBe('revenue');
    expect(classifyOffice({ office: 'government', name: 'Rampoor Gram Panchayat' })).toBe('panchayat');
    expect(classifyOffice({ office: 'government', name: 'CSC e-Seva Kendra' })).toBe('csc');
    expect(classifyOffice({ office: 'government', name: 'District Collectorate' })).toBe('government');
    expect(classifyOffice({ amenity: 'cafe' })).toBeNull();
  });
});

test.describe('parseOverpassElements', () => {
  test('parses, classifies and never fabricates fields', () => {
    const elements = [
      { type: 'node', id: 1, lat: 17.39, lon: 78.48, tags: { amenity: 'post_office', name: 'Rampoor Post Office' } },
      { type: 'way', id: 2, center: { lat: 17.4, lon: 78.49 }, tags: { office: 'government', name: 'Mandal Revenue Office', 'addr:street': 'Main Rd', 'addr:city': 'Warangal', phone: '0870-2441201' } },
      { type: 'relation', id: 3, center: { lat: 17.41, lon: 78.5 }, tags: { amenity: 'hospital', name: 'Area Hospital' } },
      { type: 'node', id: 4, lat: 17.42, lon: 78.51, tags: { amenity: 'bench' } },
      { type: 'node', id: 5, lat: 17.43, lon: 78.52, tags: { amenity: 'post_office' } },
      { type: 'node', id: 1, lat: 17.39, lon: 78.48, tags: { amenity: 'post_office', name: 'Rampoor Post Office' } },
    ];

    const { offices, skipped } = parseOverpassElements(elements as any, 17.385, 78.4867);

    // bench (unmapped) + unnamed post office skipped; duplicate node ignored.
    expect(skipped).toBe(2);
    expect(offices).toHaveLength(3);
    expect(offices.find((o) => o.externalId === 'osm:node/1')?.category).toBe('post');
    expect(offices.find((o) => o.externalId === 'osm:way/2')?.category).toBe('revenue');
    expect(offices.find((o) => o.externalId === 'osm:relation/3')?.category).toBe('health');

    const post = offices.find((o) => o.externalId === 'osm:node/1')!;
    expect(post.phone).toBe(''); // never fabricate
    expect(post.sourceType).toBe('osm');
    expect(post.attribution).toBe(OSM_ATTRIBUTION);
    expect(post.sourceUrl).toContain('openstreetmap.org/node/1');

    const revenue = offices.find((o) => o.externalId === 'osm:way/2')!;
    expect(revenue.phone).toBe('0870-2441201'); // only when the tag exists
    expect(revenue.address).toContain('Main Rd');
  });
});

test.describe('geo helpers', () => {
  test('haversine is symmetric and roughly correct', () => {
    const d = haversineKm(17.385, 78.4867, 17.395, 78.4867);
    expect(d).toBeGreaterThan(1);
    expect(d).toBeLessThan(1.2);
    expect(haversineKm(17.395, 78.4867, 17.385, 78.4867)).toBeCloseTo(d, 5);
  });

  test('attachDistances sorts by distance and dedupe keeps unique', () => {
    const base = (id: string, lat: number, lng: number): PublicOffice => ({
      id,
      name: id,
      category: 'post',
      address: '',
      district: '',
      state: '',
      pinCode: '',
      phone: '',
      workingHours: '',
      officialSource: 'OpenStreetMap',
      lastReviewedAt: new Date().toISOString(),
      latitude: lat,
      longitude: lng,
      sourceType: 'osm',
      externalId: id,
    });
    const list = [base('osm:node/2', 17.5, 78.5), base('osm:node/1', 17.386, 78.487)];
    const sorted = attachDistances(list, 17.385, 78.4867);
    expect(sorted[0].id).toBe('osm:node/1');
    expect(sorted[0].distanceKm).toBeLessThan(sorted[1].distanceKm!);

    const deduped = dedupeOffices([...list, { ...list[0] }]);
    expect(deduped).toHaveLength(2);
  });
});