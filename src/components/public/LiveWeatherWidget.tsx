import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  CloudRain,
  CloudLightning,
  Sun,
  Cloud,
  Droplets,
  Wind,
  Compass,
  AlertTriangle,
  RefreshCw,
  Share2,
  MapPin,
  Calendar,
  Check,
  CheckCircle2,
  Sparkles,
  Trees,
} from 'lucide-react';
import {
  LiveWeatherService,
  MAHARASHTRA_DISTRICTS,
  GADCHIROLI_TALUKAS,
  ALL_LOCATIONS,
} from '../../services/LiveWeatherService';
import { LiveDistrictWeather } from '../../types';

export const LiveWeatherWidget: React.FC = () => {
  const [selectedLocationId, setSelectedLocationId] = useState('gadchiroli');
  const [viewTab, setViewTab] = useState<'gadchiroli' | 'all_districts'>('gadchiroli');
  const [weather, setWeather] = useState<LiveDistrictWeather | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const loadWeather = async (locationId: string, force = false) => {
    setIsLoading(true);
    try {
      const data = await LiveWeatherService.fetchLiveWeather(locationId, force);
      setWeather(data);
    } catch (e) {
      console.error('Failed to load live weather', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedLocationId);
  }, [selectedLocationId]);

  const handleRefresh = () => {
    loadWeather(selectedLocationId, true);
    setToastMsg('नवीनतम उपग्रह हवामान डेटा रिफ्रेश झाला!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleShareWhatsApp = () => {
    if (!weather) return;
    const url = LiveWeatherService.generateWhatsAppShareUrl(weather);
    window.open(url, '_blank');
    setToastMsg('WhatsApp शेअर लिंक उघडली!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const renderWeatherIcon = (
    iconType: LiveDistrictWeather['conditionIcon'],
    className = 'h-12 w-12'
  ) => {
    switch (iconType) {
      case 'SUN':
        return <Sun className={`${className} text-amber-500 animate-spin`} style={{ animationDuration: '20s' }} />;
      case 'PARTLY_CLOUDY':
        return <CloudSun className={`${className} text-amber-500`} />;
      case 'CLOUDY':
        return <Cloud className={`${className} text-slate-400`} />;
      case 'LIGHT_RAIN':
        return <CloudRain className={`${className} text-blue-400`} />;
      case 'HEAVY_RAIN':
        return <CloudRain className={`${className} text-blue-600`} />;
      case 'THUNDERSTORM':
        return <CloudLightning className={`${className} text-amber-400`} />;
      default:
        return <CloudSun className={`${className} text-blue-500`} />;
    }
  };

  return (
    <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950 via-slate-900 to-sky-950 text-white p-5 sm:p-7 shadow-xl space-y-6">
      {/* 1. Header & Live Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-500 px-2.5 py-0.5 text-[10px] font-black text-slate-950 uppercase tracking-wider flex items-center gap-1">
              <CloudSun className="h-3.5 w-3.5" />
              LIVE SATELLITE RADAR
            </span>
            <span className="text-xs font-bold text-emerald-300">
              गडचिरोली व महाराष्ट्र थेट हवामान अंदाज
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white mt-1 font-serif">
            🌦️ गडचिरोली व सर्व १२ तालुके थेट हवामान आणि पाऊस रडार
          </h3>
        </div>

        {/* Live Refresh Button */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-emerald-500/30 px-3.5 py-2 text-xs font-bold text-emerald-300 transition-all cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>{isLoading ? 'अपडेट होत आहे...' : 'थेट डेटा रिफ्रेश'}</span>
        </button>
      </div>

      {/* 2. Mode Selector: Gadchiroli Talukas vs All Maharashtra */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-emerald-500/30">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setViewTab('gadchiroli');
              setSelectedLocationId('gadchiroli_hq');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              viewTab === 'gadchiroli'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Trees className="h-3.5 w-3.5" />
            <span>🌲 गडचिरोली जिल्हा व सर्व १२ तालुके</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setViewTab('all_districts');
              setSelectedLocationId('pune');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              viewTab === 'all_districts'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>महाराष्ट्र प्रमुख जिल्हे</span>
          </button>
        </div>

        {/* Full Location Dropdown */}
        <select
          value={selectedLocationId}
          onChange={(e) => setSelectedLocationId(e.target.value)}
          className="rounded-xl border border-emerald-500/40 bg-slate-800 px-3 py-1.5 text-xs font-bold text-white focus:outline-hidden"
        >
          <optgroup label="🌲 गडचिरोली जिल्हा व तालुके">
            {GADCHIROLI_TALUKAS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameMr}
              </option>
            ))}
          </optgroup>
          <optgroup label="📍 महाराष्ट्र इतर प्रमुख जिल्हे">
            {MAHARASHTRA_DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameMr} ({d.region})
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* 3. Quick Pills for Active View Tab */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {viewTab === 'gadchiroli' ? (
            // All 12 Gadchiroli Talukas Pills
            GADCHIROLI_TALUKAS.map((t) => {
              const isSelected = selectedLocationId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedLocationId(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-300/50'
                      : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  {t.nameMr}
                </button>
              );
            })
          ) : (
            // Maharashtra Districts Pills
            MAHARASHTRA_DISTRICTS.map((d) => {
              const isSelected = selectedLocationId === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedLocationId(d.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500 text-slate-950 shadow-md ring-2 ring-sky-300/50'
                      : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  {d.nameMr}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Main Live Telemetry Card */}
      {weather && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* Left Box: Current Temperature & Condition (7 Cols) */}
            <div className="md:col-span-7 rounded-2xl bg-slate-900/90 border border-emerald-500/30 p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-black text-white">
                      {weather.districtName}
                    </span>
                    <span className="rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 border border-emerald-500/30">
                      {weather.region}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-emerald-200 mt-1">
                    {weather.conditionText}
                  </p>
                </div>

                <div className="flex items-center justify-center p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/20 shadow-inner">
                  {renderWeatherIcon(weather.conditionIcon, 'h-12 w-12 sm:h-14 sm:w-14')}
                </div>
              </div>

              {/* Temperature & Feels Like */}
              <div className="flex items-baseline gap-4 pt-2">
                <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                  {weather.temperature}°C
                </span>
                <div className="text-xs text-slate-300 space-y-0.5">
                  <div>जाणवणारे तापमान: <strong>{weather.apparentTemperature}°C</strong></div>
                  <div className="text-[11px] text-slate-400">
                    अपडेट: {weather.updatedAt}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box: Key Metrics (5 Cols) */}
            <div className="md:col-span-5 grid grid-cols-3 md:grid-cols-1 gap-2.5">
              {/* Rain Chance */}
              <div className="rounded-2xl bg-slate-900/80 border border-emerald-500/20 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                    <Droplets className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">पाऊस शक्यता</span>
                    <span className="text-xs sm:text-sm font-black text-blue-300 font-mono">
                      {weather.rainProbability}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Humidity */}
              <div className="rounded-2xl bg-slate-900/80 border border-emerald-500/20 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
                    <Droplets className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">आर्द्रता (Humidity)</span>
                    <span className="text-xs sm:text-sm font-black text-teal-300 font-mono">
                      {weather.humidity}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Wind Speed */}
              <div className="rounded-2xl bg-slate-900/80 border border-emerald-500/20 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Wind className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">वाऱ्याचा वेग</span>
                    <span className="text-xs sm:text-sm font-black text-amber-300 font-mono">
                      {weather.windSpeed} km/h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. IMD Monsoon Advisory Alert Banner */}
          {weather.alertMessage && (
            <div
              className={`rounded-2xl p-4 flex items-start gap-3 border ${
                weather.alertSeverity === 'RED'
                  ? 'bg-red-950/70 border-red-500/80 text-red-200'
                  : weather.alertSeverity === 'ORANGE'
                  ? 'bg-amber-950/70 border-amber-500/80 text-amber-200'
                  : 'bg-yellow-950/60 border-yellow-500/60 text-yellow-200'
              }`}
            >
              <AlertTriangle
                className={`h-5 w-5 shrink-0 mt-0.5 ${
                  weather.alertSeverity === 'RED'
                    ? 'text-red-400 animate-bounce'
                    : 'text-amber-400'
                }`}
              />
              <div>
                <span className="text-xs sm:text-sm font-black block">
                  {weather.alertMessage}
                </span>
                <span className="text-[11px] opacity-80 mt-0.5 block">
                  शेतकरी बांधवांनी पिकांच्या संरक्षणासाठी व फवारणीसाठी वरील अंदाजाची नोंद घ्यावी.
                </span>
              </div>
            </div>
          )}

          {/* 6. 5-Day Real Forecast Cards */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" />
              <span>पुढील ५ दिवसांचा थेट हवामान अंदाज (5-Day Real-Time Forecast):</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {weather.dailyForecast.map((day, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/70 border border-emerald-500/20 p-3 text-center space-y-1 hover:border-emerald-400/50 transition-all"
                >
                  <span className="text-xs font-black text-emerald-200 block">
                    {day.dayName}
                  </span>
                  <div className="flex justify-center py-1">
                    {day.rainProbability > 50 ? (
                      <CloudRain className="h-6 w-6 text-blue-400" />
                    ) : day.rainProbability > 25 ? (
                      <CloudSun className="h-6 w-6 text-amber-400" />
                    ) : (
                      <Sun className="h-6 w-6 text-amber-500" />
                    )}
                  </div>
                  <div className="text-xs font-mono font-bold text-white">
                    {day.tempMax}° / {day.tempMin}°
                  </div>
                  <span className="text-[10px] text-blue-300 font-bold block">
                    💧 {day.rainProbability}% पाऊस
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 7. Footer: WhatsApp Share & Source Attribution */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-emerald-500/20 text-xs">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>{weather.source}</span>
            </span>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 px-5 py-2.5 font-black text-white shadow-md transition-all cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>हा हवामान अंदाज WhatsApp वर शेअर करा</span>
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-slideUp">
          <Check className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
