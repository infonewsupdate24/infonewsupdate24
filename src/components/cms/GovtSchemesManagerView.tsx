import React, { useState, useEffect, useMemo } from 'react';
import {
  Landmark,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Download,
  FileText,
  CheckCircle2,
  Award,
  Users,
  Eye,
  Save,
  Check,
  Briefcase,
  Layers,
} from 'lucide-react';
import { GovtSchemeOrJob, SchemeCategory } from '../../types';
import { GovtSchemeService } from '../../services/GovtSchemeService';
import { GovtSchemeDetailModal } from '../public/GovtSchemeDetailModal';

export const GovtSchemesManagerView: React.FC = () => {
  const [schemes, setSchemes] = useState<GovtSchemeOrJob[]>(() =>
    GovtSchemeService.getSchemes()
  );
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [previewScheme, setPreviewScheme] = useState<GovtSchemeOrJob | null>(
    null
  );

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SchemeCategory>('WOMEN_CHILD');
  const [type, setType] = useState<'SCHEME' | 'JOB' | 'GR'>('SCHEME');
  const [department, setDepartment] = useState('');
  const [grNumberOrAdvtNo, setGrNumberOrAdvtNo] = useState('');
  const [summary, setSummary] = useState('');
  const [benefitsOrPayScale, setBenefitsOrPayScale] = useState('');
  const [eligibilityText, setEligibilityText] = useState('');
  const [documentsText, setDocumentsText] = useState('');
  const [lastDateOrStatus, setLastDateOrStatus] = useState('सुरू आहे');
  const [officialApplyLink, setOfficialApplyLink] = useState('');
  const [grPdfDownloadUrl, setGrPdfDownloadUrl] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const stats = useMemo(() => {
    const total = schemes.length;
    const totalViews = schemes.reduce((sum, s) => sum + s.viewsCount, 0);
    const jobsCount = schemes.filter((s) => s.type === 'JOB').length;
    return { total, totalViews, jobsCount };
  }, [schemes]);

  const handleCreateScheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !department || !benefitsOrPayScale) {
      alert('कृपया आवश्यक माहिती भरा.');
      return;
    }

    const eligibility = eligibilityText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const documentsRequired = documentsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    GovtSchemeService.createScheme({
      title: title.trim(),
      category,
      type,
      department: department.trim(),
      grNumberOrAdvtNo: grNumberOrAdvtNo.trim() || undefined,
      summary: summary.trim(),
      benefitsOrPayScale: benefitsOrPayScale.trim(),
      eligibility:
        eligibility.length > 0 ? eligibility : ['पात्रतेचे निकष सविस्तर GR मध्ये पहावे.'],
      documentsRequired:
        documentsRequired.length > 0 ? documentsRequired : ['आधार कार्ड व आवश्यक कागदपत्रे'],
      lastDateOrStatus: lastDateOrStatus.trim(),
      officialApplyLink: officialApplyLink.trim() || 'https://maharashtra.gov.in',
      grPdfDownloadUrl: grPdfDownloadUrl.trim() || undefined,
      isFeatured: true,
    });

    setSchemes(GovtSchemeService.getSchemes());
    setActiveTab('list');
    setTitle('');
    setDepartment('');
    setBenefitsOrPayScale('');
    setSummary('');
    setToastMsg('✅ नवीन शासकीय योजना / भरती यशस्वीरीत्या जोडली गेली!');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleDelete = (id: string) => {
    if (confirm('ही योजना कायमची हटवायची आहे का?')) {
      const updated = GovtSchemeService.deleteScheme(id);
      setSchemes(updated);
      setToastMsg('योजना हटवली.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-[11px] font-black text-blue-800 uppercase tracking-wider flex items-center gap-1">
              <Landmark className="h-3.5 w-3.5 text-blue-600" />
              Maharashtra Govt Schemes & Jobs
            </span>
            <span className="text-xs font-bold text-slate-500">
              योजना, शासन निर्णय (GR) व भरती
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            सरकारी योजना, GR व नोकरी भरती व्यवस्थापन (Govt Schemes Studio)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            लाडकी बहीण, नमो शेतकरी, पोलीस भरती आणि शासकीय योजनांची माहिती व अधिकृत GR व्यवस्थापित करा.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'list' ? 'create' : 'list')}
          className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 px-4 py-2 text-xs font-black text-white shadow-md transition-all cursor-pointer"
        >
          {activeTab === 'list' ? (
            <>
              <Plus className="h-4 w-4" />
              <span>नवीन योजना / भरती जोडा</span>
            </>
          ) : (
            <span>सर्व यादी पहा</span>
          )}
        </button>
      </div>

      {/* 2. Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">
            एकूण योजना व भरती (Total Listings)
          </span>
          <span className="text-2xl font-black text-blue-600 font-mono mt-1 block">
            {stats.total}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">सक्रिय शासकीय योजना व जाहिराती</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">
            एकूण वाचक संख्या (Total Views)
          </span>
          <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
            {stats.totalViews.toLocaleString('mr-IN')}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">वाचकांनी पाहिलेले एकूण व्ह्यूज</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">
            नोकरी भरती जाहिराती (Job Alerts)
          </span>
          <span className="text-2xl font-black text-purple-600 font-mono mt-1 block">
            {stats.jobsCount}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">पोलीस, MPSC व शासकीय भरती</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SCHEMES LIST */}
      {/* ========================================================================= */}
      {activeTab === 'list' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" />
              <span>सध्याच्या सर्व शासकीय योजना व भरती यादी ({schemes.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {schemes.map((scheme) => (
              <div
                key={scheme.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3 hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2 py-0.5">
                      {scheme.type === 'SCHEME'
                        ? 'शासकीय योजना'
                        : scheme.type === 'JOB'
                        ? 'नोकरी भरती'
                        : 'शासन निर्णय (GR)'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      👁️ {scheme.viewsCount.toLocaleString('mr-IN')}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {scheme.title}
                  </h4>

                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-950">
                    {scheme.benefitsOrPayScale}
                  </div>

                  <span className="text-[11px] text-slate-500 block">
                    🏢 {scheme.department}
                  </span>
                </div>

                {/* Card Controls */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewScheme(scheme)}
                    className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>प्रिव्ह्यू पहा</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(scheme.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                    title="हटवा"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CREATE NEW SCHEME */}
      {/* ========================================================================= */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateScheme} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Landmark className="h-4 w-4 text-blue-600" />
              <span>नवीन शासकीय योजना / भरती / GR तपशील</span>
            </h3>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                योजनेचे किंवा भरतीचे संपूर्ण नाव (Title in Marathi): *
              </label>
              <input
                type="text"
                required
                placeholder="उदा. मुख्यमंत्री माझी लाडकी बहीण योजना २०२६ - नवीन अर्ज"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 text-xs focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">प्रवर्ग (Category):</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-800"
                >
                  <option value="WOMEN_CHILD">महिला व बालविकास</option>
                  <option value="FARMERS">शेतकरी व कृषी योजना</option>
                  <option value="EMPLOYMENT">नोकरी व भरती (Jobs)</option>
                  <option value="HEALTH">आरोग्य व उपचार</option>
                  <option value="STUDENTS">विद्यार्थी व स्कॉलरशिप</option>
                  <option value="SOCIAL_WELFARE">सामाजिक न्याय व पेन्शन</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">प्रकार (Type):</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-800"
                >
                  <option value="SCHEME">शासकीय योजना (Scheme)</option>
                  <option value="JOB">नोकरी व भरती (Job Alert)</option>
                  <option value="GR">शासन निर्णय (Official GR)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  लाभाची रक्कम / वेतन श्रेणी: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. ₹१,५०० दरमहा किंवा वेतन ₹२१,७००"
                  value={benefitsOrPayScale}
                  onChange={(e) => setBenefitsOrPayScale(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-amber-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  संबंधित शासकीय विभाग (Department): *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. महिला व बालविकास विभाग, महाराष्ट्र शासन"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  शासन निर्णय क्रमांक / जाहिरात क्र.:
                </label>
                <input
                  type="text"
                  placeholder="उदा. शासन निर्णय क्र. मबावि-२०२४/प्र.क्र.८८"
                  value={grNumberOrAdvtNo}
                  onChange={(e) => setGrNumberOrAdvtNo(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                योजनेचा गोषवारा (Summary):
              </label>
              <textarea
                rows={3}
                placeholder="योजनेचे उद्दिष्ट आणि सामान्य माहिती..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  पात्रता निकष (प्रत्येक ओळीत १ निकष लिहा):
                </label>
                <textarea
                  rows={4}
                  placeholder="वय वर्षे २१ ते ६५&#10;वार्षिक उत्पन्न ₹२.५ लाखांपेक्षा कमी&#10;महाराष्ट्राची रहिवासी"
                  value={eligibilityText}
                  onChange={(e) => setEligibilityText(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  आवश्यक कागदपत्रे (प्रत्येक ओळीत १ कागदपत्र लिहा):
                </label>
                <textarea
                  rows={4}
                  placeholder="आधार कार्ड&#10;उत्पन्नाचा दाखला&#10;बँक पासबुक&#10;रेशन कार्ड"
                  value={documentsText}
                  onChange={(e) => setDocumentsText(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  अधिकृत ऑनलाइन अर्ज लिंक (Official Apply URL):
                </label>
                <input
                  type="url"
                  placeholder="https://ladakibahin.maharashtra.gov.in"
                  value={officialApplyLink}
                  onChange={(e) => setOfficialApplyLink(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  शासन निर्णय (GR) किंवा जाहिरात PDF लिंक:
                </label>
                <input
                  type="url"
                  placeholder="https://maharashtra.gov.in/gr-file.pdf"
                  value={grPdfDownloadUrl}
                  onChange={(e) => setGrPdfDownloadUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
              >
                रद्द करा
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs shadow-md shadow-blue-200 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>योजना / भरती प्रकाशित करा</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Preview Modal */}
      {previewScheme && (
        <GovtSchemeDetailModal
          scheme={previewScheme}
          onClose={() => setPreviewScheme(null)}
        />
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
