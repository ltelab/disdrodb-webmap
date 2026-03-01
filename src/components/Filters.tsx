import { useState, useRef, useEffect } from 'react';
import type { FilterState, FilterOptions } from '../types/station';
import { MIN_YEAR, MAX_YEAR, MAX_MONTH, DEFAULT_FILTERS } from '../hooks/useUrlState';

interface FiltersProps {
    filters: FilterState;
    filterOptions: FilterOptions | null;
    onFiltersChange: (filters: FilterState) => void;
    onReset: () => void;
    resultCount: number;
    totalCount: number;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const YEARS = Array.from(
    { length: MAX_YEAR - MIN_YEAR + 1 },
    (_, i) => MIN_YEAR + i
);

function CustomSelect({
    value,
    options,
    onChange,
    className,
    disabledOptions = []
}: {
    value: string | number,
    options: { label: string, value: string | number }[],
    onChange: (val: string | number) => void,
    className?: string,
    disabledOptions?: (string | number)[]
}) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = options.find(o => o.value === value)?.label || value;

    return (
        <div ref={ref} className={`custom-select-container ${className || ''}`} style={{ position: 'relative' }}>
            <button
                type="button"
                className={`time-select ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <span>{selectedLabel}</span>
                <span className={`arrow ${isOpen ? 'open' : ''}`}>▸</span>
            </button>
            {isOpen && (
                <div className="dropdown-panel" style={{ position: 'absolute', top: '100%', left: 0, minWidth: '100%', margin: 0, zIndex: 100 }}>
                    <div className="checkbox-list" style={{ maxHeight: '180px' }}>
                        {options.map((opt) => {
                            const isDisabled = disabledOptions.includes(opt.value);
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`custom-select-item ${opt.value === value ? 'selected' : ''}`}
                                    disabled={isDisabled}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '6px 10px',
                                        background: opt.value === value ? 'var(--bg-hover)' : 'transparent',
                                        border: 'none',
                                        color: isDisabled ? 'var(--text-muted)' : 'var(--text-primary)',
                                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                                        fontSize: '12px',
                                        opacity: isDisabled ? 0.5 : 1,
                                        whiteSpace: 'nowrap'
                                    }}
                                    onClick={() => {
                                        if (!isDisabled) {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                        }
                                    }}
                                    onMouseOver={(e) => {
                                        if (!isDisabled && opt.value !== value) {
                                            e.currentTarget.style.background = 'var(--bg-hover)';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (opt.value !== value) {
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Filters({
    filters,
    filterOptions,
    onFiltersChange,
    onReset,
    resultCount,
    totalCount,
    isExpanded,
    onToggleExpand,
}: FiltersProps) {
    const [sensorOpen, setSensorOpen] = useState(false);
    const [sourceOpen, setSourceOpen] = useState(false);

    const hasActiveFilters =
        filters.search ||
        filters.sensors.length > 0 ||
        filters.sources.length > 0 ||
        filters.status !== 'all' ||
        filters.dataAvailability !== 'all' ||
        filters.minDuration !== null ||
        filters.maxDuration !== null ||
        filters.startYear !== DEFAULT_FILTERS.startYear ||
        filters.startMonth !== DEFAULT_FILTERS.startMonth ||
        filters.endYear !== DEFAULT_FILTERS.endYear ||
        filters.endMonth !== DEFAULT_FILTERS.endMonth;

    const toggleArrayFilter = (
        key: 'sensors' | 'sources',
        value: string
    ) => {
        const current = filters[key];
        const next = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
        onFiltersChange({ ...filters, [key]: next });
    };

    // Compute the visual bar position (percentage)
    const totalMonths = (MAX_YEAR - MIN_YEAR + 1) * 12;
    const startPos = ((filters.startYear - MIN_YEAR) * 12 + (filters.startMonth - 1)) / totalMonths * 100;
    const endPos = ((filters.endYear - MIN_YEAR) * 12 + filters.endMonth) / totalMonths * 100;

    return (
        <div className="filters">
            <button
                className="filters-header"
                onClick={onToggleExpand}
                style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`arrow ${isExpanded ? 'open' : ''}`} style={{ color: 'var(--text-muted)' }}>▸</span>
                    <h2>Filters</h2>
                </div>
                <span className="result-count">
                    {resultCount} / {totalCount} stations
                </span>
            </button>

            {isExpanded && (
                <div className="filters-content" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {hasActiveFilters && (
                        <button className="reset-btn" onClick={onReset}>
                            ✕ Clear all filters
                        </button>
                    )}

                    {/* Active filter chips */}
                    {hasActiveFilters && (
                        <div className="filter-chips">
                            {filters.search && (
                                <span className="chip">
                                    Search: "{filters.search}"
                                    <button onClick={() => onFiltersChange({ ...filters, search: '' })}>×</button>
                                </span>
                            )}
                            {filters.status !== 'all' && (
                                <span className={`chip ${filters.status === 'ongoing' ? 'status-ongoing-chip' : 'status-terminated-chip'}`}>
                                    {filters.status}
                                    <button onClick={() => onFiltersChange({ ...filters, status: 'all' })}>×</button>
                                </span>
                            )}
                            {filters.dataAvailability !== 'all' && (
                                <span className={`chip ${filters.dataAvailability === 'public' ? 'status-ongoing-chip' : 'status-offline-chip'}`}>
                                    {filters.dataAvailability}
                                    <button onClick={() => onFiltersChange({ ...filters, dataAvailability: 'all' })}>×</button>
                                </span>
                            )}
                            {filters.minDuration !== null && (
                                <span className="chip">
                                    {`≥ ${filters.minDuration}y`}
                                    <button onClick={() => onFiltersChange({ ...filters, minDuration: null })}>×</button>
                                </span>
                            )}
                            {filters.maxDuration !== null && (
                                <span className="chip">
                                    {`≤ ${filters.maxDuration}y`}
                                    <button onClick={() => onFiltersChange({ ...filters, maxDuration: null })}>×</button>
                                </span>
                            )}
                            {filters.sensors.map((s) => (
                                <span key={s} className="chip">
                                    {s}
                                    <button onClick={() => toggleArrayFilter('sensors', s)}>×</button>
                                </span>
                            ))}
                            {filters.sources.map((s) => (
                                <span key={s} className="chip source-chip">
                                    {s}
                                    <button onClick={() => toggleArrayFilter('sources', s)}>×</button>
                                </span>
                            ))}
                            {(filters.startYear !== DEFAULT_FILTERS.startYear || filters.startMonth !== DEFAULT_FILTERS.startMonth ||
                                filters.endYear !== DEFAULT_FILTERS.endYear || filters.endMonth !== DEFAULT_FILTERS.endMonth) && (
                                    <span className="chip">
                                        {MONTHS[filters.startMonth - 1]} {filters.startYear} – {MONTHS[filters.endMonth - 1]} {filters.endYear}
                                        <button onClick={() => onFiltersChange({
                                            ...filters,
                                            startYear: DEFAULT_FILTERS.startYear,
                                            startMonth: DEFAULT_FILTERS.startMonth,
                                            endYear: DEFAULT_FILTERS.endYear,
                                            endMonth: DEFAULT_FILTERS.endMonth,
                                        })}>×</button>
                                    </span>
                                )}
                        </div>
                    )}

                    {/* Search */}
                    <div className="filter-group">
                        <label htmlFor="search-input">Search</label>
                        <input
                            id="search-input"
                            type="text"
                            placeholder="Station, location, campaign..."
                            value={filters.search}
                            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                            className="filter-input"
                        />
                    </div>

                    {/* Deployment Status Toggle */}
                    <div className="filter-group">
                        <label>Deployment Status</label>
                        <div className="status-toggles">
                            {(['all', 'ongoing', 'terminated'] as const).map((s) => (
                                <button
                                    key={s}
                                    className={`status-toggle ${filters.status === s ? 'active' : ''} ${s}`}
                                    onClick={() => onFiltersChange({ ...filters, status: s })}
                                >
                                    {s === 'all' && '🌐 '}
                                    {s === 'ongoing' && '🟢 '}
                                    {s === 'terminated' && '⚫ '}
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Data Availability Toggle */}
                    <div className="filter-group">
                        <label>Data Availability</label>
                        <div className="status-toggles">
                            {(['all', 'public', 'offline'] as const).map((a) => (
                                <button
                                    key={a}
                                    className={`status-toggle ${filters.dataAvailability === a ? 'active' : ''} ${a === 'public' ? 'ongoing' : a === 'offline' ? 'offline' : 'all'}`}
                                    onClick={() => onFiltersChange({ ...filters, dataAvailability: a })}
                                >
                                    {a === 'all' && '🌐 '}
                                    {a === 'public' && '🌍 '}
                                    {a === 'offline' && '⛔ '}
                                    {a.charAt(0).toUpperCase() + a.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Period Range Bar */}
                    <div className="filter-group">
                        <label>Time Period</label>
                        <div className="time-range-bar">
                            <div className="time-range-track">
                                <div
                                    className="time-range-fill"
                                    style={{ left: `${startPos}%`, width: `${endPos - startPos}%` }}
                                />
                            </div>
                            <div className="time-range-labels">
                                <span>{MIN_YEAR}</span>
                                <span>{MAX_YEAR}</span>
                            </div>
                        </div>
                        <div className="time-range-selectors">
                            <div className="time-selector">
                                <span className="time-selector-label">From</span>
                                <CustomSelect
                                    value={filters.startMonth}
                                    onChange={(val) => onFiltersChange({ ...filters, startMonth: Number(val) })}
                                    className="month-select"
                                    options={MONTHS.map((m, i) => ({ label: m, value: i + 1 }))}
                                    disabledOptions={filters.startYear === MAX_YEAR ? Array.from({ length: 12 - MAX_MONTH }, (_, i) => MAX_MONTH + i + 1) : []}
                                />
                                <CustomSelect
                                    value={filters.startYear}
                                    onChange={(val) => {
                                        const newYear = Number(val);
                                        const newFilters = { ...filters, startYear: newYear };

                                        // Reset month if it exceeds the new year's max month
                                        if (newYear === MAX_YEAR && newFilters.startMonth > MAX_MONTH) {
                                            newFilters.startMonth = MAX_MONTH;
                                        }

                                        // Ensure start doesn't exceed end
                                        if (newYear > filters.endYear || (newYear === filters.endYear && newFilters.startMonth > filters.endMonth)) {
                                            newFilters.endYear = newYear;
                                            newFilters.endMonth = newFilters.startMonth;
                                        }
                                        onFiltersChange(newFilters);
                                    }}
                                    className="year-select"
                                    options={YEARS.map((y) => ({ label: String(y), value: y }))}
                                />
                            </div>
                            <div className="time-selector">
                                <span className="time-selector-label">To</span>
                                <CustomSelect
                                    value={filters.endMonth}
                                    onChange={(val) => onFiltersChange({ ...filters, endMonth: Number(val) })}
                                    className="month-select"
                                    options={MONTHS.map((m, i) => ({ label: m, value: i + 1 }))}
                                    disabledOptions={filters.endYear === MAX_YEAR ? Array.from({ length: 12 - MAX_MONTH }, (_, i) => MAX_MONTH + i + 1) : []}
                                />
                                <CustomSelect
                                    value={filters.endYear}
                                    onChange={(val) => {
                                        const newYear = Number(val);
                                        const newFilters = { ...filters, endYear: newYear };

                                        // Reset month if it exceeds the new year's max month
                                        if (newYear === MAX_YEAR && newFilters.endMonth > MAX_MONTH) {
                                            newFilters.endMonth = MAX_MONTH;
                                        }

                                        // Ensure end is not before start
                                        if (newYear < filters.startYear || (newYear === filters.startYear && newFilters.endMonth < filters.startMonth)) {
                                            newFilters.startYear = newYear;
                                            newFilters.startMonth = newFilters.endMonth;
                                        }
                                        onFiltersChange(newFilters);
                                    }}
                                    className="year-select"
                                    options={YEARS.map((y) => ({ label: String(y), value: y }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Duration Range */}
                    <div className="filter-group duration-range-group">
                        <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span>Data Record Duration</span>
                            <span style={{ fontWeight: 'normal', color: 'var(--accent-light)' }}>
                                {filters.minDuration === null && filters.maxDuration === null
                                    ? 'Any'
                                    : `${filters.minDuration !== null ? filters.minDuration : 0}y – ${filters.maxDuration !== null ? filters.maxDuration : (filterOptions?.max_duration || 50)}y`}
                            </span>
                        </label>

                        <div
                            style={{ position: 'relative', height: '24px', display: 'flex', alignItems: 'center' }}
                            onDoubleClick={() => onFiltersChange({ ...filters, minDuration: null, maxDuration: null })}
                            title="Double-click to reset duration filter"
                        >
                            {/* Background track */}
                            <div style={{ position: 'absolute', width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '3px', border: '1px solid var(--border)' }} />

                            {/* Highlighted active track */}
                            <div
                                onPointerDown={(e) => {
                                    const maxLimit = filterOptions?.max_duration || 50;
                                    const container = e.currentTarget.parentElement;
                                    if (!container) return;
                                    const rect = container.getBoundingClientRect();

                                    const currentMin = filters.minDuration !== null ? filters.minDuration : 0;
                                    const currentMax = filters.maxDuration !== null ? filters.maxDuration : maxLimit;
                                    if (currentMin === 0 && currentMax === maxLimit) return;

                                    const startX = e.clientX;
                                    const startMin = currentMin;
                                    const startMax = currentMax;
                                    const span = startMax - startMin;

                                    const handlePointerMove = (moveEvent: PointerEvent) => {
                                        const dx = moveEvent.clientX - startX;
                                        const deltaVal = (dx / rect.width) * maxLimit;

                                        let newMin = startMin + deltaVal;
                                        let newMax = startMax + deltaVal;

                                        if (newMin < 0) {
                                            newMin = 0;
                                            newMax = span;
                                        }
                                        if (newMax > maxLimit) {
                                            newMax = maxLimit;
                                            newMin = maxLimit - span;
                                        }

                                        newMin = Math.round(newMin * 2) / 2;
                                        newMax = Math.round(newMax * 2) / 2;

                                        onFiltersChange({
                                            ...filters,
                                            minDuration: newMin <= 0 ? null : newMin,
                                            maxDuration: newMax >= maxLimit ? null : newMax
                                        });
                                    };

                                    const handlePointerUp = () => {
                                        document.removeEventListener('pointermove', handlePointerMove);
                                        document.removeEventListener('pointerup', handlePointerUp);
                                    };

                                    document.addEventListener('pointermove', handlePointerMove);
                                    document.addEventListener('pointerup', handlePointerUp);
                                }}
                                style={{
                                    position: 'absolute',
                                    height: '6px',
                                    background: 'var(--green)',
                                    boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)',
                                    borderRadius: '3px',
                                    cursor: (filters.minDuration !== null || filters.maxDuration !== null) ? 'grab' : 'default',
                                    left: `${((filters.minDuration !== null ? filters.minDuration : 0) / (filterOptions?.max_duration || 50)) * 100}%`,
                                    right: `${100 - ((filters.maxDuration !== null ? filters.maxDuration : (filterOptions?.max_duration || 50)) / (filterOptions?.max_duration || 50)) * 100}%`
                                }}
                            />

                            {/* Min slider */}
                            <input
                                type="range"
                                min="0"
                                max={filterOptions?.max_duration || 50}
                                step="0.5"
                                value={filters.minDuration !== null ? filters.minDuration : 0}
                                onChange={(e) => {
                                    const maxLimit = filterOptions?.max_duration || 50;
                                    let val = parseFloat(e.target.value);
                                    const currentMax = filters.maxDuration !== null ? filters.maxDuration : maxLimit;
                                    if (val > currentMax) val = currentMax;
                                    onFiltersChange({ ...filters, minDuration: val === 0 ? null : val });
                                }}
                                className="dual-range-slider"
                                style={{ zIndex: (filters.minDuration !== null ? filters.minDuration : 0) > (filterOptions?.max_duration || 50) / 2 ? 5 : 3 }}
                            />

                            {/* Max slider */}
                            <input
                                type="range"
                                min="0"
                                max={filterOptions?.max_duration || 50}
                                step="0.5"
                                value={filters.maxDuration !== null ? filters.maxDuration : (filterOptions?.max_duration || 50)}
                                onChange={(e) => {
                                    const maxLimit = filterOptions?.max_duration || 50;
                                    let val = parseFloat(e.target.value);
                                    const currentMin = filters.minDuration !== null ? filters.minDuration : 0;
                                    if (val < currentMin) val = currentMin;
                                    onFiltersChange({ ...filters, maxDuration: val === maxLimit ? null : val });
                                }}
                                className="dual-range-slider"
                                style={{ zIndex: (filters.maxDuration !== null ? filters.maxDuration : (filterOptions?.max_duration || 50)) <= (filterOptions?.max_duration || 50) / 2 ? 5 : 4 }}
                            />
                        </div>
                        <div className="time-range-labels" style={{ marginTop: '0' }}>
                            <span>0y</span>
                            <span>{filterOptions?.max_duration || 50}y</span>
                        </div>
                    </div>

                    {/* Sensor Type */}
                    <div className="filter-group">
                        <label>Sensor Type</label>
                        <button
                            className={`dropdown-toggle ${sensorOpen ? 'open' : ''}`}
                            onClick={() => setSensorOpen(!sensorOpen)}
                        >
                            <span>
                                {filters.sensors.length === 0
                                    ? 'All Sensors'
                                    : `${filters.sensors.length} selected`}
                            </span>
                            <span className={`arrow ${sensorOpen ? 'open' : ''}`}>▸</span>
                        </button>
                        {sensorOpen && (
                            <div className="dropdown-panel">
                                <div className="checkbox-list two-column">
                                    {filterOptions?.sensor_names.map((sensor) => (
                                        <label key={sensor} className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={filters.sensors.includes(sensor)}
                                                onChange={() => toggleArrayFilter('sensors', sensor)}
                                            />
                                            <span>{sensor}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Data Source */}
                    <div className="filter-group">
                        <label>Data Source</label>
                        <button
                            className={`dropdown-toggle ${sourceOpen ? 'open' : ''}`}
                            onClick={() => setSourceOpen(!sourceOpen)}
                        >
                            <span>
                                {filters.sources.length === 0
                                    ? 'All Sources'
                                    : `${filters.sources.length} selected`}
                            </span>
                            <span className={`arrow ${sourceOpen ? 'open' : ''}`}>▸</span>
                        </button>
                        {sourceOpen && (
                            <div className="dropdown-panel">
                                <div className="checkbox-list two-column">
                                    {filterOptions?.data_sources.map((source) => (
                                        <label key={source} className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={filters.sources.includes(source)}
                                                onChange={() => toggleArrayFilter('sources', source)}
                                            />
                                            <span>{source}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
