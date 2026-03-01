import { useState, useEffect, useCallback } from 'react';
import type { FilterState } from '../types/station';

const MIN_YEAR = 2000;
const now = new Date();
const MAX_YEAR = now.getFullYear();
const MAX_MONTH = now.getMonth() + 1;

export const DEFAULT_FILTERS: FilterState = {
    search: '',
    sensors: [],
    sources: [],
    status: 'all',
    dataAvailability: 'all',
    minDuration: null,
    maxDuration: null,
    startYear: MIN_YEAR,
    startMonth: 1,
    endYear: MAX_YEAR,
    endMonth: MAX_MONTH,
};

export { MIN_YEAR, MAX_YEAR, MAX_MONTH };

function parseUrlParams(): FilterState {
    const params = new URLSearchParams(window.location.search);
    return {
        search: params.get('q') || '',
        sensors: params.get('sensors') ? params.get('sensors')!.split(',') : [],
        sources: params.get('sources') ? params.get('sources')!.split(',') : [],
        status: (params.get('status') as FilterState['status']) || 'all',
        dataAvailability: (params.get('da') as FilterState['dataAvailability']) || 'all',
        minDuration: params.get('mind') ? parseFloat(params.get('mind')!) : null,
        maxDuration: params.get('maxd') ? parseFloat(params.get('maxd')!) : null,
        startYear: params.get('sy') ? parseInt(params.get('sy')!) : MIN_YEAR,
        startMonth: params.get('sm') ? parseInt(params.get('sm')!) : 1,
        endYear: params.get('ey') ? parseInt(params.get('ey')!) : MAX_YEAR,
        endMonth: params.get('em') ? parseInt(params.get('em')!) : MAX_MONTH,
    };
}

function filtersToParams(filters: FilterState): string {
    const params = new URLSearchParams();
    if (filters.search) params.set('q', filters.search);
    if (filters.sensors.length) params.set('sensors', filters.sensors.join(','));
    if (filters.sources.length) params.set('sources', filters.sources.join(','));
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.dataAvailability !== 'all') params.set('da', filters.dataAvailability);
    if (filters.minDuration !== null) params.set('mind', String(filters.minDuration));
    if (filters.maxDuration !== null) params.set('maxd', String(filters.maxDuration));
    if (filters.startYear !== MIN_YEAR || filters.startMonth !== 1) {
        params.set('sy', String(filters.startYear));
        params.set('sm', String(filters.startMonth));
    }
    if (filters.endYear !== MAX_YEAR || filters.endMonth !== MAX_MONTH) {
        params.set('ey', String(filters.endYear));
        params.set('em', String(filters.endMonth));
    }
    return params.toString();
}

export function useUrlState() {
    const [filters, setFiltersState] = useState<FilterState>(() => parseUrlParams());

    const setFilters = useCallback((newFilters: FilterState | ((prev: FilterState) => FilterState)) => {
        setFiltersState((prev) => {
            const next = typeof newFilters === 'function' ? newFilters(prev) : newFilters;
            const qs = filtersToParams(next);
            const newUrl = qs
                ? `${window.location.pathname}?${qs}`
                : window.location.pathname;
            window.history.replaceState(null, '', newUrl);
            return next;
        });
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
    }, [setFilters]);

    useEffect(() => {
        const handlePop = () => setFiltersState(parseUrlParams());
        window.addEventListener('popstate', handlePop);
        return () => window.removeEventListener('popstate', handlePop);
    }, []);

    return { filters, setFilters, resetFilters };
}
