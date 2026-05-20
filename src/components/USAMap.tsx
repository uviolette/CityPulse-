import React from 'react';

interface USAMapProps {
  stateData: Record<string, { status: 'good' | 'warning' | 'critical'; count: number }>;
  onStateClick: (state: string) => void;
  selectedState: string | null;
}

export function USAMap({ stateData, onStateClick, selectedState }: USAMapProps) {
  const getStateColor = (stateCode: string): string => {
    const data = stateData[stateCode];
    if (!data) return '#E5E7EB';

    switch (data.status) {
      case 'good':
        return selectedState === stateCode ? '#059669' : '#10B981';
      case 'warning':
        return selectedState === stateCode ? '#D97706' : '#F59E0B';
      case 'critical':
        return selectedState === stateCode ? '#DC2626' : '#EF4444';
      default:
        return '#E5E7EB';
    }
  };

  const states = [
    { id: 'CA', d: 'M50,150 L120,120 L130,180 L100,220 L60,210 Z', name: 'California' },
    { id: 'TX', d: 'M320,280 L420,270 L430,350 L340,360 L310,330 Z', name: 'Texas' },
    { id: 'FL', d: 'M620,320 L680,310 L690,380 L670,400 L640,380 Z', name: 'Florida' },
    { id: 'NY', d: 'M700,100 L760,90 L770,130 L740,150 L710,140 Z', name: 'New York' },
    { id: 'PA', d: 'M680,130 L740,120 L750,160 L720,180 L690,170 Z', name: 'Pennsylvania' },
    { id: 'IL', d: 'M520,150 L560,140 L570,200 L540,220 L520,210 Z', name: 'Illinois' },
    { id: 'OH', d: 'M600,150 L640,140 L650,190 L620,210 L600,200 Z', name: 'Ohio' },
    { id: 'GA', d: 'M600,260 L650,250 L660,310 L630,330 L610,310 Z', name: 'Georgia' },
    { id: 'NC', d: 'M640,230 L700,220 L710,270 L680,290 L650,280 Z', name: 'North Carolina' },
    { id: 'MI', d: 'M560,100 L600,90 L610,140 L580,160 L560,150 Z', name: 'Michigan' },
    { id: 'WA', d: 'M80,40 L150,30 L160,80 L130,100 L90,90 Z', name: 'Washington' },
    { id: 'OR', d: 'M70,90 L140,80 L150,130 L120,150 L80,140 Z', name: 'Oregon' },
    { id: 'AZ', d: 'M140,220 L210,210 L220,280 L180,290 L150,280 Z', name: 'Arizona' },
    { id: 'MA', d: 'M760,100 L800,95 L805,120 L785,130 L770,125 Z', name: 'Massachusetts' },
    { id: 'CO', d: 'M240,180 L310,170 L320,230 L280,240 L250,230 Z', name: 'Colorado' },
  ];

  return (
    <div className="relative w-full bg-slate-50 rounded-xl border border-gray-200 overflow-hidden">
      <svg
        viewBox="0 0 900 450"
        className="w-full h-full"
        style={{ minHeight: '350px' }}
      >
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
          </filter>
        </defs>

        {states.map((state) => (
          <g key={state.id}>
            <path
              d={state.d}
              fill={getStateColor(state.id)}
              stroke="#ffffff"
              strokeWidth="2"
              className="transition-all duration-300 cursor-pointer hover:opacity-80"
              onClick={() => onStateClick(state.id)}
              filter={selectedState === state.id ? 'url(#shadow)' : undefined}
            />
            {stateData[state.id] && (
              <text
                x={parseInt(state.d.split(' ')[0].split(',')[0].substring(1)) + 30}
                y={parseInt(state.d.split(' ')[0].split(',')[1]) + 30}
                fontSize="14"
                fontWeight="bold"
                fill="white"
                textAnchor="middle"
                className="pointer-events-none"
              >
                {stateData[state.id].count}
              </text>
            )}
          </g>
        ))}
      </svg>

      <div className="absolute bottom-3 left-3 bg-white/95 rounded-lg p-2 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span className="text-gray-700">Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-500" />
            <span className="text-gray-700">Needs Attention</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span className="text-gray-700">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}
