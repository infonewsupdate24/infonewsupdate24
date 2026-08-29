import React, { useState } from 'react';
import {
  MessageCircle,
  Users,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Layers,
  Settings,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DistrictWhatsAppGroup } from '../../types';

export const WhatsAppChannelManagerView: React.FC = () => {
  const { whatsAppSettings, updateWhatsAppSettings } = useApp();
  const [activeTab, setActiveTab] = useState<'channel' | 'districts' | 'preview'>('channel');

  // Form states
  const [isEnabled, setIsEnabled] = useState(whatsAppSettings?.isEnabled ?? true);
  const [officialChannelUrl, setOfficialChannelUrl] = useState(
    whatsAppSettings?.officialChannelUrl || 'https://whatsapp.com/channel/0029Va9SampleInfoNewsUpdate24'
  );
  const [channelName, setChannelName] = useState(
    whatsAppSettings?.channelName || 'InfoNewsUpdate24 Official Channel'
  );
  const [subscriberCountText, setSubscriberCountText] = useState(
    whatsAppSettings?.subscriberCountText || '५०,०००+ वाचक जोडले गेले आहेत'
  );
  const [showFloatingButton, setShowFloatingButton] = useState(
    whatsAppSettings?.showFloatingButton ?? true
  );
  const [showInArticleBanner, setShowInArticleBanner] = useState(
    whatsAppSettings?.showInArticleBanner ?? true
  );
  const [inArticleBannerText, setInArticleBannerText] = useState(
    whatsAppSettings?.inArticleBannerText ||
      'दररोजच्या ताज्या घडामोडी व ब्रेकिंग न्यूज सर्वात आधी WhatsApp वर मिळवण्यासाठी आमच्या अधिकृत चॅनलला फॉलो करा!'
  );

  // District Groups State
  const [districtGroups, setDistrictGroups] = useState<DistrictWhatsAppGroup[]>(
    whatsAppSettings?.districtGroups || []
  );

  // New Group Modal State
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [newDistrictName, setNewDistrictName] = useState('');
  const [newInviteLink, setNewInviteLink] = useState('');
  const [newMemberCount, setNewMemberCount] = useState('५०० सदस्य');

  const [toastMsg, setToastMsg] = useState('');

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateWhatsAppSettings({
      isEnabled,
      officialChannelUrl,
      channelName,
      subscriberCountText,
      showFloatingButton,
      showInArticleBanner,
      inArticleBannerText,
      districtGroups,
    });
    setToastMsg('✅ व्हॉट्सॲप चॅनल सेटिंग्ज सेव्ह झाल्या!');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const newGroup: DistrictWhatsAppGroup = {
      id: `group-${Date.now()}`,
      districtName: newDistrictName,
      inviteLink: newInviteLink,
      memberCount: newMemberCount,
      isActive: true,
    };
    const updated = [...districtGroups, newGroup];
    setDistrictGroups(updated);
    updateWhatsAppSettings({ districtGroups: updated });
    setIsAddGroupModalOpen(false);
    setNewDistrictName('');
    setNewInviteLink('');
    setToastMsg(`✅ ${newDistrictName} ग्रुप जोडला गेला!`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleDeleteGroup = (id: string) => {
    if (confirm('हा व्हॉट्सॲप ग्रुप हटवायचा आहे का?')) {
      const updated = districtGroups.filter((g) => g.id !== id);
      setDistrictGroups(updated);
      updateWhatsAppSettings({ districtGroups: updated });
      setToastMsg('ग्रुप हटवला.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleToggleGroupStatus = (id: string) => {
    const updated = districtGroups.map((g) =>
      g.id === id ? { ...g, isActive: !g.isActive } : g
    );
    setDistrictGroups(updated);
    updateWhatsAppSettings({ districtGroups: updated });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
              WhatsApp Growth Engine Pro
            </span>
            <span className="text-xs font-bold text-slate-500">वाचक कम्युनिटी व्यवस्थापक</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            अधिकृत व्हॉट्सॲप चॅनल व कम्युनिटी व्यवस्थापन
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            तुमच्या वृत्तपत्राचे अधिकृत व्हॉट्सॲप चॅनल आणि जिल्ह्यांचे व्हॉट्सॲप ग्रुप्स जोडून हजारो वाचकांना थेट जोडा.
          </p>
        </div>

        {activeTab === 'districts' && (
          <button
            type="button"
            onClick={() => setIsAddGroupModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>नवीन जिल्हा ग्रुप जोडा</span>
          </button>
        )}
      </div>

      {/* 2. Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('channel')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
            activeTab === 'channel'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          <span>📢 मुख्य व्हॉट्सॲप चॅनल सेटिंग्ज</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('districts')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
            activeTab === 'districts'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>👥 जिल्ह्यांचे व्हॉट्सॲप ग्रुप्स ({districtGroups.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
            activeTab === 'preview'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Smartphone className="h-4 w-4" />
          <span>📱 मोबाईल प्रिव्ह्यू व आकडेवारी</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OFFICIAL CHANNEL SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'channel' && (
        <form
          onSubmit={handleSaveGeneral}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 max-w-4xl"
        >
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Settings className="h-5 w-5 text-emerald-600" />
              <span>मुख्य व्हॉट्सॲप चॅनल व बॅनर सेटिंग्ज</span>
            </h3>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <span>व्हॉट्सॲप सुविधा चालू:</span>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="h-4 w-4 rounded accent-emerald-600"
              />
            </label>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                अधिकृत व्हॉट्सॲप चॅनल लिंक (Official WhatsApp Channel Invite Link):
              </label>
              <input
                type="url"
                required
                value={officialChannelUrl}
                onChange={(e) => setOfficialChannelUrl(e.target.value)}
                placeholder="https://whatsapp.com/channel/..."
                className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-slate-900 focus:border-emerald-500 focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                येथे तुमच्या अधिकृत व्हॉट्सॲप चॅनलची लिंक टाका, जेणेकरून वाचक एका क्लिकवर चॅनल फॉलो करू शकतील.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  चॅनलचे नाव (Channel Name):
                </label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  वाचक संख्या बॅज (Subscriber Count Text):
                </label>
                <input
                  type="text"
                  value={subscriberCountText}
                  onChange={(e) => setSubscriberCountText(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                प्रत्येक बातमीच्या खाली दिसणारा मेसेज (In-Article Banner Text):
              </label>
              <textarea
                rows={2}
                value={inArticleBannerText}
                onChange={(e) => setInArticleBannerText(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-emerald-500 focus:outline-hidden leading-relaxed"
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFloatingButton}
                  onChange={(e) => setShowFloatingButton(e.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    फ्लोटिंग व्हॉट्सॲप बटण दाखवा
                  </span>
                  <span className="text-[11px] text-slate-500">
                    वेबसाईटच्या उजव्या कोपऱ्यात हिरवे पल्स बटण दिसेल.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInArticleBanner}
                  onChange={(e) => setShowInArticleBanner(e.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    बातमीच्या शेवटी चॅनल फॉलो बॅनर दाखवा
                  </span>
                  <span className="text-[11px] text-slate-500">
                    वाचकांनी बातमी वाचून संपवल्यावर चॅनल जॉईन करण्याचे कार्ड दिसेल.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-200 transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>सेटिंग्ज सेव्ह करा</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DISTRICT GROUPS MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'districts' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              <span>जिल्हानिहाय व्हॉट्सॲप ग्रुप्स यादी ({districtGroups.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">जिल्हा / ग्रुपचे नाव</th>
                  <th className="p-3">व्हॉट्सॲप इन्व्हाईट लिंक (Invite Link)</th>
                  <th className="p-3">सदस्य संख्या</th>
                  <th className="p-3">स्थिती</th>
                  <th className="p-3 text-right">कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {districtGroups.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{g.districtName}</td>
                    <td className="p-3 font-mono text-emerald-700 truncate max-w-xs">
                      <a
                        href={g.inviteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        <span className="truncate">{g.inviteLink}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </td>
                    <td className="p-3 text-slate-600 font-bold">{g.memberCount}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => handleToggleGroupStatus(g.id)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold cursor-pointer transition-colors ${
                          g.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {g.isActive ? 'सक्रिय (Active)' : 'बंद (Hidden)'}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteGroup(g.id)}
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

      {/* ========================================================================= */}
      {/* TAB 3: LIVE PREVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                १. बातमीच्या शेवटी दिसणारे व्हॉट्सॲप कार्ड (In-Article Card)
              </h4>

              <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-4 text-white shadow-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="rounded bg-emerald-600 px-2 py-0.5 text-[8px] font-black uppercase">
                      WHATSAPP ALERTS
                    </span>
                    <h5 className="text-xs font-bold text-white mt-0.5">
                      {inArticleBannerText}
                    </h5>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-black text-slate-950">
                    <span>चॅनल फॉलो करा (Join Channel)</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                २. फ्लोटिंग पल्स बटण (Floating Bottom-Right Button)
              </h4>

              <div className="p-6 rounded-2xl bg-slate-950 text-white flex flex-col items-center justify-center space-y-3">
                <div className="flex items-center gap-1.5 rounded-full bg-slate-900 border border-emerald-500 px-3 py-1 text-[10px] font-bold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{subscriberCountText}</span>
                </div>

                <div className="h-14 w-14 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-2xl ring-4 ring-emerald-400/30">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <span className="text-xs text-slate-400">
                  वाचकांनी क्लिक करताच सर्व जिल्ह्यांचे ग्रुप्स दिसतील.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Group Modal */}
      {isAddGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                <span>नवीन जिल्हा व्हॉट्सॲप ग्रुप जोडा</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddGroupModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGroup} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  जिल्हा / ग्रुपचे नाव:
                </label>
                <input
                  type="text"
                  required
                  value={newDistrictName}
                  onChange={(e) => setNewDistrictName(e.target.value)}
                  placeholder="उदा. सोलापूर जिल्हा न्यूज ग्रुप"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  व्हॉट्सॲप ग्रुप इन्व्हाईट लिंक (Group Invite Link):
                </label>
                <input
                  type="url"
                  required
                  value={newInviteLink}
                  onChange={(e) => setNewInviteLink(e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-slate-900 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  सदस्य संख्या लेबल:
                </label>
                <input
                  type="text"
                  value={newMemberCount}
                  onChange={(e) => setNewMemberCount(e.target.value)}
                  placeholder="उदा. ५००+ सदस्य"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddGroupModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 font-bold"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-white font-bold hover:bg-emerald-700 shadow-md cursor-pointer"
                >
                  ग्रुप प्रकाशित करा
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
