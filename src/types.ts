/** Domain model for the EXOCAT visualizer (fauna-only demo). */

export const LANGS = ['ca', 'es', 'en'] as const;
export type Lang = (typeof LANGS)[number];

/** Text available in every supported interface language. */
export type LocalizedText = Record<Lang, string>;

export const TAXON_GROUPS = ['Fish', 'Invertebrates', 'Birds', 'Herptiles', 'Mammals'] as const;
export type TaxonGroup = (typeof TAXON_GROUPS)[number];

export const RISK_LEVELS = ['high', 'medium', 'low'] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const HABITATS = ['terrestrial', 'freshwater', 'marine'] as const;
export type Habitat = (typeof HABITATS)[number];

export const WATERSHEDS = [
  'Garona',
  'Noguera Pallaresa',
  'Noguera Ribagorçana',
  'Segre',
  'Ebre',
  'Francolí',
  'Gaià',
  'Foix',
  'Llobregat',
  'Besòs',
  'Tordera',
  'Ter',
  'Fluvià',
  'Muga',
] as const;
export type Watershed = (typeof WATERSHEDS)[number];

export type WatershedSystem = 'internal' | 'ebro' | 'atlantic';

export type OriginKey =
  | 'northAmerica'
  | 'southAmerica'
  | 'seAsia'
  | 'eastAsia'
  | 'centralEurope'
  | 'pontoCaspian'
  | 'westernAtlantic'
  | 'northAfrica'
  | 'southAsiaAfrica'
  | 'subSaharanAfrica';

export type PathwayKey =
  | 'angling'
  | 'mosquitoControl'
  | 'liveBait'
  | 'cargoStowaway'
  | 'aquaculture'
  | 'boatsGear'
  | 'ballast'
  | 'tyreTrade'
  | 'biocontrol'
  | 'ornamentalTrade'
  | 'palmTrade'
  | 'petEscapes'
  | 'petReleases'
  | 'accidental'
  | 'furFarms'
  | 'hunting'
  | 'aquariumTrade'
  | 'collectionEscapes';

export type LatLng = [number, number];

export interface LegalStatus {
  /** Listed under EU Regulation 1143/2014 (Union list). */
  eu: boolean;
  /** Listed in the Spanish Catalogue of Invasive Alien Species (RD 630/2013). */
  spain: boolean;
}

export interface Species {
  id: string;
  scientificName: string;
  commonNames: LocalizedText;
  group: TaxonGroup;
  family: string;
  origin: OriginKey;
  pathway: PathwayKey;
  firstRecord: number;
  risk: RiskLevel;
  /** 0–100 composite invasiveness score (illustrative). */
  riskScore: number;
  habitats: Habitat[];
  legal: LegalStatus;
  description: LocalizedText;
  management: LocalizedText;
}

export interface Occurrence {
  id: string;
  speciesId: string;
  lat: number;
  lng: number;
  year: number;
  watershed: Watershed;
}

export interface ExocatDataset {
  species: Species[];
  occurrences: Occurrence[];
  speciesById: Map<string, Species>;
  yearBounds: [number, number];
  generatedAt: string;
}

export type SortKey = 'records' | 'name' | 'firstRecord' | 'riskScore';

export interface FilterState {
  search: string;
  groups: TaxonGroup[];
  risks: RiskLevel[];
  habitats: Habitat[];
  watershed: Watershed | null;
  yearRange: [number, number];
  euListedOnly: boolean;
  /** When set, the map and charts isolate a single species. */
  focusSpeciesId: string | null;
}

export type MapLayerId = 'records' | 'grid' | 'hubs';
