import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Zap,
  CheckCircle,
  ShieldCheck,
  Globe,
  Settings,
  Layers,
  Sparkles,
  QrCode,
  Share2,
  TrendingUp,
  RotateCcw,
  Save,
  Check,
} from 'lucide-react';

export const PWAManagerView: React.FC = () => {
  const [appName, setAppName] = useState('InfoNewsUpdate24 - मराठी डिजिटल वृत्तपत्र');
  const [shortName, setShortName] = useState('InfoNewsUpdate24');
  const [themeColor, setThemeColor] = useState('#dc2626');
  const [bgColor, setBgColor] = useState('#0f172a');
  const [offlineMessage, setOfflineMessage] = useState(
    '⚠️ आपण ऑफलाइन आहात. आधी वाचलेल्या बातम्या आपण वाचू शकता.'
  );
  const [toastMsg, setToastMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg('✅ PWA मोबाईल ॲप सेटिंग्ज सेव्ह झाल्या!');
    setTimeout(() => setToastMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-red-100 px-2.5 py-0.5 text-[11px] font-black text-red-700 uppercase tracking-wider">
              PWA App Engine Pro
            </span>
            <span className="text-xs font-bold text-slate-500">Play-Store Free App</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            मोबाईल ॲप व्यवस्थापन (PWA App Manager)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            प्ले-स्टोअरच्या खर्चाशिवाय वाचकांच्या मोबाईलवर थेट InfoNewsUpdate24 ॲप इन्स्टॉल करा आणि ऑफलाइन वाचन द्या.
          </p>
        </div>
      </div>

      {/* 2. Key Telemetry Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              मोबाईल ॲप इन्स्टॉलेशन्स
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 font-bold">
              <Smartphone className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">१८,४५०</p>
          <span className="text-[11px] font-medium text-emerald-600">
            वाचकांच्या मोबाईल होम स्क्रीनवर सक्रिय
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              ॲप इन्स्टॉल दर (Conversion)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">२६.८%</p>
          <span className="text-[11px] font-medium text-blue-600">
            नवीन वाचकांपैकी ४ पैकी १ जण ॲप जोडतो
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              ऑफलाइन वाचन सत्रे
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">१२,३२०</p>
          <span className="text-[11px] font-medium text-amber-600">
            Service Worker कॅश द्वारे वाचल्या
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              गुगल PWA स्कोअर
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">१०० / १००</p>
          <span className="text-[11px] font-medium text-emerald-600">
            Lighthouse Certified Standalone
          </span>
        </div>
      </div>

      {/* 3. PWA Health Checklist */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <span>PWA तांत्रिक तपासणी अहवाल (System Health Checklist)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-950">Web App Manifest</h4>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                manifest.json योग्यरित्या लोड झाले आहे.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-950">Service Worker (sw.js)</h4>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                कॅशिंग व ऑफलाइन नेव्हिगेशन सक्रिय आहे.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-950">App Icons (192 & 512px)</h4>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                हाय-रिझोल्युशन मास्किएबल आयकॉन्स तयार आहेत.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Settings Form & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Settings className="h-5 w-5 text-red-600" />
              <span>मोबाईल ॲप ब्रँडिंग सेटिंग्ज (App Configuration)</span>
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                ॲपचे पूर्ण नाव (Full App Name):
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 focus:border-red-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                मोबाईल होम स्क्रीनवरील लहान नाव (Short Name):
              </label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 focus:border-red-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  थीम रंग (Theme Color - Header Bar):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="h-10 w-12 rounded-lg border border-slate-300 cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 p-2.5 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  बॅकग्राउंड रंग (Splash Screen Background):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-10 w-12 rounded-lg border border-slate-300 cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 p-2.5 font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                ऑफलाइन सूचना संदेश (Offline Banner Text):
              </label>
              <input
                type="text"
                value={offlineMessage}
                onChange={(e) => setOfflineMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-red-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-200 transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>PWA सेटिंग्ज सेव्ह करा</span>
            </button>
          </div>
        </form>

        {/* Right App Icon & Mobile Showcase */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 text-center">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              मोबाईल स्क्रीनवरील ॲप आयकॉन व्ह्यू
            </h4>

            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 text-white space-y-3">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-red-600 to-red-800 p-3 shadow-2xl ring-4 ring-red-500/30 flex items-center justify-center border border-amber-300/40">
                <img src="/icon-192.svg" alt="App Icon" className="h-full w-full object-contain" />
              </div>
              <div>
                <span className="font-bold text-sm block">{shortName}</span>
                <span className="text-[10px] text-slate-400">Standalone PWA App</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1">
              <span className="font-bold text-slate-900 block">💡 PWA चा सर्वात मोठा फायदा:</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                गुगल प्ले-स्टोअरला दरवर्षी २५ डॉलर (₹२,०००+) फी द्यावी लागत नाही आणि गुगलचे ३०% कमिशन लागत नाही.
              </p>
            </div>
          </div>
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
