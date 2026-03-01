import { useState, useCallback } from 'react';
import StationMap from './components/StationMap';
import Filters from './components/Filters';
import StationList from './components/StationList';
import StationDetail from './components/StationDetail';
import { useStations, useFilteredStations, useDebounce } from './hooks/useStations';
import { useUrlState } from './hooks/useUrlState';
import type { Station } from './types/station';
import './App.css';

function App() {
  const { stations, filterOptions, loading, error } = useStations();
  const { filters, setFilters, resetFilters } = useUrlState();
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  const debouncedFilters = useDebounce(filters, 200);
  const filteredStations = useFilteredStations(stations, debouncedFilters);

  const handleSelectStation = useCallback((station: Station) => {
    setSelectedStation(station);
    setShowDetail(true);
    if (window.innerWidth < 768) {
      setSidebarOpen(true);
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false);
    setSelectedStation(null);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading DISDRODB stations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>Failed to load station data</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <span className={`hamburger ${sidebarOpen ? 'open' : ''}`}>
              <span /><span /><span />
            </span>
          </button>
          <h1 className="app-title">
            <span className="title-icon">🌧️</span>
            DISDRODB Stations
          </h1>
        </div>
        <div className="header-right">
          <a
            href="https://github.com/ltelab/disdrodb"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link"
          >
            Software
          </a>
          <a
            href="https://disdrodb.readthedocs.io/en/latest/"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link"
          >
            Documentation
          </a>
          <a
            href="https://github.com/ltelab/DISDRODB-METADATA"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link"
          >
            Metadata Archive
          </a>
        </div>
      </header>

      <div className="app-body">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          {showDetail && selectedStation ? (
            <StationDetail
              station={selectedStation}
              onClose={handleCloseDetail}
            />
          ) : (
            <>
              <Filters
                filters={filters}
                filterOptions={filterOptions}
                onFiltersChange={setFilters}
                onReset={resetFilters}
                resultCount={filteredStations.length}
                totalCount={stations.length}
                isExpanded={isFiltersExpanded}
                onToggleExpand={() => setIsFiltersExpanded(!isFiltersExpanded)}
              />
              <StationList
                stations={filteredStations}
                selectedStation={selectedStation}
                onSelectStation={handleSelectStation}
              />
            </>
          )}
        </aside>

        {/* Map */}
        <main className="map-container">
          <StationMap
            stations={filteredStations}
            selectedStation={selectedStation}
            onSelectStation={handleSelectStation}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
