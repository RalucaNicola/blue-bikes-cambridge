type ArrayWithColumnInfo<T> = T[] & { columns?: String[] };

export interface CountryRegions {
  country: string;
  region: string;
  level1: string;
  level2: string;
}

export type CountryData = CountryRegions[] & { columns?: String[] };

export interface ConstructionSite {
  id: number;
  address: string;
  end: number;
  start: number;
}
