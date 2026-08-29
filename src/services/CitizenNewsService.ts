import { CitizenNewsReport } from '../types';

const STORAGE_KEY = 'infonews_citizen_reports_v1';

export const SEED_CITIZEN_REPORTS: CitizenNewsReport[] = [
  {
    id: 'cr-101',
    reportNumber: 'INF-CIT-9821',
    reporterName: 'विलास मडावी',
    reporterMobile: '9823411223',
    reporterEmail: 'vilas.madavi@gmail.com',
    district: 'गडचिरोली',
    talukaVillage: 'भामरागड (आरेवाडा)',
    category: 'नैसर्गिक आपत्ती व पूर',
    headline: 'भामरागड-आलापल्ली मार्गावरील पर्लकोटा पुलावर पाणी; २० गावांचा संपर्क तुटला',
    description:
      'गेल्या २४ तासांत झालेल्या मुसळधार पावसामुळे पर्लकोटा नदीच्या पाणीपातळीत मोठी वाढ झाली आहे. पुलावर ३ फूट पाणी असल्याने वाहतूक पूर्णपणे ठप्प झाली आहे. स्थानिक प्रशासनाने तातडीने बोटींची व्यवस्था करावी अशी ग्रामस्थांची मागणी आहे.',
    mediaUrl:
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80',
    mediaType: 'IMAGE',
    status: 'VERIFIED',
    submittedAt: '२९ ऑगस्ट २०२६, स. ०८:४५',
    adminNotes: 'स्थानिक बातमीदाराशी फोनवर पडताळणी झाली. बातमी सत्य आहे.',
  },
  {
    id: 'cr-102',
    reportNumber: 'INF-CIT-9822',
    reporterName: 'गजानन सूर्यवंशी',
    reporterMobile: '9422188990',
    district: 'लातूर',
    talukaVillage: 'औसा रोड, लातूर',
    category: 'शेतकरी व कृषी समस्या',
    headline: 'लातूर APMC मध्ये नवीन सोयाबीनची विक्रमी आवक; हमीभावापेक्षा कमी दर मिळत असल्याने शेतकरी आक्रमक',
    description:
      'बाजार समितीत नवीन सोयाबीनला ₹४,१०० ते ₹४,३०० दर मिळत असल्याने शेतकऱ्यांमध्ये तीव्र नाराजी आहे. शासनाने घोषित केलेला ₹४,८९२ हमीभाव मिळावा अन्यथा लिलाव बंद पाडण्याचा इशारा शेतकरी संघटनेने दिला आहे.',
    mediaUrl:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
    mediaType: 'IMAGE',
    status: 'PENDING_REVIEW',
    submittedAt: '२९ ऑगस्ट २०२६, दु. १२:१५',
  },
  {
    id: 'cr-103',
    reportNumber: 'INF-CIT-9823',
    reporterName: 'सचिन शिंदे',
    reporterMobile: '9890123456',
    district: 'पुणे',
    talukaVillage: 'शिक्रापूर (ता. शिरूर)',
    category: 'स्थानिक नागरी समस्या',
    headline: 'पुणे-नगर महामार्गावर शिक्रापूर चौकात खड्ड्यांमुळे वाहनांच्या ३ किमी लांबच लांब रांगा',
    description:
      'पावसामुळे महामार्गावर मोठे खड्डे पडले असून दररोज सकाळी व संध्याकाळी चाकरमान्यांना २ तास वाहतूक कोंडीचा सामना करावा लागत आहे. राष्ट्रीय महामार्ग प्राधिकरणाने तातडीने डांबरीकरण करावे.',
    mediaUrl:
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    mediaType: 'IMAGE',
    status: 'PUBLISHED',
    submittedAt: '२८ ऑगस्ट २०२६, सं. ०६:३०',
    adminNotes: 'पोर्टलवर विशेष वृत्त म्हणून प्रकाशित करण्यात आले.',
  },
];

export class CitizenNewsService {
  public static getReports(): CitizenNewsReport[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    this.saveReports(SEED_CITIZEN_REPORTS);
    return SEED_CITIZEN_REPORTS;
  }

  public static saveReports(reports: CitizenNewsReport[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
      window.dispatchEvent(
        new CustomEvent('infonews:citizen-news-updated', { detail: reports })
      );
    } catch {}
  }

  public static getReportById(id: string): CitizenNewsReport | undefined {
    return this.getReports().find((r) => r.id === id);
  }

  public static submitReport(
    data: Omit<CitizenNewsReport, 'id' | 'reportNumber' | 'status' | 'submittedAt'>
  ): CitizenNewsReport {
    const reports = this.getReports();
    const newReport: CitizenNewsReport = {
      ...data,
      id: `cr-${Date.now()}`,
      reportNumber: `INF-CIT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'PENDING_REVIEW',
      submittedAt: new Date().toLocaleString('mr-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    };

    const updated = [newReport, ...reports];
    this.saveReports(updated);
    return newReport;
  }

  public static updateReportStatus(
    id: string,
    status: CitizenNewsReport['status'],
    adminNotes?: string
  ): CitizenNewsReport[] {
    const reports = this.getReports();
    const updated = reports.map((r) =>
      r.id === id
        ? {
            ...r,
            status,
            adminNotes: adminNotes !== undefined ? adminNotes : r.adminNotes,
          }
        : r
    );
    this.saveReports(updated);
    return updated;
  }

  public static deleteReport(id: string): CitizenNewsReport[] {
    const reports = this.getReports().filter((r) => r.id !== id);
    this.saveReports(reports);
    return reports;
  }

  public static generateWhatsAppDeskSubmissionUrl(
    report: CitizenNewsReport,
    deskNumber = '+919890012345'
  ): string {
    const text = `📢 *वाचक पत्रकार - थेट बातमी / बातमीदार रिपोर्ट*\n\n📌 *टोकन क्र:* ${report.reportNumber}\n👤 *बातमीदार:* ${report.reporterName}\n📞 *मोबाईल:* ${report.reporterMobile}\n📍 *स्थान:* ${report.talukaVillage}, जि. ${report.district}\n🏷️ *प्रवर्ग:* ${report.category}\n\n📰 *मथळा (Headline):*\n${report.headline}\n\n📝 *तपशीलवार बातमी:*\n${report.description}\n\n${report.mediaUrl ? `📸 *फोटो/व्हिडिओ लिंक:* ${report.mediaUrl}\n` : ''}\nInfoNewsUpdate24 संपादकीय डेस्ककडे पडताळणीसाठी पाठवण्यात आली आहे.`;
    const cleanNumber = deskNumber.replace(/[^0-9]/g, '');
    return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(text)}`;
  }

  public static generateWhatsAppReporterReplyUrl(
    report: CitizenNewsReport,
    articleUrl = 'https://infonewsupdate24.com'
  ): string {
    const text = `नमस्कार ${report.reporterName} जी,\n\nInfoNewsUpdate24 वर आपण पाठवलेली बातमी *"${report.headline}"* आमच्या संपादकीय टीमने पडताळणीअंती पोर्टलवर प्रकाशित केली आहे! 👏\n\n🔗 *बातमीची थेट लिंक:* ${articleUrl}\n\nआपल्या परिसरातील अशाच ताज्या घडामोडी आम्हाला सातत्याने पाठवत राहा. धन्यवाद!\n- मुख्य संपादक, InfoNewsUpdate24`;
    const cleanNumber = report.reporterMobile.replace(/[^0-9]/g, '');
    return `https://api.whatsapp.com/send?phone=91${cleanNumber}&text=${encodeURIComponent(text)}`;
  }
}
