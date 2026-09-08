import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ProcurementCentre } from '../../types';
import { useApp } from '../../context/AppContext';

import { getCentreSafe } from '../../utils/centreResolver';

interface InteractiveMapProps {
  centres: ProcurementCentre[];
  selectedCentreId?: string;
  onSelectCentre: (centre: ProcurementCentre) => void;
  onBookCentre?: (centre: ProcurementCentre) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  centres,
  selectedCentreId,
  onSelectCentre,
  onBookCentre,
}) => {
  const { farmerProfile } = useApp();

  const validCentres = (centres || []).filter((c): c is ProcurementCentre => Boolean(c && (c.id || c.officialId)));

  const [activePin, setActivePin] = useState<ProcurementCentre | null>(
    getCentreSafe(selectedCentreId, validCentres) || null
  );

  // Dynamic Map Bounds calculation based on centres & farmer profile location
  const farmerLat = farmerProfile?.latitude;
  const farmerLng = farmerProfile?.longitude;

  const lats = validCentres.map((c) => c.latitude).concat(typeof farmerLat === 'number' ? [farmerLat] : []);
  const lngs = validCentres.map((c) => c.longitude).concat(typeof farmerLng === 'number' ? [farmerLng] : []);

  const minLat = lats.length > 0 ? Math.min(...lats) - 0.04 : 20.0;
  const maxLat = lats.length > 0 ? Math.max(...lats) + 0.04 : 20.5;
  const minLng = lngs.length > 0 ? Math.min(...lngs) - 0.04 : 75.0;
  const maxLng = lngs.length > 0 ? Math.max(...lngs) + 0.04 : 75.5;

  // Convert GPS to SVG Coordinates (viewBox 0 0 800 500)
  const getCoordinates = (lat: number, lng: number) => {
    const spanLng = maxLng - minLng || 0.1;
    const spanLat = maxLat - minLat || 0.1;
    const x = ((lng - minLng) / spanLng) * 740 + 30;
    const y = 470 - ((lat - minLat) / spanLat) * 440;
    return { x: Math.max(40, Math.min(760, x)), y: Math.max(40, Math.min(460, y)) };
  };

  // Logged-in Farmer Location Pin
  const farmerPos = typeof farmerLat === 'number' && typeof farmerLng === 'number'
    ? getCoordinates(farmerLat, farmerLng)
    : getCoordinates((minLat + maxLat) / 2, (minLng + maxLng) / 2);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { bg: '#2c694e', ring: '#aeeecb', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' };
      case 'BUSY':
        return { bg: '#e9c46a', ring: '#fef3c7', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' };
      case 'OVERLOADED':
        return { bg: '#ba1a1a', ring: '#ffdad6', text: 'text-red-700', badge: 'bg-red-100 text-red-800' };
      default:
        return { bg: '#717973', ring: '#e8e8e5', text: 'text-gray-600', badge: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <div className="relative w-full bg-[#f3f4f1] rounded-2xl border border-[#c1c8c2]/60 overflow-hidden ambient-shadow">
      {/* Map Control Header */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#c1c8c2]/50 shadow-xs flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#012d1d]">
          <Navigation className="w-4 h-4 text-[#2c694e]" />
          <span>Nashik District Geospatial View</span>
        </div>
        <div className="h-3.5 w-px bg-[#c1c8c2]"></div>
        <div className="flex items-center gap-3 text-[11px] text-[#414844]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2c694e]"></span> Normal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e9c46a]"></span> Busy
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span> High Wait
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        viewBox="0 0 800 500"
        className="w-full h-[360px] md:h-[480px] bg-gradient-to-br from-[#f8faf6] via-[#eff2ec] to-[#e7ece3] select-none"
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e0e4dd" strokeWidth="0.8" />
          </pattern>
          {/* Pulse animation for active target */}
          <radialGradient id="pulseGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2c694e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2c694e" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background Grid */}
        <rect width="800" height="500" fill="url(#grid)" />

        {/* District Boundary & Highway representation */}
        <path
          d="M 50 120 Q 240 80, 480 140 T 750 200"
          fill="none"
          stroke="#d2d8ce"
          strokeWidth="3"
          strokeDasharray="6 4"
        />
        <path
          d="M 120 400 Q 300 350, 450 320 T 720 380"
          fill="none"
          stroke="#d2d8ce"
          strokeWidth="2.5"
          strokeDasharray="4 4"
        />

        {/* Farmer 10km & 20km Radius Rings */}
        <circle
          cx={farmerPos.x}
          cy={farmerPos.y}
          r="80"
          fill="none"
          stroke="#2c694e"
          strokeWidth="1"
          strokeDasharray="4 3"
          opacity="0.25"
        />
        <text
          x={farmerPos.x + 85}
          y={farmerPos.y + 4}
          fontSize="10"
          fill="#717973"
          fontFamily="sans-serif"
        >
          10 km radius
        </text>

        {/* Dynamic Route Line to active selected Centre */}
        {activePin && (
          <g>
            {(() => {
              const target = getCoordinates(activePin.latitude, activePin.longitude);
              return (
                <>
                  <line
                    x1={farmerPos.x}
                    y1={farmerPos.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="#012d1d"
                    strokeWidth="2"
                    strokeDasharray="5 4"
                    className="animate-pulse"
                  />
                  <circle
                    cx={(farmerPos.x + target.x) / 2}
                    cy={(farmerPos.y + target.y) / 2 - 10}
                    r="12"
                    fill="#ffffff"
                    stroke="#1b4332"
                    strokeWidth="1"
                  />
                  <text
                    x={(farmerPos.x + target.x) / 2}
                    y={(farmerPos.y + target.y) / 2 - 6}
                    fontSize="9"
                    textAnchor="middle"
                    fontWeight="bold"
                    fill="#012d1d"
                  >
                    ETA
                  </text>
                </>
              );
            })()}
          </g>
        )}

        {/* Farmer Location Pin */}
        <g transform={`translate(${farmerPos.x}, ${farmerPos.y})`}>
          <circle r="16" fill="url(#pulseGlow)" className="animate-ping opacity-75" />
          <circle r="9" fill="#012d1d" stroke="#ffffff" strokeWidth="2.5" />
          <circle r="4" fill="#aeeecb" />
          <rect x="-42" y="14" width="84" height="20" rx="6" fill="#012d1d" opacity="0.9" />
          <text
            x="0"
            y="28"
            fontSize="10"
            fontWeight="bold"
            fill="#ffffff"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            Your Village (Ram Das)
          </text>
        </g>

        {/* Centre Pins */}
        {validCentres.map((centre) => {
          const pos = getCoordinates(centre.latitude, centre.longitude);
          const isSelected = activePin?.id === centre.id;
          const statusStyling = getStatusColor(centre.status);

          return (
            <g
              key={centre.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              className="cursor-pointer transition-transform duration-200 hover:scale-115"
              onClick={() => {
                setActivePin(centre);
                onSelectCentre(centre);
              }}
            >
              {isSelected && (
                <circle
                  r="24"
                  fill="none"
                  stroke="#1b4332"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  className="animate-spin"
                  style={{ transformOrigin: 'center' }}
                />
              )}

              {/* Pin Base */}
              <circle
                r="13"
                fill={statusStyling.bg}
                stroke="#ffffff"
                strokeWidth="2.5"
                className="shadow-md"
              />

              {/* Centre Badge Icon/Letter */}
              <text
                x="0"
                y="4"
                fontSize="9"
                fontWeight="bold"
                fill="#ffffff"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                {centre.currentQueue}
              </text>

              {/* Centre Name Label */}
              <g transform="translate(0, -18)">
                <rect
                  x={-centre.name.length * 3.2 - 6}
                  y="-14"
                  width={centre.name.length * 6.4 + 12}
                  height="16"
                  rx="4"
                  fill="#ffffff"
                  stroke="#c1c8c2"
                  strokeWidth="0.8"
                  opacity="0.95"
                />
                <text
                  x="0"
                  y="-3"
                  fontSize="9.5"
                  fontWeight="600"
                  fill="#1a1c1a"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {centre.name}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Floating Selected Centre Card Preview */}
      {activePin && (
        <div className="absolute bottom-3 left-3 right-3 md:right-auto md:w-96 bg-white/98 backdrop-blur-lg p-4 rounded-2xl border border-[#c1c8c2]/70 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    getStatusColor(activePin.status).badge
                  }`}
                >
                  {activePin.status}
                </span>
                {activePin.id === 'cnt_sinnar' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-[#aeeecb] text-[#002114] px-2 py-0.5 rounded-md">
                    <Sparkles className="w-3 h-3 text-[#2c694e]" /> Recommended
                  </span>
                )}
              </div>
              <h4 className="font-bold text-sm text-[#012d1d] mt-1.5 leading-tight">
                {activePin.name}
              </h4>
              <p className="text-xs text-[#414844] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#717973] shrink-0" />
                <span className="truncate">{activePin.address}</span>
              </p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#eeeeeb] text-center">
            <div className="bg-[#f3f4f1] p-2 rounded-xl">
              <p className="text-[10px] text-[#717973] font-medium">Live Queue</p>
              <p className="text-xs font-bold text-[#012d1d] flex items-center justify-center gap-1 mt-0.5">
                <Users className="w-3 h-3 text-[#2c694e]" />
                {activePin.currentQueue} Farmers
              </p>
            </div>
            <div className="bg-[#f3f4f1] p-2 rounded-xl">
              <p className="text-[10px] text-[#717973] font-medium">Wait Time</p>
              <p className="text-xs font-bold text-[#012d1d] flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-[#2c694e]" />
                {activePin.estimatedWaitingTime}
              </p>
            </div>
            <div className="bg-[#f3f4f1] p-2 rounded-xl">
              <p className="text-[10px] text-[#717973] font-medium">Active Counters</p>
              <p className="text-xs font-bold text-[#012d1d] mt-0.5">
                {activePin.activeCounters} / {activePin.counters}
              </p>
            </div>
          </div>

          {/* Action Button */}
          {onBookCentre && (
            <button
              onClick={() => onBookCentre(activePin)}
              disabled={activePin.status === 'CLOSED'}
              className="mt-3 w-full bg-[#1b4332] hover:bg-[#012d1d] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>{activePin.status === 'CLOSED' ? 'Centre Currently Closed' : 'Book Slot at this Centre'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
