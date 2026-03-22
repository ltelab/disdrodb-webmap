import { useState, useCallback, useEffect } from 'react';
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
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(() => window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [linksOpen, setLinksOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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
          {/* Desktop links */}
          <a href="https://github.com/ltelab/disdrodb" target="_blank" rel="noopener noreferrer" className="header-link desktop-only">Software</a>
          <a href="https://disdrodb.readthedocs.io/en/latest/" target="_blank" rel="noopener noreferrer" className="header-link desktop-only">Documentation</a>
          <a href="https://github.com/ltelab/DISDRODB-METADATA" target="_blank" rel="noopener noreferrer" className="header-link desktop-only">Metadata Archive</a>

          {/* Mobile links dropdown */}
          <div className="mobile-menu mobile-only">
            <button
              className="mobile-menu-btn"
              onClick={() => setLinksOpen(o => !o)}
              aria-label="Open menu"
            >
              ⋮
            </button>
            {linksOpen && (
              <div className="mobile-menu-dropdown">
                <a href="https://github.com/ltelab/disdrodb" target="_blank" rel="noopener noreferrer" className="mobile-menu-link" onClick={() => setLinksOpen(false)}>Software</a>
                <a href="https://disdrodb.readthedocs.io/en/latest/" target="_blank" rel="noopener noreferrer" className="mobile-menu-link" onClick={() => setLinksOpen(false)}>Documentation</a>
                <a href="https://github.com/ltelab/DISDRODB-METADATA" target="_blank" rel="noopener noreferrer" className="mobile-menu-link" onClick={() => setLinksOpen(false)}>Metadata Archive</a>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="app-body">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          {showDetail && selectedStation && (
            <StationDetail
              station={selectedStation}
              onClose={handleCloseDetail}
              onViewMap={isMobile ? () => setSidebarOpen(false) : undefined}
            />
          )}
          <div
            style={{
              display: (showDetail && selectedStation) ? 'none' : 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0
            }}
          >
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
          </div>
        </aside>

        {/* Map */}
        <main className="map-container">
          <StationMap
            stations={filteredStations}
            selectedStation={selectedStation}
            onSelectStation={handleSelectStation}
            sidebarOpen={sidebarOpen}
          />
        </main>

        {/* Mobile: View Map FAB — hidden when station detail is open */}
        {isMobile && sidebarOpen && !showDetail && (
          <button
            className="view-map-fab"
            onClick={() => setSidebarOpen(false)}
            aria-label="View map"
          >
            🗺 View Map
          </button>
        )}

        {/* Mobile: Reopen Sidebar FAB */}
        {isMobile && !sidebarOpen && (
          <button
            className="reopen-sidebar-fab"
            onClick={() => setSidebarOpen(true)}
            aria-label={showDetail ? "Open station info" : "Open list"}
          >
            {showDetail ? "☰ View Station Info" : "☰ View Stations"}
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
