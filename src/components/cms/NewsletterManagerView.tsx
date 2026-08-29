import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Smartphone,
  Download,
  Trash2,
  Check,
  Search,
  Users,
  Send,
  Save,
  Clock,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import {
  NewsletterSubscriptionService,
  NewsletterSubscriber,
  NewsletterSettings,
  DEFAULT_NEWSLETTER_SETTINGS,
} from '../../services/NewsletterSubscriptionService';

export const NewsletterManagerView: React.FC = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(() =>
    NewsletterSubscriptionService.getSubscribers()
  );
  const [settings, setSettings] = useState<NewsletterSettings>(() =>
    NewsletterSubscriptionService.getSettings()
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'ALL' | 'EMAIL' | 'WHATSAPP'>('ALL');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isSimulatingBroadcast, setIsSimulatingBroadcast] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      const matchType = filterType === 'ALL' || sub.type === filterType;
      const matchSearch =
        !searchQuery ||
        sub.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.district.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [subscribers, filterType, searchQuery]);

  const emailCount = subscribers.filter((s) => s.type === 'EMAIL').length;
  const whatsappCount = subscribers.filter((s) => s.type === 'WHATSAPP').length;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    NewsletterSubscriptionService.saveSettings(settings);
    showToast('✅ न्यूजलेटर सेटिंग्ज यशस्वीरीत्या सेव्ह झाल्या!');
  };

  const handleDeleteSub = (id: string, contact: string) => {
    if (confirm(`तुम्हाला खात्री आहे की '${contact}' चे सबस्क्रिप्शन काढून टाकायचे आहे?`)) {
      NewsletterSubscriptionService.deleteSubscriber(id);
      setSubscribers(NewsletterSubscriptionService.getSubscribers());
      showToast('🗑️ सबस्क्राइबर काढून टाकला.');
    }
  };

  const handleExportCsv = () => {
    const csvData = NewsletterSubscriptionService.exportSubscribersCsv();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `infonews_newsletter_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 CSV फाईल डाऊनलोड झाली!');
  };

  const handleSimulateBroadcast = () => {
    setIsSimulatingBroadcast(true);
    setTimeout(() => {
      setIsSimulatingBroadcast(false);
      showToast(`📢 आजचे दैनिक प्रभात वृत्तपत्र ${subscribers.length} सबस्क्रायबर्सना यशस्वीरीत्या पाठवले गेले!`);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-4 py-3 text-xs font-black shadow-2xl animate-slideUp">
          <Check className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-linear-to-r from-amber-900 via-slate-900 to-red-950 p-6 text-white shadow-xl border border-amber-800/40">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-tr from-amber-500 to-red-600 text-white font-black shadow-lg">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight font-serif">
                दैनिक वृत्तपत्र ईमेल व व्हॉट्सॲप न्यूजलेटर व्यवस्थापन
              </h1>
              <span className="rounded-full bg-amber-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white">
                Subscribers Hub
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              दररोज सकाळी ८ वाजता वाचकांना पाठवले जाणारे डिजिटल वृत्तपत्र, ईमेल व WhatsApp याद्या
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 px-3.5 py-2 text-xs font-black transition-all cursor-pointer shadow-xs"
            title="सर्व सबस्क्रायबर्सची CSV फाईल डाऊनलोड करा"
          >
            <Download className="h-4 w-4" />
            <span>CSV यादी डाऊनलोड</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateBroadcast}
            disabled={isSimulatingBroadcast}
            className="flex items-center gap-1.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white px-4 py-2 text-xs font-black shadow-md transition-all cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>{isSimulatingBroadcast ? 'पाठवत आहे...' : 'दैनिक वृत्तपत्र ब्रॉडकास्ट करा'}</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">एकूण सबस्क्रायबर्स</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 font-serif">{subscribers.length}</span>
            <Users className="h-6 w-6 text-amber-500" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">ईमेल वृत्तपत्र वाचक</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 font-serif">{emailCount}</span>
            <Mail className="h-6 w-6 text-red-500" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">व्हॉट्सॲप बुलेटिन वाचक</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 font-serif">{whatsappCount}</span>
            <Smartphone className="h-6 w-6 text-emerald-500" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">सकाळचे ब्रॉडकास्ट वेळ</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 font-serif">{settings.morningSendTime}</span>
            <Clock className="h-6 w-6 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT 7 COLS: SUBSCRIBERS LIST TABLE */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-600" />
                <span>नोंदणीकृत वाचकांची यादी (Subscribers List)</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                एकूण {filteredSubscribers.length} वाचक सक्रिय आहेत
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ईमेल किंवा फोन शोधा..."
                  className="rounded-xl border border-slate-300 pl-9 pr-3 py-1.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:outline-none w-48"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'ALL' | 'EMAIL' | 'WHATSAPP')}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">सर्व (All)</option>
                <option value="EMAIL">📧 ईमेल</option>
                <option value="WHATSAPP">📲 व्हॉट्सॲप</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-black border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">वाचकाचा संपर्क</th>
                  <th className="py-3 px-3">माध्यम</th>
                  <th className="py-3 px-3">जिल्हा / तालुका</th>
                  <th className="py-3 px-3">नोंदणी तारीख</th>
                  <th className="py-3 px-3 text-right">कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {sub.contact}
                    </td>
                    <td className="py-3 px-3">
                      {sub.type === 'EMAIL' ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-black">
                          <Mail className="h-3 w-3" /> ईमेल
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-black">
                          <Smartphone className="h-3 w-3" /> व्हॉट्सॲप
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-700">
                      📍 {sub.district}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {sub.subscribedAt}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteSub(sub.id, sub.contact)}
                        className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                        title="काढून टाका"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT 5 COLS: NEWSLETTER BOX SETTINGS */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSaveSettings}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase">
                <Sliders className="h-4 w-4 text-amber-600" />
                <span>न्यूजलेटर बॉक्स सेटिंग्ज (Widget Settings)</span>
              </h3>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.isEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, isEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">
                मुख्य शीर्षक (Section Title) *
              </label>
              <input
                type="text"
                value={settings.sectionTitle}
                onChange={(e) =>
                  setSettings({ ...settings, sectionTitle: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none font-serif"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">
                उपशीर्षक / माहिती (Subtitle)
              </label>
              <textarea
                rows={2}
                value={settings.sectionSubtitle}
                onChange={(e) =>
                  setSettings({ ...settings, sectionSubtitle: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">
                सकाळचे ब्रॉडकास्ट वेळ (Morning Send Time)
              </label>
              <input
                type="text"
                value={settings.morningSendTime}
                onChange={(e) =>
                  setSettings({ ...settings, morningSendTime: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">
                अधिकृत WhatsApp चॅनल लिंक (Invite URL)
              </label>
              <input
                type="url"
                value={settings.officialChannelUrl}
                onChange={(e) =>
                  setSettings({ ...settings, officialChannelUrl: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 text-xs font-black shadow-md cursor-pointer transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                <span>सेटिंग्ज सेव्ह करा</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
