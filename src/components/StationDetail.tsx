import type { Station } from '../types/station';

interface StationDetailProps {
    station: Station;
    onClose: () => void;
    onViewMap?: () => void;
}

function formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

function timeCoverageString(start: string, endStr: string, isOngoing: boolean): string {
    if (!start) return '';
    try {
        const s = new Date(start);

        let e = new Date(endStr);
        if (isOngoing || !endStr) {
            e = new Date();
        }

        const diffMs = e.getTime() - s.getTime();
        if (diffMs < 0) return ''; // Invalid range

        const hours = diffMs / (1000 * 60 * 60);
        const days = hours / 24;
        const years = days / 365.25;
        const months = days / 30.4375;

        if (years >= 1) {
            return `${years.toFixed(1)} years`;
        } else if (months >= 1) {
            return `${months.toFixed(1)} months`;
        } else if (days >= 1) {
            return `${days.toFixed(1)} days`;
        } else if (hours >= 1) {
            return `${hours.toFixed(1)} hours`;
        } else {
            return `< 1 hour`;
        }
    } catch {
        return '';
    }
}

export default function StationDetail({ station, onClose, onViewMap }: StationDetailProps) {
    return (
        <div className="station-detail">
            <div className="detail-header">
                <button className="back-btn" onClick={onClose}>
                    ← Back to stations
                </button>
            </div>

            <div className="detail-content">
                <h2 className="detail-title">{station.station_name}</h2>
                <div className="detail-subtitle">
                    {station.data_source} / {station.campaign_name}
                    {station.project_name && ` / ${station.project_name}`}
                </div>

                <div className={`detail-status ${station.deployment_status}`}>
                    <span className="status-indicator" />
                    {station.deployment_status}
                </div>

                {station.title && (
                    <section className="detail-section">
                        <h4>Title</h4>
                        <p>{station.title}</p>
                    </section>
                )}

                {/* Location */}
                <section className="detail-section">
                    <h4>Location</h4>
                    <dl className="detail-grid">
                        {station.location && (
                            <>
                                <dt>Place</dt>
                                <dd>{station.location}</dd>
                            </>
                        )}
                        {station.country && (
                            <>
                                <dt>Country</dt>
                                <dd>{station.country}</dd>
                            </>
                        )}
                        {station.continent && (
                            <>
                                <dt>Continent</dt>
                                <dd>{station.continent}</dd>
                            </>
                        )}
                        <dt>Coordinates</dt>
                        <dd>
                            {station.latitude.toFixed(4)}°, {station.longitude.toFixed(4)}°
                        </dd>
                        {station.altitude !== null && (
                            <>
                                <dt>Altitude</dt>
                                <dd>{station.altitude} m</dd>
                            </>
                        )}
                    </dl>
                </section>

                {/* Time Coverage */}
                <section className="detail-section">
                    <h4>Time Coverage</h4>
                    <dl className="detail-grid">
                        <dt>Start</dt>
                        <dd>{formatDate(station.time_coverage_start)}</dd>
                        {station.time_coverage_end && station.time_coverage_end !== station.time_coverage_start && (
                            <>
                                <dt>End</dt>
                                <dd>
                                    {station.deployment_status === 'ongoing'
                                        ? formatDate(new Date().toISOString())
                                        : formatDate(station.time_coverage_end)}
                                </dd>
                                {station.time_coverage_start && (
                                    <>
                                        <dt>Duration</dt>
                                        <dd>{timeCoverageString(station.time_coverage_start, station.time_coverage_end, station.deployment_status === 'ongoing')}</dd>
                                    </>
                                )}
                            </>
                        )}
                    </dl>
                </section>

                {/* Sensor */}
                <section className="detail-section">
                    <h4>Sensor</h4>
                    <dl className="detail-grid">
                        <dt>Type</dt>
                        <dd>{station.sensor_name}</dd>
                        {station.sensor_long_name && (
                            <>
                                <dt>Full Name</dt>
                                <dd>{station.sensor_long_name}</dd>
                            </>
                        )}
                    </dl>
                </section>

                {/* Contact */}
                {(station.authors || station.contact || station.institution) && (
                    <section className="detail-section">
                        <h4>Contact & Attribution</h4>
                        <dl className="detail-grid">
                            {station.institution && (
                                <>
                                    <dt>Institution</dt>
                                    <dd>{station.institution}</dd>
                                </>
                            )}
                            {station.authors && (
                                <>
                                    <dt>Authors</dt>
                                    <dd>{station.authors}</dd>
                                </>
                            )}
                            {station.contact && (
                                <>
                                    <dt>Contact</dt>
                                    <dd>{station.contact}</dd>
                                </>
                            )}
                        </dl>
                    </section>
                )}

                {/* Metadata */}
                {(station.doi || station.license || station.references || station.documentation) && (
                    <section className="detail-section">
                        <h4>Metadata</h4>
                        <dl className="detail-grid">
                            {station.doi && (
                                <>
                                    <dt>DOI</dt>
                                    <dd>
                                        <a
                                            href={`https://doi.org/${station.doi}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="doi-link"
                                        >
                                            {station.doi}
                                        </a>
                                    </dd>
                                </>
                            )}
                            {station.license && (
                                <>
                                    <dt>License</dt>
                                    <dd>{station.license}</dd>
                                </>
                            )}
                            {station.documentation && (
                                <>
                                    <dt>Documentation</dt>
                                    <dd>
                                        <a href={station.documentation} target="_blank" rel="noopener noreferrer">
                                            View Documentation
                                        </a>
                                    </dd>
                                </>
                            )}
                            {station.references && (
                                <>
                                    <dt>References</dt>
                                    <dd className="references-text">{station.references}</dd>
                                </>
                            )}
                        </dl>
                    </section>
                )}

                {/* Links */}
                <section className="detail-section">
                    <h4>Links</h4>
                    <div className="detail-links">
                        {station.github_url && (
                            <a
                                href={station.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="detail-link github-link"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                                </svg>
                                View full metadata on GitHub
                            </a>
                        )}
                        {station.website && (
                            <a
                                href={station.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="detail-link website-link"
                            >
                                🌐 Station Website
                            </a>
                        )}
                        {station.disdrodb_data_url && (
                            <a
                                href={station.disdrodb_data_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="detail-link data-link"
                            >
                                📥 Download Data
                            </a>
                        )}
                    </div>
                </section>

                <div className="detail-footer">
                    <button className="back-btn-large" onClick={onClose}>
                        ← Back to stations
                    </button>
                    {onViewMap && (
                        <button className="back-btn-large view-map-detail-btn" onClick={onViewMap}>
                            🗺 View Map
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
