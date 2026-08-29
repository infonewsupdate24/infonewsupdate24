import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  Check,
  Send,
  Sparkles,
  Users,
  Smartphone,
  Flame,
  BarChart3,
  Settings,
  History,
  TrendingUp,
  RotateCcw,
  Save,
  Radio,
  ExternalLink,
  Volume2,
} from 'lucide-react';
import {
  WebPushNotificationService,
  DEFAULT_WEB_PUSH_SETTINGS,
} from '../../services/WebPushNotificationService';
import { WebPushNotification, WebPushSettings } from '../../types';
import { EPAPER_DISTRICTS } from '../../data/epaperSeedData';

export const WebPushManagerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'broadcast' | 'history' | 'settings'>('broadcast');
  const [logs, setLogs] = useState<WebPushNotification[]>(() =>
    WebPushNotificationService.getLogs()
  );
  const [settings, setSettings] = useState<WebPushSettings>(() =>
    WebPushNotificationService.getSettings()
  );

  // Broadcast Composer State
  const [pushTitle, setPushTitle] = useState('🔴 ब्रेकिंग: ');
  const [pushBody, setPushBody] = useState('');
  const [pushUrl, setPushUrl] = useState('/?mode=public');
  const [pushTopic, setPushTopic] = useState<WebPushNotification['targetTopic']>('BREAKING');
  const [pushDistrict, setPushDistrict] = useState<string>('पुणे');
  const [pushImage, setPushImage] = useState(
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80'
  );

  const [toastMsg, setToastMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) {
      alert('कृपया पुश मथळा आणि सविस्तर माहिती भरा.');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      const dispatched = WebPushNotificationService.broadcastPush(
        pushTitle,
        pushBody,
        pushUrl,
        pushTopic,
        pushTopic === 'DISTRICT' ? pushDistrict : undefined,
        pushImage
      );

      setLogs([dispatched, ...logs]);
      setIsSending(false);
      setToastMsg(`✅ ब्रेकिंग न्यूज पुश नोटिफिकेशन ${dispatched.totalSent.toLocaleString('mr-IN')} वाचकांना पाठवले गेले!`);
      setTimeout(() => setToastMsg(''), 5000);

      // Reset form
      setPushTitle('🔴 ब्रेकिंग: ');
      setPushBody('');
    }, 600);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    WebPushNotificationService.saveSettings(settings);
    setToastMsg('✅ पुश नोटिफिकेशन सेटिंग्ज सेव्ह झाल्या!');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleTestSound = () => {
    WebPushNotificationService.playBreakingAlertChime();
    setToastMsg('🎵 ब्रेकिंग अलर्ट ऑडिओ चाईम वाजला!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-red-100 px-2.5 py-0.5 text-[11px] font-black text-red-700 uppercase tracking-wider">
              Web Push Engine Pro
            </span>
            <span className="text-xs font-bold text-slate-500">Instant Breaking Alerts</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            वेब पुश व ब्रेकिंग न्यूज अलर्ट व्यवस्थापन (Web Push Hub)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            वाचकांच्या मोबाईल व कॉम्प्युटर स्क्रीनवर त्वरित ब्रेकिंग बातम्यांचे पुश नोटिफिकेशन्स पाठवा आणि ट्रॅफिक वाढवा.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestSound}
          className="flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 border border-slate-300 transition-colors cursor-pointer"
        >
          <Volume2 className="h-4 w-4 text-red-600" />
          <span>साउंड चाईम तपासा</span>
        </button>
      </div>

      {/* 2. Top Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              सक्रिय वेब पुश वाचक
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 font-bold">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">३४,८९०</p>
          <span className="text-[11px] font-medium text-emerald-600">
            +१२% नवीन सबस्क्रायबर्स या आठवड्यात
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              आज पाठवलेले अलर्ट्स
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold">
              <Flame className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">४</p>
          <span className="text-[11px] font-medium text-amber-600">सर्व ब्रेकिंग अलर्ट्स डिलिव्हर</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              सरासरी क्लिक दर (CTR)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">१८.४%</p>
          <span className="text-[11px] font-medium text-blue-600">उद्योग मानकांपेक्षा २ पट जास्त</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              डिलिव्हरी यश दर
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
              <Check className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">९९.२%</p>
          <span className="text-[11px] font-medium text-emerald-600">Chrome, Edge & Android Active</span>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
            activeTab === 'broadcast'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Send className="h-4 w-4" />
          <span>त्वरित पुश पाठवा (Send Push Alert)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className="h-4 w-4" />
          <span>पाठवलेले अलर्ट्स व आकडेवारी (History & Logs)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>पुश सेटिंग्ज व पॉपअप (Settings)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INSTANT BROADCAST COMPOSER */}
      {/* ========================================================================= */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form */}
          <form
            onSubmit={handleSendPush}
            className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4"
          >
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-600" />
                <span>नवीन ब्रेकिंग न्यूज पुश अलर्ट तयार करा</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                हा अलर्ट सर्व ३४,८००+ नोंदणीकृत वाचकांच्या मोबाईल व लॅपटॉप स्क्रीनवर थेट जाईल.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  पुश नोटिफिकेशन मथळा (Push Headline) *
                </label>
                <input
                  type="text"
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  required
                  placeholder="उदा. 🔴 ब्रेकिंग: मंत्रिमंडळाचा मोठा निर्णय..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  सविस्तर माहिती / सारांश (Push Message Excerpt) *
                </label>
                <textarea
                  rows={3}
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  required
                  placeholder="उदा. राज्यातील शेतकऱ्यांसाठी वीजबिल माफी योजना मंजूर; संपूर्ण बातमी वाचा."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    टार्गेट वर्गवारी (Target Topic):
                  </label>
                  <select
                    value={pushTopic}
                    onChange={(e) => setPushTopic(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-800 focus:border-red-500 focus:outline-hidden"
                  >
                    <option value="BREAKING">🔴 ब्रेकिंग न्यूज (सर्व वाचक)</option>
                    <option value="POLITICS">🏛️ राजकारण व महाराष्ट्र</option>
                    <option value="KRISHI">🌾 कृषी व बाजारभाव</option>
                    <option value="DISTRICT">📍 विशिष्ट जिल्हा वाचक</option>
                    <option value="ALL">🌐 सर्व साधारण बातम्या</option>
                  </select>
                </div>

                {pushTopic === 'DISTRICT' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">जिल्हा निवडा:</label>
                    <select
                      value={pushDistrict}
                      onChange={(e) => setPushDistrict(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-800 focus:border-red-500 focus:outline-hidden"
                    >
                      {EPAPER_DISTRICTS.map((d) => (
                        <option key={d.code} value={d.name.replace(' आवृत्ती', '')}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    क्लिक केल्यावर उघडणारी लिंक (Target URL):
                  </label>
                  <input
                    type="text"
                    value={pushUrl}
                    onChange={(e) => setPushUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  पुश अलर्ट इमेज URL (मोबाईल बिग-पिक्चर व्ह्यू):
                </label>
                <input
                  type="url"
                  value={pushImage}
                  onChange={(e) => setPushImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-red-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">
                🚀 १-क्लिक ब्रॉडकास्ट प्रणाली
              </span>

              <button
                type="submit"
                disabled={isSending}
                className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-200 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{isSending ? 'पाठवत आहे...' : 'आत्ताच पुश नोटिफिकेशन पाठवा'}</span>
              </button>
            </div>
          </form>

          {/* Right Live Device Mockup */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-slate-700" />
                <span>वाचकांच्या मोबाईलवर कसे दिसेल (Live Mobile Preview)</span>
              </h4>

              {/* Android / Chrome Push Card Mockup */}
              <div className="rounded-2xl bg-slate-900 text-white p-4 shadow-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    <span>InfoNewsUpdate24 &bull; Chrome</span>
                  </div>
                  <span>आत्ताच</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h5 className="font-black text-white text-xs leading-snug">
                      {pushTitle || '🔴 ब्रेकिंग न्यूज मथळा येथे दिसेल...'}
                    </h5>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      {pushBody || 'बातमीचा सविस्तर तपशील आणि महत्त्वाचे अपडेट्स येथे दिसतील...'}
                    </p>
                  </div>
                  {pushImage && (
                    <img
                      src={pushImage}
                      alt="Push thumbnail"
                      className="h-12 w-12 rounded-lg object-cover border border-slate-700 shrink-0"
                    />
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="text-red-400 font-bold">infonewsupdate24.com</span>
                  <span className="rounded bg-red-600/90 text-white px-2 py-0.5 font-bold">
                    आत्ताच वाचा &rarr;
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs space-y-1.5 text-amber-900">
              <h5 className="font-bold flex items-center gap-1.5 text-amber-950">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>पुश नोटिफिकेशन बेस्ट प्रॅक्टिसेस:</span>
              </h5>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-800">
                <li>मथळा नेहमी आकर्षक आणि संक्षिप्त (६० ते ८० अक्षरे) ठेवा.</li>
                <li>महत्त्वाच्या ब्रेकिंग बातम्यांसाठी 🔴 किंवा ⚡ इमोजी वापरा.</li>
                <li>दिवसातून ५ ते ७ पेक्षा जास्त अनपेक्षित नोटिफिकेशन्स पाठवू नका.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BROADCAST HISTORY & LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="h-5 w-5 text-red-600" />
              <span>पाठवलेले पुश अलर्ट्स व आकडेवारी (Dispatched Push Logs)</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">
              एकूण अलर्ट्स: {logs.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">मथळा व तपशील</th>
                  <th className="p-3">वर्गवारी / जिल्हा</th>
                  <th className="p-3">एकूण पाठवले</th>
                  <th className="p-3">क्लिक्स (CTR)</th>
                  <th className="p-3">वेळ</th>
                  <th className="p-3 text-right">स्थिती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const ctr = log.totalSent > 0 ? ((log.clicksCount / log.totalSent) * 100).toFixed(1) : '14.5';
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 max-w-xs">
                        <span className="font-bold text-slate-900 block truncate">
                          {log.title}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {log.body}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                          {log.targetTopic} {log.targetDistrict && `(${log.targetDistrict})`}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-800">
                        {log.totalSent.toLocaleString('mr-IN')}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-emerald-600">{ctr}%</span>
                        <span className="text-[10px] text-slate-400 block">
                          ({log.clicksCount.toLocaleString('mr-IN')} वाचकांनी उघडले)
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 whitespace-nowrap">{log.sentAt}</td>
                      <td className="p-3 text-right">
                        <span className="rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-[10px] font-black">
                          DELIVERED
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SETTINGS & POPUP CONFIG */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-red-600" />
                <span>पुश नोटिफिकेशन वर्तन व वाचक पॉपअप सेटिंग्ज</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                नवीन वाचकांना दाखवला जाणारा सबस्क्रिप्शन पॉपअप आणि साउंड अलर्ट्स नियंत्रित करा.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  पॉपअप मथळा (Prompt Title Marathi):
                </label>
                <input
                  type="text"
                  value={settings.promptTitleMarathi}
                  onChange={(e) =>
                    setSettings({ ...settings, promptTitleMarathi: e.target.value })
                  }
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  पॉपअप दिसण्याचा विलंब (Delay in Seconds):
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={settings.promptDelaySeconds}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      promptDelaySeconds: parseInt(e.target.value) || 3,
                    })
                  }
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  पॉपअप उपमथळा (Prompt Subtitle Marathi):
                </label>
                <input
                  type="text"
                  value={settings.promptSubtitleMarathi}
                  onChange={(e) =>
                    setSettings({ ...settings, promptSubtitleMarathi: e.target.value })
                  }
                  required
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-900">ऑडिओ चाईम वाजवा (Sound Alert)</h4>
                  <p className="text-[11px] text-slate-500">
                    ब्रेकिंग न्यूज पाठवल्यावर वाचकाच्या डिव्हाइसवर बातमीचा चाईम वाजेल
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowSoundAlert}
                  onChange={(e) =>
                    setSettings({ ...settings, allowSoundAlert: e.target.checked })
                  }
                  className="h-5 w-5 text-red-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-900">स्वयंचलित वाचक विनंती (Auto Prompt)</h4>
                  <p className="text-[11px] text-slate-500">
                    नवीन वाचक वेबसाईटवर आल्यावर आपोआप घंटी सबस्क्रिप्शन विचारा
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoPromptOnFirstVisit}
                  onChange={(e) =>
                    setSettings({ ...settings, autoPromptOnFirstVisit: e.target.checked })
                  }
                  className="h-5 w-5 text-red-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 sticky bottom-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl">
            <button
              type="button"
              onClick={() => setSettings(DEFAULT_WEB_PUSH_SETTINGS)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>डिफॉल्ट रिसेट</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-200 transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>पुश सेटिंग्ज सेव्ह करा (Save Settings)</span>
            </button>
          </div>
        </form>
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
