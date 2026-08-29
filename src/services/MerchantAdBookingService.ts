import { AdPackagePricing, MerchantAdBooking } from '../types';
import {
  DEFAULT_AD_PACKAGES,
  DEFAULT_UPI_MERCHANT_CONFIG,
  SEED_MERCHANT_BOOKINGS,
} from '../data/merchantAdSeedData';

const STORAGE_KEY = 'infonews_merchant_bookings_v1';
const PACKAGES_STORAGE_KEY = 'infonews_merchant_ad_packages_v1';

export class MerchantAdBookingService {
  public static getBookings(): MerchantAdBooking[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return SEED_MERCHANT_BOOKINGS;
  }

  public static setBookings(bookings: MerchantAdBooking[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
      window.dispatchEvent(
        new CustomEvent('infonews:merchant-bookings-updated', { detail: bookings })
      );
    } catch {}
  }

  public static getPackages(): AdPackagePricing[] {
    try {
      const stored = localStorage.getItem(PACKAGES_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_AD_PACKAGES;
  }

  public static setPackages(packages: AdPackagePricing[]) {
    try {
      localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(packages));
    } catch {}
  }

  public static createBooking(
    data: Omit<MerchantAdBooking, 'id' | 'bookingNumber' | 'createdAt' | 'status'>
  ): MerchantAdBooking {
    const bookings = this.getBookings();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `INF-AD-${randomNum}`;

    const newBooking: MerchantAdBooking = {
      ...data,
      id: `mb-${Date.now()}`,
      bookingNumber,
      status: 'PENDING_REVIEW',
      createdAt: new Date().toLocaleDateString('mr-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      adminNote: 'नवीन बुकिंग प्राप्त झाली - UPI UTR व्हेरिफिकेशन प्रलंबित.',
    };

    const updated = [newBooking, ...bookings];
    this.setBookings(updated);
    return newBooking;
  }

  public static updateBookingStatus(
    id: string,
    status: MerchantAdBooking['status'],
    adminNote?: string
  ): MerchantAdBooking[] {
    const bookings = this.getBookings();
    const updated = bookings.map((b) => {
      if (b.id !== id) return b;
      const today = new Date().toLocaleDateString('mr-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return {
        ...b,
        status,
        startDate: status === 'ACTIVE' ? today : b.startDate,
        adminNote: adminNote || b.adminNote,
      };
    });
    this.setBookings(updated);
    return updated;
  }

  public static deleteBooking(id: string): MerchantAdBooking[] {
    const bookings = this.getBookings();
    const updated = bookings.filter((b) => b.id !== id);
    this.setBookings(updated);
    return updated;
  }

  public static generateUPIPaymentLink(amount: number, bookingNumber: string): string {
    const pa = DEFAULT_UPI_MERCHANT_CONFIG.upiId;
    const pn = encodeURIComponent(DEFAULT_UPI_MERCHANT_CONFIG.merchantName);
    const tn = encodeURIComponent(`Ad Booking ${bookingNumber}`);
    return `upi://pay?pa=${pa}&pn=${pn}&am=${amount}&cu=INR&tn=${tn}`;
  }

  public static generateWhatsAppReceiptUrl(booking: MerchantAdBooking): string {
    const text = `📢 *नवीन जाहिरात बुकिंग पावती (InfoNewsUpdate24)*\n\n🔖 *बुकिंग क्रमांक:* ${booking.bookingNumber}\n🏪 *व्यवसायाचे नाव:* ${booking.businessName}\n👤 *संपर्क व्यक्ती:* ${booking.contactPerson} (${booking.mobileNumber})\n📍 *जाहिरात जागा:* ${booking.slotPosition}\n⏱️ *कालावधी:* ${booking.durationDays} दिवस\n💰 *भरलेली रक्कम:* ₹${booking.amountPaid.toLocaleString('mr-IN')}\n💳 *UPI UTR / Trans ID:* ${booking.upiTransactionId}\n\n👉 *माझा जाहिरात बॅनर तपासा:* ${booking.bannerImageUrl}\n🔗 *टार्गेट लिंक:* ${booking.targetUrl}\n\nकृपया जाहिरात तपासून तात्काळ लाईव्ह करावी ही विनंती!`;
    return `https://api.whatsapp.com/send?phone=919876543210&text=${encodeURIComponent(text)}`;
  }
}
