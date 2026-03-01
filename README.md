# DISDRODB Web Map

This directory contains the React + TypeScript + Vite application that powers the DISDRODB interactive station map.

The app renders a searchable, filterable Leaflet map of disdrometer stations. 
The expected station data JSON files are automatically pushed into `public/data/` by an external GitHub Action from the upstream metadata repository.

## Purpose

The web map is the browser interface for exploring the DISDRODB metadata archive. It lets users:

- browse all indexed stations on an interactive world map
- filter stations by text, deployment status, data availability, duration, time period, sensor type, and data source
- inspect station metadata in a detail panel
- open the source metadata file on GitHub
- follow data download links when public DISDRODB data is available

## Tech Stack

- React 19
- TypeScript
- Vite
- Leaflet
- React Leaflet

## App Structure

### Entry points

- `src/main.tsx`: React bootstrap
- `src/App.tsx`: top-level layout and state orchestration
- `vite.config.ts`: Vite configuration, including the GitHub Pages base path

### Main UI components

- `src/components/StationMap.tsx`: Leaflet map, base layers, fit-to-bounds behavior, marker styling, and reset-view control
- `src/components/Filters.tsx`: sidebar filters and active-filter chips
- `src/components/StationList.tsx`: filtered station result list
- `src/components/StationDetail.tsx`: detail panel with location, time coverage, sensor, attribution, and links

### Hooks and types

- `src/hooks/useStations.ts`: fetches generated JSON and applies client-side filtering
- `src/hooks/useUrlState.ts`: synchronizes filter state with URL query parameters
- `src/types/station.ts`: shared TypeScript interfaces for stations, filter options, and filter state

### Data assets

Data is automatically generated via a separate pipeline and injected into this repository via a GitHub Action logic. The app expects the following structure:
- `public/data/stations.json`: generated station records consumed by the app
- `public/data/filter-options.json`: generated filter option values

## Local Development & Testing

To test the application locally in development mode, run the following commands from this repository root.

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

Start local hot module replacement by running:

```bash
npm run dev
```

The terminal will print out a URL (by default `http://localhost:5173/disdrodb-webmap/`). Open this URL in your web browser. Any changes you make to the code (e.g. `src/` files) will seamlessly update the live-rendering in your browser automatically—no manual page refresh required!

## Deployment Notes

- The Vite base path is configured for GitHub Pages hosting under `/disdrodb-webmap/`.
- GitHub Actions automatically manage the build and deployment logic inside `.github/workflows/GenerateMap.yml`. Every time code is pushed to the `main` branch, the workflow automatically provisions the build and hosts it on GitHub Pages.
- Generated production assets are emitted to `dist/`.

## Filter Implementation Details

Filtering is processed entirely client-side. The filters persist in the URL query string allowing link-sharing of active filter configurations. Supported filters include:

- free-text search (scans station name, location, campaign, country, sensor name, etc.)
- deployment status: `all`, `ongoing`, `terminated`
- data availability: `all`, `public`, `offline`
- data source and sensor type multiselect checkboxes
