import type { OriginKey } from '../types';

/**
 * Native-range regions as ISO 3166-1 numeric country codes (the ids used by the
 * world-atlas / Natural Earth TopoJSON). Coarse on purpose: the mini-map shows
 * where a species comes from, not its exact native distribution.
 */
const NORTH_AMERICA = ['840', '124', '484'];
const SOUTH_AMERICA = ['076', '032', '858', '600', '068', '152', '604', '218', '170', '862', '328', '740'];
const NORTH_AFRICA = ['504', '012', '788', '434', '818', '732'];
const SAHEL_EAST_AFRICA = ['686', '270', '478', '466', '854', '562', '148', '729', '728', '231', '232', '566', '324', '800'];
const SUB_SAHARAN_AFRICA = [
  ...SAHEL_EAST_AFRICA,
  '694', '430', '384', '288', '768', '204', '120', '140', '178', '180', '266', '226', '024', '516', '072', '710',
  '426', '748', '508', '716', '894', '454', '834', '404', '646', '108', '706', '262', '624', '450',
];

export const ORIGIN_REGIONS: Record<OriginKey, string[]> = {
  northAmerica: NORTH_AMERICA,
  southAmerica: SOUTH_AMERICA,
  seAsia: ['764', '704', '418', '116', '104', '458', '360', '608', '096'],
  eastAsia: ['156', '392', '410', '408', '496', '158'],
  centralEurope: ['276', '616', '203', '040', '348', '703', '756'],
  pontoCaspian: ['804', '498', '642', '100', '268', '051', '031', '795'],
  westernAtlantic: [...NORTH_AMERICA, '192', '044', '332', '214', '320', '084', '340', '558', '188', '591', '170', '862', '328', '740', '076', '858', '032'],
  northAfrica: NORTH_AFRICA,
  southAsiaAfrica: ['356', '586', '050', '144', '524', ...SAHEL_EAST_AFRICA],
  subSaharanAfrica: SUB_SAHARAN_AFRICA,
};

/** Catalonia, the arrival point drawn on every origin map ([lng, lat]). */
export const CATALONIA_POINT: [number, number] = [1.6, 41.8];
