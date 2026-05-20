import React, { useState, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { supabase } from '../../lib/supabase';
import { Home, ZoomIn, ZoomOut, Navigation, MapPin, ChevronRight, BarChart3 } from 'lucide-react';

interface LocationData {
  state: string;
  county?: string;
  city?: string;
  incidentCount: number;
  fixedCount: number;
  activeCount: number;
  criticalCount: number;
}

type ZoomLevel = 'national' | 'state' | 'county' | 'city';

interface MapState {
  level: ZoomLevel;
  selectedState: string | null;
  selectedCounty: string | null;
  selectedCity: string | null;
  position: { coordinates: [number, number]; zoom: number };
}

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const STATE_CENTERS: { [key: string]: [number, number] } = {
  'Alabama': [-86.9023, 32.8067],
  'Alaska': [-152.4044, 61.3707],
  'Arizona': [-111.4312, 33.7298],
  'Arkansas': [-92.3731, 34.9697],
  'California': [-119.6816, 36.1162],
  'Colorado': [-105.3111, 39.0598],
  'Connecticut': [-72.7554, 41.5978],
  'Delaware': [-75.5071, 39.3185],
  'Florida': [-81.5158, 27.7663],
  'Georgia': [-83.6431, 33.0406],
  'Hawaii': [-157.4983, 21.0943],
  'Idaho': [-114.4788, 44.2405],
  'Illinois': [-89.3985, 40.3495],
  'Indiana': [-86.2604, 39.8494],
  'Iowa': [-93.0977, 42.0115],
  'Kansas': [-96.7265, 38.5266],
  'Kentucky': [-84.6701, 37.6681],
  'Louisiana': [-91.8749, 31.1695],
  'Maine': [-69.3819, 44.6939],
  'Maryland': [-76.8021, 39.0639],
  'Massachusetts': [-71.5301, 42.2302],
  'Michigan': [-84.5361, 43.3266],
  'Minnesota': [-93.9002, 45.6945],
  'Mississippi': [-89.6787, 32.7416],
  'Missouri': [-92.2884, 38.4561],
  'Montana': [-110.4544, 46.9219],
  'Nebraska': [-98.2680, 41.1254],
  'Nevada': [-117.0554, 38.3135],
  'New Hampshire': [-71.5639, 43.4525],
  'New Jersey': [-74.5210, 40.2989],
  'New Mexico': [-106.2371, 34.8405],
  'New York': [-74.2179, 42.1657],
  'North Carolina': [-79.8431, 35.6301],
  'North Dakota': [-99.7840, 47.5289],
  'Ohio': [-82.7649, 40.3888],
  'Oklahoma': [-96.9289, 35.5653],
  'Oregon': [-122.0709, 44.5720],
  'Pennsylvania': [-77.1945, 40.5908],
  'Rhode Island': [-71.5101, 41.6809],
  'South Carolina': [-80.9066, 33.8569],
  'South Dakota': [-99.4388, 44.2998],
  'Tennessee': [-86.6923, 35.7478],
  'Texas': [-97.5631, 31.0545],
  'Utah': [-111.8910, 40.1500],
  'Vermont': [-72.7107, 44.0459],
  'Virginia': [-78.1694, 37.7693],
  'Washington': [-121.4905, 47.4009],
  'West Virginia': [-80.9545, 38.4912],
  'Wisconsin': [-89.6165, 44.2685],
  'Wyoming': [-107.3025, 42.7559]
};

export function InteractiveUSMap() {
  const [mapState, setMapState] = useState<MapState>({
    level: 'national',
    selectedState: null,
    selectedCounty: null,
    selectedCity: null,
    position: { coordinates: [-96, 38], zoom: 1 }
  });

  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    name: string;
    stats: LocationData | null;
    x: number;
    y: number;
  } | null>(null);
  const [showSidePanel, setShowSidePanel] = useState(true);

  useEffect(() => {
    fetchLocationData();
  }, [mapState.level, mapState.selectedState, mapState.selectedCounty]);

  async function fetchLocationData() {
    setIsLoading(true);

    try {
      let query = supabase
        .from('incidents')
        .select('state, county, city, status');

      if (mapState.level === 'state' && mapState.selectedState) {
        query = query.eq('state', mapState.selectedState);
      } else if (mapState.level === 'county' && mapState.selectedCounty) {
        query = query.eq('county', mapState.selectedCounty);
      }

      const { data } = await query;

      if (data) {
        const aggregated = aggregateData(data);
        setLocationData(aggregated);
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    }

    setIsLoading(false);
  }

  function aggregateData(incidents: any[]): LocationData[] {
    const map = new Map<string, LocationData>();

    incidents.forEach(incident => {
      let key: string;

      if (mapState.level === 'national') {
        key = incident.state;
        if (!map.has(key)) {
          map.set(key, {
            state: incident.state,
            incidentCount: 0,
            fixedCount: 0,
            activeCount: 0,
            criticalCount: 0
          });
        }
      } else if (mapState.level === 'state') {
        key = `${incident.state}-${incident.county}`;
        if (!map.has(key)) {
          map.set(key, {
            state: incident.state,
            county: incident.county,
            incidentCount: 0,
            fixedCount: 0,
            activeCount: 0,
            criticalCount: 0
          });
        }
      } else {
        key = `${incident.state}-${incident.county}-${incident.city}`;
        if (!map.has(key)) {
          map.set(key, {
            state: incident.state,
            county: incident.county,
            city: incident.city,
            incidentCount: 0,
            fixedCount: 0,
            activeCount: 0,
            criticalCount: 0
          });
        }
      }

      const loc = map.get(key)!;
      loc.incidentCount++;

      if (incident.status === 'resolved') {
        loc.fixedCount++;
      } else if (incident.status === 'in_progress') {
        loc.activeCount++;
      } else {
        loc.criticalCount++;
      }
    });

    return Array.from(map.values());
  }

  function getHeatColor(location: LocationData): string {
    if (location.incidentCount === 0) return '#F1E7D8';

    const criticalRatio = location.criticalCount / location.incidentCount;
    const activeRatio = location.activeCount / location.incidentCount;
    const fixedRatio = location.fixedCount / location.incidentCount;

    if (criticalRatio > 0.5) return '#A86A70';
    if (criticalRatio > 0.3) return '#C48A90';
    if (activeRatio > 0.5) return '#7FA8C3';
    if (fixedRatio > 0.7) return '#A3BFA2';
    if (activeRatio > 0.3) return '#B8CFE0';

    return '#F5ECE3';
  }

  function handleStateClick(stateName: string) {
    const center = STATE_CENTERS[stateName];
    if (center) {
      setMapState({
        level: 'state',
        selectedState: stateName,
        selectedCounty: null,
        selectedCity: null,
        position: { coordinates: center, zoom: 4 }
      });
    }
  }

  function handleCountyClick(countyName: string) {
    setMapState(prev => ({
      ...prev,
      level: 'county',
      selectedCounty: countyName,
      selectedCity: null,
      position: { ...prev.position, zoom: 8 }
    }));
  }

  function handleResetToNational() {
    setMapState({
      level: 'national',
      selectedState: null,
      selectedCounty: null,
      selectedCity: null,
      position: { coordinates: [-96, 38], zoom: 1 }
    });
  }

  function handleZoomIn() {
    setMapState(prev => ({
      ...prev,
      position: { ...prev.position, zoom: prev.position.zoom * 1.5 }
    }));
  }

  function handleZoomOut() {
    setMapState(prev => ({
      ...prev,
      position: { ...prev.position, zoom: Math.max(1, prev.position.zoom / 1.5) }
    }));
  }

  function handleMouseEnter(stateName: string, event: React.MouseEvent) {
    setHoveredState(stateName);
    const stateData = locationData.find(d => d.state === stateName);
    setTooltipData({
      name: stateName,
      stats: stateData || null,
      x: event.clientX,
      y: event.clientY
    });
  }

  function handleMouseMove(event: React.MouseEvent) {
    if (tooltipData) {
      setTooltipData(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
    }
  }

  function handleMouseLeave() {
    setHoveredState(null);
    setTooltipData(null);
  }

  return (
    <div className="h-full w-full flex">
      {/* Side Panel */}
      {showSidePanel && (
        <div className="w-80 bg-[#F5ECE3] border-r-2 border-[#C77B86]/20 overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b-2 border-[#C77B86]/20 bg-[#E6D6C2]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-[#8E2C3A] flex items-center gap-2">
                <BarChart3 size={20} className="text-[#D88A2D]" />
                Region Explorer
              </h3>
              <button
                onClick={() => setShowSidePanel(false)}
                className="p-1 rounded-full hover:bg-[#C77B86]/20 transition-colors"
              >
                <ChevronRight size={18} className="text-[#8E2C3A]" />
              </button>
            </div>
            <p className="text-xs text-[#8B4A1C]/70 font-medium">
              {mapState.level === 'national' && 'All U.S. States'}
              {mapState.level === 'state' && `${mapState.selectedState} Counties`}
              {mapState.level === 'county' && `${mapState.selectedCounty} Cities`}
            </p>
          </div>

          <div className="p-4 space-y-2">
            {mapState.level === 'national' && locationData.length > 0 && (
              <div className="space-y-2">
                {locationData.sort((a, b) => b.incidentCount - a.incidentCount).map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleStateClick(loc.state)}
                    onMouseEnter={(e) => handleMouseEnter(loc.state, e)}
                    onMouseLeave={handleMouseLeave}
                    className={`w-full p-3 rounded-2xl border-2 transition-all text-left ${
                      hoveredState === loc.state
                        ? 'bg-[#D88A2D]/20 border-[#D88A2D]'
                        : 'bg-white border-[#C77B86]/20 hover:border-[#D88A2D]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-[#8E2C3A]">{loc.state}</p>
                      <ChevronRight size={16} className="text-[#D88A2D]" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-[#8B4A1C]/60 font-medium">Total</p>
                        <p className="font-bold text-[#8E2C3A]">{loc.incidentCount}</p>
                      </div>
                      <div>
                        <p className="text-[#8B4A1C]/60 font-medium">Unfixed</p>
                        <p className="font-bold" style={{ color: 'var(--status-critical)' }}>{loc.criticalCount}</p>
                      </div>
                      <div>
                        <p className="text-[#8B4A1C]/60 font-medium">Fixed</p>
                        <p className="font-bold" style={{ color: 'var(--status-resolved)' }}>{loc.fixedCount}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {mapState.level === 'state' && (
              <div className="space-y-2">
                {locationData.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => loc.county && handleCountyClick(loc.county)}
                    className="w-full p-3 bg-white rounded-2xl border-2 border-[#C77B86]/20 hover:border-[#D88A2D] transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getHeatColor(loc) }}
                        />
                        <p className="text-sm font-bold text-[#8E2C3A]">{loc.county}</p>
                      </div>
                      <ChevronRight size={16} className="text-[#D88A2D]" />
                    </div>
                    <p className="text-xs text-[#8B4A1C]/70">{loc.incidentCount} incidents</p>
                  </button>
                ))}
              </div>
            )}

            {mapState.level === 'county' && (
              <div className="space-y-2">
                {locationData.map((loc, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-2xl border-2 border-[#C77B86]/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getHeatColor(loc) }}
                        />
                        <p className="text-sm font-bold text-[#8E2C3A]">{loc.city}</p>
                      </div>
                      <p className="text-xs text-[#8B4A1C]/70">{loc.incidentCount} incidents</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Map Area */}
      <div className="flex-1 flex flex-col">
        {!showSidePanel && (
          <button
            onClick={() => setShowSidePanel(true)}
            className="absolute left-0 top-20 z-10 p-2 bg-[#F5ECE3] border-2 border-[#C77B86]/30 rounded-r-full hover:border-[#C77B86] transition-all shadow-bakery"
          >
            <ChevronRight size={18} className="text-[#8E2C3A] rotate-180" />
          </button>
        )}

        <div className="bakery-card border-b-2 border-[#C77B86]/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-[#8E2C3A] flex items-center gap-2">
              <MapPin size={20} className="text-[#D88A2D]" />
              {mapState.level === 'national' && 'United States'}
              {mapState.level === 'state' && mapState.selectedState}
              {mapState.level === 'county' && `${mapState.selectedCounty}, ${mapState.selectedState}`}
            </h2>
            <p className="text-xs text-[#8B4A1C]/70 font-medium">
              {mapState.level === 'national' && 'Click any state to explore'}
              {mapState.level === 'state' && 'Click any county to explore'}
              {mapState.level === 'county' && 'Viewing city-level data'}
            </p>
          </div>

          <div className="flex gap-2">
            {mapState.level !== 'national' && (
              <button
                onClick={handleResetToNational}
                className="p-2 bg-[#F5ECE3] border-2 border-[#C77B86]/30 rounded-full hover:border-[#C77B86] transition-all"
                title="Back to National View"
              >
                <Home size={18} className="text-[#8E2C3A]" />
              </button>
            )}
            <button
              onClick={handleZoomIn}
              className="p-2 bg-[#F5ECE3] border-2 border-[#C77B86]/30 rounded-full hover:border-[#C77B86] transition-all"
              title="Zoom In"
            >
              <ZoomIn size={18} className="text-[#8E2C3A]" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-[#F5ECE3] border-2 border-[#C77B86]/30 rounded-full hover:border-[#C77B86] transition-all"
              title="Zoom Out"
            >
              <ZoomOut size={18} className="text-[#8E2C3A]" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#A86A70] border border-[#A86A70]"></div>
            <span className="text-[#8B4A1C] font-medium">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#7FA8C3] border border-[#7FA8C3]"></div>
            <span className="text-[#8B4A1C] font-medium">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#A3BFA2] border border-[#A3BFA2]"></div>
            <span className="text-[#8B4A1C] font-medium">Resolved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#F1E7D8] border border-[#C77B86]"></div>
            <span className="text-[#8B4A1C] font-medium">No Data</span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-[#E6D6C2] relative" onMouseMove={handleMouseMove}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#E6D6C2]/80 z-10">
            <div className="bakery-card p-4 shadow-bakery">
              <Navigation className="text-[#D88A2D] animate-pulse mx-auto mb-2" size={32} />
              <p className="text-[#8E2C3A] font-medium">Loading map data...</p>
            </div>
          </div>
        )}

        {/* Tooltip */}
        {tooltipData && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: tooltipData.x + 15,
              top: tooltipData.y - 15,
            }}
          >
            <div className="bakery-card p-3 shadow-bakery border-2 border-[#C77B86]/30">
              <p className="text-sm font-bold text-[#8E2C3A] mb-2">{tooltipData.name}</p>
              {tooltipData.stats ? (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#8B4A1C]/70 font-medium">Total Issues:</span>
                    <span className="font-bold text-[#8E2C3A]">{tooltipData.stats.incidentCount}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#8B4A1C]/70 font-medium">Unfixed:</span>
                    <span className="font-bold" style={{ color: 'var(--status-critical)' }}>{tooltipData.stats.criticalCount}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#8B4A1C]/70 font-medium">Active:</span>
                    <span className="font-bold" style={{ color: 'var(--status-active)' }}>{tooltipData.stats.activeCount}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#8B4A1C]/70 font-medium">Fixed:</span>
                    <span className="font-bold" style={{ color: 'var(--status-resolved)' }}>{tooltipData.stats.fixedCount}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#8B4A1C]/70">No data available</p>
              )}
            </div>
          </div>
        )}

        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{
            scale: 1000
          }}
          className="w-full h-full"
        >
          <ZoomableGroup
            center={mapState.position.coordinates}
            zoom={mapState.position.zoom}
            minZoom={1}
            maxZoom={16}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const stateName = geo.properties.name;
                  const stateData = locationData.find(d => d.state === stateName);
                  const fillColor = stateData ? getHeatColor(stateData) : '#F1E7D8';

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleStateClick(stateName)}
                      onMouseEnter={(event: any) => handleMouseEnter(stateName, event)}
                      onMouseLeave={handleMouseLeave}
                      style={{
                        default: {
                          fill: fillColor,
                          stroke: '#8E2C3A',
                          strokeWidth: 0.5,
                          outline: 'none',
                        },
                        hover: {
                          fill: '#D88A2D',
                          stroke: '#8E2C3A',
                          strokeWidth: 1.5,
                          outline: 'none',
                          cursor: 'pointer',
                        },
                        pressed: {
                          fill: '#9B2E3D',
                          stroke: '#8E2C3A',
                          strokeWidth: 1,
                          outline: 'none',
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* State Labels */}
            {mapState.level === 'national' && mapState.position.zoom >= 1 && (
              <>
                {Object.entries(STATE_CENTERS).map(([stateName, coordinates]) => {
                  const stateData = locationData.find(d => d.state === stateName);
                  if (!stateData || stateData.incidentCount === 0) return null;

                  return (
                    <Marker key={stateName} coordinates={coordinates}>
                      <g>
                        <circle
                          r={4}
                          fill="#8E2C3A"
                          stroke="#F5ECE3"
                          strokeWidth={1}
                          className="pointer-events-none"
                        />
                        <text
                          textAnchor="middle"
                          y={-8}
                          className="pointer-events-none"
                          style={{
                            fontFamily: 'system-ui',
                            fontSize: '8px',
                            fontWeight: 'bold',
                            fill: '#8E2C3A',
                            stroke: '#F5ECE3',
                            strokeWidth: '2px',
                            paintOrder: 'stroke',
                          }}
                        >
                          {stateData.incidentCount}
                        </text>
                      </g>
                    </Marker>
                  );
                })}
              </>
            )}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      </div>
    </div>
  );
}
