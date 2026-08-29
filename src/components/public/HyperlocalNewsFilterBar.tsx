import React, { useState, useMemo } from 'react';
import {
  MapPin,
  ChevronRight,
  Filter,
  X,
  Compass,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  DistrictInfo,
  MAHARASHTRA_DISTRICTS,
  GADCHIROLI_TALUKAS,
  TalukaInfo,
} from '../../data/maharashtraDistricts';
import { HyperlocalNewsService } from '../../services/HyperlocalNewsService';
import { Post } from '../../types';

interface HyperlocalNewsFilterBarProps {
  posts: Post[];
  selectedDistrictId: string | null;
  selectedTalukaId: string | null;
  onSelectDistrict: (districtId: string | null) => void;
  onSelectTaluka: (talukaId: string | null) => void;
  onResetFilter: () => void;
}

export const HyperlocalNewsFilterBar: React.FC<HyperlocalNewsFilterBarProps> = ({
  posts,
  selectedDistrictId,
  selectedTalukaId,
  onSelectDistrict,
  onSelectTaluka,
  onResetFilter,
}) => {
  const [isMoreDistrictsOpen, setIsMoreDistrictsOpen] = useState(false);

  const activeDistrict = useMemo(
    () =>
      selectedDistrictId
        ? MAHARASHTRA_DISTRICTS.find((d) => d.id === selectedDistrictId)
        : null,
    [selectedDistrictId]
  );

  const activeTaluka = useMemo(() => {
    if (!activeDistrict || !selectedTalukaId) return null;
    return activeDistrict.talukas.find((t) => t.id === selectedTalukaId);
  }, [activeDistrict, selectedTalukaId]);

  // Priority districts shown directly in the pill bar
  const priorityDistricts = useMemo(() => {
    return MAHARASHTRA_DISTRICTS.slice(0, 10);
  }, []);

  const otherDistricts = useMemo(() => {
    return MAHARASHTRA_DISTRICTS.slice(10);
  }, []);

  const filteredCount = useMemo(() => {
    return HyperlocalNewsService.filterPosts(
      posts,
      selectedDistrictId,
      selectedTalukaId
    ).length;
  }, [posts, selectedDistrictId, selectedTalukaId]);

  const isFilterActive = Boolean(selectedDistrictId && selectedDistrictId !== 'ALL');

  return (
    <div className="my-6 rounded-3xl border border-red-200/90 bg-gradient-to-br from-red-50/50 via-white to-amber-50/40 p-4 sm:p-6 shadow-sm space-y-4">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white font-bold shadow-sm">
            <MapPin className="h-5 w-5 animate-bounce-subtle" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>जिल्हा व तालुका विशेष स्थानिक बातम्या</span>
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-black text-red-700 uppercase tracking-wider">
                Hyperlocal News
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              आपल्या जिल्ह्याच्या व गडचिरोलीच्या सर्व १२ तालुक्यांच्या घडामोडी १-क्लिकमध्ये
            </p>
          </div>
        </div>

        {/* Active Filter Clear Tag */}
        {isFilterActive && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-red-600 text-white px-3 py-1 text-xs font-bold shadow-xs">
              <MapPin className="h-3 w-3" />
              <span>
                {activeDistrict?.nameMr}
                {activeTaluka ? ` > ${activeTaluka.nameMr}` : ''}
              </span>
              <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
                {filteredCount} बातम्या
              </span>
              <button
                type="button"
                onClick={onResetFilter}
                className="ml-1 hover:bg-white/30 rounded-full p-0.5 transition-colors cursor-pointer"
                title="फिल्टर काढा"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <button
              type="button"
              onClick={onResetFilter}
              className="text-xs font-bold text-slate-500 hover:text-red-600 underline cursor-pointer"
            >
              सर्व बातम्या पहा
            </button>
          </div>
        )}
      </div>

      {/* 2. District Quick Selectors */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* All Maharashtra */}
        <button
          type="button"
          onClick={() => {
            onSelectDistrict(null);
            onSelectTaluka(null);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            !selectedDistrictId || selectedDistrictId === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm font-black'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>🌟 सर्व महाराष्ट्र</span>
        </button>

        {/* Priority District Pills */}
        {priorityDistricts.map((district) => {
          const isSelected = selectedDistrictId === district.id;
          const isGadchiroli = district.id === 'gadchiroli';

          return (
            <button
              key={district.id}
              type="button"
              onClick={() => {
                if (isSelected) {
                  onSelectDistrict(null);
                  onSelectTaluka(null);
                } else {
                  onSelectDistrict(district.id);
                  onSelectTaluka(null);
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? isGadchiroli
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md font-black ring-2 ring-red-400'
                    : 'bg-red-600 text-white shadow-sm font-black'
                  : isGadchiroli
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black hover:bg-amber-200'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-red-50 hover:border-red-200'
              }`}
            >
              <span>{isGadchiroli ? '🚩' : '📍'}</span>
              <span>{district.nameMr}</span>
              {isGadchiroli && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white text-red-700'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  १२ तालुके
                </span>
              )}
            </button>
          );
        })}

        {/* Other Districts Dropdown */}
        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => setIsMoreDistrictsOpen(!isMoreDistrictsOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 whitespace-nowrap cursor-pointer"
          >
            <span>इतर जिल्हे ({otherDistricts.length})</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isMoreDistrictsOpen && (
            <div className="absolute left-0 mt-2 w-64 max-h-72 overflow-y-auto rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 z-50 animate-scaleUp text-xs">
              <span className="text-[10px] font-black uppercase text-slate-400 px-2.5 py-1 block">
                महाराष्ट्र जिल्हे निवडा
              </span>
              <div className="space-y-1 mt-1">
                {otherDistricts.map((dist) => (
                  <button
                    key={dist.id}
                    type="button"
                    onClick={() => {
                      onSelectDistrict(dist.id);
                      onSelectTaluka(null);
                      setIsMoreDistrictsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      selectedDistrictId === dist.id
                        ? 'bg-red-50 text-red-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>📍 {dist.nameMr}</span>
                    <span className="text-[10px] text-slate-400">
                      {dist.divisionMr.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. TALUKA SUB-BAR (If Gadchiroli or Any District is Selected) */}
      {activeDistrict && activeDistrict.talukas.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-white border border-red-200/90 shadow-2xs space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span className="text-red-600">🚩</span>
              <span>{activeDistrict.nameMr} जिल्ह्यातील तालुके ({activeDistrict.talukas.length} तालुके):</span>
            </span>

            {selectedTalukaId && (
              <button
                type="button"
                onClick={() => onSelectTaluka(null)}
                className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
              >
                सर्व तालुके दाखवा
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {/* All Talukas Pill */}
            <button
              type="button"
              onClick={() => onSelectTaluka(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                !selectedTalukaId
                  ? 'bg-red-600 text-white shadow-xs font-black'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              सर्व {activeDistrict.talukas.length} तालुके
            </button>

            {/* Individual Taluka Pills */}
            {activeDistrict.talukas.map((taluka) => {
              const isTalukaSelected = selectedTalukaId === taluka.id;
              return (
                <button
                  key={taluka.id}
                  type="button"
                  onClick={() => {
                    if (isTalukaSelected) {
                      onSelectTaluka(null);
                    } else {
                      onSelectTaluka(taluka.id);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                    isTalukaSelected
                      ? 'bg-red-600 text-white shadow-xs font-black'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-red-50 hover:border-red-200'
                  }`}
                >
                  <span>📍</span>
                  <span>{taluka.nameMr}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
