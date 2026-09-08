import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Map as MapIcon,
  List,
  Calendar,
  Sparkles,
  SlidersHorizontal,
  Wheat,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { recommendCentres } from '../../services/recommendation/recommendationEngine';
import { SmartRecommendationCard } from '../../components/farmer/SmartRecommendationCard';
import { InteractiveMap } from '../../components/farmer/InteractiveMap';
import {
  INDIA_STATES,
  INDIA_UNION_TERRITORIES,
  getDistrictsForState,
  getBlocksForDistrict,
  findStateForDistrict,
} from '../../services/location/locationService';
import { getTodayNormalized } from '../../utils/dateUtils';

interface VoiceParams {
  crop?: string;
  state?: string;
  stateCode?: string;
  district?: string;
  districtCode?: string;
  block?: string;
  quantity?: number;
  rawText: string;
}

interface SearchCentresPageProps {
  onNavigate: (path: string) => void;
  onSelectCentre: (centreId: string) => void;
  voiceParams?: VoiceParams | null;
}

export const SearchCentresPage: React.FC<SearchCentresPageProps> = ({
  onNavigate,
  onSelectCentre,
  voiceParams,
}) => {
  const { centres, farmerProfile, t } = useApp();

  const [selectedState, setSelectedState] = useState<string>(farmerProfile?.state || 'All India');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(farmerProfile?.district || 'All Districts');
  const [selectedBlock, setSelectedBlock] = useState<string>('All Blocks');
  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayNormalized());
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Search-aware filtered lists for STATES vs UNION TERRITORIES dropdown
  const filteredStates = useMemo(() => {
    if (!searchQuery) return INDIA_STATES;
    const q = searchQuery.toLowerCase();
    return INDIA_STATES.filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredUnionTerritories = useMemo(() => {
    if (!searchQuery) return INDIA_UNION_TERRITORIES;
    const q = searchQuery.toLowerCase();
    return INDIA_UNION_TERRITORIES.filter(
      (ut) => ut.name.toLowerCase().includes(q) || ut.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const districtsList = useMemo(() => getDistrictsForState(selectedState), [selectedState]);
  const blocksList = useMemo(
    () => getBlocksForDistrict(selectedState, selectedDistrict),
    [selectedState, selectedDistrict]
  );

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    setSelectedDistrict('All Districts');
    setSelectedBlock('All Blocks');
  };

  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    setSelectedBlock('All Blocks');
  };

  // Synchronize global voice search parameters when received
  useEffect(() => {
    if (voiceParams) {
      // 1. State auto-selection
      if (voiceParams.state) {
        setSelectedState(voiceParams.state);
      } else if (voiceParams.district) {
        const parentState = findStateForDistrict(voiceParams.district);
        if (parentState) setSelectedState(parentState);
      }

      // 2. District auto-selection
      if (voiceParams.district) {
        setSelectedDistrict(voiceParams.district);
      } else if (voiceParams.state) {
        setSelectedDistrict('All Districts');
      }

      // 3. Block auto-selection
      if (voiceParams.block) {
        setSelectedBlock(voiceParams.block);
      } else if (voiceParams.district || voiceParams.state) {
        setSelectedBlock('All Blocks');
      }

      // 4. Crop auto-selection
      if (voiceParams.crop) {
        setSelectedCrop(voiceParams.crop);
      }

      // 5. Query string synchronization
      if (!voiceParams.crop && !voiceParams.district && !voiceParams.block && !voiceParams.state && voiceParams.rawText) {
        setSearchQuery(voiceParams.rawText);
      } else {
        setSearchQuery('');
      }
    }
  }, [voiceParams]);

  // Compute recommendations from valid APMC centres dataset
  const recommendations = useMemo(() => {
    let filtered = (centres || []).filter((c) => {
      if (!c) return false;
      const matchState =
        !selectedState ||
        selectedState === 'All India' ||
        (c.state && c.state.toLowerCase() === selectedState.toLowerCase());
      const matchDistrict =
        !selectedDistrict ||
        selectedDistrict === 'All Districts' ||
        (c.district && c.district.toLowerCase() === selectedDistrict.toLowerCase());
      const matchBlock =
        !selectedBlock ||
        selectedBlock === 'All Blocks' ||
        (c.block && c.block.toLowerCase() === selectedBlock.toLowerCase());
      const matchCrop =
        !selectedCrop ||
        selectedCrop === 'All Crops' ||
        (c.supportedCrops && c.supportedCrops.some((cr) => cr.toLowerCase().includes(selectedCrop.toLowerCase())));
      const matchQuery =
        !searchQuery ||
        (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.agency && c.agency.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.state && c.state.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.district && c.district.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchState && matchDistrict && matchBlock && matchCrop && matchQuery;
    });

    return recommendCentres(farmerProfile, filtered, selectedCrop, selectedDate);
  }, [
    centres,
    farmerProfile,
    selectedState,
    selectedDistrict,
    selectedBlock,
    selectedCrop,
    selectedDate,
    searchQuery,
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-28 font-sans select-none relative">
      {/* 1. Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-black text-[#012d1d] tracking-tight">
            {t('searchCentres')}
          </h1>
          <span className="text-xs bg-[#c1ecd4] text-[#002114] px-2.5 py-0.5 rounded-md font-extrabold">
            {recommendations.length} Centres Found
          </span>
        </div>
        <p className="text-xs md:text-sm text-[#414844] mt-1 font-medium">
          Compare waiting times, active queue length, and book instant procurement slots across India.
        </p>
      </div>

      {/* 2. Filter Toolbar & Search Bar */}
      <div className="bg-white p-4 md:p-5 rounded-3xl border border-[#c1c8c2]/60 shadow-xs space-y-4">
        {/* Manual Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717973]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="⌨️ Search by centre name, mandis, state, or address..."
            className="w-full bg-[#f3f4f1] pl-10 pr-4 py-2.5 rounded-2xl text-xs md:text-sm text-[#012d1d] font-bold placeholder:text-[#717973] border-none focus:ring-2 focus:ring-[#1b4332] outline-none"
          />
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {/* State */}
          <div>
            <label className="text-[10px] font-bold uppercase text-[#717973] tracking-wider mb-1 block">
              {t('state')}
            </label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full bg-[#f3f4f1] px-2.5 py-2 rounded-xl text-xs font-semibold text-[#012d1d] border border-[#c1c8c2]/50 focus:border-[#012d1d] outline-none cursor-pointer"
            >
              <option value="All India">All India</option>
              {filteredStates.length > 0 && (
                <optgroup label="──────── STATES ────────">
                  {filteredStates.map((st) => (
                    <option key={st.code} value={st.name}>
                      {st.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {filteredUnionTerritories.length > 0 && (
                <optgroup label="──────── UNION TERRITORIES ────────">
                  {filteredUnionTerritories.map((ut) => (
                    <option key={ut.code} value={ut.name}>
                      {ut.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="text-[10px] font-bold uppercase text-[#717973] tracking-wider mb-1 block">
              {t('district')}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full bg-[#f3f4f1] px-2.5 py-2 rounded-xl text-xs font-semibold text-[#012d1d] border border-[#c1c8c2]/50 focus:border-[#012d1d] outline-none cursor-pointer"
            >
              {districtsList.map((dst) => (
                <option key={dst} value={dst}>
                  {dst}
                </option>
              ))}
            </select>
          </div>

          {/* Block */}
          <div>
            <label className="text-[10px] font-bold uppercase text-[#717973] tracking-wider mb-1 block">
              {t('block')}
            </label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full bg-[#f3f4f1] px-2.5 py-2 rounded-xl text-xs font-semibold text-[#012d1d] border border-[#c1c8c2]/50 focus:border-[#012d1d] outline-none cursor-pointer"
            >
              {blocksList.map((blk) => (
                <option key={blk} value={blk}>
                  {blk}
                </option>
              ))}
            </select>
          </div>

          {/* Crop */}
          <div>
            <label className="text-[10px] font-bold uppercase text-[#717973] tracking-wider mb-1 block">
              {t('crop')}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full bg-[#f3f4f1] px-2.5 py-2 rounded-xl text-xs font-semibold text-[#012d1d] border border-[#c1c8c2]/50 focus:border-[#012d1d] outline-none cursor-pointer"
            >
              <option value="Wheat">Wheat (गेहूं)</option>
              <option value="Soybean">Soybean (सोयाबीन)</option>
              <option value="Paddy">Paddy (धान / भात)</option>
              <option value="Gram (Chana)">Gram / Chana (चना)</option>
              <option value="Maize">Maize (मक्का)</option>
              <option value="Mustard">Mustard (सरसों)</option>
              <option value="Cotton">Cotton (कपास)</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="text-[10px] font-bold uppercase text-[#717973] tracking-wider mb-1 block">
              {t('date')}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-[#f3f4f1] px-2 py-1.5 rounded-xl text-xs font-semibold text-[#012d1d] border border-[#c1c8c2]/50 focus:border-[#012d1d] outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* View Mode Toggle Switch */}
        <div className="flex items-center justify-between pt-2 border-t border-[#eeeeeb]">
          <div className="flex items-center gap-1.5 text-xs text-[#717973]">
            <Sparkles className="w-3.5 h-3.5 text-[#2c694e]" />
            <span>Sorted by Smart Recommendation Engine</span>
          </div>

          <div className="flex items-center bg-[#f3f4f1] p-1 rounded-xl border border-[#c1c8c2]/50">
            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'LIST'
                  ? 'bg-white text-[#012d1d] shadow-2xs font-extrabold'
                  : 'text-[#717973] hover:text-[#012d1d]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('MAP')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'MAP'
                  ? 'bg-white text-[#012d1d] shadow-2xs font-extrabold'
                  : 'text-[#717973] hover:text-[#012d1d]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Geospatial Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Results Display */}
      {viewMode === 'MAP' ? (
        <div className="space-y-4">
          <InteractiveMap
            centres={recommendations.map((r) => r.centre)}
            onSelectCentre={(c) => onSelectCentre(c.id)}
            onBookCentre={(c) => {
              onSelectCentre(c.id);
              onNavigate(`/farmer/book-slot?centreId=${c.id}`);
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-[#c1c8c2]/50">
              <Wheat className="w-12 h-12 text-[#717973] mx-auto mb-3" />
              <h3 className="font-bold text-base text-[#012d1d]">No centres matched your filters</h3>
              <p className="text-xs text-[#717973] mt-1">
                Try selecting "All Blocks" or another commodity crop.
              </p>
            </div>
          ) : (
            recommendations.map((rec) => (
              <SmartRecommendationCard
                key={rec.centre.id}
                recommendation={rec}
                onBook={() => {
                  onSelectCentre(rec.centre.id);
                  onNavigate(`/farmer/book-slot?centreId=${rec.centre.id}`);
                }}
                onViewDetails={() => {
                  onSelectCentre(rec.centre.id);
                  onNavigate(`/farmer/centre-details?centreId=${rec.centre.id}`);
                }}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
