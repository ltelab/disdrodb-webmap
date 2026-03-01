import { useEffect, useRef } from 'react';
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    useMap,
    useMapEvents,
    LayersControl,
} from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';
import type { Station } from '../types/station';
import 'leaflet/dist/leaflet.css';

interface StationMapProps {
    stations: Station[];
    selectedStation: Station | null;
    onSelectStation: (station: Station) => void;
}

function FitBounds({ stations }: { stations: Station[] }) {
    const map = useMap();
    const prevLengthRef = useRef(stations.length);

    useEffect(() => {
        if (stations.length === 0) {
            map.setView([20, 0], 2);
            prevLengthRef.current = 0;
            return;
        }

        const bounds = L.latLngBounds(
            stations.map((s) => [s.latitude, s.longitude] as [number, number])
        );
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        prevLengthRef.current = stations.length;
    }, [stations, map]);

    return null;
}

function HighlightMarker({
    station,
}: {
    station: Station | null;
}) {
    const map = useMap();

    useEffect(() => {
        if (station) {
            map.setView([station.latitude, station.longitude], Math.max(map.getZoom(), 10), {
                animate: true,
                duration: 0.5,
            });
        }
    }, [station, map]);

    return null;
}

function MarkersList({ stations, selectedStation, onSelectStation }: StationMapProps) {
    const map = useMap();
    const [zoom, setZoom] = useState(map.getZoom());

    useMapEvents({
        zoom() {
            setZoom(map.getZoom());
        }
    });

    const getColor = (station: Station) => {
        if (selectedStation?.id === station.id) return '#f59e0b';
        return station.deployment_status === 'ongoing' ? '#10b981' : '#64748b';
    };

    const getRadius = (station: Station) => {
        // Dynamically scale radius based on zoom level
        const baseRadius = Math.max(2, Math.min(6, zoom * 0.5));
        return selectedStation?.id === station.id ? baseRadius + 3 : baseRadius;
    };

    return (
        <>
            {stations.map((station) => (
                <CircleMarker
                    key={station.id}
                    center={[station.latitude, station.longitude]}
                    radius={getRadius(station)}
                    pathOptions={{
                        color: getColor(station),
                        fillColor: getColor(station),
                        fillOpacity: 0.8,
                        weight: selectedStation?.id === station.id ? 3 : 1.5,
                    }}
                    eventHandlers={{
                        click: () => onSelectStation(station),
                    }}
                >
                    <Popup>
                        <div className="popup-content">
                            <h3>{station.station_name}</h3>
                            <p><strong>Source:</strong> {station.data_source}</p>
                            <p><strong>Campaign:</strong> {station.campaign_name}</p>
                            <p><strong>Sensor:</strong> {station.sensor_name}</p>
                            <p><strong>Location:</strong> {station.location || 'N/A'}{station.country ? `, ${station.country}` : ''}</p>
                            <p><strong>Status:</strong>
                                <span className={`status-badge ${station.deployment_status}`}>
                                    {station.deployment_status}
                                </span>
                            </p>
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
        </>
    );
}

export default function StationMap({
    stations,
    selectedStation,
    onSelectStation,
}: StationMapProps) {
    const [map, setMap] = useState<L.Map | null>(null);

    // Watch for container resizes (like sidebar toggling) and invalidate map size
    // to prevent gray blank space from expanding without re-rendering tiles.
    useEffect(() => {
        if (!map) return;
        const container = map.getContainer();
        if (!container) return;

        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, [map]);

    const resetView = () => {
        if (!map) return;
        if (stations.length === 0) {
            map.setView([20, 0], 2);
            return;
        }
        const bounds = L.latLngBounds(
            stations.map((s) => [s.latitude, s.longitude] as [number, number])
        );
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <MapContainer
                center={[20, 0]}
                zoom={2}
                className="station-map"
                zoomControl={true}
                maxBounds={[[-90, -200], [90, 200]]}
                maxBoundsViscosity={0.8}
                ref={setMap}
            >
                <LayersControl position="topright">
                    <LayersControl.BaseLayer name="OpenStreetMap">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            maxZoom={19}
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="CartoDB Light">
                        <TileLayer
                            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            maxZoom={19}
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer checked name="CartoDB Dark">
                        <TileLayer
                            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            maxZoom={19}
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                <FitBounds stations={stations} />
                <HighlightMarker station={selectedStation} />

                <MarkersList
                    stations={stations}
                    selectedStation={selectedStation}
                    onSelectStation={onSelectStation}
                />
            </MapContainer>

            {/* Custom Reset View Button matching Leaflet's control style */}
            <button
                onClick={resetView}
                title="Reset View to Global Map"
                style={{
                    position: 'absolute',
                    top: '80px', // Just below the default zoom controls (usually top: 10px, height: ~60px)
                    left: '10px',
                    zIndex: 1000,
                    width: '34px',
                    height: '34px',
                    backgroundColor: '#fff',
                    border: '2px solid rgba(0,0,0,0.2)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 5px rgba(0,0,0,0.65)',
                    padding: 0,
                    fontSize: '16px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f4f4f4'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
                🌍
            </button>
        </div>
    );
}
