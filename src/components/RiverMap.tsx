import { useCallback, useEffect, useRef } from "react";
import { GeoJSONSource, Map as MLMap, Marker, NavigationControl } from "maplibre-gl";
import type { MapLayerMouseEvent } from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";
import { RIVERS, LABEL_RIVERS, type River } from "@/data/rivers";
import { AUSTRALIA_OUTLINE, TASMANIA_OUTLINE, LAKE_EYRE, LAKE_TORRENS } from "@/data/geography";
import { DAMS } from "@/data/dams";
import { CONDITION_META } from "@/lib/engine";
import type { ConditionsSnapshot } from "@/lib/api";

export type MapMode = "flow" | "level" | "dams";

interface Props {
  mode: MapMode;
  snapshot: ConditionsSnapshot | null;
  selectedId?: string | null;
  onSelectRiver: (river: River) => void;
  onSelectDam: (damId: string) => void;
}

const UNAVAILABLE_COLOR = "#465568";

function landGeoJSON(): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: [AUSTRALIA_OUTLINE] },
      },
      {
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: [TASMANIA_OUTLINE] },
      },
    ],
  } as FeatureCollection;
}

function lakesGeoJSON(): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [LAKE_EYRE, LAKE_TORRENS].map((ring) => ({
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates: [ring] },
    })),
  } as FeatureCollection;
}

function riversGeoJSON(snapshot: ConditionsSnapshot | null): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: RIVERS.map((river) => {
      const observation = snapshot?.rivers[river.id];
      const condition = observation?.condition;
      return {
        type: "Feature",
        properties: {
          id: river.id,
          name: river.name,
          w: river.width,
          level: observation?.levelM ?? null,
          available: observation?.dataState === "observed" ? 1 : 0,
          color: condition ? CONDITION_META[condition].color : UNAVAILABLE_COLOR,
        },
        geometry: { type: "LineString", coordinates: river.points },
      };
    }),
  } as FeatureCollection;
}

function damsGeoJSON(snapshot: ConditionsSnapshot | null): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: DAMS.map((dam) => {
      const observation = snapshot?.dams[dam.id];
      return {
        type: "Feature",
        properties: {
          id: dam.id,
          name: dam.name,
          pct: observation?.storagePercent ?? null,
          r: 3.5 + Math.min(4.5, Math.sqrt(dam.capacityGL) / 25),
          color: observation?.storagePercent === null || observation?.storagePercent === undefined
            ? UNAVAILABLE_COLOR
            : damColor(observation.storagePercent),
        },
        geometry: { type: "Point", coordinates: [dam.lon, dam.lat] },
      };
    }),
  } as FeatureCollection;
}

function gaugesGeoJSON(snapshot: ConditionsSnapshot | null, mode: MapMode): FeatureCollection {
  if (!snapshot) return { type: "FeatureCollection", features: [] } as FeatureCollection;
  return {
    type: "FeatureCollection",
    features: Object.values(snapshot.rivers)
      .filter(
        (observation) =>
          observation.dataState === "observed" &&
          observation.stationLongitude !== null &&
          observation.stationLatitude !== null,
      )
      .map((observation) => ({
        type: "Feature",
        properties: {
          id: observation.riverId,
          station: observation.stationName,
          color: mode === "level"
            ? observation.levelM === null ? UNAVAILABLE_COLOR : levelColor(observation.levelM)
            : observation.condition ? CONDITION_META[observation.condition].color : UNAVAILABLE_COLOR,
        },
        geometry: {
          type: "Point",
          coordinates: [observation.stationLongitude!, observation.stationLatitude!],
        },
      })),
  } as FeatureCollection;
}

function levelColor(level: number): string {
  if (level < 1.5) return "#5f7488";
  if (level < 2.5) return "#4f93a8";
  if (level < 3.5) return "#3fb3c4";
  if (level < 4.5) return "#38c9de";
  return "#5ee7ff";
}

function damColor(percent: number): string {
  if (percent < 30) return "#d7301f";
  if (percent < 50) return "#f16913";
  if (percent < 70) return "#fdad45";
  if (percent < 85) return "#74c476";
  return "#3b8bff";
}

