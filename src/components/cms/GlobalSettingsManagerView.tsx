import {
  AlertCircle,
  Building,
  CheckCircle2,
  Download,
  Eye,
  FileCode,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Key,
  Layers,
  Lock,
  Mail,
  MessageSquare,
  Moon,
  Phone,
  RefreshCw,
  Save,
  Search,
  Send,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Upload,
  User,
  Users,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SiteGlobalSettings } from '../../types';

export const GlobalSettingsManagerView: React.FC = () => {
  const { siteSettings, updateSiteSettings, exportDataJson, importDataJson, setPortalMode } = useApp();

  const [activeTab, setActiveTab] = useState<
    'general' | 'legal' | 'seo_analytics' | 'comments' | 'security_backup' | 'social'
  >('general');

  // Form State initialized from siteSettings
  const [formData, setFormData] = useState<SiteGlobalSettings>({
    ...siteSettings,
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Field Change
  const handleChange = (field: keyof SiteGlobalSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Save All Settings
  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings(formData);
    showNotification('success', '✅ सर्व ग्लोबल सेटिंग्ज (Global Settings) यशस्वीरित्या सेव्ह झाल्या!');
  };

  // 1-Click Backup Download
  const handleDownloadBackup = () => {
    exportDataJson();
    showNotification('success', '💾 संपूर्ण पोर्टलचा डेटा आणि सेटिंग्जचा JSON बॅकअप डाऊनलोड झाला!');
  };

  // File Upload for Backup Restore
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonStr = event.target?.result as string;
        const result = importDataJson(jsonStr);
        if (result.success) {
          showNotification('success', '🔄 बॅकअप यशस्वीरित्या रिस्टोअर झाला! सर्व डेटा लोड झाला.');
        } else {
          showNotification('error', `बॅकअप रिस्टोअर अयशस्वी: ${result.message}`);
        }
      } catch (err) {
        showNotification('error', 'अवैध JSON फाइल.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            ग्लोबल पोर्टल सेटिंग्ज (Master Control Room)
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            InfoNewsUpdate24 चे ब्रँडिंग, कायदेशीर नोंदणी, SEO ट्रॅकिंग, कॉमेंट्स नियम, सुरक्षा व डेटा बॅकअप नियंत्रित करा.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPortalMode('PUBLIC')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <Eye className="h-4 w-4 text-slate-600" />
            <span>पब्लिक पोर्टल पहा (Live Site)</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 px-5 py-2 text-xs font-black text-white shadow-md transition cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>सर्व बदल सेव्ह करा</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white p-2 rounded-2xl shadow-xs text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'general'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>१. सामान्य व ब्रँडिंग</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('legal')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'legal'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>२. कायदेशीर व IT Rules</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seo_analytics')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'seo_analytics'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>३. SEO, Analytics व AdSense</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'comments'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>४. कॉमेंट्स व चर्चा नियम</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security_backup')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'security_backup'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>५. सुरक्षा व डेटा बॅकअप</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'social'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>६. अधिकृत सोशल मीडिया</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveAll}>
        {/* TAB 1: GENERAL BRANDING & IDENTITY */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-red-600" />
                  <span>पोर्टल माहिती व न्यूजरूम संपर्क (Site Identity)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  वेबसाईटचे शीर्षक, मराठी ब्रीदवाक्य आणि अधिकृत कार्यालयाचा पत्ता.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    पोर्टलचे नाव (Site Title) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.siteTitle}
                    onChange={(e) => handleChange('siteTitle', e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-bold focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    अधिकृत डोमेन URL (Site URL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.siteUrl}
                    onChange={(e) => handleChange('siteUrl', e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-mono focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    मराठी ब्रीदवाक्य / टॅगलाईन (Tagline)
                  </label>
                  <input
                    type="text"
                    value={formData.siteTagline}
                    onChange={(e) => handleChange('siteTagline', e.target.value)}
                    placeholder="उदा. महाराष्ट्रातील ताज्या, निर्भीड आणि विश्वासार्ह घडामोडी"
                    className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    संपादकीय ईमेल (Newsroom Email) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.siteEmail}
                    onChange={(e) => handleChange('siteEmail', e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    अधिकृत व्हॉट्सॲप / हेल्पलाईन फोन
                  </label>
                  <input
                    type="tel"
                    value={formData.sitePhone}
                    onChange={(e) => handleChange('sitePhone', e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    मुख्य ब्युरो कार्यालय पत्ता (Head Office Address)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.siteAddress}
                    onChange={(e) => handleChange('siteAddress', e.target.value)}
                    placeholder="उदा. मुख्य ब्युरो कार्यालय, पत्रकार भवन, गडचिरोली / मुंबई, महाराष्ट्र..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Logo & Branding Preview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-red-600" />
                  <span>लोगो व आयकॉन (Logo & Favicon)</span>
                </h3>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  हेडर लोगो URL (Header Logo)
                </label>
                <input
                  type="url"
                  value={formData.headerLogoUrl || ''}
                  onChange={(e) => handleChange('headerLogoUrl', e.target.value)}
                  placeholder="https://.../logo.png"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              {/* Logo Preview */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-center min-h-[70px]">
                {formData.headerLogoUrl ? (
                  <img src={formData.headerLogoUrl} alt="Logo" className="max-h-12 object-contain" />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-sm">
                      24
                    </div>
                    <span className="font-black text-sm uppercase">
                      Info<span className="text-red-500">News</span>Update24
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Favicon आयकॉन URL (१:१ PNG)
                </label>
                <input
                  type="url"
                  value={formData.faviconUrl || ''}
                  onChange={(e) => handleChange('faviconUrl', e.target.value)}
                  placeholder="https://.../favicon.png"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEGAL & IT RULES 2021 COMPLIANCE */}
        {activeTab === 'legal' && (
          <div className="max-w-3xl bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>डिजिटल मीडिया कायदेशीर पूर्तता (IT Rules 2021 Compliance)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                भारत सरकारच्या डिजिटल मीडिया आचारसंहिता (Digital Media Ethics) नुसार तक्रार निवारण अधिकारी व नोंदणी माहिती.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  RNI / डिजिटल मीडिया नोंदणी क्रमांक
                </label>
                <input
                  type="text"
                  value={formData.rniRegNumber || ''}
                  onChange={(e) => handleChange('rniRegNumber', e.target.value)}
                  placeholder="उदा. MAHMAR/2026/89452"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-mono font-bold focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  तक्रार निवारण अधिकारी नाव (Grievance Officer) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.grievanceOfficerName || ''}
                  onChange={(e) => handleChange('grievanceOfficerName', e.target.value)}
                  placeholder="उदा. ॲड. सचिन मोरे"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  तक्रार निवारण ईमेल (Grievance Email) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.grievanceOfficerEmail || ''}
                  onChange={(e) => handleChange('grievanceOfficerEmail', e.target.value)}
                  placeholder="grievance@infonewsupdate24.com"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  तक्रार निवारण संपर्क फोन
                </label>
                <input
                  type="tel"
                  value={formData.grievanceOfficerPhone || ''}
                  onChange={(e) => handleChange('grievanceOfficerPhone', e.target.value)}
                  placeholder="+91 98XXXXXXXX"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  कॉपीराइट सूचना (Copyright Footer Notice)
                </label>
                <input
                  type="text"
                  value={formData.copyrightText || ''}
                  onChange={(e) => handleChange('copyrightText', e.target.value)}
                  placeholder="© 2026 InfoNewsUpdate24. सर्व हक्क राखीव."
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-900">IT Rules 2021 & AdSense Compliant</p>
                <p className="text-[11px] text-emerald-700">
                  सदर माहिती पोर्टलच्या Grievance Redressal आणि Footer पानांवर आपोआप प्रदर्शित केली जाते.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SEO, ANALYTICS & ADSENSE */}
        {activeTab === 'seo_analytics' && (
          <div className="max-w-3xl bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                <span>SEO, Google Analytics व AdSense ट्रॅकिंग Suite</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Google Search Console, Google Analytics 4 आणि AdSense कोड्स.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Google Analytics 4 Measurement ID
                </label>
                <input
                  type="text"
                  value={formData.googleAnalyticsId || ''}
                  onChange={(e) => handleChange('googleAnalyticsId', e.target.value)}
                  placeholder="उदा. G-XXXXXXXXXX"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-mono font-bold focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Google Search Console Verification Meta Tag
                </label>
                <input
                  type="text"
                  value={formData.googleSearchConsoleMeta || ''}
                  onChange={(e) => handleChange('googleSearchConsoleMeta', e.target.value)}
                  placeholder="google-site-verification=XXXXXXXXXXXXXXXXXXXX"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-mono focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Google AdSense Publisher ID (Client ID)
                </label>
                <input
                  type="text"
                  value={formData.adsensePublisherId || ''}
                  onChange={(e) => handleChange('adsensePublisherId', e.target.value)}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-mono font-bold focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  डिफॉल्ट सोशल शेअर इमेज URL (Open Graph Default Cover)
                </label>
                <input
                  type="url"
                  value={formData.defaultSocialShareImage || ''}
                  onChange={(e) => handleChange('defaultSocialShareImage', e.target.value)}
                  placeholder="https://.../og-default.jpg"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMMENTS & DISCUSSION POLICY */}
        {activeTab === 'comments' && (
          <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <span>वाचक प्रतिक्रिया व कॉमेंट्स धोरण (Comment Moderation)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                बातम्यांवर वाचकांच्या प्रतिक्रिया, आक्षेपार्ह शब्द फिल्टर व पूर्व-मंजुरी नियम.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition cursor-pointer">
                <div>
                  <span className="font-bold text-slate-900 block">बातम्यांवर कॉमेंट्स चालू ठेवा (Enable Comments)</span>
                  <span className="text-[11px] text-slate-500">वाचकांना बातम्यांखाली प्रतिक्रिया देण्याची परवानगी द्या.</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enableComments}
                  onChange={(e) => handleChange('enableComments', e.target.checked)}
                  className="w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition cursor-pointer">
                <div>
                  <span className="font-bold text-slate-900 block">संपादकीय पूर्व-मंजुरी बंधनकारक (Require Approval)</span>
                  <span className="text-[11px] text-slate-500">संपादकाने तपासून मंजूर केल्याशिवाय कॉमेंट लाईव्ह होणार नाही.</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.requireCommentApproval}
                  onChange={(e) => handleChange('requireCommentApproval', e.target.checked)}
                  className="w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                />
              </label>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  प्रतिबंधित / आक्षेपार्ह शब्द यादी (Blacklisted Words Filter)
                </label>
                <textarea
                  rows={3}
                  value={formData.blacklistedWords}
                  onChange={(e) => handleChange('blacklistedWords', e.target.value)}
                  placeholder="कॉमा देऊन शब्द लिहा: शिवी, आक्षेपार्ह, बकवास, फेक..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:bg-white focus:border-red-500 outline-none font-medium"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  या शब्दांचा समावेश असलेली कोणतीही कॉमेंट आपोआप रोखली जाईल.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PERFORMANCE, SECURITY & 1-CLICK BACKUP */}
        {activeTab === 'security_backup' && (
          <div className="max-w-3xl bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-600" />
                <span>सुरक्षा, मेंटेनन्स मोड व १-क्लिक संपूर्ण डेटा बॅकअप</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                वेबसाईटची सुरक्षा, कॉपी प्रोटेक्शन आणि संपूर्ण डेटाबेस बॅकअप / रिस्टोअर.
              </p>
            </div>

            <div className="space-y-4">
              {/* Maintenance Mode Toggle */}
              <div className={`p-4 rounded-xl border transition ${formData.maintenanceMode ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block flex items-center gap-2">
                      <span>🔒 मेंटेनन्स मोड (Maintenance Mode)</span>
                      {formData.maintenanceMode && (
                        <span className="rounded-full bg-red-600 text-white text-[9px] font-black px-2 py-0.5 animate-pulse">
                          ACTIVE
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      वेबसाईटवर मोठे काम चालू असताना सामान्य वाचकांना 'साइट लवकरच सुरू होईल' अशी स्क्रीन दिसेल.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.maintenanceMode}
                    onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Anti Copy Protection */}
              <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition cursor-pointer">
                <div>
                  <span className="font-bold text-slate-900 block">🛡️ बातमी कॉपी प्रोटेक्शन (Anti-Plagiarism / Disable Right-Click)</span>
                  <span className="text-[11px] text-slate-500">इतरांना आपल्या बातम्यांचा मजकूर सहज कॉपी करण्यापासून रोखा.</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.antiCopyProtection}
                  onChange={(e) => handleChange('antiCopyProtection', e.target.checked)}
                  className="w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                />
              </label>

              {/* Auto Refresh Interval */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  🔄 ब्रेकिंग न्यूज ऑटो-रिफ्रेश टाइमर (Auto-Refresh Interval)
                </label>
                <select
                  value={formData.autoRefreshIntervalMinutes}
                  onChange={(e) => handleChange('autoRefreshIntervalMinutes', Number(e.target.value))}
                  className="w-full sm:w-64 h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-bold focus:bg-white focus:border-red-500 outline-none"
                >
                  <option value={1}>दर १ मिनिटाने रिफ्रेश करा</option>
                  <option value={2}>दर २ मिनिटांनी रिफ्रेश करा</option>
                  <option value={3}>दर ३ मिनिटांनी रिफ्रेश करा (Recommended)</option>
                  <option value={5}>दर ५ मिनिटांनी रिफ्रेश करा</option>
                  <option value={0}>ऑटो-रिफ्रेश बंद ठेवा</option>
                </select>
              </div>

              {/* 1-Click Backup & Restore Box */}
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>संपूर्ण पोर्टल डेटा बॅकअप व रिस्टोअर (JSON Export/Import)</span>
                </h3>
                <p className="text-xs text-slate-600">
                  सर्व बातम्या, पाने, कॅटेगरी, टॅग्ज, जाहिराती आणि सेटिंग्जचा १-क्लिक बॅकअप घ्या किंवा जुना बॅकअप लोड करा.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>१-क्लिक संपूर्ण बॅकअप डाऊनलोड करा (.JSON)</span>
                  </button>

                  <label className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>बॅकअप फाइल रिस्टोअर करा</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: OFFICIAL SOCIAL CHANNELS */}
        {activeTab === 'social' && (
          <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-pink-600" />
                <span>अधिकृत सोशल मीडिया चॅनेल्स (Official Social Links)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                हेडर, फुटर आणि बातम्यांच्या खाली दिसणाऱ्या अधिकृत सोशल मीडिया लिंक्स.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Facebook Page URL
                </label>
                <input
                  type="url"
                  value={formData.socialFacebook || ''}
                  onChange={(e) => handleChange('socialFacebook', e.target.value)}
                  placeholder="https://facebook.com/infonewsupdate24"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Twitter / X Profile URL
                </label>
                <input
                  type="url"
                  value={formData.socialTwitter || ''}
                  onChange={(e) => handleChange('socialTwitter', e.target.value)}
                  placeholder="https://twitter.com/infonewsupdate24"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  YouTube Channel URL
                </label>
                <input
                  type="url"
                  value={formData.socialYouTube || ''}
                  onChange={(e) => handleChange('socialYouTube', e.target.value)}
                  placeholder="https://youtube.com/@infonewsupdate24"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Instagram Handle URL
                </label>
                <input
                  type="url"
                  value={formData.socialInstagram || ''}
                  onChange={(e) => handleChange('socialInstagram', e.target.value)}
                  placeholder="https://instagram.com/infonewsupdate24"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  WhatsApp Official Channel URL
                </label>
                <input
                  type="url"
                  value={formData.socialWhatsAppChannel || ''}
                  onChange={(e) => handleChange('socialWhatsAppChannel', e.target.value)}
                  placeholder="https://whatsapp.com/channel/infonewsupdate24"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Telegram Channel URL
                </label>
                <input
                  type="url"
                  value={formData.socialTelegram || ''}
                  onChange={(e) => handleChange('socialTelegram', e.target.value)}
                  placeholder="https://t.me/infonewsupdate24"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Bar at Bottom */}
        <div className="mt-6 flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-8 py-3 text-xs font-black text-white shadow-lg cursor-pointer transition"
          >
            <Save className="w-4 h-4" />
            <span>सर्व ग्लोबल बदल सेव्ह करा (Save All Settings)</span>
          </button>
        </div>
      </form>
    </div>
  );
};
