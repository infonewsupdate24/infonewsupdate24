export type InvoiceStatus = 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';

export type PaymentMethod =
  | 'UPI'
  | 'CASH'
  | 'NET_BANKING'
  | 'CHEQUE'
  | 'CREDIT_CARD'
  | 'NEFT_RTGS';

export type InvoiceCategory =
  | 'PORTAL_BANNER'
  | 'EPAPER_CLASSIFIED'
  | 'FESTIVAL_WISH'
  | 'SPONSORED_NEWS'
  | 'EPAPER_SUBSCRIPTION'
  | 'PRINT_COMMERCIAL'
  | 'OTHER';

export interface InvoiceItem {
  id: string;
  description: string;
  hsnSacCode?: string;
  quantity: number;
  unit: string;
  rate: number;
  gstPercent: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  billDate: string;
  dueDate: string;
  clientName: string;
  businessName?: string;
  clientPhone: string;
  clientEmail?: string;
  clientAddress?: string;
  clientGstin?: string;
  category: InvoiceCategory;
  categoryLabelMarathi: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  gstAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED';

export interface Quotation {
  id: string;
  quotationNumber: string;
  date: string;
  validUntil: string;
  clientName: string;
  businessName?: string;
  clientPhone: string;
  clientEmail?: string;
  clientAddress?: string;
  clientGstin?: string;
  category: InvoiceCategory;
  categoryLabelMarathi: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  gstAmount: number;
  totalAmount: number;
  status: QuotationStatus;
  convertedInvoiceId?: string;
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientContact {
  id: string;
  name: string;
  businessName?: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  category?: InvoiceCategory;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingStats {
  totalRevenue: number;
  collectedAmount: number;
  pendingDueAmount: number;
  totalInvoicesCount: number;
  paidInvoicesCount: number;
  pendingInvoicesCount: number;
  overdueInvoicesCount: number;
  totalClientsCount?: number;
}

export interface BillingSettings {
  // Business & Publication Profile
  publicationName: string;
  publicationTagline: string;
  businessAddress: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  rniNumber: string;
  state: string;
  stateCode: string;
  hsnSacCode: string;
  showGstin: boolean; // Toggle to Show or Hide GST Number across bills & quotations
  showBankQr: boolean; // Toggle to Show or Hide UPI Payment QR Code

  // Bank Account Details
  bankAccountName: string;
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankBranch: string;
  bankAccountType: string;

  // UPI & QR Code Settings
  upiId: string;
  upiPayeeName: string;
  upiMerchantCode?: string;

  // Default Invoicing & Terms
  invoicePrefix: string;
  quotationPrefix: string;
  defaultDueDays: number;
  defaultQuotationValidityDays: number;
  defaultInvoiceNotes: string;
  defaultInvoiceTerms: string;
  defaultQuotationNotes: string;
  defaultQuotationTerms: string;
  signatoryTitle: string;
}

export const DEFAULT_BILLING_SETTINGS: BillingSettings = {
  publicationName: 'InfoNewsUpdate24',
  publicationTagline: 'डिजिटल वृत्तपत्र, वेब पोर्टल व जाहिरात माध्यम समूह',
  businessAddress: 'मु. पो. ता. जि. गडचिरोली - ४४२६०५ (महाराष्ट्र)',
  phone: '+91 8799933629',
  email: 'infonewsupdate24@gmail.com',
  website: 'https://infonewsupdate24.com',
  gstin: '27AABCI1234F1Z9',
  rniNumber: 'MAHMUR/2024/88990',
  state: 'Maharashtra',
  stateCode: '27',
  hsnSacCode: '998361',
  showGstin: true,
  showBankQr: true,

  bankAccountName: 'InfoNewsUpdate24',
  bankName: 'HDFC Bank',
  bankAccountNumber: '50200088991122',
  bankIfsc: 'HDFC0001234',
  bankBranch: 'गडचिरोली मुख्य शाखा (Gadchiroli Branch)',
  bankAccountType: 'चालू खाते (Current Account)',

  upiId: 'infonewsupdate24@okhdfcbank',
  upiPayeeName: 'InfoNewsUpdate24',
  upiMerchantCode: 'INFO24',

  invoicePrefix: 'INU24/',
  quotationPrefix: 'QTN-INU24/',
  defaultDueDays: 7,
  defaultQuotationValidityDays: 15,
  defaultInvoiceNotes: 'InfoNewsUpdate24 डिजिटल पोर्टल व वृत्तपत्रात जाहिरात प्रसिद्ध केल्याबद्दल धन्यवाद.',
  defaultInvoiceTerms: '१. बिलाची रक्कम देय तारखेच्या आत अदा करावी.\n२. धनादेश / RTGS "InfoNewsUpdate24" नावे करावे.\n३. सर्व वाद गडचिरोली न्यायालयाच्या अखत्यारीत.',
  defaultQuotationNotes: 'InfoNewsUpdate24 डिजिटल पोर्टल व वृत्तपत्रात जाहिरात प्रसिद्धीसाठी अधिकृत दरपत्रक.',
  defaultQuotationTerms: '१. हे दरपत्रक १५ दिवसांसाठी वैध राहील.\n२. जाहिरात निश्चितीनंतर ५०% अग्रिम रक्कम आवश्यक.\n३. जीएसटी १८% लागू राहील.\n४. सर्व वाद गडचिरोली न्यायालयाच्या अखत्यारीत.',
  signatoryTitle: 'मुख्य संपादक / अधिकृत जाहिरात व्यवस्थापक',
};

const STORAGE_KEY_INVOICES = 'infonews_billbook_invoices_v1';
const STORAGE_KEY_CLIENTS = 'infonews_billbook_clients_v1';
const STORAGE_KEY_QUOTATIONS = 'infonews_billbook_quotations_v1';
const STORAGE_KEY_BILLING_SETTINGS = 'infonews_billbook_settings_v1';

export const SEED_CLIENTS: ClientContact[] = [
  {
    id: 'cli-001',
    name: 'राजेशजी मेश्राम',
    businessName: 'पतंजली मेगा स्टोअर व आयुर्वेद केंद्र, गडचिरोली',
    phone: '9822334455',
    email: 'patanjali.gad@gmail.com',
    address: 'मेन रोड, आंबेडकर चौक, गडचिरोली - ४४२६०५',
    gstin: '27AABCP1234F1Z5',
    category: 'PORTAL_BANNER',
    notes: 'नियमित मासिक बॅनर जाहिरातदार',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-28T10:00:00Z',
  },
  {
    id: 'cli-002',
    name: 'सचिनजी कांबळे',
    businessName: 'विदर्भ ऑटोमोबाईल्स व हिरो मोटोकॉर्प, गडचिरोली',
    phone: '9423112233',
    email: 'vidarbha.auto@gmail.com',
    address: 'चंद्रपूर रोड, आयटीआय जवळ, गडचिरोली - ४४२६०५',
    gstin: '27BBCPK5678G2Z1',
    category: 'PRINT_COMMERCIAL',
    notes: 'सण व नवीन बाईक लाँचिंग जाहिराती',
    createdAt: '2026-08-05T11:30:00Z',
    updatedAt: '2026-08-25T11:30:00Z',
  },
  {
    id: 'cli-003',
    name: 'प्रा. डॉ. विलासराव देशमुख',
    businessName: 'ज्ञानगंगा शिक्षण संस्था व कनिष्ठ महाविद्यालय, आरमोरी',
    phone: '9890445566',
    email: 'dnyanganga.armori@edu.in',
    address: 'कॉलेज कॅम्पस, आरमोरी रोड, गडचिरोली - ४४१२०८',
    category: 'SPONSORED_NEWS',
    notes: 'प्रवेश प्रक्रिया व गुणवंत विद्यार्थी सत्कार जाहिराती',
    createdAt: '2026-08-10T09:15:00Z',
    updatedAt: '2026-08-20T09:15:00Z',
  },
  {
    id: 'cli-004',
    name: 'सुधीरजी मुनगंटीवार जनसंपर्क कार्यालय',
    businessName: 'गडचिरोली-चिमूर लोकसभा विकास जनसंपर्क कक्ष',
    phone: '9822998877',
    email: 'pr.gadchiroli@gov.in',
    address: 'प्रशासकीय इमारत परिसर, गडचिरोली - ४४२६०५',
    category: 'FESTIVAL_WISH',
    notes: 'शासकीय योजना व सदिच्छा संदेश',
    createdAt: '2026-08-15T14:00:00Z',
    updatedAt: '2026-08-27T14:00:00Z',
  },
  {
    id: 'cli-005',
    name: 'सौ. मीनाताई गेडाम',
    businessName: 'आदिवासी महिला वनधन विकास संस्था, कुरखेडा',
    phone: '9765123456',
    email: 'vandhan.kurkheda@gmail.com',
    address: 'बाजार चौक, कुरखेडा, जि. गडचिरोली - ४४१२०९',
    category: 'EPAPER_CLASSIFIED',
    notes: 'महुवा व रानमेवा विक्री वर्गीकृत जाहिरात',
    createdAt: '2026-08-18T16:20:00Z',
    updatedAt: '2026-08-26T16:20:00Z',
  },
];

export const CATEGORY_OPTIONS: { id: InvoiceCategory; label: string; sac: string }[] = [
  { id: 'PORTAL_BANNER', label: 'वेबसाइट / पोर्टल बॅनर जाहिरात (Website Banner Ad)', sac: '998361' },
  { id: 'EPAPER_CLASSIFIED', label: 'ई-पेपर वर्गीकृत जाहिरात (E-Paper Classified Ad)', sac: '998362' },
  { id: 'FESTIVAL_WISH', label: 'सदिच्छा / सण / वाढदिवस शुभेच्छा जाहिरात (Festival Wishes)', sac: '998363' },
  { id: 'SPONSORED_NEWS', label: 'प्रायोजित वृत्त / प्रेस नोट (Sponsored News / PR)', sac: '998364' },
  { id: 'EPAPER_SUBSCRIPTION', label: 'ई-पेपर वार्षिक/मासिक वर्गणी (E-Paper Subscription)', sac: '998431' },
  { id: 'PRINT_COMMERCIAL', label: 'व्यावसायिक वृत्तपत्रीय जाहिरात (Commercial Display Ad)', sac: '998365' },
  { id: 'OTHER', label: 'इतर सेवा (Other Media Services)', sac: '998369' },
];

const SEED_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INU24/2026-27/001',
    billDate: '2026-08-28',
    dueDate: '2026-09-04',
    clientName: 'राजेशजी मेश्राम',
    businessName: 'पतंजली मेगा स्टोअर व आयुर्वेद केंद्र, गडचिरोली',
    clientPhone: '9822334455',
    clientEmail: 'patanjali.gad@gmail.com',
    clientAddress: 'मेन रोड, आंबेडकर चौक, गडचिरोली - ४४२६०५',
    clientGstin: '27AABCP1234F1Z5',
    category: 'PORTAL_BANNER',
    categoryLabelMarathi: 'वेबसाइट / पोर्टल बॅनर जाहिरात',
    items: [
      {
        id: 'item-1',
        description: 'होमपेज टॉप लीडरबोर्ड बॅनर जाहिरात (७२८x९० पिक्सेल) - ३० दिवस',
        hsnSacCode: '998361',
        quantity: 1,
        unit: 'महिना',
        rate: 5000,
        gstPercent: 18,
        amount: 5000,
      },
    ],
    subtotal: 5000,
    discountAmount: 500,
    gstAmount: 810,
    totalAmount: 5310,
    amountPaid: 5310,
    balanceDue: 0,
    status: 'PAID',
    paymentMethod: 'UPI',
    transactionRef: 'UPI/624198234812/HDFC',
    notes: '३० दिवसांचे होमपेज जाहिरात प्रदर्शन यशस्वीरीत्या सुरू झाले आहे.',
    terms: '१. बिलाची रक्कम ७ दिवसांच्या आत अदा करावी.\n२. सर्व वाद गडचिरोली न्यायालयाच्या अखत्यारीत.',
    createdAt: '2026-08-28T10:30:00Z',
    updatedAt: '2026-08-28T11:00:00Z',
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INU24/2026-27/002',
    billDate: '2026-08-27',
    dueDate: '2026-09-03',
    clientName: 'डॉ. सचिन इंगळे',
    businessName: 'इंगळे मल्टीस्पेशालिटी हॉस्पिटल व ट्रॉमा सेंटर',
    clientPhone: '9422118899',
    clientEmail: 'inglehospital@gmail.com',
    clientAddress: 'चंद्रपूर रोड, गडचिरोली - ४४२६०५',
    clientGstin: '27AXYZI9876E1Z2',
    category: 'EPAPER_CLASSIFIED',
    categoryLabelMarathi: 'ई-पेपर वर्गीकृत जाहिरात',
    items: [
      {
        id: 'item-2',
        description: 'डिजिटल ई-पेपर पृष्ठ क्र. १ वर बॉटम स्ट्रिप जाहिरात - ७ दिवस',
        hsnSacCode: '998362',
        quantity: 7,
        unit: 'दिवस',
        rate: 400,
        gstPercent: 5,
        amount: 2800,
      },
    ],
    subtotal: 2800,
    discountAmount: 0,
    gstAmount: 140,
    totalAmount: 2940,
    amountPaid: 2940,
    balanceDue: 0,
    status: 'PAID',
    paymentMethod: 'NET_BANKING',
    transactionRef: 'NEFT/MAHB262409811',
    notes: 'स्वातंत्र्य दिन विशेष आरोग्य तपासणी मोहिमेची जाहिरात.',
    terms: '१. जाहिरातीचा मजकूर अचूक प्रसिद्ध करण्यात आला आहे.',
    createdAt: '2026-08-27T14:15:00Z',
    updatedAt: '2026-08-27T16:00:00Z',
  },
  {
    id: 'inv-003',
    invoiceNumber: 'INU24/2026-27/003',
    billDate: '2026-08-26',
    dueDate: '2026-09-02',
    clientName: 'मा. आ. विजयभाऊ पाटील मित्रपरिवार',
    businessName: 'राष्ट्रवादी युवक काँग्रेस संपर्क कार्यालय',
    clientPhone: '9766554433',
    clientEmail: 'patil.mitra@gmail.com',
    clientAddress: 'गांधी चौक, अहेरी, जि. गडचिरोली',
    category: 'FESTIVAL_WISH',
    categoryLabelMarathi: 'सदिच्छा / सण / वाढदिवस शुभेच्छा जाहिरात',
    items: [
      {
        id: 'item-3',
        description: 'वाढदिवस अभीष्टचिंतन विशेष पूर्ण रंगीत डिजिटल पोस्टर व बातमी कव्हर',
        hsnSacCode: '998363',
        quantity: 1,
        unit: 'इव्हेंट',
        rate: 3500,
        gstPercent: 0,
        amount: 3500,
      },
    ],
    subtotal: 3500,
    discountAmount: 500,
    gstAmount: 0,
    totalAmount: 3000,
    amountPaid: 1500,
    balanceDue: 1500,
    status: 'PARTIAL',
    paymentMethod: 'CASH',
    transactionRef: 'CASH-REC-4891',
    notes: 'अ‍ॅडव्हान्स ₹१,५००/- प्राप्त, उर्वरित ₹१,५००/- ३ दिवसांत देय.',
    terms: '१. उर्वरित रक्कम मुदतीत अदा करावी.',
    createdAt: '2026-08-26T09:00:00Z',
    updatedAt: '2026-08-26T09:30:00Z',
  },
  {
    id: 'inv-004',
    invoiceNumber: 'INU24/2026-27/004',
    billDate: '2026-08-20',
    dueDate: '2026-08-27',
    clientName: 'अमृता ऑटोमोबाईल्स प्रा. लि.',
    businessName: 'हिरो मोटोकॉर्प अधिकृत डिलरशिप, आरमोरी',
    clientPhone: '9881122334',
    clientEmail: 'amruta.hero@rediffmail.com',
    clientAddress: 'आरमोरी-गडचिरोली हायवे, आरमोरी',
    clientGstin: '27AABCA7766K1Z9',
    category: 'PRINT_COMMERCIAL',
    categoryLabelMarathi: 'व्यावसायिक वृत्तपत्रीय जाहिरात',
    items: [
      {
        id: 'item-4',
        description: 'गणेशोत्सव व दसरा सण विशेष ऑफर बॅनर (पोर्टल व ई-पेपर कॉम्बो)',
        hsnSacCode: '998365',
        quantity: 1,
        unit: 'कॉम्बो पॅकेज',
        rate: 7500,
        gstPercent: 18,
        amount: 7500,
      },
    ],
    subtotal: 7500,
    discountAmount: 500,
    gstAmount: 1260,
    totalAmount: 8260,
    amountPaid: 0,
    balanceDue: 8260,
    status: 'OVERDUE',
    notes: 'पेमेंट स्मरणपत्र पाठवले आहे.',
    terms: '१. विलंब शुल्कासह रक्कम तात्काळ अदा करावी.',
    createdAt: '2026-08-20T11:45:00Z',
    updatedAt: '2026-08-28T08:00:00Z',
  },
  {
    id: 'inv-005',
    invoiceNumber: 'INU24/2026-27/005',
    billDate: '2026-08-29',
    dueDate: '2026-09-05',
    clientName: 'सुनील तागडे',
    businessName: 'कृषी सेवा केंद्र व खत-बियाणे भांडार, कुरखेडा',
    clientPhone: '9977553311',
    clientAddress: 'कृषी उत्पन्न बाजार समिती समोर, कुरखेडा',
    category: 'SPONSORED_NEWS',
    categoryLabelMarathi: 'प्रायोजित वृत्त / प्रेस नोट',
    items: [
      {
        id: 'item-5',
        description: 'शेतकऱ्यांसाठी आधुनिक फवारणी तंत्रज्ञान मार्गदर्शन प्रायोजित लेख',
        hsnSacCode: '998364',
        quantity: 1,
        unit: 'आर्टिकल',
        rate: 2000,
        gstPercent: 0,
        amount: 2000,
      },
    ],
    subtotal: 2000,
    discountAmount: 0,
    gstAmount: 0,
    totalAmount: 2000,
    amountPaid: 0,
    balanceDue: 2000,
    status: 'PENDING',
    notes: 'नवीन प्रसिद्ध झालेला लेख.',
    terms: '१. कृपया बिलाची रक्कम मुदतीत जमा करावी.',
    createdAt: '2026-08-29T12:00:00Z',
    updatedAt: '2026-08-29T12:00:00Z',
  },
];

export const SEED_QUOTATIONS: Quotation[] = [
  {
    id: 'qtn-001',
    quotationNumber: 'QTN-INU24/2026-27/001',
    date: '2026-08-28',
    validUntil: '2026-09-12',
    clientName: 'महेशजी बोरकर',
    businessName: 'बोरकर ज्वेलर्स व सराफा असोसिएशन, गडचिरोली',
    clientPhone: '9422889900',
    clientEmail: 'borkar.jewellers@gmail.com',
    clientAddress: 'सराफा लाईन, मुख्य बाजारपेठ, गडचिरोली - ४४२६०५',
    clientGstin: '27AABCB9988H1Z4',
    category: 'PORTAL_BANNER',
    categoryLabelMarathi: 'वेब पोर्टल टॉप बॅनर व ई-पेपर जाहिरात पॅकेज',
    items: [
      {
        id: 'item-q1',
        description: 'InfoNewsUpdate24 मुख्य वेब पोर्टल टॉप हेडर लीडरबोर्ड बॅनर जाहिरात (१ महिना)',
        hsnSacCode: '998361',
        quantity: 1,
        unit: 'महिना',
        rate: 8000,
        gstPercent: 18,
        amount: 8000,
      },
      {
        id: 'item-q2',
        description: 'दैनिक ई-पेपर मुख्य पान रंगीत क्लासिफाइड जाहिरात (१५ दिवस)',
        hsnSacCode: '998361',
        quantity: 15,
        unit: 'दिवस',
        rate: 300,
        gstPercent: 18,
        amount: 4500,
      },
    ],
    subtotal: 12500,
    discountAmount: 1500,
    gstAmount: 1980,
    totalAmount: 12980,
    status: 'SENT',
    notes: 'गणेशोत्सव व दिवाळी सणानिमित्त विशेष जाहिरात दर पॅकेज कोटेशन.',
    terms: '१. हे दरपत्रक १५ दिवसांपर्यंत वैध राहील.\n२. जाहिरात मंजुरीनंतर ५०% अग्रिम रक्कम आवश्यक.\n३. जीएसटी १८% लागू राहील.\n४. सर्व वाद गडचिरोली न्यायालयाच्या अखत्यारीत.',
    createdAt: '2026-08-28T10:00:00Z',
    updatedAt: '2026-08-28T10:00:00Z',
  },
  {
    id: 'qtn-002',
    quotationNumber: 'QTN-INU24/2026-27/002',
    date: '2026-08-27',
    validUntil: '2026-09-10',
    clientName: 'अॅड. प्रफुल्ल पाटील',
    businessName: 'पाटील लॉ ॲकॅडमी व करिअर गाईडन्स, चंद्रपूर रोड',
    clientPhone: '9823445566',
    clientEmail: 'patil.law@gmail.com',
    clientAddress: 'चंद्रपूर रोड, गडचिरोली',
    category: 'SPONSORED_NEWS',
    categoryLabelMarathi: 'प्रायोजित बातमी व सोशल मीडिया कव्हरेज',
    items: [
      {
        id: 'item-q3',
        description: 'वेब पोर्टल विशेष बातमी कव्हरेज व WhatsApp/Facebook पोस्ट प्रसिद्धी (१ वेळ)',
        hsnSacCode: '998361',
        quantity: 1,
        unit: 'नग',
        rate: 3500,
        gstPercent: 0,
        amount: 3500,
      },
    ],
    subtotal: 3500,
    discountAmount: 500,
    gstAmount: 0,
    totalAmount: 3000,
    status: 'ACCEPTED',
    notes: 'नवीन बॅच प्रवेश जाहिरात दर अंदाजपत्रक.',
    terms: '१. दरपत्रक ७ दिवसांसाठी वैध राहील.\n२. प्रसिद्धीपूर्वी बातमी व फोटोचे अंतिम प्रूफ़ तपासावे.',
    createdAt: '2026-08-27T14:00:00Z',
    updatedAt: '2026-08-28T11:00:00Z',
  },
];

export class BillingService {
  static getInvoices(): Invoice[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INVOICES);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch {
      return [];
    }
  }

