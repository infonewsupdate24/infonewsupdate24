import React, { useState } from 'react';
import {
  X,
  Send,
  Camera,
  MapPin,
  User,
  Phone,
  FileText,
  CheckCircle2,
  Share2,
  AlertCircle,
  Sparkles,
  Upload,
  Check,
} from 'lucide-react';
import { CitizenNewsReport } from '../../types';
import { CitizenNewsService } from '../../services/CitizenNewsService';

interface CitizenNewsSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CitizenNewsSubmissionModal: React.FC<
  CitizenNewsSubmissionModalProps
> = ({ isOpen, onClose }) => {
  const [reporterName, setReporterName] = useState('');
  const [reporterMobile, setReporterMobile] = useState('');
  const [district, setDistrict] = useState('गडचिरोली');
  const [talukaVillage, setTalukaVillage] = useState('');
  const [category, setCategory] = useState('स्थानिक नागरी समस्या');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] =
    useState<CitizenNewsReport | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName || !reporterMobile || !headline || !description) {
      alert('कृपया सर्व आवश्यक माहिती भरा.');
      return;
    }

    setIsSubmitting(true);
    const newReport = CitizenNewsService.submitReport({
      reporterName: reporterName.trim(),
      reporterMobile: reporterMobile.trim(),
      district,
      talukaVillage: talukaVillage.trim() || district,
      category,
      headline: headline.trim(),
      description: description.trim(),
      mediaUrl: mediaUrl.trim() || undefined,
      mediaType: 'IMAGE',
    });

    setIsSubmitting(false);
    setSubmittedReport(newReport);
  };

  const handleSendViaWhatsApp = () => {
    if (!submittedReport) return;
    const url =
      CitizenNewsService.generateWhatsAppDeskSubmissionUrl(submittedReport);
    window.open(url, '_blank');
  };

  const handleReset = () => {
    setSubmittedReport(null);
    setReporterName('');
    setReporterMobile('');
    setTalukaVillage('');
    setHeadline('');
    setDescription('');
    setMediaUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200 text-slate-900 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-amber-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md font-bold">
              ✍️
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black leading-tight">
                वाचक पत्रकार - बातमी पाठवा (Citizen Journalism)
              </h3>
              <p className="text-xs text-red-100">
                तुमच्या गावातील/परिसरातील समस्या, घटना व बातमी थेट संपादकांना पाठवा
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {submittedReport ? (
            /* Success State */
            <div className="text-center space-y-4 py-4">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div className="space-y-1">
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-1 uppercase">
                  टोकन क्र: {submittedReport.reportNumber}
                </span>
                <h4 className="text-lg font-black text-slate-900 pt-2">
                  धन्यवाद {submittedReport.reporterName} जी!
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  आपण पाठवलेली बातमी InfoNewsUpdate24 च्या संपादकीय डेस्ककडे पडताळणीसाठी यशस्वीरीत्या नोंदवली गेली आहे.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
                <div className="text-xs font-bold text-slate-800">
                  📰 <strong>मथळा:</strong> {submittedReport.headline}
                </div>
                <div className="text-[11px] text-slate-500">
                  📍 <strong>स्थान:</strong> {submittedReport.talukaVillage}, जि. {submittedReport.district}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSendViaWhatsApp}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-5 py-2.5 font-bold text-white shadow-md transition-all cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>📲 WhatsApp वर संपादकांना पाठवा</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  बंद करा
                </button>
              </div>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Reporter Info Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    तुमचे नाव (Reporter Name): *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="उदा. विलास मडावी"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs font-bold focus:border-red-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    व्हॉट्सॲप मोबाईल नंबर: *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="उदा. 9823411223"
                      value={reporterMobile}
                      onChange={(e) => setReporterMobile(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs font-bold font-mono focus:border-red-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* District & Taluka */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">जिल्हा (District):</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-800"
                  >
                    <option value="गडचिरोली">गडचिरोली</option>
                    <option value="पुणे">पुणे</option>
                    <option value="मुंबई">मुंबई</option>
                    <option value="नागपूर">नागपूर</option>
                    <option value="नाशिक">नाशिक</option>
                    <option value="लातूर">लातूर</option>
                    <option value="छत्रपती संभाजीनगर">छत्रपती संभाजीनगर</option>
                    <option value="कोल्हापूर">कोल्हापूर</option>
                    <option value="सोलापूर">सोलापूर</option>
                    <option value="अमरावती">अमरावती</option>
                    <option value="चंद्रपूर">चंद्रपूर</option>
                    <option value="इतर">इतर जिल्हा</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    तालुका / गाव (Taluka / Village): *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="उदा. भामरागड / आरमोरी / शिक्रापूर"
                      value={talukaVillage}
                      onChange={(e) => setTalukaVillage(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs font-bold focus:border-red-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">बातमीचा प्रकार (Category):</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-800"
                >
                  <option value="स्थानिक नागरी समस्या">स्थानिक नागरी समस्या (रस्ते, वीज, पाणी)</option>
                  <option value="शेतकरी व कृषी समस्या">शेतकरी व कृषी समस्या (हमीभाव, पीक नुकसान)</option>
                  <option value="नैसर्गिक आपत्ती व पूर">नैसर्गिक आपत्ती, पाऊस व पूर</option>
                  <option value="अपघात व क्राईम">अपघात व ताजी घटना</option>
                  <option value="सण, उत्सव व संस्कृती">सण, उत्सव व सामाजिक उपक्रम</option>
                  <option value="शिक्षण व रोजगार">शिक्षण, शाळा व नोकरी</option>
                </select>
              </div>

              {/* Headline */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  बातमीचा मुख्य मथळा (News Headline in Marathi): *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. मुसळधार पावसामुळे पर्लकोटा पुलावर पाणी; २० गावांचा संपर्क तुटला"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900 focus:border-red-600 focus:outline-hidden"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  बातमीचा संपूर्ण तपशील (Full News Details): *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="घडलेली घटना, वेळ, ठिकाण आणि नागरिकांची मागणी सविस्तर लिहा..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs leading-relaxed text-slate-800 focus:border-red-600 focus:outline-hidden"
                />
              </div>

              {/* Media URL / Photo Link */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  घटनास्थळाचा फोटो / व्हिडिओ लिंक (Photo/Video URL):
                </label>
                <div className="relative">
                  <Camera className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://... फोटो किंवा व्हिडिओ लिंक (ऐच्छिक)"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs font-mono focus:border-red-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-[10px] text-slate-500">
                  🔒 तुमची संपर्क माहिती गोपनीय ठेवली जाईल.
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 px-6 py-2.5 font-black text-white shadow-md shadow-red-200 transition-all cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? 'नोंद होत आहे...' : 'बातमी सबमिट करा'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