export default function RiverMap({ mode, snapshot, selectedId, onSelectRiver, onSelectDam }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const rafRef = useRef<number>(0);
  const callbacksRef = useRef({ onSelectRiver, onSelectDam });
  callbacksRef.current = { onSelectRiver, onSelectDam };

  const refreshData = useCallback((nextSnapshot: ConditionsSnapshot | null, nextMode: MapMode) => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const rivers = riversGeoJSON(nextSnapshot);
    if (nextMode === "level") {
      for (const feature of rivers.features) {
        const level = feature.properties?.level;
        feature.properties!.color = typeof level === "number" ? levelColor(level) : UNAVAILABLE_COLOR;
      }
    }
    (map.getSource("rivers") as GeoJSONSource | undefined)?.setData(rivers);
    (map.getSource("dams") as GeoJSONSource | undefined)?.setData(damsGeoJSON(nextSnapshot));
    (map.getSource("gauges") as GeoJSONSource | undefined)?.setData(gaugesGeoJSON(nextSnapshot, nextMode));
    map.setPaintProperty("river-line", "line-opacity", nextMode === "dams" ? 0.28 : 0.95);
    map.setPaintProperty("river-glow", "line-opacity", nextMode === "dams" ? 0.06 : 0.42);
    map.setPaintProperty("river-flow", "line-opacity", nextMode === "dams" ? 0.03 : 0.42);
    map.setPaintProperty("dams-circle", "circle-opacity", nextMode === "dams" ? 1 : 0.55);
    map.setPaintProperty("gauges-circle", "circle-opacity", nextMode === "dams" ? 0 : 1);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new MLMap({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [{ id: "bg", type: "background", paint: { "background-color": "#04070c" } }],
      },
      center: [134.5, -26.8],
      zoom: 3.2,
      minZoom: 2.8,
      maxZoom: 10,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });
    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: false }), "bottom-right");

    map.on("load", () => {
      map.fitBounds([[112, -44.5], [155.5, -9]], {
        padding: { top: 30, left: 30, right: 30, bottom: 100 },
        animate: false,
      });
      map.addSource("land", { type: "geojson", data: landGeoJSON() });
      map.addSource("lakes", { type: "geojson", data: lakesGeoJSON() });
      map.addSource("rivers", { type: "geojson", data: riversGeoJSON(snapshot) });
      map.addSource("dams", { type: "geojson", data: damsGeoJSON(snapshot) });
      map.addSource("gauges", { type: "geojson", data: gaugesGeoJSON(snapshot, mode) });

      map.addLayer({
        id: "land",
        type: "fill",
        source: "land",
        paint: { "fill-color": "#0f1a2c", "fill-opacity": 1 },
      });
      map.addLayer({
        id: "land-line",
        type: "line",
        source: "land",
        paint: { "line-color": "#243a56", "line-width": 1 },
      });
      map.addLayer({
        id: "lakes",
        type: "fill",
        source: "lakes",
        paint: { "fill-color": "#16293f", "fill-opacity": 0.9 },
      });
      map.addLayer({
        id: "river-glow",
        type: "line",
        source: "rivers",
        paint: {
          "line-color": ["get", "color"],
          "line-width": ["*", ["get", "w"], 3.4],
          "line-blur": 3,
          "line-opacity": 0.42,
        },
        layout: { "line-cap": "round", "line-join": "round" },
      });
      map.addLayer({
        id: "river-line",
        type: "line",
        source: "rivers",
        paint: {
          "line-color": ["get", "color"],
          "line-width": [
            "interpolate", ["linear"], ["zoom"],
            3, ["max", 1.4, ["*", ["get", "w"], 1.05]],
            8, ["max", 2.6, ["*", ["get", "w"], 2.1]],
          ],
          "line-opacity": 1,
        },
        layout: { "line-cap": "round", "line-join": "round" },
      });
      map.addLayer({
        id: "river-flow",
        type: "line",
        source: "rivers",
        paint: {
          "line-color": "#ffffff",
          "line-width": [
            "interpolate", ["linear"], ["zoom"],
            3, ["max", 0.7, ["*", ["get", "w"], 0.45]],
            8, ["max", 1.3, ["*", ["get", "w"], 0.9]],
          ],
          "line-dasharray": [0, 2.4, 2.6],
          "line-opacity": 0.42,
        },
        layout: { "line-cap": "round", "line-join": "round" },
      });
      map.addLayer({
        id: "gauges-circle",
        type: "circle",
        source: "gauges",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 2.6, 8, 5.5],
          "circle-color": ["get", "color"],
          "circle-stroke-color": "#e2f4ff",
          "circle-stroke-width": 0.8,
          "circle-opacity": 1,
        },
      });
      map.addLayer({
        id: "dams-circle",
        type: "circle",
        source: "dams",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, ["*", ["get", "r"], 0.75], 8, ["*", ["get", "r"], 1.4]],
          "circle-color": ["get", "color"],
          "circle-stroke-color": "#05080e",
          "circle-stroke-width": 1.5,
          "circle-opacity": 0.55,
        },
      });

      const dash = 2.4;
      const gap = 2.6;
      const cycle = dash + gap;
      const steps = 24;
      let step = 0;
      let last = 0;
      const tick = (time: number) => {
        if (time - last > 55) {
          last = time;
          step = (step + 1) % steps;
          const position = (step / steps) * cycle;
          if (map.getLayer("river-flow")) {
            map.setPaintProperty("river-flow", "line-dasharray", [position, dash, cycle - position]);
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      for (const [id, position] of Object.entries(LABEL_RIVERS)) {
        const river = RIVERS.find((candidate) => candidate.id === id);
        if (!river) continue;
        const element = document.createElement("div");
        element.textContent = river.name.replace(" River", "").replace(" (QLD)", "").replace(" (WA)", "").replace(" (VIC)", "");
        element.style.cssText = [
          "color:rgba(150,185,215,0.55)",
          "font-size:10.5px",
          "letter-spacing:0.14em",
          "text-transform:uppercase",
          "font-family:ui-monospace,SFMono-Regular,Menlo,monospace",
          "pointer-events:none",
          "white-space:nowrap",
          "text-shadow:0 0 6px rgba(5,8,14,0.9),0 0 2px rgba(5,8,14,1)",
        ].join(";");
        markersRef.current.push(new Marker({ element, anchor: "center" }).setLngLat(position).addTo(map));
      }

      const selectRiver = (event: MapLayerMouseEvent) => {
        const id = event.features?.[0]?.properties?.id;
        const river = RIVERS.find((candidate) => candidate.id === id);
        if (river) callbacksRef.current.onSelectRiver(river);
      };
      map.on("click", "river-line", selectRiver);
      map.on("click", "gauges-circle", selectRiver);
      map.on("click", "dams-circle", (event: MapLayerMouseEvent) => {
        const id = event.features?.[0]?.properties?.id;
        if (id) callbacksRef.current.onSelectDam(id);
      });
      for (const layer of ["river-line", "gauges-circle", "dams-circle"]) {
        map.on("mouseenter", layer, () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", layer, () => (map.getCanvas().style.cursor = ""));
      }

      refreshData(snapshot, mode);
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // Map creation is intentionally one-time; data is refreshed by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshData(snapshot, mode);
  }, [snapshot, mode, refreshData]);

  useEffect(() => {
    const map = mapRef.current;
    const river = RIVERS.find((candidate) => candidate.id === selectedId);
    if (!map || !river) return;
    const longitudes = river.points.map((point) => point[0]);
    const latitudes = river.points.map((point) => point[1]);
    map.fitBounds(
      [[Math.min(...longitudes), Math.min(...latitudes)], [Math.max(...longitudes), Math.max(...latitudes)]],
      { padding: { top: 160, bottom: 160, left: 160, right: 420 }, duration: 900, maxZoom: 7 },
    );
  }, [selectedId]);

  return <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />;
}