  // ==========================================
  // QUOTATION / ESTIMATE METHODS
  // ==========================================

  static getQuotations(): Quotation[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_QUOTATIONS);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch {
      return [];
    }
  }

  static saveQuotations(quotations: Quotation[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_QUOTATIONS, JSON.stringify(quotations));
      window.dispatchEvent(new CustomEvent('infonews:quotations-updated', { detail: quotations }));
    } catch (err) {
      console.error('Error saving quotations:', err);
    }
  }

  // ==========================================
  // BANK & BILLING SETTINGS METHODS
  // ==========================================

  static getSettings(): BillingSettings {
    if (typeof window === 'undefined') return DEFAULT_BILLING_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BILLING_SETTINGS);
      if (stored) {
        return { ...DEFAULT_BILLING_SETTINGS, ...JSON.parse(stored) };
      }
      localStorage.setItem(STORAGE_KEY_BILLING_SETTINGS, JSON.stringify(DEFAULT_BILLING_SETTINGS));
      return DEFAULT_BILLING_SETTINGS;
    } catch {
      return DEFAULT_BILLING_SETTINGS;
    }
  }

  static saveSettings(settings: BillingSettings): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_BILLING_SETTINGS, JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent('infonews:billing-settings-updated', { detail: settings }));
    } catch (err) {
      console.error('Error saving billing settings:', err);
    }
  }

  static resetSettings(): BillingSettings {
    if (typeof window === 'undefined') return DEFAULT_BILLING_SETTINGS;
    try {
      localStorage.setItem(STORAGE_KEY_BILLING_SETTINGS, JSON.stringify(DEFAULT_BILLING_SETTINGS));
      window.dispatchEvent(new CustomEvent('infonews:billing-settings-updated', { detail: DEFAULT_BILLING_SETTINGS }));
      return DEFAULT_BILLING_SETTINGS;
    } catch {
      return DEFAULT_BILLING_SETTINGS;
    }
  }

  static generateNextQuotationNumber(quotations?: Quotation[]): string {
    const list = quotations || this.getQuotations();
    const settings = this.getSettings();
    const today = new Date();
    const financialYearStart = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    const nextYearShort = (financialYearStart + 1).toString().slice(-2);
    const prefix = `${settings.quotationPrefix || 'QTN-INU24/'}${financialYearStart}-${nextYearShort}/`;

    const existingNumbers = list
      .map((q) => {
        const parts = q.quotationNumber.split('/');
        return parseInt(parts[parts.length - 1], 10) || 0;
      })
      .filter((n) => !isNaN(n));

    const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const nextNum = (maxNum + 1).toString().padStart(3, '0');
    return `${prefix}${nextNum}`;
  }

  static createQuotation(data: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>): Quotation {
    const quotations = this.getQuotations();
    const newQuotation: Quotation = {
      ...data,
      id: `qtn-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    quotations.unshift(newQuotation);
    this.saveQuotations(quotations);
    return newQuotation;
  }

  static updateQuotation(id: string, updates: Partial<Quotation>): Quotation | null {
    const quotations = this.getQuotations();
    const index = quotations.findIndex((q) => q.id === id);
    if (index === -1) return null;

    quotations[index] = {
      ...quotations[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveQuotations(quotations);
    return quotations[index];
  }

  static deleteQuotation(id: string): boolean {
    const quotations = this.getQuotations();
    const filtered = quotations.filter((q) => q.id !== id);
    if (filtered.length === quotations.length) return false;
    this.saveQuotations(filtered);
    return true;
  }

  static convertQuotationToInvoice(quotationId: string, reservedInvoiceNumber?: string): Invoice | null {
    const quotations = this.getQuotations();
    const qtn = quotations.find((q) => q.id === quotationId);
    if (!qtn) return null;

    const invoices = this.getInvoices();
    const newInvoiceNumber = reservedInvoiceNumber || this.generateNextInvoiceNumber(invoices);

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: newInvoiceNumber,
      billDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientName: qtn.clientName,
      businessName: qtn.businessName,
      clientPhone: qtn.clientPhone,
      clientEmail: qtn.clientEmail,
      clientAddress: qtn.clientAddress,
      clientGstin: qtn.clientGstin,
      category: qtn.category,
      categoryLabelMarathi: qtn.categoryLabelMarathi,
      items: qtn.items,
      subtotal: qtn.subtotal,
      discountAmount: qtn.discountAmount,
      gstAmount: qtn.gstAmount,
      totalAmount: qtn.totalAmount,
      amountPaid: 0,
      balanceDue: qtn.totalAmount,
      status: 'PENDING',
      notes: `कोटेशन क्र. ${qtn.quotationNumber} चे बिलामध्ये रूपांतर. ${qtn.notes || ''}`,
      terms: qtn.terms || '१. बिलाची रक्कम देय तारखेच्या आत अदा करावी.\n२. सर्व वाद गडचिरोली न्यायालयाच्या अखत्यारीत.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    invoices.unshift(newInvoice);
    this.saveInvoices(invoices);
    this.syncClientFromInvoice(newInvoice);

    // Mark quotation as converted
    this.updateQuotation(quotationId, {
      status: 'CONVERTED',
      convertedInvoiceId: newInvoice.id,
    });

    return newInvoice;
  }

  static generateQuotationWhatsAppText(q: Quotation, settings: BillingSettings = this.getSettings()): string {
    const totalWords = this.numberToMarathiWords(q.totalAmount);
    const clientGreeting = q.businessName
      ? `${q.clientName} (${q.businessName})`
      : q.clientName;

    const itemsText = q.items
      .map(
        (item, idx) =>
          `${idx + 1}. *${item.description}* - ${item.quantity} ${item.unit} @ ₹${item.rate.toLocaleString('en-IN')} = ₹${item.amount.toLocaleString('en-IN')}`
      )
      .join('\n');

    return `📑 *अधिकृत वृत्तपत्रीय जाहिरात दरपत्रक (ADVERTISEMENT ESTIMATE / QUOTATION)*\n*InfoNewsUpdate24 माध्यम समूह*\n\nप्रति,\n*${clientGreeting}*,\nसस्नेह नमस्कार! 🙏\n\nआपल्या मागणीनुसार *InfoNewsUpdate24* वृत्तपत्र व डिजिटल पोर्टलवरील जाहिरातीचे अधिकृत अंदाजपत्रक खालीलप्रमाणे आहे:\n\n📌 *कोटेशन क्र.:* ${q.quotationNumber}\n📅 *तारीख:* ${q.date}\n⏱️ *वैधता मुदत:* ${q.validUntil} पर्यंत\n📂 *जाहिरात वर्ग:* ${q.categoryLabelMarathi}\n\n📋 *जाहिरात तपशील व दर:*\n${itemsText}\n\n📊 *आर्थिक तपशील:*\n🔹 मूळ रक्कम: ₹${q.subtotal.toLocaleString('en-IN')}/-\n${q.discountAmount > 0 ? `🔹 विशेष सूट: - ₹${q.discountAmount.toLocaleString('en-IN')}/-\n` : ''}${q.gstAmount > 0 ? `🔹 GST (18%): + ₹${q.gstAmount.toLocaleString('en-IN')}/-\n` : ''}💎 *अंतिम एकूण अंदाजित रक्कम:* *₹${q.totalAmount.toLocaleString('en-IN')}/-* (${totalWords})\n\n💡 *टीप:* हे दरपत्रक ${q.validUntil} पर्यंत वैध आहे.\nजाहिरात निश्चित करण्यासाठी कृपया याच क्रमांकावर संपर्क साधावा.\n\n🙏 *आपला विश्वासू माध्यम भागीदार,*\n*InfoNewsUpdate24, गडचिरोली*\n📞 *संपर्क:* +91 8799933629`;
  }

  static saveInvoices(invoices: Invoice[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invoices));
      window.dispatchEvent(new CustomEvent('infonews:invoices-updated', { detail: invoices }));
    } catch (err) {
      console.error('Error saving invoices:', err);
    }
  }

  // ==========================================
  // CLIENT DIRECTORY (ADDRESS BOOK) METHODS
  // ==========================================

  static getClients(): ClientContact[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CLIENTS);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch {
      return [];
    }
  }

  static saveClients(clients: ClientContact[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
      window.dispatchEvent(new CustomEvent('infonews:clients-updated', { detail: clients }));
    } catch (err) {
      console.error('Error saving clients:', err);
    }
  }

  static createClient(data: Omit<ClientContact, 'id' | 'createdAt' | 'updatedAt'>): ClientContact {
    const clients = this.getClients();
    const newClient: ClientContact = {
      ...data,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    clients.unshift(newClient);
    this.saveClients(clients);
    return newClient;
  }

  static updateClient(id: string, updates: Partial<ClientContact>): ClientContact | null {
    const clients = this.getClients();
    const index = clients.findIndex((c) => c.id === id);
    if (index === -1) return null;

    clients[index] = {
      ...clients[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveClients(clients);
    return clients[index];
  }

  static deleteClient(id: string): boolean {
    const clients = this.getClients();
    const filtered = clients.filter((c) => c.id !== id);
    if (filtered.length === clients.length) return false;
    this.saveClients(filtered);
    return true;
  }

  static syncClientFromInvoice(invoice: Invoice): void {
    if (!invoice.clientName || !invoice.clientPhone) return;
    const clients = this.getClients();
    const cleanPhone = invoice.clientPhone.trim();
    const existingIndex = clients.findIndex(
      (c) => c.phone.trim() === cleanPhone || c.name.toLowerCase() === invoice.clientName.toLowerCase()
    );

    if (existingIndex >= 0) {
      clients[existingIndex] = {
        ...clients[existingIndex],
        name: invoice.clientName,
        businessName: invoice.businessName || clients[existingIndex].businessName,
        phone: invoice.clientPhone,
        email: invoice.clientEmail || clients[existingIndex].email,
        address: invoice.clientAddress || clients[existingIndex].address,
        gstin: invoice.clientGstin || clients[existingIndex].gstin,
        category: invoice.category || clients[existingIndex].category,
        updatedAt: new Date().toISOString(),
      };
      this.saveClients(clients);
    } else {
      const newClient: ClientContact = {
        id: `cli-${Date.now()}`,
        name: invoice.clientName,
        businessName: invoice.businessName,
        phone: invoice.clientPhone,
        email: invoice.clientEmail,
        address: invoice.clientAddress,
        gstin: invoice.clientGstin,
        category: invoice.category,
        notes: `बिल क्र. ${invoice.invoiceNumber} द्वारे नोंदणी`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      clients.unshift(newClient);
      this.saveClients(clients);
    }
  }

  static generateNextInvoiceNumber(invoices?: Invoice[]): string {
    const list = invoices || this.getInvoices();
    const settings = this.getSettings();
    const today = new Date();
    const financialYearStart = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
    const nextYearShort = (financialYearStart + 1).toString().slice(-2);
    const prefix = `${settings.invoicePrefix || 'INU24/'}${financialYearStart}-${nextYearShort}/`;

    const existingNumbers = list
      .map((inv) => {
        const parts = inv.invoiceNumber.split('/');
        return parseInt(parts[parts.length - 1], 10) || 0;
      })
      .filter((n) => !isNaN(n));

    const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const nextNum = (maxNum + 1).toString().padStart(3, '0');
    return `${prefix}${nextNum}`;
  }

  static createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Invoice {
    const invoices = this.getInvoices();
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    invoices.unshift(newInvoice);
    this.saveInvoices(invoices);
    this.syncClientFromInvoice(newInvoice);
    return newInvoice;
  }

  static updateInvoice(id: string, updates: Partial<Invoice>): Invoice | null {
    const invoices = this.getInvoices();
    const index = invoices.findIndex((i) => i.id === id);
    if (index === -1) return null;

    invoices[index] = {
      ...invoices[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Auto-update status if balance changes
    if (updates.amountPaid !== undefined || updates.totalAmount !== undefined) {
      const tot = updates.totalAmount ?? invoices[index].totalAmount;
      const paid = updates.amountPaid ?? invoices[index].amountPaid;
      invoices[index].balanceDue = Math.max(0, tot - paid);

      if (paid >= tot && tot > 0) {
        invoices[index].status = 'PAID';
      } else if (paid > 0 && paid < tot) {
        invoices[index].status = 'PARTIAL';
      } else if (paid === 0) {
        const isPastDue = new Date(invoices[index].dueDate) < new Date();
        invoices[index].status = isPastDue ? 'OVERDUE' : 'PENDING';
      }
    }

    this.saveInvoices(invoices);
    this.syncClientFromInvoice(invoices[index]);
    return invoices[index];
  }

  static deleteInvoice(id: string): boolean {
    const invoices = this.getInvoices();
    const filtered = invoices.filter((i) => i.id !== id);
    if (filtered.length === invoices.length) return false;
    this.saveInvoices(filtered);
    return true;
  }

  static recordPayment(
    id: string,
    paidAmount: number,
    method: PaymentMethod,
    ref: string
  ): Invoice | null {
    const invoices = this.getInvoices();
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return null;
    if (!Number.isFinite(paidAmount) || paidAmount <= 0 || paidAmount > inv.balanceDue) return null;

    const newAmountPaid = (inv.amountPaid || 0) + paidAmount;
    return this.updateInvoice(id, {
      amountPaid: newAmountPaid,
      paymentMethod: method,
      transactionRef: ref,
    });
  }

  static getStatistics(invoices?: Invoice[]): BillingStats {
    const list = invoices || this.getInvoices();
    let totalRevenue = 0;
    let collectedAmount = 0;
    let pendingDueAmount = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    list.forEach((inv) => {
      totalRevenue += inv.totalAmount || 0;
      collectedAmount += inv.amountPaid || 0;
      pendingDueAmount += inv.balanceDue || 0;

      if (inv.status === 'PAID') paidCount++;
      else if (inv.status === 'PENDING' || inv.status === 'PARTIAL') pendingCount++;
      else if (inv.status === 'OVERDUE') overdueCount++;
    });

    return {
      totalRevenue,
      collectedAmount,
      pendingDueAmount,
      totalInvoicesCount: list.length,
      paidInvoicesCount: paidCount,
      pendingInvoicesCount: pendingCount,
      overdueInvoicesCount: overdueCount,
    };
  }

  static duplicateInvoice(id: string, reservedInvoiceNumber?: string): Invoice | null {
    const invoices = this.getInvoices();
    const existing = invoices.find((i) => i.id === id);
    if (!existing) return null;

    const nextInvNo = reservedInvoiceNumber || this.generateNextInvoiceNumber(invoices);
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newInvoice: Invoice = {
      ...existing,
      id: `inv-${Date.now()}`,
      invoiceNumber: nextInvNo,
      billDate: today,
      dueDate: dueDate,
      amountPaid: 0,
      balanceDue: existing.totalAmount,
      status: 'PENDING',
      transactionRef: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    invoices.unshift(newInvoice);
    this.saveInvoices(invoices);
    return newInvoice;
  }

  static numberToMarathiWords(amount: number): string {
    if (!amount || amount <= 0) return 'शून्य रुपये फक्त';

    const ones: { [k: number]: string } = {
      0: '', 1: 'एक', 2: 'दोन', 3: 'तीन', 4: 'चार', 5: 'पाच', 6: 'सहा', 7: 'सात', 8: 'आठ', 9: 'नऊ',
      10: 'दहा', 11: 'अकरा', 12: 'बारा', 13: 'तेरा', 14: 'चौदा', 15: 'पंधरा', 16: 'सोळा', 17: 'सतरा', 18: 'अठरा', 19: 'एकोणीस',
      20: 'वीस', 21: 'एकवीस', 22: 'बावीस', 23: 'तेवीस', 24: 'चोवीस', 25: 'पंचवीस', 26: 'सव्वीस', 27: 'सत्तावीस', 28: 'अठ्ठावीस', 29: 'एकोणतीस',
      30: 'तीस', 31: 'एकतीस', 32: 'बत्तीस', 33: 'तेहतीस', 34: 'चौतीस', 35: 'पस्तीस', 36: 'छत्तीस', 37: 'सदतीस', 38: 'अडतीस', 39: 'एकेचाळीस',
      40: 'चाळीस', 41: 'एक्केचाळीस', 42: 'बेचाळीस', 43: 'त्रेचाळीस', 44: 'चव्वेचाळीस', 45: 'पंचेचाळीस', 46: 'शेहेचाळीस', 47: 'सत्तेचाळीस', 48: 'अठ्ठेचाळीस', 49: 'एकोणपन्नास',
      50: 'पन्नास', 51: 'एक्कावन्न', 52: 'बावन्न', 53: 'त्रेपन्न', 54: 'चौपन्न', 55: 'पंचावन्न', 56: 'छप्पन्न', 57: 'सत्तावन्न', 58: 'अठ्ठावन्न', 59: 'एकोणसाठ',
      60: 'साठ', 61: 'एकसष्ठ', 62: 'पासष्ठ', 63: 'त्रेसष्ठ', 64: 'चौसष्ठ', 65: 'पासष्ठ', 66: 'सहासष्ठ', 67: 'सदुसष्ठ', 68: 'अडुसष्ठ', 69: 'एकोणसत्तर',
      70: 'सत्तर', 71: 'एकाहत्तर', 72: 'बाहत्तर', 73: 'त्र्याहत्तर', 74: 'चौऱ्याहत्तर', 75: 'पंच्याहत्तर', 76: 'शहात्तर', 77: 'सत्त्याहत्तर', 78: 'अठ्ठ्याहत्तर', 79: 'एकोणऐंशी',
      80: 'ऐंशी', 81: 'एक्यांशी', 82: 'ब्यांशी', 83: 'त्र्यांशी', 84: 'चौऱ्यांशी', 85: 'पंच्यांशी', 86: 'शहांशी', 87: 'सत्त्यांशी', 88: 'अठ्ठ्यांशी', 89: 'एकोणनव्वद',
      90: 'नव्वद', 91: 'एक्याण्णव', 92: 'ब्याण्णव', 93: 'त्र्याण्णव', 94: 'चौऱ्याण्णव', 95: 'पंच्याण्णव', 96: 'शहाण्णव', 97: 'सत्त्याण्णव', 98: 'अठ्ठ्याण्णव', 99: 'नऊ्याण्णव',
    };

    let n = Math.floor(amount);
    let str = '';

    if (n >= 10000000) {
      const cr = Math.floor(n / 10000000);
      str += (ones[cr] || `${cr}`) + ' कोटी ';
      n %= 10000000;
    }
    if (n >= 100000) {
      const lk = Math.floor(n / 100000);
      str += (ones[lk] || `${lk}`) + ' लाख ';
      n %= 100000;
    }
    if (n >= 1000) {
      const th = Math.floor(n / 1000);
      str += (ones[th] || `${th}`) + ' हजार ';
      n %= 1000;
    }
    if (n >= 100) {
      const h = Math.floor(n / 100);
      str += (ones[h] || `${h}`) + 'शे ';
      n %= 100;
    }
    if (n > 0) {
      str += (ones[n] || `${n}`) + ' ';
    }

    return `${str.trim()} रुपये फक्त`;
  }

  static generateOverdueReminderText(inv: Invoice, type: 'gentle' | 'urgent' = 'gentle', settings: BillingSettings = this.getSettings()): string {
    const dueWords = this.numberToMarathiWords(inv.balanceDue);
    const clientGreeting = inv.businessName
      ? `${inv.clientName} (${inv.businessName})`
      : inv.clientName;

    if (type === 'urgent') {
      return `🚨 *तात्काळ पेमेंट तगादा / अंतिम स्मरणपत्र (URGENT PAYMENT NOTICE)*\n*InfoNewsUpdate24 माध्यम समूह*\n\nप्रति,\n*${clientGreeting}*,\n\nआपल्या InfoNewsUpdate24 वृत्तपत्रातील जाहिरातीचे बिल क्र. *${inv.invoiceNumber}* ची देय अंतिम मुदत (*${inv.dueDate}*) संपून बरेच दिवस झाले असूनही *₹${inv.balanceDue.toLocaleString('en-IN')}/-* अद्याप प्राप्त झालेले नाही.\n\n🔴 *थकीत बाकी रक्कम:* *₹${inv.balanceDue.toLocaleString('en-IN')}/-* (${dueWords})\n\n💳 *तातडीने पेमेंटसाठी UPI ID:* \`infonewsupdate24@okhdfcbank\`\n🏦 *बँक तपशील:* InfoNewsUpdate24, HDFC Bank, A/C: 50200088991122, IFSC: HDFC0001234\n\nकृपया आजच वरील रक्कम अदा करावी जेणेकरून पुढील सेवा व प्रसिद्धी खंडित होणार नाही.\n\n🙏 *आपल्या त्वरित सहकार्याची अपेक्षा!*\n- लेखा व जाहिरात विभाग, InfoNewsUpdate24\n📞 *संपर्क:* +91 8799933629`;
    }

    return `⚠️ *थकबाकी पेमेंट स्मरणपत्र (Payment Due Reminder)*\n*InfoNewsUpdate24 माध्यम समूह*\n\nप्रिय *${clientGreeting}* जी,\nसस्नेह नमस्कार! 🙏\n\nआपल्या *InfoNewsUpdate24* वृत्तपत्र व डिजिटल पोर्टलवरील जाहिरातीचे बिल खालीलप्रमाणे मुदतीत येणे बाकी आहे:\n\n📌 *बिल क्रमांक:* ${inv.invoiceNumber}\n📅 *बिल तारीख:* ${inv.billDate}\n⏱️ *देय अंतिम तारीख:* ${inv.dueDate}\n📂 *जाहिरात प्रकार:* ${inv.categoryLabelMarathi}\n\n💰 *एकूण बिल रक्कम:* ₹${inv.totalAmount.toLocaleString('en-IN')}/-\n✅ *भरलेली रक्कम:* ₹${inv.amountPaid.toLocaleString('en-IN')}/-\n🔴 *शिल्लक देय बाकी:* *₹${inv.balanceDue.toLocaleString('en-IN')}/-* (${dueWords})\n\n💳 *पेमेंटसाठी थेट UPI ID:* \`infonewsupdate24@okhdfcbank\`\n🏦 *बँक तपशील:* InfoNewsUpdate24, HDFC Bank, A/C: 50200088991122, IFSC: HDFC0001234\n\nकृपया वरील थकीत रक्कम त्वरित अदा करून सहकार्य करावे ही नम्र विनंती.\n*(पेमेंट आधीच जमा केले असल्यास कृपया या संदेशाकडे दुर्लक्ष करावे.)*\n\n🙏 *आपला विश्वासू माध्यम भागीदार,*\n*InfoNewsUpdate24, गडचिरोली*\n📞 *संपर्क:* +91 8799933629`;
  }

  // ==========================================
  // GST & EXCEL / CSV REPORT EXPORT METHODS
  // ==========================================

  static calculateGstSummary(invoices: Invoice[]) {
    let taxableTurnover = 0;
    let totalDiscount = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let totalGst = 0;
    let totalGrossInvoiced = 0;
    let totalCollected = 0;
    let totalPending = 0;
    let b2bCount = 0;
    let b2cCount = 0;

    invoices.forEach((inv) => {
      const taxable = Math.max(0, (inv.subtotal || 0) - (inv.discountAmount || 0));
      taxableTurnover += taxable;
      totalDiscount += inv.discountAmount || 0;
      const gst = inv.gstAmount || 0;
      totalGst += gst;
      cgstTotal += Math.round(gst / 2);
      sgstTotal += Math.round(gst / 2);
      totalGrossInvoiced += inv.totalAmount || 0;
      totalCollected += inv.amountPaid || 0;
      totalPending += inv.balanceDue || 0;

      if (inv.clientGstin && inv.clientGstin.trim().length >= 10) {
        b2bCount++;
      } else {
        b2cCount++;
      }
    });

    return {
      taxableTurnover,
      totalDiscount,
      cgstTotal,
      sgstTotal,
      totalGst,
      totalGrossInvoiced,
      totalCollected,
      totalPending,
      totalInvoicesCount: invoices.length,
      b2bCount,
      b2cCount,
    };
  }

  static exportLedgerCsv(invoices: Invoice[], filename = 'InfoNewsUpdate24-Billing-Ledger.csv'): void {
    const headers = [
      'बिल क्रमांक (Invoice No)',
      'बिल तारीख (Bill Date)',
      'देय तारीख (Due Date)',
      'ग्राहकाचे नाव (Client Name)',
      'फर्म / कंपनीचे नाव (Business Name)',
      'मोबाईल नंबर (Phone)',
      'GSTIN',
      'पत्ता (Address)',
      'जाहिरात प्रकार (Category)',
      'मूळ रक्कम (Subtotal)',
      'सूट (Discount)',
      'करपात्र मूल्य (Taxable Value)',
      'CGST 9% (₹)',
      'SGST 9% (₹)',
      'एकूण GST (₹)',
      'एकूण देय रक्कम (Total ₹)',
      'वसूल रक्कम (Paid ₹)',
      'शिल्लक बाकी (Balance Due ₹)',
      'स्थिती (Status)',
      'पेमेंट पद्धत (Payment Method)',
      'Transaction Ref',
    ];

    const rows = invoices.map((inv) => {
      const taxable = Math.max(0, (inv.subtotal || 0) - (inv.discountAmount || 0));
      const halfGst = Math.round((inv.gstAmount || 0) / 2);

      return [
        `"${inv.invoiceNumber}"`,
        `"${inv.billDate}"`,
        `"${inv.dueDate}"`,
        `"${(inv.clientName || '').replace(/"/g, '""')}"`,
        `"${(inv.businessName || '').replace(/"/g, '""')}"`,
        `"${inv.clientPhone || ''}"`,
        `"${inv.clientGstin || ''}"`,
        `"${(inv.clientAddress || '').replace(/"/g, '""')}"`,
        `"${inv.categoryLabelMarathi || inv.category}"`,
        inv.subtotal || 0,
        inv.discountAmount || 0,
        taxable,
        halfGst,
        halfGst,
        inv.gstAmount || 0,
        inv.totalAmount || 0,
        inv.amountPaid || 0,
        inv.balanceDue || 0,
        `"${inv.status}"`,
        `"${inv.paymentMethod || ''}"`,
        `"${inv.transactionRef || ''}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static exportGstr1Csv(invoices: Invoice[], filename = 'InfoNewsUpdate24-GSTR1-Report.csv'): void {
    const headers = [
      'GSTIN/UIN of Recipient',
      'Receiver Name',
      'Invoice Number',
      'Invoice date',
      'Invoice Value (₹)',
      'Place Of Supply',
      'Reverse Charge',
      'Applicable % of Tax Rate',
      'Invoice Type',
      'E-Commerce GSTIN',
      'SAC Code',
      'Taxable Value (₹)',
      'Rate (%)',
      'Central Tax Amount (CGST ₹)',
      'State Tax Amount (SGST ₹)',
      'Integrated Tax Amount (IGST ₹)',
      'Cess Amount (₹)',
    ];

    const rows = invoices.map((inv) => {
      const taxable = Math.max(0, (inv.subtotal || 0) - (inv.discountAmount || 0));
      const hasGst = (inv.gstAmount || 0) > 0;
      const rate = hasGst ? 18 : 0;
      const halfGst = hasGst ? Math.round((inv.gstAmount || 0) / 2) : 0;
      const sac = inv.items[0]?.hsnSacCode || '998361';
      const invType = inv.clientGstin ? 'Regular B2B' : 'B2C Others';

      return [
        `"${inv.clientGstin || 'URP'}"`,
        `"${(inv.clientName || '').replace(/"/g, '""')}"`,
        `"${inv.invoiceNumber}"`,
        `"${inv.billDate}"`,
        inv.totalAmount || 0,
        `"27-Maharashtra"`,
        `"N"`,
        `""`,
        `"${invType}"`,
        `""`,
        `"${sac}"`,
        taxable,
        rate,
        halfGst,
        halfGst,
        0,
        0,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
