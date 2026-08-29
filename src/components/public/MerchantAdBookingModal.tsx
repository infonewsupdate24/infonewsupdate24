import React, { useState, useMemo } from 'react';
import {
  X,
  Check,
  CreditCard,
  QrCode,
  Smartphone,
  Upload,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Copy,
  MessageCircle,
  Building,
  Calendar,
  Layers,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { AdPackagePricing, AdSlotPositionType, MerchantAdBooking } from '../../types';
import { MerchantAdBookingService } from '../../services/MerchantAdBookingService';
import { DEFAULT_UPI_MERCHANT_CONFIG } from '../../data/merchantAdSeedData';

interface MerchantAdBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSlot?: AdSlotPositionType;
}

export const MerchantAdBookingModal: React.FC<MerchantAdBookingModalProps> = ({
  isOpen,
  onClose,
  defaultSlot = 'HEADER',
}) => {
  const packages = useMemo(() => MerchantAdBookingService.getPackages(), []);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 State
  const [selectedSlot, setSelectedSlot] = useState<AdSlotPositionType>(defaultSlot);
  const [selectedDuration, setSelectedDuration] = useState<7 | 15 | 30>(7);

  // Step 2 State
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState(
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80'
  );

  // Step 3 State
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Step 4 Completed State
  const [confirmedBooking, setConfirmedBooking] = useState<MerchantAdBooking | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const activePackage = useMemo(() => {
    return packages.find((p) => p.slot === selectedSlot) || packages[0];
  }, [packages, selectedSlot]);

  const totalAmount = useMemo(() => {
    if (selectedDuration === 7) return activePackage.price7Days;
    if (selectedDuration === 15) return activePackage.price15Days;
    return activePackage.price30Days;
  }, [activePackage, selectedDuration]);

  const upiQrData = useMemo(() => {
    const randomBookingRef = confirmedBooking?.bookingNumber || `INF-${Date.now().toString().slice(-4)}`;
    return MerchantAdBookingService.generateUPIPaymentLink(totalAmount, randomBookingRef);
  }, [totalAmount, confirmedBooking]);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upiQrData
  )}&margin=10`;

  if (!isOpen) return null;

  const handleCopyUpiId = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(DEFAULT_UPI_MERCHANT_CONFIG.upiId);
      setCopiedUpi(true);
      setToastMsg('UPI ID कॉपी झाला!');
      setTimeout(() => {
        setCopiedUpi(false);
        setToastMsg('');
      }, 3000);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiTransactionId.trim()) {
      alert('कृपया तुमच्या UPI पेमेंटचा 12-अंकी UTR किंवा Transaction ID प्रविष्ट करा.');
      return;
    }

    const booking = MerchantAdBookingService.createBooking({
      businessName,
      contactPerson,
      mobileNumber,
      email,
      slotPosition: selectedSlot,
      durationDays: selectedDuration,
      amountPaid: totalAmount,
      bannerImageUrl,
      targetUrl: targetUrl || `https://wa.me/91${mobileNumber}`,
      upiTransactionId,
    });

    setConfirmedBooking(booking);
    setStep(4);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-amber-600 p-5 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                SELF-SERVICE AD PORTAL
              </span>
              <span className="text-xs font-bold text-amber-200">
                पायरी {step} पैकी ४
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-1">
              📢 InfoNewsUpdate24 वर स्वतःची जाहिरात बुक करा
            </h2>
            <p className="text-xs text-red-100 mt-0.5">
              स्थानिक व्यापारी, दुकाने व उद्योजकांसाठी १-क्लिक ऑनलाइन जाहिरात बुकिंग व UPI पेमेंट सुविधा.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        <div className="grid grid-cols-4 bg-slate-100 text-[11px] font-bold text-center border-b border-slate-200">
          <div
            className={`py-2 ${
              step === 1
                ? 'bg-red-50 text-red-700 border-b-2 border-red-600 font-black'
                : step > 1
                ? 'text-emerald-700 font-bold'
                : 'text-slate-400'
            }`}
          >
            १. स्लॉट व प्लॅन
          </div>
          <div
            className={`py-2 ${
              step === 2
                ? 'bg-red-50 text-red-700 border-b-2 border-red-600 font-black'
                : step > 2
                ? 'text-emerald-700 font-bold'
                : 'text-slate-400'
            }`}
          >
            २. बॅनर व माहिती
          </div>
          <div
            className={`py-2 ${
              step === 3
                ? 'bg-red-50 text-red-700 border-b-2 border-red-600 font-black'
                : step > 3
                ? 'text-emerald-700 font-bold'
                : 'text-slate-400'
            }`}
          >
            ३. UPI पेमेंट
          </div>
          <div
            className={`py-2 ${
              step === 4
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600 font-black'
                : 'text-slate-400'
            }`}
          >
            ४. पावती व पुष्टी
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* ============================================================= */}
          {/* STEP 1: SELECT AD SLOT & DURATION */}
          {/* ============================================================= */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-900 uppercase tracking-wider block mb-2 text-xs">
                  जाहिरातीची जागा निवडा (Select Ad Slot):
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {packages.map((pkg) => {
                    const isSelected = selectedSlot === pkg.slot;
                    return (
                      <div
                        key={pkg.slot}
                        onClick={() => setSelectedSlot(pkg.slot)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-red-600 bg-red-50/50 shadow-md ring-2 ring-red-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 px-2 py-0.5 rounded">
                              {pkg.badge}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {pkg.dimensions}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-xs mt-1">
                            {pkg.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                            {pkg.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">
                            ७ दिवसांचे दर:
                          </span>
                          <span className="text-sm font-black text-slate-900 font-mono">
                            ₹{pkg.price7Days.toLocaleString('mr-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Duration Selector */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <label className="font-bold text-slate-900 uppercase tracking-wider block text-xs">
                  कालावधी निवडा (Select Duration):
                </label>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { days: 7, label: '७ दिवस (1 Week)', price: activePackage.price7Days },
                    { days: 15, label: '१५ दिवस (2 Weeks)', price: activePackage.price15Days },
                    { days: 30, label: '३० दिवस (1 Month)', price: activePackage.price30Days },
                  ].map((d) => (
                    <button
                      key={d.days}
                      type="button"
                      onClick={() => setSelectedDuration(d.days as any)}
                      className={`p-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                        selectedDuration === d.days
                          ? 'border-red-600 bg-white text-red-600 shadow-md ring-2 ring-red-400/30'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block text-xs">{d.label}</span>
                      <span className="block text-sm font-black text-slate-900 font-mono mt-1">
                        ₹{d.price.toLocaleString('mr-IN')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">एकूण देय रक्कम:</span>
                  <span className="text-xl font-black text-amber-400 font-mono">
                    ₹{totalAmount.toLocaleString('mr-IN')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-red-950 transition-all cursor-pointer"
                >
                  <span>पुढील पायरी (Next)</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* STEP 2: MERCHANT DETAILS & BANNER */}
          {/* ============================================================= */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    व्यवसाय / दुकानाचे नाव (Business Name): *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="उदा. महालक्ष्मी ज्वेलर्स"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    संपर्क व्यक्तीचे नाव (Contact Person): *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="उदा. अमोल कुलकर्णी"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    मोबाईल नंबर (WhatsApp Number): *
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="उदा. 9822112233"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-slate-900 focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ईमेल आयडी (Email - ऐच्छिक):
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="उदा. business@gmail.com"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  क्लिक केल्यावर उघडणारी लिंक (Website URL / WhatsApp Chat):
                </label>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="उदा. https://wa.me/919822112233 किंवा https://mywebsite.com"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-slate-900 focus:border-red-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  (वाचकांनी जाहिरातीवर क्लिक केल्यावर तुमचा व्हॉट्सॲप चॅट किंवा वेबसाईट उघडेल)
                </span>
              </div>

              {/* Banner Image URL / Upload */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block mb-1">
                  जाहिरात बॅनर इमेज लिंक (Banner Image URL):
                </label>
                <input
                  type="url"
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-slate-900 focus:border-red-500 focus:outline-hidden"
                />

                {/* Banner Live Mockup Preview */}
                <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-red-600" />
                    <span>बॅनर प्रिव्ह्यू ({activePackage.dimensions})</span>
                  </span>
                  <div className="rounded-xl overflow-hidden border border-slate-300 bg-white max-h-36 flex items-center justify-center">
                    <img
                      src={bannerImageUrl}
                      alt="Banner Preview"
                      className="w-full h-auto object-cover max-h-36"
                      onError={(e) => {
                        (e.target as any).src =
                          'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>मागे (Back)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!businessName.trim() || !contactPerson.trim() || !mobileNumber.trim()) {
                      alert('कृपया व्यवसायाचे नाव, संपर्क व्यक्ती आणि मोबाईल नंबर प्रविष्ट करा.');
                      return;
                    }
                    setStep(3);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 px-6 py-2.5 text-xs font-black text-white shadow-md cursor-pointer"
                >
                  <span>UPI पेमेंट कडे जा</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* STEP 3: INSTANT UPI PAYMENT & UTR INPUT */}
          {/* ============================================================= */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                {/* QR Code Container (5 Cols) */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-700 space-y-3">
                  <span className="rounded-md bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                    SCAN & PAY WITH ANY UPI APP
                  </span>

                  <div className="bg-white p-2.5 rounded-2xl shadow-inner">
                    <img
                      src={qrImageUrl}
                      alt="UPI QR Code"
                      className="h-40 w-40 object-contain rounded-lg"
                    />
                  </div>

                  <div className="text-center space-y-0.5">
                    <span className="text-[11px] text-slate-400 block">स्कॅन करा व भरा:</span>
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      ₹{totalAmount.toLocaleString('mr-IN')}
                    </span>
                  </div>
                </div>

                {/* UPI Details & UTR Input (7 Cols) */}
                <div className="sm:col-span-7 space-y-3.5">
                  {/* UPI ID Copy Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      किंवा खालील UPI ID वर पैसे पाठवा:
                    </span>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-300">
                      <span className="font-mono font-black text-slate-900 text-xs">
                        {DEFAULT_UPI_MERCHANT_CONFIG.upiId}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUpiId}
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedUpi ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedUpi ? 'कॉपी झाले' : 'कॉपी'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 1-Click Pay Link for Mobile */}
                  <a
                    href={upiQrData}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-black text-white shadow-md transition-all sm:hidden"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>PhonePe / GPay वर थेट पे करा</span>
                  </a>

                  {/* UTR Input Field */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-900 block text-xs">
                      पेमेंट झाल्यानंतर मिळालेला 12-अंकी UPI UTR / Transaction Ref ID टाका: *
                    </label>
                    <input
                      type="text"
                      required
                      value={upiTransactionId}
                      onChange={(e) => setUpiTransactionId(e.target.value)}
                      placeholder="उदा. UPI-423891028374 किंवा 423891028374"
                      className="w-full rounded-xl border-2 border-red-500/80 bg-red-50/20 p-2.5 font-mono font-bold text-slate-900 text-xs focus:border-red-600 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      पेमेंट यशस्वी झाल्यावर तुमच्या PhonePe/GPay स्क्रीनवर दिसणारा १२-अंकी UTR नंबर येथे टाका.
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>मागे (Back)</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-200 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>पेमेंट कन्फर्म करा व पावती मिळवा</span>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================= */}
          {/* STEP 4: SUCCESS RECEIPT & WHATSAPP FORWARD */}
          {/* ============================================================= */}
          {step === 4 && confirmedBooking && (
            <div className="space-y-4 text-center py-2">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <Check className="h-8 w-8" />
              </div>

              <div>
                <span className="rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5">
                  BOOKING SUBMITTED SUCCESSFULLY
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1.5">
                  अभिनंदन! तुमची जाहिरात यशस्वीरीत्या नोंदवली गेली आहे.
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  बुकिंग क्रमांक: <strong className="font-mono text-slate-900">{confirmedBooking.bookingNumber}</strong>
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">व्यवसायाचे नाव:</span>
                    <span className="font-bold text-slate-900">{confirmedBooking.businessName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">कालावधी:</span>
                    <span className="font-bold text-slate-900">{confirmedBooking.durationDays} दिवस</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block">भरलेली रक्कम:</span>
                    <span className="font-black text-emerald-700 font-mono">
                      ₹{confirmedBooking.amountPaid.toLocaleString('mr-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">UPI UTR ID:</span>
                    <span className="font-mono text-slate-800">{confirmedBooking.upiTransactionId}</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Receipt Forward */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2.5">
                <p className="text-[11px] text-emerald-950 font-bold">
                  ⚡ जाहिरात त्वरित (१० मिनिटांत) लाईव्ह करण्यासाठी खालील बटण दाबून ही पावती संपादकांना WhatsApp वर पाठवा:
                </p>

                <a
                  href={MerchantAdBookingService.generateWhatsAppReceiptUrl(confirmedBooking)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 py-3 text-xs font-black text-white shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp वर संपादकांना पावती पाठवा</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  बंद करा (Done)
                </button>
              </div>
            </div>
          )}
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
