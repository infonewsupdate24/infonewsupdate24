import React, { useState } from 'react';
import {
  Trophy,
  Wheat,
  Plus,
  Trash2,
  Save,
  Check,
  Zap,
  RotateCcw,
  ShieldCheck,
  Eye,
  EyeOff,
  Calendar,
} from 'lucide-react';
import { CricketMatchScore, APMCMandiRate } from '../../types';
import { LiveScoreAndMandiService } from '../../services/LiveScoreAndMandiService';

export const LiveCricketAndMandiManagerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mandi' | 'cricket'>('mandi');
  const [isCricketBarEnabled, setIsCricketBarEnabled] = useState<boolean>(() =>
    LiveScoreAndMandiService.isCricketBarEnabled()
  );
  const [matches, setMatches] = useState<CricketMatchScore[]>(() =>
    LiveScoreAndMandiService.getMatches()
  );
  const [mandiRates, setMandiRates] = useState<APMCMandiRate[]>(() =>
    LiveScoreAndMandiService.getMandiRates()
  );

  const [toastMsg, setToastMsg] = useState('');

  // Active Match Form State
  const activeMatch = matches[0];
  const [isMatchLive, setIsMatchLive] = useState<boolean>(activeMatch?.isLive || false);
  const [matchTitle, setMatchTitle] = useState(activeMatch?.matchTitle || 'भारत वि. न्यूझीलंड');
  const [team1Name, setTeam1Name] = useState(activeMatch?.team1.name || 'भारत');
  const [team1Score, setTeam1Score] = useState(activeMatch?.team1.score || 'आगामी सामना');
  const [team2Name, setTeam2Name] = useState(activeMatch?.team2.name || 'न्यूझीलंड');
  const [team2Score, setTeam2Score] = useState(activeMatch?.team2.score || 'सायंकाळी ७:०० वा.');
  const [matchStatus, setMatchStatus] = useState(
    activeMatch?.currentStatus || 'सध्या कोणताही सामना चालू नाही • पुढील सामना सायंकाळी ७:०० वाजता सुरू होईल'
  );

  // New Mandi Rate State
  const [isAddRateModalOpen, setIsAddRateModalOpen] = useState(false);
  const [newCommodity, setNewCommodity] = useState('');
  const [newMandi, setNewMandi] = useState('');
  const [newCategory, setNewCategory] = useState<APMCMandiRate['category']>('VEGETABLES');
  const [newMinRate, setNewMinRate] = useState(2000);
  const [newMaxRate, setNewMaxRate] = useState(3000);
  const [newAvgRate, setNewAvgRate] = useState(2500);

  const handleToggleCricketBar = (val: boolean) => {
    setIsCricketBarEnabled(val);
    LiveScoreAndMandiService.setCricketBarEnabled(val);
    setToastMsg(val ? '✅ क्रिकेट बार पोर्टलवर सक्रिय केला!' : 'क्रिकेट बार पोर्टलवरून लपवला.');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleSaveCricketSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = LiveScoreAndMandiService.updateMatch(activeMatch.id, {
      matchTitle,
      isLive: isMatchLive,
      team1: { ...activeMatch.team1, name: team1Name, score: team1Score },
      team2: { ...activeMatch.team2, name: team2Name, score: team2Score },
      currentStatus: matchStatus,
    });
    setMatches(updated);
    setToastMsg('✅ क्रिकेट माहिती यशस्वीरीत्या सेव्ह झाली!');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleResetToUpcoming = () => {
    const updated = LiveScoreAndMandiService.resetToUpcomingMatch();
    setMatches(updated);
    setIsMatchLive(false);
    setTeam1Score('आगामी सामना');
    setTeam2Score('सायंकाळी ७:०० वा.');
    setMatchStatus('सध्या कोणताही सामना चालू नाही • पुढील सामना सायंकाळी ७:०० वाजता सुरू होईल');
    setToastMsg('क्रिकेट बार आगामी सामन्यावर रिसेट झाला (कोणताही बनावट स्कोअर नाही).');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleResetMandiRates = () => {
    const updated = LiveScoreAndMandiService.resetToOfficialDailyRates();
    setMandiRates(updated);
    setToastMsg('२९ ऑगस्ट २०२६ चे अधिकृत MSAMB दैनिक दर रिसेट झाले!');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleAddMandiRate = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = LiveScoreAndMandiService.addMandiRate({
      commodityName: newCommodity,
      category: newCategory,
      mandiName: newMandi,
      minRate: newMinRate,
      maxRate: newMaxRate,
      avgRate: newAvgRate,
      unit: newCategory === 'METALS' ? 'रु. प्रति १० ग्रॅम' : 'रु. प्रति क्विंटल',
      trend: 'STABLE',
      changeAmount: 0,
      updatedAt: '२९ ऑगस्ट २०२६ (अधिकृत दैनिक लिलाव दर)',
    });
    setMandiRates(updated);
    setIsAddRateModalOpen(false);
    setToastMsg(`✅ ${newCommodity} चा अधिकृत बाजारभाव जोडला गेला!`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleDeleteMandiRate = (id: string) => {
    if (confirm('हा बाजारभाव हटवायचा आहे का?')) {
      const updated = LiveScoreAndMandiService.deleteMandiRate(id);
      setMandiRates(updated);
      setToastMsg('बाजारभाव हटवला.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              अधिकृत दैनिक डेटा मॅनेजर
            </span>
            <span className="text-xs font-bold text-slate-500">२९ ऑगस्ट २०२६</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            लाईव्ह क्रिकेट व कृषी बाजारभाव व्यवस्थापन
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            कोणताही बनावट डेटा न दाखवता खऱ्या चालू सामन्यांची माहिती आणि महाराष्ट्रातील कृषी उत्पन्न बाजार समित्यांचे अधिकृत भाव नियंत्रित करा.
          </p>
        </div>

        {activeTab === 'mandi' ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetMandiRates}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>आजचे MSAMB दर लोड करा</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddRateModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-3.5 py-2 text-xs font-bold text-white shadow-md transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>नवीन बाजारभाव जोडा</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToUpcoming}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>आगामी सामन्यावर रिसेट करा</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('cricket')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
            activeTab === 'cricket'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>🏏 क्रिकेट मॅच व्यवस्थापक (Cricket Match Manager)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mandi')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
            activeTab === 'mandi'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Wheat className="h-4 w-4" />
          <span>🌾 कृषी बाजारभाव व सराफ दर (APMC Daily Rates)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CRICKET CONTROLLER */}
      {/* ========================================================================= */}
      {activeTab === 'cricket' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            {/* Strip Visibility Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  {isCricketBarEnabled ? <Eye className="h-5 w-5 text-emerald-600" /> : <EyeOff className="h-5 w-5 text-slate-400" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    वेबसाईटवर क्रिकेट हेडर बार दाखवायचा का?
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    मॅच नसताना हा बार बंद ठेवू शकता किंवा आगामी सामन्याची माहिती दाखवू शकता.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                <input
                  type="checkbox"
                  checked={isCricketBarEnabled}
                  onChange={(e) => handleToggleCricketBar(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <form
              onSubmit={handleSaveCricketSettings}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4"
            >
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-red-600" />
                  <span>क्रिकेट मॅच स्थिती व स्कोअर सेटिंग्ज</span>
                </h3>
              </div>

              {/* Match Mode Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <label className="font-bold text-slate-900 block">
                  सामन्याची खरी स्थिती (Match Status):
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMatchLive(false);
                      setTeam1Score('आगामी सामना');
                      setTeam2Score('सायंकाळी ७:०० वा.');
                      setMatchStatus('सध्या कोणताही सामना चालू नाही • पुढील सामना सायंकाळी ७:०० वाजता सुरू होईल');
                    }}
                    className={`p-3 rounded-xl border font-bold text-left transition-all cursor-pointer ${
                      !isMatchLive
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-xs">📅 चालू सामना नाही (Upcoming)</span>
                    <span className="text-[10px] font-normal text-slate-500">
                      वाचकांना आगामी सामन्याची तारीख/वेळ दिसेल
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMatchLive(true);
                      setTeam1Score('१४२/२ (१५.०)');
                      setTeam2Score('१४०/८ (२०.०)');
                      setMatchStatus('भारताचा डाव चालू');
                    }}
                    className={`p-3 rounded-xl border font-bold text-left transition-all cursor-pointer ${
                      isMatchLive
                        ? 'border-red-600 bg-red-50 text-red-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-xs">🔴 थेट सामना चालू आहे (Live Match)</span>
                    <span className="text-[10px] font-normal text-slate-500">
                      वास्तविक चालू सामन्याचा स्कोअर दिसेल
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    सामन्याचे नाव / शीर्षक (Tournament/Series):
                  </label>
                  <input
                    type="text"
                    value={matchTitle}
                    onChange={(e) => setMatchTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">संघ १ (Team 1):</label>
                    <input
                      type="text"
                      value={team1Name}
                      onChange={(e) => setTeam1Name(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2 text-slate-900"
                    />
                    <input
                      type="text"
                      value={team1Score}
                      onChange={(e) => setTeam1Score(e.target.value)}
                      placeholder="उदा. आगामी सामना किंवा १८०/४"
                      className="w-full mt-2 rounded-lg border border-slate-300 p-2 font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">संघ २ (Team 2):</label>
                    <input
                      type="text"
                      value={team2Name}
                      onChange={(e) => setTeam2Name(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2 text-slate-900"
                    />
                    <input
                      type="text"
                      value={team2Score}
                      onChange={(e) => setTeam2Score(e.target.value)}
                      placeholder="उदा. सायंकाळी ७:०० वा."
                      className="w-full mt-2 rounded-lg border border-slate-300 p-2 font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    स्थिती संदेश (Status Text):
                  </label>
                  <input
                    type="text"
                    value={matchStatus}
                    onChange={(e) => setMatchStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-200 transition-all cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>माहिती सेव्ह करा</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                वेबसाईट हेडरवरील प्रिव्ह्यू
              </h4>

              <div className="rounded-2xl bg-slate-900 text-white p-4 shadow-xl border border-slate-700 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${isMatchLive ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-amber-400'}`}>
                    {isMatchLive ? 'LIVE' : 'UPCOMING'}
                  </span>
                  <span className="text-slate-300 font-bold">{matchTitle}</span>
                </div>

                <div className="flex items-center justify-between text-sm pt-1">
                  <span>{team1Name}: <strong className="font-mono text-slate-300">{team1Score}</strong></span>
                  <span>{team2Name}: <strong className="font-mono text-amber-400">{team2Score}</strong></span>
                </div>

                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  {matchStatus}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: APMC MANDI RATES CONTROLLER */}
      {/* ========================================================================= */}
      {activeTab === 'mandi' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wheat className="h-5 w-5 text-amber-600" />
              <span>२९ ऑगस्ट २०२६ चे अधिकृत कृषी बाजारभाव ({mandiRates.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">पिक / कमोडिटी</th>
                  <th className="p-3">बाजार समिती (Mandi)</th>
                  <th className="p-3">किमान भाव</th>
                  <th className="p-3">कमाल भाव</th>
                  <th className="p-3">सरासरी भाव</th>
                  <th className="p-3">तारीख / संदर्भ</th>
                  <th className="p-3 text-right">कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mandiRates.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{r.commodityName}</td>
                    <td className="p-3 text-slate-600">{r.mandiName}</td>
                    <td className="p-3 font-mono">₹{r.minRate.toLocaleString('mr-IN')}</td>
                    <td className="p-3 font-mono">₹{r.maxRate.toLocaleString('mr-IN')}</td>
                    <td className="p-3 font-mono font-bold text-amber-900">
                      ₹{r.avgRate.toLocaleString('mr-IN')}
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">{r.updatedAt}</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteMandiRate(r.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                        title="हटवा"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Mandi Rate Modal */}
      {isAddRateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wheat className="h-5 w-5 text-amber-600" />
                <span>नवीन अधिकृत बाजारभाव प्रविष्ट करा</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddRateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMandiRate} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">पिकाचे नाव:</label>
                <input
                  type="text"
                  required
                  value={newCommodity}
                  onChange={(e) => setNewCommodity(e.target.value)}
                  placeholder="उदा. कांदा (उन्हाळ), सोयाबीन"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">वर्गवारी:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-800"
                  >
                    <option value="VEGETABLES">भाजीपाला / कांदा</option>
                    <option value="OILSEEDS">सोयाबीन व कापूस</option>
                    <option value="GRAINS">धान्य व कडधान्य</option>
                    <option value="METALS">सोने-चांदी सराफ भाव</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">बाजार समिती (Mandi):</label>
                  <input
                    type="text"
                    required
                    value={newMandi}
                    onChange={(e) => setNewMandi(e.target.value)}
                    placeholder="उदा. लासलगाव APMC"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">किमान भाव:</label>
                  <input
                    type="number"
                    value={newMinRate}
                    onChange={(e) => setNewMinRate(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">कमाल भाव:</label>
                  <input
                    type="number"
                    value={newMaxRate}
                    onChange={(e) => setNewMaxRate(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">सरासरी भाव:</label>
                  <input
                    type="number"
                    value={newAvgRate}
                    onChange={(e) => setNewAvgRate(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-mono font-bold text-amber-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRateModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 font-bold"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-5 py-2 text-white font-bold hover:bg-amber-700 shadow-md cursor-pointer"
                >
                  बाजारभाव प्रकाशित करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
