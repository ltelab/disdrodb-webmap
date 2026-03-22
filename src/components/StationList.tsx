import { useState, useMemo, useRef, useEffect } from 'react';
import type { Station } from '../types/station';

interface StationListProps {
    stations: Station[];
    selectedStation: Station | null;
    onSelectStation: (station: Station) => void;
}

type SortOption = 'duration' | 'data_source' | 'campaign_name' | 'station_name' | 'start_time';

function getStationDuration(s: Station): number {
    if (!s.time_coverage_start) return 0;
    const start = new Date(s.time_coverage_start).getTime();
    if (isNaN(start)) return 0;

    let end: number;
    if (s.deployment_status === 'ongoing') {
        end = Date.now();
    } else {
        if (!s.time_coverage_end) return 0;
        end = new Date(s.time_coverage_end).getTime();
        if (isNaN(end)) return 0;
    }

    if (end < start) return 0;
    return (end - start) / (1000 * 60 * 60 * 24 * 365.25);
}

function formatDuration(years: number): string {
    if (years === 0) return 'Unknown duration';
    if (years < 1) {
        const months = Math.max(1, Math.round(years * 12));
        return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${years.toFixed(1)} years`;
}

function formatLocation(location: string): string {
    if (!location) return '';

    // Drop text inside parentheses or brackets
    let loc = location.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s*\[[^\]]*\]\s*/g, ' ').trim();

    const MAX_LENGTH = 20;

    if (loc.length > MAX_LENGTH) {
        const parts = loc.split(',').map(p => p.trim());
        let result = parts[0];

        for (let i = 1; i < parts.length; i++) {
            if (result.length + parts[i].length + 2 <= MAX_LENGTH) {
                result += ', ' + parts[i];
            } else {
                break;
            }
        }

        // If there are no commas and the location is just one long string, we have to hard truncate
        if (parts.length === 1 && result.length > MAX_LENGTH) {
            loc = result.substring(0, MAX_LENGTH) + '...';
        } else {
            // Otherwise, keep the assembled parts (which includes at least the first comma part)
            loc = (result.length < loc.length) ? result + '...' : result;
        }
    }

    // Convert to title case if the string is all uppercase
    const isAllUpperCase = loc === loc.toUpperCase() && /[A-Z]/.test(loc);
    if (isAllUpperCase) {
        loc = loc.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    }

    return loc;
}

export default function StationList({
    stations,
    selectedStation,
    onSelectStation,
}: StationListProps) {
    const [sortBy, setSortBy] = useState<SortOption>('duration');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Reset scroll position when stations list changes
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [stations]);

    const sortedStations = useMemo(() => {
        return [...stations].sort((a, b) => {
            if (sortBy === 'duration') {
                const durA = getStationDuration(a);
                const durB = getStationDuration(b);
                if (durA === 0 && durB !== 0) return 1;
                if (durA !== 0 && durB === 0) return -1;
                return durB - durA;
            }
            if (sortBy === 'data_source') {
                return a.data_source.localeCompare(b.data_source);
            }
            if (sortBy === 'campaign_name') {
                return a.campaign_name.localeCompare(b.campaign_name);
            }
            if (sortBy === 'station_name') {
                return a.station_name.localeCompare(b.station_name);
            }
            if (sortBy === 'start_time') {
                const tA = a.time_coverage_start ? new Date(a.time_coverage_start).getTime() : NaN;
                const tB = b.time_coverage_start ? new Date(b.time_coverage_start).getTime() : NaN;

                const validA = !isNaN(tA);
                const validB = !isNaN(tB);

                if (!validA && validB) return 1;
                if (validA && !validB) return -1;
                if (!validA && !validB) return 0;

                return tA - tB;
            }
            return 0;
        });
    }, [stations, sortBy]);

    return (
        <div className="station-list">
            <div className="station-list-header">
                <h3>{stations.length} stations</h3>
                <div className="sort-control">
                    <label htmlFor="sort-select">Sort by:</label>
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="sort-select"
                    >
                        <option value="duration">Duration</option>
                        <option value="data_source">Data Source</option>
                        <option value="campaign_name">Campaign</option>
                        <option value="station_name">Station Name</option>
                        <option value="start_time">Start Time</option>
                    </select>
                </div>
            </div>
            <div className="station-list-items" ref={scrollRef}>
                {sortedStations.length === 0 && (
                    <div className="empty-state">
                        <p>No stations match your filters.</p>
                        <p className="empty-hint">Try adjusting your search criteria.</p>
                    </div>
                )}
                {sortedStations.map((station) => (
                    <button
                        key={station.id}
                        className={`station-item ${selectedStation?.id === station.id ? 'selected' : ''
                            }`}
                        onClick={() => onSelectStation(station)}
                    >
                        <div className="station-item-header">
                            <span className="station-item-name">{station.station_name}</span>
                            <span
                                className={`status-dot ${station.deployment_status}`}
                                title={station.deployment_status}
                            />
                        </div>
                        <div className="station-item-meta">
                            <span>{station.data_source} / {station.campaign_name}</span>
                        </div>
                        <div className="station-item-details">
                            <span className="sensor-tag">{station.sensor_name}</span>
                            {station.location && (
                                <span className="location-tag">{formatLocation(station.location)}</span>
                            )}
                            <span className="duration-tag">{formatDuration(getStationDuration(station))}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
