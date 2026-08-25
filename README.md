# Australian River Conditions

An interactive national map of Australian river flow, river level, and major storage conditions. The application uses official Bureau of Meteorology observations and clearly marks missing coverage instead of inventing values.

## Data sources

| Feature | Source | How it is used |
| --- | --- | --- |
| River discharge and level | [BoM Water Data Online](https://www.bom.gov.au/waterdata/) | Current and historical station observations |
| Storage volume | [BoM Water Data Online](https://www.bom.gov.au/waterdata/) | Observed volume and 7/30-day change |
| Gauge names, locations, and station links | [Australian Hydrological Geospatial Fabric V3.3](https://hosting.wsapi.cloud.bom.gov.au/arcgis/rest/services/ahgf/Geofabric_V3x_All_Products/FeatureServer) | Matching curated river display lines to official gauges |
| River display lines | Curated in `src/data/rivers.ts` | Simplified visual context only; not authoritative reach geometry |

Flow condition is the observation's percentile within a 15-day seasonal window across the previous 10 years. Discharge from Water Data Online is converted from m³/s to ML/day using `1 m³/s = 86.4 ML/day`.

The application does not infer flood status. Use [official BoM warnings](https://www.bom.gov.au/australia/warnings/) for safety decisions.

## Architecture

- React, TypeScript, Vite, Tailwind CSS, and MapLibre GL for the client.
- A small Node HTTP server proxies the upstream public services, caches responses, and keeps data-source logic out of the browser.
- Vite exposes the same API middleware during local development.
- Upstream station mappings are cached for six hours; current snapshots are cached for 15 minutes.

API routes:

- `GET /api/health`
- `GET /api/conditions?date=YYYY-MM-DD`
- `GET /api/rivers/:riverId?date=YYYY-MM-DD`

## Run locally

Requires Node.js 22 or later.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

To run the production build:

```bash
npm run build
npm start
```

The production server listens on `PORT` (default `3000`). Optional environment variables:

| Variable | Default | Purpose |
| --- | ---: | --- |
| `BASELINE_YEARS` | `10` | Seasonal baseline length; clamped to 3–30 years |
| `UPSTREAM_TIMEOUT_MS` | `45000` | Timeout for each BoM request |
| `PORT` | `3000` | Production HTTP port |

## Verification

```bash
npm test
npm run lint
```

The GitHub Actions workflow runs both commands on every push and pull request.

## Important limitations

- Coverage is limited to stations published through Water Data Online and a deterministic name/location match to the curated display network.
- A river line represents a named river, not the exact reach controlled by a gauge.
- Storage percentage uses the reference full-supply capacity in `src/data/dams.ts`; confirm those capacity records before using percentages analytically.
- Quality codes are shown but not interpreted by the application.
- This is an information display, not an emergency-warning or operational decision system.

## Attribution

Water observations and Geofabric records are sourced from the Australian Bureau of Meteorology. Review the [BoM copyright notice](https://www.bom.gov.au/other/copyright.shtml) and the source metadata before redistributing data or using the application commercially.
