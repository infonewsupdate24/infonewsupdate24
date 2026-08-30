import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Check,
  XCircle,
  FileText,
  MessageCircle,
  Share2,
  Trash2,
  Eye,
  ExternalLink,
  MapPin,
  Phone,
  AlertCircle,
  Send,
  Sparkles,
} from 'lucide-react';
import { CitizenNewsReport, Post } from '../../types';
import { CitizenNewsService } from '../../services/CitizenNewsService';
import { useApp } from '../../context/AppContext';

export const CitizenNewsDeskManagerView: React.FC = () => {
  const { createPost, categories } = useApp();
  const [reports, setReports] = useState<CitizenNewsReport[]>(() =>
    CitizenNewsService.getReports()
  );
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<
    'ALL' | 'PENDING_REVIEW' | 'VERIFIED' | 'PUBLISHED' | 'REJECTED'
  >('ALL');
  const [activeModalReport, setActiveModalReport] =
    useState<CitizenNewsReport | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const refreshReports = () => {
    setReports(CitizenNewsService.getReports());
  };

  useEffect(() => {
    const handleUpdate = () => refreshReports();
    window.addEventListener('infonews:citizen-news-updated', handleUpdate);
    return () =>
      window.removeEventListener('infonews:citizen-news-updated', handleUpdate);
  }, []);

  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) => r.status === 'PENDING_REVIEW').length;
    const verified = reports.filter((r) => r.status === 'VERIFIED').length;
    const published = reports.filter((r) => r.status === 'PUBLISHED').length;
    return { total, pending, verified, published };
  }, [reports]);

  const filteredReports = useMemo(() => {
    if (selectedStatusFilter === 'ALL') return reports;
    return reports.filter((r) => r.status === selectedStatusFilter);
  }, [reports, selectedStatusFilter]);

  const handleMarkVerified = (report: CitizenNewsReport) => {
    const updated = CitizenNewsService.updateReportStatus(
      report.id,
      'VERIFIED',
      'बातमीदाराशी संपर्क साधून माहितीची सत्यता तपासण्यात आली.'
    );
    setReports(updated);
    setToastMsg(`✅ ${report.reporterName} यांची बातमी पडताळणीअंती मंजूर झाली!`);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleConvertToPublishedPost = async (report: CitizenNewsReport) => {
    // 1. Create a live Post in the Newsroom
    const newPostSlug = `citizen-${report.headline
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const targetCat = categories[0] || { id: 'cat-1', name: 'महाराष्ट्र' };
    await createPost({
      title: report.headline,
      slug: newPostSlug,
      excerpt: report.description.slice(0, 180) + '...',
      content: `<p><strong>${report.talukaVillage}, जि. ${report.district}:</strong></p><p>${report.description}</p><p><em>(बातमीदार: वाचक पत्रकार ${report.reporterName})</em></p>`,
      featuredImage:
        report.mediaUrl ||
        'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80',
      featuredImageCaption: `${report.headline} - छायाचित्र: ${report.reporterName}`,
      featuredImageAlt: report.headline,
      categoryId: targetCat.id,
      tags: ['वाचक पत्रकार', report.district, report.talukaVillage],
      authorId: 'user-admin',
      authorName: `वाचक पत्रकार: ${report.reporterName}`,
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      authorRole: 'REPORTER',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      publishDate: new Date().toISOString().split('T')[0],
      isBreaking: false,
      isFeatured: false,
      isTrending: false,
      readingTimeMinutes: 2,
      views: 150,
      likes: 12,
      location: `${report.talukaVillage}, ${report.district}`,
      seo: {
        focusKeyword: 'वाचक पत्रकार',
        seoTitle: report.headline,
        metaDescription: report.description.slice(0, 150),
        score: 90,
        checks: {
          keywordInTitle: true,
          keywordInUrl: true,
          keywordInDescription: true,
          keywordInFirstParagraph: true,
          keywordInHeadings: true,
          contentLengthOk: true,
          hasInternalLinks: true,
          hasExternalLinks: false,
          hasImageAlt: true,
          readabilityOk: true,
        },
      },
    });

    // 2. Mark report as PUBLISHED
    const updated = CitizenNewsService.updateReportStatus(
      report.id,
      'PUBLISHED',
      `पोर्टलवर बातमी म्हणून थेट प्रकाशित करण्यात आली. Slug: ${newPostSlug}`
    );
    setReports(updated);
    setToastMsg(`🎉 बातमी पोर्टलवर थेट लाईव्ह प्रकाशित झाली!`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleRejectReport = (report: CitizenNewsReport) => {
    const reason = prompt('बातमी नाकारण्याचे कारण लिहा:');
    if (reason !== null) {
      const updated = CitizenNewsService.updateReportStatus(
        report.id,
        'REJECTED',
        reason || 'पडताळणीअंती माहिती अपुरी आढळली.'
      );
      setReports(updated);
      setToastMsg('बातमी नाकारण्यात आली.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleDeleteReport = (id: string) => {
    if (confirm('हा रिपोर्ट कायमचा हटवायचा आहे का?')) {
      const updated = CitizenNewsService.deleteReport(id);
      setReports(updated);
      setToastMsg('रिपोर्ट हटवला.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleWhatsAppReply = (report: CitizenNewsReport) => {
    const url = CitizenNewsService.generateWhatsAppReporterReplyUrl(
      report,
      'https://infonewsupdate24.com'
    );
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-red-100 px-2.5 py-0.5 text-[11px] font-black text-red-800 uppercase tracking-wider flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-red-600" />
              Citizen Journalism Desk
            </span>
            <span className="text-xs font-bold text-slate-500">
              वाचक व स्थानिक बातमीदार इनबॉक्स
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            वाचक पत्रकार डेस्क (Citizen News Reports Manager)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            वाचकांनी, गावकऱ्यांनी आणि बातमीदारांनी पाठवलेल्या स्थानिक समस्या, फोटो व बातम्यांची पडताळणी करा आणि १-क्लिकमध्ये प्रकाशित करा.
          </p>
        </div>
      </div>

      {/* 2. Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">
            एकूण प्राप्त बातम्या
          </span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
            {stats.total}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">वाचकांकडून आलेल्या सर्व नोंदी</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-200 bg-amber-50/40 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 block uppercase">
            पडताळणी बाकी (Pending)
          </span>
          <span className="text-2xl font-black text-amber-600 font-mono mt-1 block">
            {stats.pending}
          </span>
          <span className="text-[10px] text-amber-800/70 mt-0.5 block">संपादकांच्या मंजुरीच्या प्रतीक्षेत</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-blue-200 bg-blue-50/40 shadow-xs">
          <span className="text-[11px] font-bold text-blue-700 block uppercase">
            सत्यापित बातम्या (Verified)
          </span>
          <span className="text-2xl font-black text-blue-600 font-mono mt-1 block">
            {stats.verified}
          </span>
          <span className="text-[10px] text-blue-800/70 mt-0.5 block">पडताळणी पूर्ण झालेले रिपोर्ट्स</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-emerald-200 bg-emerald-50/40 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 block uppercase">
            लाईव्ह प्रकाशित (Published)
          </span>
          <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
            {stats.published}
          </span>
          <span className="text-[10px] text-emerald-800/70 mt-0.5 block">वेबसाईटवर लाईव्ह झालेल्या बातम्या</span>
        </div>
      </div>

      {/* 3. Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {(
          [
            { key: 'ALL', label: `सर्व बातम्या (${stats.total})` },
            { key: 'PENDING_REVIEW', label: `पडताळणी बाकी (${stats.pending})` },
            { key: 'VERIFIED', label: `सत्यापित (${stats.verified})` },
            { key: 'PUBLISHED', label: `लाईव्ह प्रकाशित (${stats.published})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelectedStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedStatusFilter === tab.key
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Reports List Cards */}
      <div className="space-y-4">
        {filteredReports.map((report) => {
          const isPending = report.status === 'PENDING_REVIEW';
          const isVerified = report.status === 'VERIFIED';
          const isPublished = report.status === 'PUBLISHED';
          const isRejected = report.status === 'REJECTED';

          return (
            <div
              key={report.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4 hover:border-red-300 transition-all"
            >
              {/* Top Row: Reporter Meta & Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                    {report.reportNumber}
                  </span>
                  <span className="rounded bg-red-100 text-red-800 text-[10px] font-black uppercase px-2 py-0.5">
                    {report.category}
                  </span>
                  <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-red-600" />
                    <span>{report.talukaVillage}, जि. {report.district}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {report.submittedAt}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                      isPublished
                        ? 'bg-emerald-100 text-emerald-800'
                        : isVerified
                        ? 'bg-blue-100 text-blue-800'
                        : isPending
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {isPublished
                      ? 'Live Published'
                      : isVerified
                      ? 'Verified'
                      : isPending
                      ? 'Pending Review'
                      : 'Rejected'}
                  </span>
                </div>
              </div>

              {/* Main Content Grid: Text & Media */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 space-y-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {report.headline}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {report.description}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      👤 बातमीदार: <strong>{report.reporterName}</strong>
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-emerald-700">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{report.reporterMobile}</span>
                    </span>
                  </div>

                  {report.adminNotes && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                      <strong>संपादकीय नोंद:</strong> {report.adminNotes}
                    </div>
                  )}
                </div>

                {/* Right: Media Attachment Preview */}
                {report.mediaUrl && (
                  <div className="md:col-span-4 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-48">
                    <img
                      src={report.mediaUrl}
                      alt={report.headline}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Card Footer: Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleWhatsAppReply(report)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 font-bold cursor-pointer transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span>बातमीदाराशी WhatsApp चॅट</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mark Verified Button */}
                  {isPending && (
                    <button
                      type="button"
                      onClick={() => handleMarkVerified(report)}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 font-bold cursor-pointer shadow-xs"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>सत्यापित करा (Mark Verified)</span>
                    </button>
                  )}

                  {/* Convert to Published Post */}
                  {!isPublished && (
                    <button
                      type="button"
                      onClick={() => handleConvertToPublishedPost(report)}
                      className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white px-4 py-1.5 font-black cursor-pointer shadow-md shadow-red-200 transition-all"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>पोर्टलवर बातमी म्हणून लाईव्ह करा</span>
                    </button>
                  )}

                  {/* Reject Button */}
                  {!isRejected && !isPublished && (
                    <button
                      type="button"
                      onClick={() => handleRejectReport(report)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                    >
                      नाकारा
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteReport(report.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                    title="हटवा"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
