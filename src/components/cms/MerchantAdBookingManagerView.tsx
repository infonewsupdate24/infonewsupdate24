import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Check,
  X,
  Trash2,
  ExternalLink,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  QrCode,
  DollarSign,
  TrendingUp,
  Clock,
  Eye,
  Settings,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { AdPackagePricing, MerchantAdBooking } from '../../types';
import { MerchantAdBookingService } from '../../services/MerchantAdBookingService';
import { DEFAULT_UPI_MERCHANT_CONFIG } from '../../data/merchantAdSeedData';
import { useApp } from '../../context/AppContext';

export const MerchantAdBookingManagerView: React.FC = () => {
  const { addAd } = useApp();
  const [bookings, setBookings] = useState<MerchantAdBooking[]>(() =>
    MerchantAdBookingService.getBookings()
  );
  const [packages, setPackages] = useState<AdPackagePricing[]>(() =>
    MerchantAdBookingService.getPackages()
  );
  const [activeTab, setActiveTab] = useState<'bookings' | 'packages' | 'upi'>('bookings');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<MerchantAdBooking | null>(null);

  // UPI settings state
  const [upiId, setUpiId] = useState(DEFAULT_UPI_MERCHANT_CONFIG.upiId);
  const [merchantName, setMerchantName] = useState(DEFAULT_UPI_MERCHANT_CONFIG.merchantName);
  const [supportMobile, setSupportMobile] = useState(DEFAULT_UPI_MERCHANT_CONFIG.supportMobile);

  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setBookings(e.detail);
      }
    };
    window.addEventListener('infonews:merchant-bookings-updated', handleUpdate);
    return () =>
      window.removeEventListener('infonews:merchant-bookings-updated', handleUpdate);
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = bookings
      .filter((b) => b.status === 'ACTIVE')
      .reduce((sum, b) => sum + b.amountPaid, 0);
    const activeCount = bookings.filter((b) => b.status === 'ACTIVE').length;
    const pendingCount = bookings.filter((b) => b.status === 'PENDING_REVIEW').length;
    return { totalRevenue, activeCount, pendingCount, totalCount: bookings.length };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (statusFilter === 'ALL') return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const handleApproveAndActivate = (booking: MerchantAdBooking) => {
    // 1. Update Booking status to ACTIVE
    const updated = MerchantAdBookingService.updateBookingStatus(
      booking.id,
      'ACTIVE',
      'पेमेंट व्हेरिफाय झाले. जाहिरात पोर्टलवर थेट सक्रिय करण्यात आली.'
    );
    setBookings(updated);

    // 2. Inject into App Ad Units Engine
    try {
      const positionMap: Record<string, any> = {
        HEADER: 'HEADER',
        ARTICLE_MID: 'ARTICLE_MIDDLE',
        SIDEBAR: 'SIDEBAR_TOP',
        MOBILE_STICKY: 'MOBILE_STICKY',
        EPAPER_SOLUS: 'EPAPER_HEADER',
      };

      addAd({
        title: `${booking.businessName} (प्रायोजक जाहिरात)`,
        type: 'BANNER',
        position: positionMap[booking.slotPosition] || 'HEADER',
        codeOrUrl: booking.bannerImageUrl,
        targetUrl: booking.targetUrl,
        status: 'ACTIVE',
        priority: 10,
        deviceTargeting: 'ALL',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + booking.durationDays * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        sponsorName: booking.businessName,
        sponsorBadge: true,
        openInNewTab: true,
      });
    } catch {}

    setToastMsg(`✅ ${booking.businessName} ची जाहिरात मंजूर झाली व पोर्टलवर लाईव्ह झाली!`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleRejectBooking = (booking: MerchantAdBooking) => {
    const reason = prompt('जाहिरात नामंजूर करण्याचे कारण प्रविष्ट करा:');
    if (reason !== null) {
      const updated = MerchantAdBookingService.updateBookingStatus(
        booking.id,
        'REJECTED',
        reason || 'पेमेंट UTR जुळले नाही किंवा अवैध बॅनर.'
      );
      setBookings(updated);
      setToastMsg('जाहिरात नामंजूर केली.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleDeleteBooking = (id: string) => {
    if (confirm('ही जाहिरात नोंद कायमची हटवायची आहे का?')) {
      const updated = MerchantAdBookingService.deleteBooking(id);
      setBookings(updated);
      setToastMsg('नोंद हटवली.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleSavePackages = (e: React.FormEvent) => {
    e.preventDefault();
    MerchantAdBookingService.setPackages(packages);
    setToastMsg('✅ जाहिरात दर व पॅकेजेस सेव्ह झाले!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSaveUpi = (e: React.FormEvent) => {
    e.preventDefault();
    DEFAULT_UPI_MERCHANT_CONFIG.upiId = upiId;
    DEFAULT_UPI_MERCHANT_CONFIG.merchantName = merchantName;
    DEFAULT_UPI_MERCHANT_CONFIG.supportMobile = supportMobile;
    setToastMsg('✅ UPI पेमेंट सेटिंग्ज अपडेट झाल्या!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-100 px-2.5 py-0.5 text-[11px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5" />
              Direct Merchant Ad Engine
            </span>
            <span className="text-xs font-bold text-slate-500">स्थानिक व्यापारी जाहिरात व्यवस्थापक</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            व्यापारी जाहिरात स्वयंसेवा बुकिंग (UPI Ad Bookings)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            स्थानिक दुकाने, क्लासेस व उद्योजकांनी भरलेले UPI पेमेंट्स तपासा आणि जाहिरात एका क्लिकवर वेबसाईटवर लाईव्ह करा.
          </p>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">
            एकूण जाहिरात कमाई (Revenue)
          </span>
          <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
            ₹{stats.totalRevenue.toLocaleString('mr-IN')}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">सक्रिय जाहिरातींमधून मिळालेली रक्कम</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">
            व्हेरिफिकेशन बाकी (Pending Review)
          </span>
          <span className="text-2xl font-black text-amber-600 font-mono mt-1 block">
            {stats.pendingCount}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">ज्यांचे UPI UTR तपासायचे आहे</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">
            सध्या लाईव्ह जाहिराती (Active Ads)
          </span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
            {stats.activeCount}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">वेबसाईट व ई-पेपरवर चालू असणारे बॅनर्स</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">
            एकूण प्राप्त बुकिंग्ज
          </span>
          <span className="text-2xl font-black text-slate-700 font-mono mt-1 block">
            {stats.totalCount}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">आतापर्यंत नोंदवलेल्या सर्व नोंदी</span>
        </div>
      </div>

      {/* 3. Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
            activeTab === 'bookings'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>📋 व्यापारी बुकिंग्ज यादी ({bookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('packages')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
            activeTab === 'packages'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>💰 जाहिरात दर व पॅकेजेस व्यवस्थापक</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upi')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
            activeTab === 'upi'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <QrCode className="h-4 w-4" />
          <span>📱 UPI पेमेंट व QR कोड सेटिंग्ज</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MERCHANT BOOKINGS LIST */}
      {/* ========================================================================= */}
      {activeTab === 'bookings' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-600" />
              <span>स्थानिक व्यापारी जाहिरात नोंदी ({filteredBookings.length})</span>
            </h3>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs">
              {['ALL', 'PENDING_REVIEW', 'ACTIVE', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL'
                    ? 'सर्व'
                    : st === 'PENDING_REVIEW'
                    ? 'प्रलंबित (Pending)'
                    : st === 'ACTIVE'
                    ? 'सक्रिय (Active)'
                    : 'नामंजूर (Rejected)'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">बुकिंग क्र. / तारीख</th>
                  <th className="p-3">व्यवसाय व संपर्क</th>
                  <th className="p-3">जाहिरात जागा व कालावधी</th>
                  <th className="p-3">रक्कम व UPI UTR</th>
                  <th className="p-3">बॅनर प्रिव्ह्यू</th>
                  <th className="p-3">स्थिती</th>
                  <th className="p-3 text-right">कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <span className="font-mono font-bold text-slate-900 block">
                        {b.bookingNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">{b.createdAt}</span>
                    </td>

                    <td className="p-3">
                      <strong className="text-slate-900 block">{b.businessName}</strong>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span>{b.contactPerson}</span>
                        <a
                          href={`https://wa.me/91${b.mobileNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline flex items-center gap-0.5 ml-1"
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>{b.mobileNumber}</span>
                        </a>
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="rounded bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 block w-fit">
                        {b.slotPosition}
                      </span>
                      <span className="text-[11px] text-slate-600 mt-1 block">
                        {b.durationDays} दिवस कालावधी
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="font-mono font-black text-emerald-700 text-sm block">
                        ₹{b.amountPaid.toLocaleString('mr-IN')}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        UTR: {b.upiTransactionId}
                      </span>
                    </td>

                    <td className="p-3">
                      <a
                        href={b.bannerImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block h-10 w-20 rounded-lg overflow-hidden border border-slate-300 bg-slate-100"
                        title="पूर्ण बॅनर उघडा"
                      >
                        <img
                          src={b.bannerImageUrl}
                          alt=""
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </a>
                    </td>

                    <td className="p-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                          b.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'PENDING_REVIEW'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {b.status === 'ACTIVE'
                          ? 'सक्रिय (Live)'
                          : b.status === 'PENDING_REVIEW'
                          ? 'तपासणी बाकी'
                          : 'नामंजूर'}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === 'PENDING_REVIEW' && (
                          <button
                            type="button"
                            onClick={() => handleApproveAndActivate(b)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-xs cursor-pointer"
                            title="मंजूर करा व लाईव्ह करा"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>मंजूर करा</span>
                          </button>
                        )}

                        {b.status === 'PENDING_REVIEW' && (
                          <button
                            type="button"
                            onClick={() => handleRejectBooking(b)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                            title="नामंजूर करा"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteBooking(b.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                          title="हटवा"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PACKAGES & PRICING MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'packages' && (
        <form
          onSubmit={handleSavePackages}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 max-w-4xl"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-red-600" />
              <span>जाहिरात स्लॉट व दर व्यवस्थापन (Pricing Packages)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              प्रत्येक स्लॉटचे ७, १५ आणि ३० दिवसांचे दर तुम्ही तुमच्या आवडीनुसार बदलू शकता.
            </p>
          </div>

          <div className="space-y-4">
            {packages.map((pkg, idx) => (
              <div
                key={pkg.slot}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 text-xs">{pkg.title}</strong>
                  <span className="text-[10px] text-slate-400 font-mono">{pkg.dimensions}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">७ दिवसांचे दर (₹):</label>
                    <input
                      type="number"
                      value={pkg.price7Days}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const copy = [...packages];
                        copy[idx].price7Days = val;
                        setPackages(copy);
                      }}
                      className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">१५ दिवसांचे दर (₹):</label>
                    <input
                      type="number"
                      value={pkg.price15Days}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const copy = [...packages];
                        copy[idx].price15Days = val;
                        setPackages(copy);
                      }}
                      className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">३० दिवसांचे दर (₹):</label>
                    <input
                      type="number"
                      value={pkg.price30Days}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const copy = [...packages];
                        copy[idx].price30Days = val;
                        setPackages(copy);
                      }}
                      className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold text-emerald-800"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-6 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>नवीन दर सेव्ह करा</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: UPI SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'upi' && (
        <form
          onSubmit={handleSaveUpi}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 max-w-2xl"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-emerald-600" />
              <span>अधिकृत UPI खाते व संपर्क माहिती</span>
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                तुमचा UPI ID (Google Pay / PhonePe / Bank UPI): *
              </label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="उदा. infonewsupdate24@okhdfcbank"
                className="w-full rounded-xl border border-slate-300 p-2.5 font-mono font-bold text-slate-900 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                पेमेंट मिळणाऱ्या फर्म / वृत्तपत्राचे नाव (Payee Name):
              </label>
              <input
                type="text"
                required
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                जाहिरात मदत व WhatsApp संपर्क नंबर:
              </label>
              <input
                type="tel"
                required
                value={supportMobile}
                onChange={(e) => setSupportMobile(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>सेटिंग्ज सेव्ह करा</span>
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
