import type { Station } from '../types/station';

interface StationListProps {
    stations: Station[];
    selectedStation: Station | null;
    onSelectStation: (station: Station) => void;
}

export default function StationList({
    stations,
    selectedStation,
    onSelectStation,
}: StationListProps) {
    return (
        <div className="station-list">
            <div className="station-list-header">
                <h3>{stations.length} stations</h3>
            </div>
            <div className="station-list-items">
                {stations.length === 0 && (
                    <div className="empty-state">
                        <p>No stations match your filters.</p>
                        <p className="empty-hint">Try adjusting your search criteria.</p>
                    </div>
                )}
                {stations.map((station) => (
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
                                <span className="location-tag">{station.location}</span>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
