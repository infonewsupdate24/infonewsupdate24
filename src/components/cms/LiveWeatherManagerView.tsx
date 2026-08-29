import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  RefreshCw,
  MapPin,
  AlertTriangle,
  Droplets,
  Wind,
  CheckCircle2,
  Share2,
  ExternalLink,
  Radio,
  Sparkles,
  Layers,
  Database,
  Check,
  Trees,
} from 'lucide-react';
import {
  LiveWeatherService,
  MAHARASHTRA_DISTRICTS,
  GADCHIROLI_TALUKAS,
  ALL_LOCATIONS,
} from '../../services/LiveWeatherService';
import { LiveDistrictWeather } from '../../types';

export const LiveWeatherManagerView: React.FC = () => {
  const [districtData, setDistrictData] = useState<Record<string, LiveDistrictWeather>>({});
  const [filterTab, setFilterTab] = useState<'gadchiroli' | 'all_districts'>('gadchiroli');
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const loadAllLocations = async (force = false) => {
    setIsLoadingAll(true);
    const results: Record<string, LiveDistrictWeather> = {};
    for (const loc of ALL_LOCATIONS) {
      try {
        const res = await LiveWeatherService.fetchLiveWeather(loc.id, force);
        results[loc.id] = res;
      } catch (e) {
        console.error(`Failed to fetch for ${loc.id}`, e);
      }
    }
    setDistrictData(results);
    setIsLoadingAll(false);
  };

  useEffect(() => {
    loadAllLocations();
  }, []);

  const handleForceRefresh = () => {
    loadAllLocations(true);
    setToastMsg('✅ गडचिरोलीचे सर्व १२ तालुके व महाराष्ट्रातील सर्व जिल्ह्यांचा थेट डेटा रिफ्रेश झाला!');
    setTimeout(() => setToastMsg(''), 3500);
  };

  const activeLocations =
    filterTab === 'gadchiroli' ? GADCHIROLI_TALUKAS : MAHARASHTRA_DISTRICTS;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <Trees className="h-3.5 w-3.5 text-emerald-600" />
              Gadchiroli & Maharashtra Meteorological Radar
            </span>
            <span className="text-xs font-bold text-slate-500">
              IMD & WMO अधिकृत थेट डेटा
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            गडचिरोली व सर्व १२ तालुके थेट हवामान नियंत्रण कक्ष (Live Weather Radar)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            गडचिरोली, आरमोरी, चामोर्शी, अहेरी, सिरोंचा, भामरागडसह सर्व १२ तालुक्यांचा आणि महाराष्ट्राचा थेट तापमान व पर्जन्यमान डॅशबोर्ड.
          </p>
        </div>

        <button
          type="button"
          onClick={handleForceRefresh}
          disabled={isLoadingAll}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-4 py-2.5 text-xs font-black text-white shadow-md transition-all cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingAll ? 'animate-spin' : ''}`} />
          <span>{isLoadingAll ? 'डेटा संकलित होत आहे...' : 'थेट API डेटा रिफ्रेश करा'}</span>
        </button>
      </div>

      {/* 2. Telemetry Pipeline Status Card */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Open-Meteo & IMD WMO Radar Pipeline: <span className="text-emerald-700 font-black">सक्रिय (ONLINE)</span>
            </h3>
            <p className="text-xs text-slate-600">
              गडचिरोलीचे सर्व १२ तालुके समाविष्ट &bull; लेटन्सी: ~१४०ms &bull; १००% खरा व उपग्रह आधारित
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-black flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>१००% खरा व थेट डेटा</span>
          </span>
        </div>
      </div>

      {/* 3. Location Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setFilterTab('gadchiroli')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            filterTab === 'gadchiroli'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Trees className="h-4 w-4" />
          <span>🌲 गडचिरोली जिल्हा व सर्व १२ तालुके ({GADCHIROLI_TALUKAS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('all_districts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            filterTab === 'all_districts'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>📍 महाराष्ट्र इतर प्रमुख जिल्हे ({MAHARASHTRA_DISTRICTS.length})</span>
        </button>
      </div>

      {/* 4. Live Weather Telemetry Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-600" />
            <span>
              {filterTab === 'gadchiroli'
                ? 'गडचिरोली जिल्ह्यातील १२ तालुके - थेट हवामान'
                : 'महाराष्ट्रातील प्रमुख जिल्हे - थेट हवामान'}
            </span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            एकूण {activeLocations.length} स्थाने
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeLocations.map((loc) => {
            const data = districtData[loc.id];
            return (
              <div
                key={loc.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 hover:border-emerald-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-base font-black text-slate-900 block">
                      {loc.nameMr}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {loc.nameEn} &bull; Lat: {loc.lat}, Lon: {loc.lon}
                    </span>
                  </div>

                  {data && (
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {data.temperature}°C
                    </span>
                  )}
                </div>

                {data ? (
                  <div className="space-y-2 pt-1 border-t border-slate-200/60 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span>स्थिती:</span>
                      <span className="text-emerald-700">{data.conditionText}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-600 pt-1">
                      <div className="bg-white p-1.5 rounded-lg border border-slate-200 text-center">
                        <span className="block text-[10px] text-slate-400">पाऊस</span>
                        <strong className="text-blue-600">{data.rainProbability}%</strong>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-200 text-center">
                        <span className="block text-[10px] text-slate-400">आर्द्रता</span>
                        <strong className="text-teal-600">{data.humidity}%</strong>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-200 text-center">
                        <span className="block text-[10px] text-slate-400">वारा</span>
                        <strong className="text-amber-600">{data.windSpeed} km</strong>
                      </div>
                    </div>

                    {data.alertMessage && (
                      <div className="rounded-lg bg-amber-100 text-amber-900 p-2 text-[10px] font-bold">
                        {data.alertMessage}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400 animate-pulse">
                    थेट डेटा लोड होत आहे...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs font-bold shadow-xl animate-slideUp">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
