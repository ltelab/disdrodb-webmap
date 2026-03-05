import { useState, useEffect, useMemo } from 'react';
import type { Station, StationsData, FilterOptions, FilterState } from '../types/station';

const BASE_URL = import.meta.env.BASE_URL || '/';

export function useStations() {
    const [stations, setStations] = useState<Station[]>([]);
    const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            fetch(`${BASE_URL}data/stations.json`).then((r) => r.json()),
            fetch(`${BASE_URL}data/filter-options.json`).then((r) => r.json()),
        ])
            .then(([stationsData, options]: [StationsData, FilterOptions]) => {
                options.max_duration = 25;

                setStations(stationsData.stations);
                setFilterOptions(options);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return { stations, filterOptions, loading, error };
}

function toMonthNum(year: number, month: number): number {
    return year * 12 + month;
}

function stationStartMonth(s: Station): number | null {
    if (!s.time_coverage_start) return null;
    const d = new Date(s.time_coverage_start);
    if (isNaN(d.getTime())) return null;
    return toMonthNum(d.getFullYear(), d.getMonth() + 1);
}

function stationEndMonth(s: Station): number | null {
    if (!s.time_coverage_end) return null;
    const d = new Date(s.time_coverage_end);
    if (isNaN(d.getTime())) return null;
    return toMonthNum(d.getFullYear(), d.getMonth() + 1);
}

export function useFilteredStations(stations: Station[], filters: FilterState) {
    const [now] = useState(() => Date.now());

    return useMemo(() => {
        let result = stations;

        // Text search
        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter(
                (s) =>
                    s.station_name.toLowerCase().includes(q) ||
                    s.location.toLowerCase().includes(q) ||
                    s.campaign_name.toLowerCase().includes(q) ||
                    s.project_name.toLowerCase().includes(q) ||
                    s.title.toLowerCase().includes(q) ||
                    s.country.toLowerCase().includes(q) ||
                    s.continent.toLowerCase().includes(q) ||
                    s.institution.toLowerCase().includes(q) ||
                    s.authors.toLowerCase().includes(q) ||
                    s.data_source.toLowerCase().includes(q) ||
                    s.sensor_name.toLowerCase().includes(q)
            );
        }

        // Deployment status filter
        if (filters.status !== 'all') {
            result = result.filter((s) => s.deployment_status === filters.status);
        }

        // Data Availability filter
        if (filters.dataAvailability !== 'all') {
            if (filters.dataAvailability === 'public') {
                result = result.filter((s) => !!s.disdrodb_data_url);
            } else if (filters.dataAvailability === 'offline') {
                result = result.filter((s) => !s.disdrodb_data_url);
            }
        }

        // Duration filter
        if (filters.minDuration !== null || filters.maxDuration !== null) {
            result = result.filter((s) => {
                if (!s.time_coverage_start) return false;
                const start = new Date(s.time_coverage_start).getTime();
                if (isNaN(start)) return false;

                let end: number;
                if (s.deployment_status === 'ongoing') {
                    end = now;
                } else {
                    if (!s.time_coverage_end) return false;
                    end = new Date(s.time_coverage_end).getTime();
                    if (isNaN(end)) return false;
                }

                if (end < start) return false;

                const durationYears = (end - start) / (1000 * 60 * 60 * 24 * 365.25);

                if (filters.minDuration !== null && durationYears < filters.minDuration) return false;
                if (filters.maxDuration !== null && durationYears > filters.maxDuration) return false;

                return true;
            });
        }

        // Sensor filter
        if (filters.sensors.length > 0) {
            result = result.filter((s) => filters.sensors.includes(s.sensor_name));
        }

        // Data source filter
        if (filters.sources.length > 0) {
            result = result.filter((s) => filters.sources.includes(s.data_source));
        }

        // Time range filter (month/year overlap logic)
        const filterStart = toMonthNum(filters.startYear, filters.startMonth);
        const filterEnd = toMonthNum(filters.endYear, filters.endMonth);

        result = result.filter((s) => {
            const sEnd = stationEndMonth(s);
            const sStart = stationStartMonth(s);
            // If station has no dates, include it
            if (sStart === null && sEnd === null) return true;
            // Overlap check: station range overlaps filter range
            if (sEnd !== null && sEnd < filterStart) return false;
            if (sStart !== null && sStart > filterEnd) return false;
            return true;
        });

        return result;
    }, [stations, filters, now]);
}

export function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}
