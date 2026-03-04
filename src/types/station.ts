export interface Station {
  id: string;
  data_source: string;
  campaign_name: string;
  project_name: string;
  station_name: string;
  title: string;
  sensor_name: string;
  sensor_long_name: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
  time_coverage_start: string;
  time_coverage_end: string;
  deployment_status: string;
  location: string;
  country: string;
  continent: string;
  institution: string;
  contact: string;
  authors: string;
  disdrodb_data_url: string;
  documentation: string;
  doi: string;
  license: string;
  references: string;
  website: string;
  github_url: string;
}

export interface StationsData {
  generated_at: string;
  total: number;
  stations: Station[];
}

export interface FilterOptions {
  sensor_names: string[];
  data_sources: string[];
  // campaign_names: string[];
  // countries: string[];
  // continents: string[];
  // deployment_statuses: string[];
  max_duration?: number;
}

export interface FilterState {
  search: string;
  sensors: string[];
  sources: string[];
  status: 'all' | 'ongoing' | 'terminated';
  dataAvailability: 'all' | 'public' | 'offline';
  minDuration: number | null;
  maxDuration: number | null;
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
}
