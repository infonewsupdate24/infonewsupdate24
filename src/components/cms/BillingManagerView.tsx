import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Bell,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Coins,
  Copy,
  CreditCard,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  MessageCircle,
  Phone,
  Plus,
  Printer,
  QrCode,
  Receipt,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BillingSettings,
  ClientContact,
  BillingService,
  CATEGORY_OPTIONS,
  DEFAULT_BILLING_SETTINGS,
  Invoice,
  InvoiceCategory,
  InvoiceItem,
  InvoiceStatus,
  PaymentMethod,
  Quotation,
  QuotationStatus,
} from '../../services/BillingService';

export const BillingManagerView: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(() => BillingService.getInvoices());
  const [clients, setClients] = useState<ClientContact[]>(() => BillingService.getClients());
  const [quotations, setQuotations] = useState<Quotation[]>(() => BillingService.getQuotations());
  const [billingSettings, setBillingSettings] = useState<BillingSettings>(() => BillingService.getSettings());
  const [settingsFormData, setSettingsFormData] = useState<BillingSettings>(() => BillingService.getSettings());
  const [activeTab, setActiveTab] = useState<
    | 'register'
    | 'create'
    | 'invoice_preview'
    | 'clients'
    | 'reports'
    | 'quotations'
    | 'create_quotation'
    | 'quotation_preview'
    | 'settings'
  >('register');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Quotation Filter States
  const [quotationSearchQuery, setQuotationSearchQuery] = useState('');
  const [quotationStatusFilter, setQuotationStatusFilter] = useState<string>('ALL');

  // Reports & GST Filter States
  const [reportMonthFilter, setReportMonthFilter] = useState<string>('ALL');
  const [reportGstOnlyFilter, setReportGstOnlyFilter] = useState<boolean>(false);

  // Client Directory Search & Modal States
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientContact | null>(null);
  const [clientFormData, setClientFormData] = useState({
    name: '',
    businessName: '',
    phone: '',
    email: '',
    address: '',
    gstin: '',
    category: 'PORTAL_BANNER' as InvoiceCategory,
    notes: '',
  });

  // Quick Payment Modal
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentRef, setPaymentRef] = useState('');

  // Overdue Reminder Modal
  const [reminderModalInvoice, setReminderModalInvoice] = useState<Invoice | null>(null);
  const [reminderType, setReminderType] = useState<'gentle' | 'urgent'>('gentle');

  const handleOpenReminderModal = (inv: Invoice) => {
    setReminderModalInvoice(inv);
    const isPastDue = new Date(inv.dueDate) < new Date();
    setReminderType(isPastDue ? 'urgent' : 'gentle');
  };

  const handleSendReminderWhatsApp = (inv: Invoice, type: 'gentle' | 'urgent') => {
    const text = BillingService.generateOverdueReminderText(inv, type);
    const cleanPhone = inv.clientPhone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(text)}`, '_blank');
    showToast(`📲 ${inv.clientName} यांना थकबाकी स्मरणपत्र WhatsApp वर पाठवले!`);
    setReminderModalInvoice(null);
  };

  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isExportingJpg, setIsExportingJpg] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg((cur) => (cur === msg ? null : cur)), 3500);
  };

  useEffect(() => {
    const handleInvoiceUpdate = () => {
      setInvoices(BillingService.getInvoices());
    };
    const handleClientUpdate = () => {
      setClients(BillingService.getClients());
    };
    const handleQuotationUpdate = () => {
      setQuotations(BillingService.getQuotations());
    };
    const handleSettingsUpdate = () => {
      const s = BillingService.getSettings();
      setBillingSettings(s);
      setSettingsFormData(s);
    };
    window.addEventListener('infonews:invoices-updated', handleInvoiceUpdate);
    window.addEventListener('infonews:clients-updated', handleClientUpdate);
    window.addEventListener('infonews:quotations-updated', handleQuotationUpdate);
    window.addEventListener('infonews:billing-settings-updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('infonews:invoices-updated', handleInvoiceUpdate);
      window.removeEventListener('infonews:clients-updated', handleClientUpdate);
      window.removeEventListener('infonews:quotations-updated', handleQuotationUpdate);
      window.removeEventListener('infonews:billing-settings-updated', handleSettingsUpdate);
    };
  }, []);

  const stats = useMemo(() => BillingService.getStatistics(invoices), [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && inv.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesClient = inv.clientName.toLowerCase().includes(q);
        const matchesBusiness = inv.businessName?.toLowerCase().includes(q) || false;
        const matchesInvNo = inv.invoiceNumber.toLowerCase().includes(q);
        const matchesPhone = inv.clientPhone.includes(q);
        if (!matchesClient && !matchesBusiness && !matchesInvNo && !matchesPhone) return false;
      }
      return true;
    });
  }, [invoices, statusFilter, categoryFilter, searchQuery]);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (!clientSearchQuery.trim()) return true;
      const q = clientSearchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.businessName && c.businessName.toLowerCase().includes(q)) ||
        c.phone.includes(q) ||
        (c.gstin && c.gstin.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
      );
    });
  }, [clients, clientSearchQuery]);

  // Available Months for Reports & GST Suite
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    invoices.forEach((inv) => {
      if (inv.billDate && inv.billDate.length >= 7) {
        set.add(inv.billDate.slice(0, 7)); // '2026-08'
      }
    });
    return Array.from(set).sort().reverse();
  }, [invoices]);

  const reportFilteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (reportMonthFilter !== 'ALL' && !inv.billDate.startsWith(reportMonthFilter)) {
        return false;
      }
      if (reportGstOnlyFilter && (!inv.gstAmount || inv.gstAmount <= 0)) {
        return false;
      }
      return true;
    });
  }, [invoices, reportMonthFilter, reportGstOnlyFilter]);

  const reportGstSummary = useMemo(() => {
    return BillingService.calculateGstSummary(reportFilteredInvoices);
  }, [reportFilteredInvoices]);

  // Client Selection / Auto-Fill Handler
  const handleSelectClientForInvoice = (client: ClientContact) => {
    setFormData((prev) => ({
      ...prev,
      clientName: client.name,
      businessName: client.businessName || '',
      clientPhone: client.phone,
      clientEmail: client.email || '',
      clientAddress: client.address || '',
      clientGstin: client.gstin || '',
      category: client.category || prev.category,
    }));
    showToast(`✅ "${client.name}" ची माहिती आपोआप भरली (Auto-Filled)!`);
  };

  const handleStartCreateForClient = (client: ClientContact) => {
    setFormData({
      invoiceNumber: BillingService.generateNextInvoiceNumber(invoices),
      billDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientName: client.name,
      businessName: client.businessName || '',
      clientPhone: client.phone,
      clientEmail: client.email || '',
      clientAddress: client.address || '',
      clientGstin: client.gstin || '',
      category: client.category || 'PORTAL_BANNER',
      discountAmount: 0,
      amountPaid: 0,
      paymentMethod: 'UPI',
      transactionRef: '',
      notes: 'InfoNewsUpdate24 डिजिटल पोर्टल व वृत्तपत्रात जाहिरात प्रसिद्ध केल्याबद्दल धन्यवाद.',
      terms: '१. बिलाची रक्कम देय तारखेच्या आत अदा करावी.\n२. धनादेश / RTGS "InfoNewsUpdate24" नावे करावे.\n३. सर्व वाद गडचिरोली न्यायालयाच्या अखत्यारीत.',
    });
    setActiveTab('create');
    showToast(`✍️ ${client.name} साठी नवीन बिल तयार करत आहे...`);
  };

  const handleOpenNewClientModal = () => {
    setEditingClient(null);
    setClientFormData({
      name: '',
      businessName: '',
      phone: '',
      email: '',
      address: '',
      gstin: '',
      category: 'PORTAL_BANNER',
      notes: '',
    });
    setIsClientModalOpen(true);
  };

  const handleOpenEditClientModal = (c: ClientContact) => {
    setEditingClient(c);
    setClientFormData({
      name: c.name,
      businessName: c.businessName || '',
      phone: c.phone,
      email: c.email || '',
      address: c.address || '',
      gstin: c.gstin || '',
      category: c.category || 'PORTAL_BANNER',
      notes: c.notes || '',
    });
    setIsClientModalOpen(true);
  };

  const handleSaveClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientFormData.name.trim() || !clientFormData.phone.trim()) {
      showToast('⚠️ कृपया ग्राहकाचे नाव व फोन नंबर टाका!');
      return;
    }

    if (editingClient) {
      BillingService.updateClient(editingClient.id, clientFormData);
      showToast(`✅ "${clientFormData.name}" ची माहिती अद्यतनित झाली!`);
    } else {
      BillingService.createClient(clientFormData);
      showToast(`✅ नवीन ग्राहक "${clientFormData.name}" डिरेक्टरीमध्ये जोडला गेला!`);
    }

    setClients(BillingService.getClients());
    setIsClientModalOpen(false);
  };

  const handleDeleteClient = (id: string, name: string) => {
    if (window.confirm(`तुम्हाला खात्री आहे का? ग्राहक "${name}" डिरेक्टरीमधून हटवायचा आहे?`)) {
      BillingService.deleteClient(id);
      setClients(BillingService.getClients());
      showToast(`🗑️ ग्राहक "${name}" हटवण्यात आला.`);
    }
  };

  // --- Quotation Form & State ---
  const [quotationFormData, setQuotationFormData] = useState({
    quotationNumber: BillingService.generateNextQuotationNumber(quotations),
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientName: '',
    businessName: '',
    clientPhone: '',
    clientEmail: '',
    clientAddress: '',
    clientGstin: '',
    category: 'PORTAL_BANNER' as InvoiceCategory,
    discountAmount: 0,
    gstRate: 18,
    notes: 'InfoNewsUpdate24 डिजिटल पोर्टल व वृत्तपत्रात जाहिरात प्रसिद्धीसाठी अधिकृत दरपत्रक.',
    terms: '१. हे दरपत्रक १५ दिवसांसाठी वैध राहील.\n२. जाहिरात निश्चितीनंतर ५०% अग्रिम रक्कम आवश्यक.\n३. जीएसटी १८% लागू राहील.\n४. सर्व वाद गडचिरोली न्यायालयाच्या अखत्यारीत.',
  });

  const [quotationItems, setQuotationItems] = useState<InvoiceItem[]>([
    {
      id: 'item-q-1',
      description: 'InfoNewsUpdate24 मुख्य वेब पोर्टल टॉप हेडर लीडरबोर्ड बॅनर जाहिरात (१ महिना)',
      hsnSacCode: '998361',
      quantity: 1,
      unit: 'महिना',
      rate: 6000,
      gstPercent: 18,
      amount: 6000,
    },
  ]);

  const quotationSubtotal = useMemo(() => {
    return quotationItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [quotationItems]);

  const quotationTaxable = useMemo(() => {
    return Math.max(0, quotationSubtotal - (Number(quotationFormData.discountAmount) || 0));
  }, [quotationSubtotal, quotationFormData.discountAmount]);

  const quotationGstAmount = useMemo(() => {
    if (quotationFormData.gstRate === 0) return 0;
    return Math.round((quotationTaxable * quotationFormData.gstRate) / 100);
  }, [quotationTaxable, quotationFormData.gstRate]);

  const quotationTotalAmount = useMemo(() => {
    return quotationTaxable + quotationGstAmount;
  }, [quotationTaxable, quotationGstAmount]);

  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      if (quotationStatusFilter !== 'ALL' && q.status !== quotationStatusFilter) return false;
      if (quotationSearchQuery.trim()) {
        const query = quotationSearchQuery.toLowerCase();
        const matchesClient = q.clientName.toLowerCase().includes(query);
        const matchesBusiness = q.businessName?.toLowerCase().includes(query) || false;
        const matchesQNo = q.quotationNumber.toLowerCase().includes(query);
        const matchesPhone = q.clientPhone.includes(query);
        if (!matchesClient && !matchesBusiness && !matchesQNo && !matchesPhone) return false;
      }
      return true;
    });
  }, [quotations, quotationStatusFilter, quotationSearchQuery]);

  const handleSelectClientForQuotation = (client: ClientContact) => {
    setQuotationFormData((prev) => ({
      ...prev,
      clientName: client.name,
      businessName: client.businessName || '',
      clientPhone: client.phone,
      clientEmail: client.email || '',
      clientAddress: client.address || '',
      clientGstin: client.gstin || '',
      category: client.category || prev.category,
    }));
    showToast(`✅ "${client.name}" ची माहिती दरपत्रकासाठी भरली गेली!`);
  };

  const handleSaveQuotationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotationFormData.clientName.trim() || !quotationFormData.clientPhone.trim()) {
      showToast('⚠️ कृपया ग्राहकाचे नाव व फोन नंबर टाका!');
      return;
    }

    const catOption = CATEGORY_OPTIONS.find((c) => c.id === quotationFormData.category);
    const catLabel = catOption ? catOption.label : quotationFormData.category;

    const newQuotation = BillingService.createQuotation({
      quotationNumber: quotationFormData.quotationNumber,
      date: quotationFormData.date,
      validUntil: quotationFormData.validUntil,
      clientName: quotationFormData.clientName,
      businessName: quotationFormData.businessName,
      clientPhone: quotationFormData.clientPhone,
      clientEmail: quotationFormData.clientEmail,
      clientAddress: quotationFormData.clientAddress,
      clientGstin: quotationFormData.clientGstin,
      category: quotationFormData.category,
      categoryLabelMarathi: catLabel,
      items: quotationItems,
      subtotal: quotationSubtotal,
      discountAmount: Number(quotationFormData.discountAmount) || 0,
      gstAmount: quotationGstAmount,
      totalAmount: quotationTotalAmount,
      status: 'SENT',
      notes: quotationFormData.notes,
      terms: quotationFormData.terms,
    });

    setQuotations(BillingService.getQuotations());
    setSelectedQuotation(newQuotation);
    setActiveTab('quotation_preview');
    showToast(`🎉 दरपत्रक ${newQuotation.quotationNumber} तयार झाले!`);
  };

  const handleConvertQuotationToInvoice = (qId: string) => {
    const inv = BillingService.convertQuotationToInvoice(qId);
    if (inv) {
      setInvoices(BillingService.getInvoices());
      setQuotations(BillingService.getQuotations());
      setSelectedInvoice(inv);
      setActiveTab('invoice_preview');
      showToast(`⚡ कोटेशनचे अधिकृत बिल (${inv.invoiceNumber}) मध्ये रूपांतर झाले!`);
    }
  };

  const handleWhatsAppQuotationSend = (q: Quotation) => {
    const text = BillingService.generateQuotationWhatsAppText(q);
    const cleanPhone = q.clientPhone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(text)}`, '_blank');
    showToast(`📲 ${q.clientName} यांना दरपत्रक WhatsApp वर पाठवले!`);
  };

  const handleDeleteQuotation = (id: string, qtnNo: string) => {
    if (window.confirm(`दरपत्रक "${qtnNo}" हटवायचे आहे का?`)) {
      BillingService.deleteQuotation(id);
      setQuotations(BillingService.getQuotations());
      showToast(`🗑️ दरपत्रक "${qtnNo}" हटवले.`);
    }
  };

  // --- Settings Handlers ---
  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    BillingService.saveSettings(settingsFormData);
    setBillingSettings(settingsFormData);
    showToast('💾 बँक, UPI व व्यवसाय प्रोफाईल सेटिंग्ज सेव्ह झाल्या!');
  };

  const handleResetSettings = () => {
    if (window.confirm('तुम्हाला खात्री आहे का? सर्व बँक, UPI व माध्यम समूह माहिती मूळ डिफॉल्ट मूल्यांवर रिसेट करायची आहे?')) {
      const def = BillingService.resetSettings();
      setBillingSettings(def);
      setSettingsFormData(def);
      showToast('🔄 सेटिंग्ज डिफॉल्टवर रिसेट झाल्या!');
    }
  };

  // --- Form State for New Invoice ---
  const [formData, setFormData] = useState({
    invoiceNumber: BillingService.generateNextInvoiceNumber(invoices),
    billDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientName: '',
    businessName: '',
    clientPhone: '',
    clientEmail: '',
    clientAddress: '',
    clientGstin: '',
    category: 'PORTAL_BANNER' as InvoiceCategory,
    discountAmount: 0,
    amountPaid: 0,
    paymentMethod: 'UPI' as PaymentMethod,
    transactionRef: '',
    notes: 'InfoNewsUpdate24 डिजिटल पोर्टल व वृत्तपत्रात जाहिरात प्रसिद्ध केल्याबद्दल धन्यवाद.',
    terms: '१. बिलाची रक्कम देय तारखेच्या आत अदा करावी.\n२. धनादेश / RTGS "InfoNewsUpdate24" नावे करावे.\n३. सर्व वाद गडचिरोली न्यायालयाच्या अखत्यारीत.',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
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
  ]);

  const handleAddItem = () => {
    const nextSac = CATEGORY_OPTIONS.find((c) => c.id === formData.category)?.sac || '998361';
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: 'जाहिरात किंवा माध्यम सेवा तपशील',
        hsnSacCode: nextSac,
        quantity: 1,
        unit: 'नग',
        rate: 1000,
        gstPercent: 18,
        amount: 1000,
      },
    ]);
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: value };
      if (field === 'quantity' || field === 'rate') {
        const qty = field === 'quantity' ? Number(value) : target.quantity;
        const r = field === 'rate' ? Number(value) : target.rate;
        target.amount = (qty || 0) * (r || 0);
      }
      updated[index] = target;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Auto Calculation
  const calculatedSubtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.amount || 0), 0);
  }, [items]);

  const calculatedGst = useMemo(() => {
    return items.reduce((acc, item) => {
      const taxRate = item.gstPercent || 0;
      return acc + (item.amount * taxRate) / 100;
    }, 0);
  }, [items]);

  const calculatedTotal = useMemo(() => {
    return Math.max(0, calculatedSubtotal - (formData.discountAmount || 0) + calculatedGst);
  }, [calculatedSubtotal, formData.discountAmount, calculatedGst]);

  const calculatedBalance = useMemo(() => {
    return Math.max(0, calculatedTotal - (formData.amountPaid || 0));
  }, [calculatedTotal, formData.amountPaid]);

  const handleSaveInvoice = (andPrint = false) => {
    if (!formData.clientName.trim()) {
      showToast('⚠️ कृपया ग्राहकाचे नाव टाका!');
      return;
    }
    if (!formData.clientPhone.trim()) {
      showToast('⚠️ कृपया संपर्क क्रमांक टाका!');
      return;
    }

    const catLabel =
      CATEGORY_OPTIONS.find((c) => c.id === formData.category)?.label || 'जाहिरात बिलिंग';

    let initialStatus: InvoiceStatus = 'PENDING';
    if (formData.amountPaid >= calculatedTotal && calculatedTotal > 0) {
      initialStatus = 'PAID';
    } else if (formData.amountPaid > 0 && formData.amountPaid < calculatedTotal) {
      initialStatus = 'PARTIAL';
    }

    const newInv = BillingService.createInvoice({
      invoiceNumber: formData.invoiceNumber || BillingService.generateNextInvoiceNumber(invoices),
      billDate: formData.billDate,
      dueDate: formData.dueDate,
      clientName: formData.clientName,
      businessName: formData.businessName,
      clientPhone: formData.clientPhone,
      clientEmail: formData.clientEmail,
      clientAddress: formData.clientAddress,
      clientGstin: formData.clientGstin,
      category: formData.category,
      categoryLabelMarathi: catLabel,
      items: items,
      subtotal: calculatedSubtotal,
      discountAmount: Number(formData.discountAmount) || 0,
      gstAmount: Math.round(calculatedGst),
      totalAmount: Math.round(calculatedTotal),
      amountPaid: Number(formData.amountPaid) || 0,
      balanceDue: Math.round(calculatedBalance),
      status: initialStatus,
      paymentMethod: formData.amountPaid > 0 ? formData.paymentMethod : undefined,
      transactionRef: formData.transactionRef,
      notes: formData.notes,
      terms: formData.terms,
    });

    setInvoices(BillingService.getInvoices());
    showToast(`✅ बिल क्र. ${newInv.invoiceNumber} यशस्वीरीत्या तयार झाले!`);

    // Reset Form
    setFormData({
      invoiceNumber: BillingService.generateNextInvoiceNumber(),
      billDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientName: '',
      businessName: '',
      clientPhone: '',
      clientEmail: '',
      clientAddress: '',
      clientGstin: '',
      category: 'PORTAL_BANNER',
      discountAmount: 0,
      amountPaid: 0,
      paymentMethod: 'UPI',
      transactionRef: '',
      notes: 'InfoNewsUpdate24 डिजिटल पोर्टल व वृत्तपत्रात जाहिरात प्रसिद्ध केल्याबद्दल धन्यवाद.',
      terms: '१. बिलाची रक्कम देय तारखेच्या आत अदा करावी.\n२. धनादेश / RTGS "InfoNewsUpdate24" नावे करावे.\n३. सर्व वाद गडचिरोली न्यायालयाच्या अखत्यारीत.',
    });

    setSelectedInvoice(newInv);
    setActiveTab('invoice_preview');
    if (andPrint) {
      setTimeout(() => window.print(), 350);
    }
  };

  const handleDuplicateInvoice = (id: string) => {
    const duplicated = BillingService.duplicateInvoice(id);
    if (duplicated) {
      setInvoices(BillingService.getInvoices());
      showToast(`🔁 बिल क्र. ${duplicated.invoiceNumber} नवीन तयार झाले!`);
      setSelectedInvoice(duplicated);
      setActiveTab('invoice_preview');
    }
  };

  const handleOpenPaymentModal = (inv: Invoice) => {
    setPaymentModalInvoice(inv);
    setPaymentAmount(inv.balanceDue);
    setPaymentMethod('UPI');
    setPaymentRef('');
  };

  const handleRecordPaymentSubmit = () => {
    if (!paymentModalInvoice) return;
    if (paymentAmount <= 0) {
      showToast('⚠️ कृपया वैध रक्कम प्रविष्ट करा!');
      return;
    }

    BillingService.recordPayment(
      paymentModalInvoice.id,
      paymentAmount,
      paymentMethod,
      paymentRef || `REC-${Date.now().toString().slice(-4)}`
    );

    setInvoices(BillingService.getInvoices());
    showToast(`💰 ₹${paymentAmount.toLocaleString('en-IN')} पेमेंट यशस्वीरित्या नोंदवले!`);
    setPaymentModalInvoice(null);
  };

  const handleDeleteInvoice = (id: string, invNo: string) => {
    if (window.confirm(`तुम्हाला खात्री आहे का? बिल क्र. ${invNo} हटवायचे आहे?`)) {
      BillingService.deleteInvoice(id);
      setInvoices(BillingService.getInvoices());
      showToast(`🗑️ बिल क्र. ${invNo} हटवण्यात आले.`);
      if (selectedInvoice?.id === id) {
        setSelectedInvoice(null);
        setActiveTab('register');
      }
    }
  };

  const handleWhatsAppSend = (inv: Invoice) => {
    const words = BillingService.numberToMarathiWords(inv.totalAmount);
    const text = `🧾 *InfoNewsUpdate24 अधिकृत टॅक्स इनव्हॉइस / जाहिरात बिल*\n\n📌 *बिल क्र.:* ${inv.invoiceNumber}\n📅 *बिल तारीख:* ${inv.billDate}\n👤 *ग्राहक:* ${inv.clientName} (${inv.businessName || 'वैयक्तिक'})\n📂 *सेवेचा प्रकार:* ${inv.categoryLabelMarathi}\n\n💰 *एकूण देय रक्कम:* ₹${inv.totalAmount.toLocaleString('en-IN')}/-\n🗣️ *अक्षरी:* ${words}\n✅ *भरलेली रक्कम:* ₹${inv.amountPaid.toLocaleString('en-IN')}/-\n⚠️ *थकबाकी शिल्लक:* ₹${inv.balanceDue.toLocaleString('en-IN')}/-\n⏱️ *देय अंतिम मुदत:* ${inv.dueDate}\n\n💳 *पेमेंटसाठी UPI ID:* \`infonewsupdate24@okhdfcbank\`\n🏦 *बँक खाते:* InfoNewsUpdate24, HDFC Bank, A/C: 50200088991122, IFSC: HDFC0001234\n\n🙏 *InfoNewsUpdate24 वृत्तपत्रात जाहिरात दिल्याबद्दल मनःपूर्वक धन्यवाद!*`;
    const cleanPhone = inv.clientPhone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(text)}`, '_blank');
  };

  // High-Resolution Snapshot JPG Image Download using html2canvas
  const handleDownloadInvoiceImage = async (targetInvoice?: Invoice) => {
    const inv = targetInvoice || selectedInvoice;
    if (!inv) return;

    if (activeTab !== 'invoice_preview' || selectedInvoice?.id !== inv.id) {
      setSelectedInvoice(inv);
      setActiveTab('invoice_preview');
    }

    setIsExportingJpg(true);
    showToast('📸 बिलाचा हाय-रिझोल्यूशन स्नॅपशॉट तयार होत आहे...');

    setTimeout(async () => {
      const voucherElement = document.getElementById('printable-invoice-voucher');
      if (!voucherElement) {
        window.print();
        setIsExportingJpg(false);
        return;
      }

      try {
        const canvas = await html2canvas(voucherElement, {
          scale: 2.5,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
        });

        const jpgUrl = canvas.toDataURL('image/jpeg', 0.98);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = jpgUrl;
        const safeInvNo = inv.invoiceNumber.replace(/[\/\\]/g, '-');
        downloadAnchor.download = `Invoice-${safeInvNo}-${inv.clientName.replace(/\s+/g, '_')}.jpg`;
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        showToast('✅ बिलाचा सुंदर स्नॅपशॉट JPG डाऊनलोड झाला! WhatsApp वर पाठवू शकता.');
      } catch (err) {
        console.error('Snapshot error:', err);
        window.print();
      } finally {
        setIsExportingJpg(false);
      }
    }, 200);
  };

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="no-print fixed top-6 right-6 z-50 rounded-xl bg-slate-900 text-white px-5 py-3 shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="h-5 w-5 text-amber-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP BANNER & METRICS                                                   */}
      {/* ========================================================================= */}
      {activeTab !== 'invoice_preview' && activeTab !== 'quotation_preview' && (
        <>
          {/* Top Banner & Header */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="rounded-full bg-red-600/10 px-3 py-1 text-xs font-black text-red-600 border border-red-200/60 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>वृत्तपत्र बिलिंग, दरपत्रक व इनव्हॉइस केंद्र</span>
                </span>
                <span className="rounded-full bg-emerald-600/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-200">
                  GST / Non-GST Ready
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
                <Banknote className="h-7 w-7 text-red-600" />
                <span>दैनिक बिल बुक रजिस्टर व जाहिरात पावती केंद्र</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
                वेबसाइट बॅनर, ई-पेपर क्लासिफाइड, वाढदिवस सदिच्छा, प्रायोजित बातम्या व वर्गणीदारांचे १-क्लिक बिल व दरपत्रक (Quotation) तयार करा, A4 छापील पावती काढा आणि थेट WhatsApp वर पाठवा.
              </p>
            </div>

            {/* Action Controls & Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>📋 बिल रजिस्टर ({invoices.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('quotations')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'quotations'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <FileText className="w-4 h-4 text-amber-500" />
                <span>📑 दरपत्रक / कोटेशन्स ({quotations.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('clients')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'clients'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Users className="w-4 h-4 text-blue-600" />
                <span>👥 ग्राहक वही ({clients.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'reports'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>📊 GST रिपोर्ट</span>
              </button>

              {/* Bank & UPI Settings Button */}
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Settings className="w-4 h-4 text-purple-600" />
                <span>⚙️ बँक व UPI सेटिंग्ज</span>
              </button>

              {/* + New Quotation Button */}
              <button
                type="button"
                onClick={() => {
                  setQuotationFormData((prev) => ({
                    ...prev,
                    quotationNumber: BillingService.generateNextQuotationNumber(quotations),
                  }));
                  setActiveTab('create_quotation');
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  activeTab === 'create_quotation'
                    ? 'bg-indigo-700 text-white border-indigo-700 shadow-sm'
                    : 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ नवीन दरपत्रक</span>
              </button>

              {/* + New Bill Button */}
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    invoiceNumber: BillingService.generateNextInvoiceNumber(invoices),
                  }));
                  setActiveTab('create');
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition transform active:scale-95 cursor-pointer ${
                  activeTab === 'create'
                    ? 'bg-red-700 text-white ring-2 ring-red-400 shadow-md'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>+ नवीन बिल</span>
              </button>
            </div>
          </div>

          {/* 4 Financial Stat Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">एकूण बिलिंग रक्कम (Total Invoiced)</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                <span>एकूण {stats.totalInvoicesCount} बिलांची नोंद</span>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-emerald-800">
                <span className="text-xs font-bold">वसूल रक्कम (Total Collected)</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <CheckCircle className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-900 font-mono">
                ₹{stats.collectedAmount.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                <span>{stats.paidInvoicesCount} बिले १००% पूर्ण भरली</span>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-amber-800">
                <span className="text-xs font-bold">थकबाकी बाकी रक्कम (Outstanding Due)</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-white">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-950 font-mono">
                ₹{stats.pendingDueAmount.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-amber-800 flex items-center gap-1 font-medium">
                <span>{stats.pendingInvoicesCount} बिलांची रक्कम येणे बाकी</span>
              </div>
            </div>

            <div
              onClick={() => {
                setStatusFilter('OVERDUE');
                setActiveTab('register');
                showToast('🔴 मुदत संपलेली (Overdue) बिले फिल्टर केली!');
              }}
              className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-5 shadow-xs space-y-2 cursor-pointer hover:border-rose-400 hover:shadow-md transition-all group"
              title="सर्व मुदत संपलेली बिले फिल्टर करा"
            >
              <div className="flex items-center justify-between text-rose-800">
                <span className="text-xs font-bold group-hover:underline">मुदत संपलेली बिले (Overdue Bills)</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white group-hover:scale-110 transition-transform">
                  <AlertCircle className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-950 font-mono">
                {stats.overdueInvoicesCount} <span className="text-xs font-normal">बिले</span>
              </div>
              <div className="text-[11px] text-rose-700 flex items-center gap-1 font-medium">
                <span>⚡ १-क्लिक तगादा / स्मरणपत्र पाठवा</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: LIVE BILL BOOK REGISTER (TABLE & FILTERS)                          */}
      {/* ========================================================================= */}
      {activeTab === 'register' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>📋 दैनिक बिल बुक लेजर रजिस्टर</span>
                <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                  {filteredInvoices.length} नोंदी
                </span>
              </h3>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="ग्राहक, बिल नं., मोबाईल शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-48 sm:w-64 rounded-xl border border-slate-200 bg-slate-50 px-3 pr-8 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                )}
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 focus:outline-hidden"
              >
                <option value="ALL">सर्व स्थिती (All Status)</option>
                <option value="PAID">🟢 पूर्ण भरले (Paid)</option>
                <option value="PARTIAL">🟠 अर्धे भरले (Partial)</option>
                <option value="PENDING">🟡 येणे बाकी (Pending)</option>
                <option value="OVERDUE">🔴 मुदत संपली (Overdue)</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 focus:outline-hidden"
              >
                <option value="ALL">सर्व जाहिरात प्रकार (All Categories)</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              {/* Quick CSV / Excel Export Button */}
              <button
                type="button"
                onClick={() => {
                  BillingService.exportLedgerCsv(filteredInvoices);
                  showToast('📥 संपूर्ण बिल रजिस्टर Excel / CSV फाइल डाऊनलोड झाली!');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 text-xs font-bold transition cursor-pointer"
                title="सध्याची फिल्टर केलेली यादी Excel/CSV मध्ये डाऊनलोड करा"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Excel एक्सपोर्ट</span>
              </button>
            </div>
          </div>

          {/* Bill Book Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 text-slate-700 border-b border-slate-200 font-bold">
                  <th className="py-3.5 px-4">बिल क्र. व तारीख</th>
                  <th className="py-3.5 px-4">ग्राहक / व्यावसायिक नाव</th>
                  <th className="py-3.5 px-4">जाहिरात / सेवेचा प्रकार</th>
                  <th className="py-3.5 px-4 text-right">एकूण बिल (₹)</th>
                  <th className="py-3.5 px-4 text-right">भरले / शिल्लक (₹)</th>
                  <th className="py-3.5 px-4 text-center">स्थिती (Status)</th>
                  <th className="py-3.5 px-4 text-center">कृती (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Receipt className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                      <p className="font-bold text-slate-600">कोणतेही बिल सापडले नाही</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        नवीन बिल तयार करण्यासाठी वर दिलेल्या '+ नवीन बिल तयार करा' बटनावर क्लिक करा.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Bill No & Date - Clickable to open details */}
                      <td
                        className="py-3 px-4 cursor-pointer group"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setActiveTab('invoice_preview');
                        }}
                        title="बिलाचा संपूर्ण तपशील पाहण्यासाठी क्लिक करा"
                      >
                        <div className="font-mono font-black text-red-600 group-hover:underline flex items-center gap-1.5">
                          <span>{inv.invoiceNumber}</span>
                          <Eye className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          <span>{inv.billDate}</span>
                        </div>
                      </td>

                      {/* Client & Business - Clickable to open details */}
                      <td
                        className="py-3 px-4 cursor-pointer group"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setActiveTab('invoice_preview');
                        }}
                        title="बिलाचा संपूर्ण तपशील पाहण्यासाठी क्लिक करा"
                      >
                        <div className="font-bold text-slate-900 group-hover:text-red-600 transition-colors flex items-center gap-1">
                          <span>{inv.clientName}</span>
                          <Eye className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {inv.businessName && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {inv.businessName}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" />
                          <span>{inv.clientPhone}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block rounded-md bg-slate-100 text-slate-700 font-bold px-2 py-0.5 text-[10px]">
                          {inv.categoryLabelMarathi}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900 text-sm">
                        ₹{inv.totalAmount.toLocaleString('en-IN')}
                      </td>

                      {/* Paid & Balance Due */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono text-emerald-700 font-bold text-[11px]">
                          ₹{inv.amountPaid.toLocaleString('en-IN')} (भरले)
                        </div>
                        {inv.balanceDue > 0 ? (
                          <div className="font-mono text-rose-600 font-bold text-[11px]">
                            ₹{inv.balanceDue.toLocaleString('en-IN')} (बाकी)
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-600 font-bold">शून्य बाकी ✅</div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 text-center">
                        {inv.status === 'PAID' && (
                          <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 inline-block">
                            🟢 PAID
                          </span>
                        )}
                        {inv.status === 'PARTIAL' && (
                          <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 inline-block">
                            🟠 PARTIAL
                          </span>
                        )}
                        {inv.status === 'PENDING' && (
                          <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] font-black px-2.5 py-1 inline-block">
                            🟡 PENDING
                          </span>
                        )}
                        {inv.status === 'OVERDUE' && (
                          <span className="rounded-full bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-1 inline-block animate-pulse">
                            🔴 OVERDUE
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View / Print A4 Invoice */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setActiveTab('invoice_preview');
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                            title="A4 बिल पावती पहा / प्रिंट करा"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>

                          {/* Quick Download JPG Image for WhatsApp */}
                          <button
                            type="button"
                            onClick={() => handleDownloadInvoiceImage(inv)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                            title="WhatsApp वर पाठवण्यासाठी JPG फोटो डाऊनलोड करा"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>

                          {/* 1-Click WhatsApp Share */}
                          <button
                            type="button"
                            onClick={() => handleWhatsAppSend(inv)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                            title="WhatsApp वर थेट मेसेज पाठवा"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </button>

                          {/* Duplicate Invoice */}
                          <button
                            type="button"
                            onClick={() => handleDuplicateInvoice(inv.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                            title="पुन्हा बिल बनवा (Duplicate Invoice)"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>

                          {/* 1-Click WhatsApp Overdue Reminder */}
                          {inv.balanceDue > 0 && (
                            <button
                              type="button"
                              onClick={() => handleOpenReminderModal(inv)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                inv.status === 'OVERDUE'
                                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white ring-1 ring-rose-300 animate-pulse'
                                  : 'bg-amber-100 text-amber-800 hover:bg-amber-600 hover:text-white'
                              }`}
                              title="थकबाकी पेमेंट तगादा / स्मरणपत्र WhatsApp वर पाठवा"
                            >
                              <Bell className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Record Payment */}
                          {inv.balanceDue > 0 && (
                            <button
                              type="button"
                              onClick={() => handleOpenPaymentModal(inv)}
                              className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white transition-colors cursor-pointer"
                              title="पेमेंट नोंदवा (Record Payment)"
                            >
                              <Coins className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                            title="हटवा (Delete)"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: NEW INVOICE GENERATOR (CREATOR FORM)                               */}
      {/* ========================================================================= */}
      {activeTab === 'create' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>✍️ नवीन वृत्तपत्रीय जाहिरात बिल तयार करा</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ग्राहक माहिती व जाहिरात दर टाका; GST व देय रक्कम आपोआप मोजली जाईल.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
              बिल क्र.: {formData.invoiceNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Client & Line Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Client Info Card with Auto-Fill Selector */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                  <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-red-600" />
                    <span>१. ग्राहक व व्यावसायिक तपशील (Client Details)</span>
                  </h4>

                  {/* Auto-Fill Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                      📇 सेव्ह केलेला ग्राहक ऑटो-फिल:
                    </span>
                    <select
                      onChange={(e) => {
                        const found = clients.find((c) => c.id === e.target.value);
                        if (found) handleSelectClientForInvoice(found);
                      }}
                      defaultValue=""
                      className="h-8 rounded-lg border border-blue-200 bg-blue-50 px-2 text-xs font-bold text-blue-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="" disabled>
                        -- ग्राहक निवडा (Select Client) --
                      </option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.businessName ? `(${c.businessName})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ग्राहकाचे नाव (Client Name) *
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. राजेशजी मेश्राम"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium focus:ring-1 focus:ring-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      दुकान / कंपनीचे नाव (Business / Firm Name)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. पतंजली स्टोअर, गडचिरोली"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium focus:ring-1 focus:ring-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      मोबाईल / WhatsApp नंबर *
                    </label>
                    <input
                      type="tel"
                      placeholder="उदा. 9822334455"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium focus:ring-1 focus:ring-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      GSTIN (ऐच्छिक / Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. 27AABCP1234F1Z5"
                      value={formData.clientGstin}
                      onChange={(e) => setFormData({ ...formData, clientGstin: e.target.value })}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono uppercase focus:ring-1 focus:ring-red-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      पत्ता व तालुका (Address & Location)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. मेन रोड, आंबेडकर चौक, गडचिरोली"
                      value={formData.clientAddress}
                      onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium focus:ring-1 focus:ring-red-600"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                    <Receipt className="h-3.5 w-3.5 text-red-600" />
                    <span>२. जाहिरात व सेवा तपशील (Bill Line Items)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ नवीन ओळ जोडा</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 items-center"
                    >
                      <div className="col-span-12 sm:col-span-5">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          तपशील / जाहिरात स्वरूप
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium"
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          प्रमाण / दिवस
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-mono text-center"
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          दर प्रति नग (₹)
                        </label>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(idx, 'rate', Number(e.target.value))}
                          className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-mono text-right"
                        />
                      </div>

                      <div className="col-span-3 sm:col-span-2 text-right">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          रक्कम (₹)
                        </label>
                        <div className="h-8 flex items-center justify-end font-mono font-bold text-xs text-slate-900 pr-1">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="col-span-1 sm:col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length <= 1}
                          className={`p-1.5 rounded text-slate-400 hover:text-rose-600 ${
                            items.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          title="ही ओळ काढा"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Summary & Payment Box */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-6 shadow-md space-y-4">
                <h4 className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
                  <Coins className="h-4 w-4" />
                  <span>३. एकूण बिल हिशोब (Bill Summary)</span>
                </h4>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>मूळ रक्कम (Subtotal):</span>
                    <span className="font-mono text-white font-bold">
                      ₹{calculatedSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>विशेष सूट (Discount):</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.discountAmount}
                        onChange={(e) =>
                          setFormData({ ...formData, discountAmount: Number(e.target.value) })
                        }
                        className="w-20 h-7 rounded bg-slate-800 border border-slate-700 text-white text-xs font-mono text-right px-2 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span>GST (१८%):</span>
                    <span className="font-mono text-white font-bold">
                      ₹{Math.round(calculatedGst).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-700 flex justify-between text-sm sm:text-base font-black text-amber-400">
                    <span>अंतिम देय रक्कम:</span>
                    <span className="font-mono">₹{Math.round(calculatedTotal).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-300">
                      आता मिळालेली रक्कम (Advance / Paid Amount):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={calculatedTotal}
                      value={formData.amountPaid}
                      onChange={(e) =>
                        setFormData({ ...formData, amountPaid: Number(e.target.value) })
                      }
                      className="w-full h-9 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-mono font-black text-sm px-3 focus:outline-hidden"
                      placeholder="0"
                    />

                    {formData.amountPaid > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <select
                          value={formData.paymentMethod}
                          onChange={(e) =>
                            setFormData({ ...formData, paymentMethod: e.target.value as any })
                          }
                          className="h-8 rounded bg-slate-800 border border-slate-700 text-white text-[11px] font-bold px-2 focus:outline-hidden"
                        >
                          <option value="UPI">UPI (GPay/PhonePe)</option>
                          <option value="CASH">रोख (Cash)</option>
                          <option value="NET_BANKING">Net Banking / NEFT</option>
                          <option value="CHEQUE">धनादेश (Cheque)</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Trx ID / Ref"
                          value={formData.transactionRef}
                          onChange={(e) =>
                            setFormData({ ...formData, transactionRef: e.target.value })
                          }
                          className="h-8 rounded bg-slate-800 border border-slate-700 text-white text-[11px] px-2 font-mono"
                        />
                      </div>
                    )}

                    <div className="flex justify-between pt-2 text-xs font-bold text-slate-400">
                      <span>येणे बाकी (Balance Due):</span>
                      <span className="font-mono text-rose-400">
                        ₹{Math.round(calculatedBalance).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Save Buttons */}
                <div className="pt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSaveInvoice(false)}
                    className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md transition cursor-pointer"
                  >
                    💾 बिल सेव्ह करा (Save to Bill Book)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveInvoice(true)}
                    className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>सेव्ह करा व थेट A4 प्रिंट काढा</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: DEDICATED FULLSCREEN A4 TAX INVOICE STUDIO (ONLY BILL IS VISIBLE)  */}
      {/* ========================================================================= */}
      {activeTab === 'invoice_preview' && selectedInvoice && (
        <div className="space-y-6 min-h-screen">
          {/* Top Dedicated Studio Toolbar (Hidden during browser printing) */}
          <div className="no-print rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black shadow-2xs transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-red-600" />
                <span>⬅️ बिल बुक रजिस्टरकडे परत जा</span>
              </button>
              <div className="hidden sm:block border-l border-slate-200 pl-3">
                <span className="text-xs text-slate-500 font-medium">निवडलेले बिल:</span>
                <span className="ml-1.5 font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  {selectedInvoice.invoiceNumber}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* 1. Download High-Res JPG Image for direct WhatsApp image attachment */}
              <button
                type="button"
                onClick={() => handleDownloadInvoiceImage(selectedInvoice)}
                disabled={isExportingJpg}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md transition cursor-pointer"
                title="WhatsApp वर फोटो पाठवण्यासाठी हाय-क्वालिटी JPG इमेज डाऊनलोड करा"
              >
                <Download className="w-4 h-4" />
                <span>{isExportingJpg ? 'तयार होत आहे...' : '🖼️ JPG इमेज डाऊनलोड (WhatsApp)'}</span>
              </button>

              {/* 2. Save as PDF */}
              <button
                type="button"
                onClick={() => {
                  showToast('📄 PDF सेव्ह करण्यासाठी प्रिंट डायलॉगमध्ये "Save as PDF" निवडा...');
                  window.print();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-black shadow-2xs transition cursor-pointer"
                title="A4 PDF फाईल सेव्ह करा"
              >
                <FileText className="w-4 h-4 text-red-600" />
                <span>📄 PDF डाऊनलोड</span>
              </button>

              {/* 3. Direct WhatsApp Share */}
              <button
                type="button"
                onClick={() => handleWhatsAppSend(selectedInvoice)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition cursor-pointer"
                title="ग्राहकाच्या WhatsApp वर थेट मेसेज पाठवा"
              >
                <MessageCircle className="w-4 h-4" />
                <span>📲 WhatsApp वर पाठवा</span>
              </button>

              {/* 4. Direct WhatsApp Payment Reminder */}
              {selectedInvoice.balanceDue > 0 && (
                <button
                  type="button"
                  onClick={() => handleOpenReminderModal(selectedInvoice)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md transition cursor-pointer"
                  title="ग्राहकाला थकबाकी स्मरणपत्र / तगादा WhatsApp वर पाठवा"
                >
                  <Bell className="w-4 h-4" />
                  <span>🔔 थकबाकी तगादा पाठवा</span>
                </button>
              )}

              {/* 5. A4 Print */}
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-black shadow-md transition cursor-pointer"
                title="प्रिंटरद्वारे A4 पावती प्रिंट करा"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>🖨️ A4 प्रिंट</span>
              </button>
            </div>
          </div>

          {/* Official A4 Voucher Canvas Container */}
          <div className="py-2 flex justify-center no-shadow">
            <style>{`
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 8mm;
                }
                body, #cms-shell-root, main, #cms-main-content-area {
                  background: #ffffff !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  box-shadow: none !important;
                }
                .no-print, header, footer, nav, [id*="breadcrumb"], button {
                  display: none !important;
                  visibility: hidden !important;
                }
                #printable-invoice-voucher {
                  border: none !important;
                  outline: none !important;
                  box-shadow: none !important;
                  max-width: 100% !important;
                  width: 100% !important;
                  padding: 8mm 10mm !important;
                  margin: 0 !important;
                  background: #ffffff !important;
                }
              }
            `}</style>

            <div
              id="printable-invoice-voucher"
              style={{ boxShadow: 'none', border: 'none', outline: 'none' }}
              className="w-full max-w-[800px] bg-white p-8 sm:p-10 space-y-6 text-slate-900 mx-auto border-0 shadow-none outline-none"
            >
              {/* 1. Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-red-600 pb-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-600 text-white font-black text-xl">
                      24
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950 font-serif">
                        <span>Info</span>
                        <span className="text-red-600">News</span>
                        <span className="ml-1.5 text-xs bg-slate-950 text-white px-2 py-0.5 rounded font-sans">
                          UPDATE24
                        </span>
                      </h2>
                      <p className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">
                        {billingSettings.publicationTagline || 'महाराष्ट्राचे अग्रगण्य डिजिटल वृत्तपत्र व माध्यम समूह'}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-700 leading-relaxed max-w-md pt-1 font-medium">
                    📍 मुख्य कार्यालय: {billingSettings.businessAddress}
                    <br />
                    📞 संपर्क: {billingSettings.phone} &bull; ✉️ {billingSettings.email}
                    <br />
                    🌐 पोर्टल: {billingSettings.website}
                    <br />
                    {billingSettings.showGstin && billingSettings.gstin ? (
                      <span>🏷️ <strong>GSTIN:</strong> {billingSettings.gstin} &bull; <strong>RNI:</strong> {billingSettings.rniNumber}</span>
                    ) : (
                      <span>🏷️ <strong>RNI:</strong> {billingSettings.rniNumber} &bull; अधिकृत वृत्तपत्र माध्यम</span>
                    )}
                  </p>
                </div>

                {/* Invoice Badge Box */}
                <div className="text-right space-y-1 bg-slate-50 p-3.5 rounded-lg border border-slate-300 min-w-[210px]">
                  <span className="inline-block rounded bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5">
                    {billingSettings.showGstin && selectedInvoice.gstAmount > 0
                      ? 'अधिकृत जाहिरात कर बीजक (Tax Invoice)'
                      : 'अधिकृत जाहिरात देयक पावती (Bill / Receipt)'}
                  </span>
                  <div className="font-mono font-black text-base text-slate-950 pt-1">
                    {selectedInvoice.invoiceNumber}
                  </div>
                  <div className="text-[11px] text-slate-700">
                    बिल तारीख: <strong>{selectedInvoice.billDate}</strong>
                  </div>
                  <div className="text-[11px] text-slate-700">
                    देय अंतिम तारीख: <strong>{selectedInvoice.dueDate}</strong>
                  </div>
                </div>
              </div>

              {/* 2. Client & Billing Party Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-300 text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                    बिल कोणाच्या नावे (Billed To):
                  </span>
                  <h4 className="text-sm font-black text-slate-950">{selectedInvoice.clientName}</h4>
                  {selectedInvoice.businessName && (
                    <p className="font-bold text-slate-800 mt-0.5">{selectedInvoice.businessName}</p>
                  )}
                  {selectedInvoice.clientAddress && (
                    <p className="text-slate-700 mt-0.5">{selectedInvoice.clientAddress}</p>
                  )}
                  <p className="text-slate-700 mt-1">
                    📞 फोन: <strong>{selectedInvoice.clientPhone}</strong>
                  </p>
                  {selectedInvoice.clientGstin && (
                    <p className="font-mono text-slate-800 mt-0.5">
                      GSTIN: <strong>{selectedInvoice.clientGstin}</strong>
                    </p>
                  )}
                </div>

                <div className="sm:text-right flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                      जाहिरात वर्ग / सेवेचा प्रकार:
                    </span>
                    <span className="font-bold text-red-700 bg-red-50 border border-red-300 px-2 py-0.5 rounded text-[11px]">
                      {selectedInvoice.categoryLabelMarathi}
                    </span>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">
                      पेमेंट स्थिती (Payment Status):
                    </span>
                    <span
                      className={`font-black text-xs uppercase inline-block px-2.5 py-0.5 rounded mt-0.5 border ${
                        selectedInvoice.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : selectedInvoice.status === 'PARTIAL'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Items Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-300 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                      <th className="py-2.5 px-3 text-center w-12 border-r border-slate-300">अ.क्र.</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">जाहिरात / सेवेचा तपशील</th>
                      <th className="py-2.5 px-3 text-center border-r border-slate-300">SAC कोड</th>
                      <th className="py-2.5 px-3 text-center border-r border-slate-300">प्रमाण</th>
                      <th className="py-2.5 px-3 text-right border-r border-slate-300">दर (₹)</th>
                      <th className="py-2.5 px-3 text-right">एकूण (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedInvoice.items.map((item, i) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">{i + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-200">
                          {item.description}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-600 border-r border-slate-200">
                          {item.hsnSacCode || billingSettings.hsnSacCode || '998361'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono border-r border-slate-200">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200">
                          ₹{item.rate.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 4. Calculation Summary & Payment Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start text-xs pt-1">
                {/* Left: Words & Dynamic Bank / UPI QR Code */}
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-300">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500 block">
                      अक्षरी एकूण रक्कम (Amount in Words):
                    </span>
                    <p className="font-bold text-slate-950 mt-0.5 leading-snug">
                      🗣️ {BillingService.numberToMarathiWords(selectedInvoice.totalAmount)}
                    </p>
                  </div>

                  {/* Bank Payment QR Code + NEFT/RTGS */}
                  <div className="pt-2 border-t border-slate-200 flex items-center gap-3">
                    <div className="h-16 w-16 bg-white p-1 rounded border border-slate-300 flex items-center justify-center shrink-0">
                      <QrCode className="h-14 w-14 text-slate-900" />
                    </div>
                    <div className="text-[10px] text-slate-700 space-y-0.5">
                      <p className="font-bold text-slate-950 flex items-center gap-1">
                        <span>📲 UPI द्वारे थेट पेमेंट करा:</span>
                      </p>
                      <p className="font-mono font-black text-red-600">infonewsupdate24@okhdfcbank</p>
                      <p className="text-[9px] text-slate-600 font-medium">
                        बँक: <strong>HDFC Bank</strong> &bull; A/C: <strong>50200088991122</strong> &bull; IFSC: <strong>HDFC0001234</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Numerical Calculation */}
                <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-300 font-mono text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>मूळ रक्कम (Subtotal):</span>
                    <span>₹{selectedInvoice.subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {selectedInvoice.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>विशेष सूट (Discount):</span>
                      <span>- ₹{selectedInvoice.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {selectedInvoice.gstAmount > 0 && (
                    <div className="flex justify-between text-slate-700">
                      <span>GST (CGST 9% + SGST 9%):</span>
                      <span>+ ₹{selectedInvoice.gstAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-300 flex justify-between font-black text-sm text-slate-950">
                    <span>अंतिम एकूण देय रक्कम:</span>
                    <span>₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-emerald-700 font-bold pt-1">
                    <span>भरलेली रक्कम (Paid):</span>
                    <span>₹{selectedInvoice.amountPaid.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-rose-700 font-bold border-t border-slate-200 pt-1">
                    <span>शिल्लक बाकी (Balance Due):</span>
                    <span>₹{selectedInvoice.balanceDue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* 5. Terms & Signatures / Official Seal Stamp */}
              <div className="pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-end justify-between gap-6 text-[10px] text-slate-600">
                <div className="space-y-1 max-w-sm">
                  <strong className="text-slate-800 font-bold block">अटी व शर्ती (Terms & Conditions):</strong>
                  <p className="whitespace-pre-line leading-relaxed">{selectedInvoice.terms}</p>
                </div>

                <div className="flex items-center gap-4 text-center sm:text-right">
                  {/* Red Rubber Stamp Badge */}
                  <div className="h-16 w-16 rounded-full border-2 border-dashed border-red-600 text-red-600 flex flex-col items-center justify-center p-1 text-[7px] font-black uppercase rotate-[-8deg]">
                    <span>InfoNews</span>
                    <span className="text-[9px] font-black">24</span>
                    <span>Verified Seal</span>
                  </div>

                  <div className="space-y-6 min-w-[170px]">
                    <p className="font-bold text-slate-900">InfoNewsUpdate24 माध्यम समूहासाठी</p>
                    <div className="border-t border-slate-400 pt-1">
                      <p className="font-bold text-slate-900">अधिकृत स्वाक्षरी / मुख्य संपादक</p>
                      <p className="text-[9px] text-slate-500">(Authorized Signatory)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: CLIENT DIRECTORY / ADDRESS BOOK                                    */}
      {/* ========================================================================= */}
      {activeTab === 'clients' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>👥 वृत्तपत्रीय जाहिरातदार व ग्राहक डिरेक्टरी</span>
                <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  {filteredClients.length} नोंदणीकृत ग्राहक
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                सर्व जाहिरातदारांचा पत्ता, फोन व GST तपशील येथे सेव्ह राहतो. नवीन बिल बनवताना ही माहिती आपोआप भरली जाते.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative min-w-[240px]">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ग्राहक नाव, फर्म, फोन किंवा GSTIN शोधा..."
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Add Client Button */}
              <button
                type="button"
                onClick={handleOpenNewClientModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ नवीन ग्राहक जोडा</span>
              </button>
            </div>
          </div>

          {/* Client Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <User className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="font-bold text-slate-600">कोणताही ग्राहक सापडला नाही</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  नवीन ग्राहक जोडण्यासाठी वर दिलेल्या '+ नवीन ग्राहक जोडा' बटनावर क्लिक करा.
                </p>
              </div>
            ) : (
              filteredClients.map((client) => {
                const clientInvoices = invoices.filter(
                  (inv) =>
                    inv.clientPhone === client.phone ||
                    inv.clientName.toLowerCase() === client.name.toLowerCase()
                );
                const totalBilled = clientInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

                return (
                  <div
                    key={client.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    {/* Top Row: Avatar & Name */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-sm shadow-xs">
                            {client.name.slice(0, 2)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                              {client.name}
                            </h4>
                            {client.businessName && (
                              <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                                {client.businessName}
                              </p>
                            )}
                          </div>
                        </div>

                        {client.category && (
                          <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 uppercase">
                            {CATEGORY_OPTIONS.find((c) => c.id === client.category)?.label.split(' ')[0] || 'जाहिरात'}
                          </span>
                        )}
                      </div>

                      {/* Contact Badges */}
                      <div className="space-y-1.5 pt-1 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{client.phone}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const cleanPhone = client.phone.replace(/\D/g, '');
                              const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                              window.open(`https://api.whatsapp.com/send?phone=${finalPhone}`, '_blank');
                            }}
                            className="text-[10px] text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1"
                            title="WhatsApp उघडा"
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </button>
                        </div>

                        {client.address && (
                          <div className="text-[11px] text-slate-500 line-clamp-2">
                            📍 {client.address}
                          </div>
                        )}

                        {client.gstin && (
                          <div className="text-[10px] font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block">
                            GSTIN: <strong className="text-slate-800">{client.gstin}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats & Actions Footer */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">एकूण बिले:</span>
                        <span className="font-bold text-slate-800">
                          {clientInvoices.length} बिले (₹{totalBilled.toLocaleString('en-IN')})
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        {/* 1-Click Create Invoice for this client */}
                        <button
                          type="button"
                          onClick={() => handleStartCreateForClient(client)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-700 text-xs font-bold border border-red-200 transition cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>नवीन बिल बनवा</span>
                        </button>

                        {/* Edit Client */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditClientModal(client)}
                          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                          title="ग्राहक माहिती संपादन करा"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Client */}
                        <button
                          type="button"
                          onClick={() => handleDeleteClient(client.id, client.name)}
                          className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                          title="ग्राहक हटवा"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: GST & EXCEL FINANCIAL REPORTS SUITE                                */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-6">
          {/* Header & Export Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-emerald-600/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>CA & Tax Audit Ready</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">SAC: 998361 (वृत्तपत्र व डिजिटल जाहिरात)</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
                <span>📊 वृत्तपत्रीय GST ताळेबंद व मासिक Excel रिपोर्ट</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                GSTR-1 रिटर्न, CA टॅक्स लेजर व मासिक उत्पन्न अहवाल १-क्लिकमध्ये एक्सेल/CSV मध्ये डाऊनलोड करा.
              </p>
            </div>

            {/* Filter & Export Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Month Selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={reportMonthFilter}
                  onChange={(e) => setReportMonthFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">सर्व महिने (All Months)</option>
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {m} (मासिक अहवाल)
                    </option>
                  ))}
                </select>
              </div>

              {/* GST Only Toggle */}
              <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={reportGstOnlyFilter}
                  onChange={(e) => setReportGstOnlyFilter(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>फक्त GST बिले</span>
              </label>

              {/* Export Full Ledger CSV */}
              <button
                type="button"
                onClick={() => {
                  const suffix = reportMonthFilter === 'ALL' ? 'All-Months' : reportMonthFilter;
                  BillingService.exportLedgerCsv(reportFilteredInvoices, `InfoNewsUpdate24-Ledger-${suffix}.csv`);
                  showToast(`📥 संपूर्ण बिलिंग लेजर (${suffix}) Excel/CSV डाऊनलोड झाले!`);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                title="सर्व बिलांचे तपशीलवार लेजर Excel/CSV मध्ये डाऊनलोड करा"
              >
                <Download className="w-3.5 h-3.5" />
                <span>📥 संपूर्ण लेजर Excel</span>
              </button>

              {/* Export CA GSTR-1 CSV */}
              <button
                type="button"
                onClick={() => {
                  const suffix = reportMonthFilter === 'ALL' ? 'All-Months' : reportMonthFilter;
                  BillingService.exportGstr1Csv(reportFilteredInvoices, `InfoNewsUpdate24-GSTR1-${suffix}.csv`);
                  showToast(`📑 CA साठी GSTR-1 टॅक्स रिपोर्ट (${suffix}) डाऊनलोड झाला!`);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                title="CA रिटर्न भरण्यासाठी GSTR-1 CSV फॉरमॅट डाऊनलोड करा"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>📑 CA GSTR-1 रिपोर्ट</span>
              </button>
            </div>
          </div>

          {/* 4 Financial GST KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-1.5">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">एकूण करपात्र उलाढाल (Taxable Value)</span>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                ₹{reportGstSummary.taxableTurnover.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                <span>सूट वजा करून मूळ करपात्र रक्कम</span>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-5 space-y-1.5">
              <div className="flex items-center justify-between text-blue-800">
                <span className="text-xs font-bold">केंद्रीय कर (CGST 9%)</span>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">९ टक्के</span>
              </div>
              <div className="text-2xl font-black text-blue-950 font-mono">
                ₹{reportGstSummary.cgstTotal.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-blue-700 font-medium">
                <span>Central GST Output Tax</span>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-200/80 bg-purple-50/40 p-5 space-y-1.5">
              <div className="flex items-center justify-between text-purple-800">
                <span className="text-xs font-bold">राज्य कर (SGST 9%)</span>
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">९ टक्के</span>
              </div>
              <div className="text-2xl font-black text-purple-950 font-mono">
                ₹{reportGstSummary.sgstTotal.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-purple-700 font-medium">
                <span>State GST (महाराष्ट्र - २७)</span>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 space-y-1.5">
              <div className="flex items-center justify-between text-emerald-800">
                <span className="text-xs font-bold">एकूण GST देयता (Total GST)</span>
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-950 font-mono">
                ₹{reportGstSummary.totalGst.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                <span>CGST + SGST एकूण शासकीय कर</span>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown & B2B/B2C Stats Bar */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">एकूण ग्रॉस बिलिंग:</span>
                <strong className="text-slate-900 font-mono">₹{reportGstSummary.totalGrossInvoiced.toLocaleString('en-IN')}</strong>
              </div>
              <div className="h-4 w-px bg-slate-300 hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">वसूल रक्कम:</span>
                <strong className="text-emerald-700 font-mono">₹{reportGstSummary.totalCollected.toLocaleString('en-IN')}</strong>
              </div>
              <div className="h-4 w-px bg-slate-300 hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">येणे बाकी:</span>
                <strong className="text-rose-700 font-mono">₹{reportGstSummary.totalPending.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold font-mono">
                B2B (GSTIN सह): {reportGstSummary.b2bCount} बिले
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 font-bold font-mono">
                B2C: {reportGstSummary.b2cCount} बिले
              </span>
            </div>
          </div>

          {/* GSTR-1 Invoices Table Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-red-600" />
                <span>GSTR-1 टॅक्स ब्रेकडाउन लेजर ({reportFilteredInvoices.length} बिले)</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                {reportMonthFilter === 'ALL' ? 'सर्व महिन्यांचा एकत्रित अहवाल' : `${reportMonthFilter} चा अहवाल`}
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-3 px-3.5">बिल क्र. व तारीख</th>
                    <th className="py-3 px-3.5">ग्राहक व फर्मचे नाव</th>
                    <th className="py-3 px-3.5">GSTIN क्रमांक</th>
                    <th className="py-3 px-3.5">SAC Code</th>
                    <th className="py-3 px-3.5 text-right">करपात्र मूल्य (₹)</th>
                    <th className="py-3 px-3.5 text-right">CGST 9% (₹)</th>
                    <th className="py-3 px-3.5 text-right">SGST 9% (₹)</th>
                    <th className="py-3 px-3.5 text-right">एकूण GST (₹)</th>
                    <th className="py-3 px-3.5 text-right">एकूण बिल (₹)</th>
                    <th className="py-3 px-3.5 text-center">स्थिती</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportFilteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                        या फिल्टर अंतर्गत कोणतेही बिल सापडले नाही.
                      </td>
                    </tr>
                  ) : (
                    reportFilteredInvoices.map((inv) => {
                      const taxable = Math.max(0, (inv.subtotal || 0) - (inv.discountAmount || 0));
                      const halfGst = Math.round((inv.gstAmount || 0) / 2);

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3.5 font-mono">
                            <span className="font-bold text-red-600">{inv.invoiceNumber}</span>
                            <span className="block text-[10px] text-slate-400">{inv.billDate}</span>
                          </td>
                          <td className="py-2.5 px-3.5">
                            <span className="font-bold text-slate-900">{inv.clientName}</span>
                            {inv.businessName && (
                              <span className="block text-[10px] text-slate-500 font-medium">{inv.businessName}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3.5 font-mono text-[11px]">
                            {inv.clientGstin ? (
                              <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                {inv.clientGstin}
                              </span>
                            ) : (
                              <span className="text-slate-400">URP (Non-GST)</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3.5 font-mono text-slate-600">
                            {inv.items[0]?.hsnSacCode || '998361'}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900">
                            ₹{taxable.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono text-blue-700">
                            ₹{halfGst.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono text-purple-700">
                            ₹{halfGst.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono font-bold text-emerald-700">
                            ₹{(inv.gstAmount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono font-black text-slate-950">
                            ₹{inv.totalAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                inv.status === 'PAID'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : inv.status === 'OVERDUE'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 6: QUOTATIONS / ESTIMATES REGISTER                                   */}
      {/* ========================================================================= */}
      {activeTab === 'quotations' && (
        <div className="space-y-6">
          {/* 3 Quotation Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">एकूण दरपत्रके (Total Quotations)</span>
                <FileText className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {quotations.length} <span className="text-xs font-normal">दरपत्रके</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                <span>सक्रिय व पाठवलेले प्रस्ताव</span>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/40 p-5 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-indigo-800">
                <span className="text-xs font-bold">एकूण अंदाजित मूल्य (Estimated Value)</span>
                <TrendingUp className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-indigo-950 font-mono">
                ₹{quotations.reduce((sum, q) => sum + q.totalAmount, 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-indigo-700 font-medium">
                <span>संभाव्य जाहिरात उलाढाल</span>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-emerald-800">
                <span className="text-xs font-bold">मंजूर / बिलात रूपांतरित (Converted)</span>
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-950 font-mono">
                {quotations.filter((q) => q.status === 'CONVERTED' || q.status === 'ACCEPTED').length} <span className="text-xs font-normal">मंजूर</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                <span>जाहिरात निश्चित झालेली दरपत्रके</span>
              </div>
            </div>
          </div>

          {/* Quotations Table Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>📑 अधिकृत जाहिरात दरपत्रक वही (Estimates Register)</span>
                  <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                    {filteredQuotations.length} दरपत्रके
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  जाहिरात प्रसिद्ध करण्यापूर्वी ग्राहकांना दिलेली अधिकृत दरपत्रके. ग्राहक मंजुरीनंतर १-क्लिकमध्ये बिलात रूपांतर करता येते.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative min-w-[200px]">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ग्राहक नाव, कोटेशन क्र..."
                    value={quotationSearchQuery}
                    onChange={(e) => setQuotationSearchQuery(e.target.value)}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={quotationStatusFilter}
                  onChange={(e) => setQuotationStatusFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 focus:outline-hidden"
                >
                  <option value="ALL">सर्व स्थिती (All Status)</option>
                  <option value="DRAFT">मसुदा (Draft)</option>
                  <option value="SENT">पाठवले (Sent)</option>
                  <option value="ACCEPTED">मंजूर (Accepted)</option>
                  <option value="CONVERTED">बिलात रूपांतरित (Converted)</option>
                </select>

                {/* + New Quotation Button */}
                <button
                  type="button"
                  onClick={() => {
                    setQuotationFormData((prev) => ({
                      ...prev,
                      quotationNumber: BillingService.generateNextQuotationNumber(quotations),
                    }));
                    setActiveTab('create_quotation');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ नवीन दरपत्रक</span>
                </button>
              </div>
            </div>

            {/* Quotations Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-3.5 px-4">कोटेशन क्र. व तारीख</th>
                    <th className="py-3.5 px-4">ग्राहक / व्यावसायिक नाव</th>
                    <th className="py-3.5 px-4">जाहिरात प्रकार व तपशील</th>
                    <th className="py-3.5 px-4">वैधता मुदत</th>
                    <th className="py-3.5 px-4 text-right">अंदाजित एकूण रक्कम (₹)</th>
                    <th className="py-3.5 px-4 text-center">स्थिती</th>
                    <th className="py-3.5 px-4 text-center">कृती (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQuotations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                        कोणतेही दरपत्रक सापडले नाही. नवीन दरपत्रक तयार करण्यासाठी वरील '+ नवीन दरपत्रक' बटनावर क्लिक करा.
                      </td>
                    </tr>
                  ) : (
                    filteredQuotations.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedQuotation(q);
                              setActiveTab('quotation_preview');
                            }}
                            className="font-black text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer text-left"
                            title="A4 दरपत्रक पहा"
                          >
                            <span>{q.quotationNumber}</span>
                            <Eye className="h-3 w-3 text-slate-400 shrink-0" />
                          </button>
                          <span className="block text-[10px] text-slate-400">{q.date}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900">{q.clientName}</span>
                          {q.businessName && (
                            <span className="block text-[11px] text-slate-500 font-medium">{q.businessName}</span>
                          )}
                          <span className="block text-[10px] text-slate-400 font-mono">{q.clientPhone}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800 line-clamp-1">{q.categoryLabelMarathi}</span>
                          <span className="text-[10px] text-slate-400">
                            {q.items.length} आयटम्स ({q.items.map((i) => i.description).join(', ').slice(0, 35)}...)
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                          ⏱️ {q.validUntil}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-slate-950 text-sm">
                          ₹{q.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              q.status === 'CONVERTED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : q.status === 'ACCEPTED'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : q.status === 'SENT'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {q.status === 'CONVERTED'
                              ? 'बिलात रूपांतरित'
                              : q.status === 'ACCEPTED'
                              ? 'मंजूर'
                              : q.status === 'SENT'
                              ? 'पाठवले'
                              : 'मसुदा'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View A4 Quotation */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedQuotation(q);
                                setActiveTab('quotation_preview');
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                              title="A4 दरपत्रक पहा / प्रिंट करा"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </button>

                            {/* Convert to Invoice */}
                            {q.status !== 'CONVERTED' && (
                              <button
                                type="button"
                                onClick={() => handleConvertQuotationToInvoice(q.id)}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-colors cursor-pointer"
                                title="१-क्लिक: या दरपत्रकाचे अधिकृत बिलामध्ये रूपांतर करा"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {/* WhatsApp Share */}
                            <button
                              type="button"
                              onClick={() => handleWhatsAppQuotationSend(q)}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                              title="WhatsApp वर दरपत्रक पाठवा"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteQuotation(q.id, q.quotationNumber)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                              title="हटवा"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 7: CREATE NEW QUOTATION FORM                                         */}
      {/* ========================================================================= */}
      {activeTab === 'create_quotation' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>📑 नवीन जाहिरात दरपत्रक / अंदाजपत्रक तयार करा</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                जाहिरात प्रसिद्धीपूर्वी संभाव्य जाहिरातदारास अधिकृत दरपत्रक पाठवा.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl">
              कोटेशन क्र.: {quotationFormData.quotationNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Client & Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Client Card with Auto-Fill */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                  <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-indigo-600" />
                    <span>१. ग्राहक व व्यावसायिक तपशील</span>
                  </h4>

                  {/* Auto-Fill Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                      📇 ग्राहक ऑटो-फिल:
                    </span>
                    <select
                      onChange={(e) => {
                        const found = clients.find((c) => c.id === e.target.value);
                        if (found) handleSelectClientForQuotation(found);
                      }}
                      defaultValue=""
                      className="h-8 rounded-lg border border-indigo-200 bg-indigo-50 px-2 text-xs font-bold text-indigo-900 focus:outline-hidden cursor-pointer"
                    >
                      <option value="" disabled>
                        -- ग्राहक निवडा --
                      </option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.businessName ? `(${c.businessName})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ग्राहकाचे नाव (Client Name) *
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. महेशजी बोरकर"
                      value={quotationFormData.clientName}
                      onChange={(e) => setQuotationFormData({ ...quotationFormData, clientName: e.target.value })}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      दुकान / कंपनीचे नाव (Business Name)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. बोरकर ज्वेलर्स"
                      value={quotationFormData.businessName}
                      onChange={(e) => setQuotationFormData({ ...quotationFormData, businessName: e.target.value })}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      मोबाईल / WhatsApp नंबर *
                    </label>
                    <input
                      type="tel"
                      placeholder="उदा. 9822334455"
                      value={quotationFormData.clientPhone}
                      onChange={(e) => setQuotationFormData({ ...quotationFormData, clientPhone: e.target.value })}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      GSTIN (ऐच्छिक)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. 27AABCB9988H1Z4"
                      value={quotationFormData.clientGstin}
                      onChange={(e) => setQuotationFormData({ ...quotationFormData, clientGstin: e.target.value })}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono uppercase focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      पत्ता व ठिकाण (Address)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. मुख्य बाजारपेठ, गडचिरोली"
                      value={quotationFormData.clientAddress}
                      onChange={(e) => setQuotationFormData({ ...quotationFormData, clientAddress: e.target.value })}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* Quotation Line Items */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-indigo-600" />
                    <span>२. प्रस्तावित जाहिरात तपशील व दर (Itemized Proposal)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setQuotationItems([
                        ...quotationItems,
                        {
                          id: `item-q-${Date.now()}`,
                          description: 'दैनिक ई-पेपर जाहिरात प्रसिद्धी',
                          hsnSacCode: '998361',
                          quantity: 1,
                          unit: 'दिवस',
                          rate: 1000,
                          gstPercent: quotationFormData.gstRate,
                          amount: 1000,
                        },
                      ]);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold shadow-xs hover:bg-indigo-700 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ नवीन आयटम जोडा</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {quotationItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          प्रस्ताव आयटम #{index + 1}
                        </span>
                        {quotationItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setQuotationItems(quotationItems.filter((_, i) => i !== index))}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                            title="हा आयटम हटवा"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-2.5">
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            तपशील / जाहिरात प्रकार *
                          </label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const updated = [...quotationItems];
                              updated[index].description = e.target.value;
                              setQuotationItems(updated);
                            }}
                            className="w-full h-8 rounded-lg border border-slate-200 px-2.5 text-xs font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">नग / प्रमाण</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const qty = Number(e.target.value) || 1;
                              const updated = [...quotationItems];
                              updated[index].quantity = qty;
                              updated[index].amount = qty * updated[index].rate;
                              setQuotationItems(updated);
                            }}
                            className="w-full h-8 rounded-lg border border-slate-200 px-2 text-xs font-mono text-center"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">दर (₹) *</label>
                          <input
                            type="number"
                            min="0"
                            value={item.rate}
                            onChange={(e) => {
                              const rate = Number(e.target.value) || 0;
                              const updated = [...quotationItems];
                              updated[index].rate = rate;
                              updated[index].amount = updated[index].quantity * rate;
                              setQuotationItems(updated);
                            }}
                            className="w-full h-8 rounded-lg border border-slate-200 px-2 text-xs font-mono font-bold text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">एकूण (₹)</label>
                          <div className="h-8 rounded-lg bg-slate-100 flex items-center justify-end px-2.5 text-xs font-mono font-black text-indigo-900">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Dates, Financials, Terms & Actions */}
            <div className="space-y-6">
              {/* Dates & Validity Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-3.5">
                <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <span>३. तारीख व वैधता मुदत</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">कोटेशन तारीख *</label>
                    <input
                      type="date"
                      value={quotationFormData.date}
                      onChange={(e) => setQuotationFormData({ ...quotationFormData, date: e.target.value })}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      वैधता अंतिम तारीख (Valid Until) *
                    </label>
                    <input
                      type="date"
                      value={quotationFormData.validUntil}
                      onChange={(e) => setQuotationFormData({ ...quotationFormData, validUntil: e.target.value })}
                      className="w-full h-9 rounded-xl border border-indigo-300 bg-indigo-50/50 px-3 text-xs font-mono font-bold text-indigo-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">जाहिरात वर्ग</label>
                    <select
                      value={quotationFormData.category}
                      onChange={(e) =>
                        setQuotationFormData({ ...quotationFormData, category: e.target.value as InvoiceCategory })
                      }
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-800"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Financial Calculation Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-3.5">
                <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-indigo-600" />
                  <span>४. अंदाजित एकूण रक्कम (Estimate Calculation)</span>
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>मूळ रक्कम (Subtotal):</span>
                    <span className="font-mono font-bold">₹{quotationSubtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600">विशेष सूट (Discount ₹):</span>
                    <input
                      type="number"
                      min="0"
                      value={quotationFormData.discountAmount}
                      onChange={(e) =>
                        setQuotationFormData({ ...quotationFormData, discountAmount: Number(e.target.value) || 0 })
                      }
                      className="w-24 h-7 rounded-lg border border-slate-200 bg-white px-2 text-right font-mono font-bold text-emerald-700"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600">GST दर (%):</span>
                    <select
                      value={quotationFormData.gstRate}
                      onChange={(e) =>
                        setQuotationFormData({ ...quotationFormData, gstRate: Number(e.target.value) })
                      }
                      className="h-7 rounded-lg border border-slate-200 bg-white px-2 font-bold text-slate-800 text-xs"
                    >
                      <option value={18}>18% GST (CGST 9% + SGST 9%)</option>
                      <option value={0}>0% (Non-GST दरपत्रक)</option>
                    </select>
                  </div>

                  {quotationGstAmount > 0 && (
                    <div className="flex justify-between text-indigo-700 font-bold">
                      <span>GST (18%):</span>
                      <span className="font-mono">+ ₹{quotationGstAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-indigo-950">
                    <span>अंतिम एकूण अंदाजित रक्कम:</span>
                    <span className="font-mono text-base text-indigo-700">
                      ₹{quotationTotalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveQuotationSubmit}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md transition transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>✨ दरपत्रक तयार करा व पहा (Generate Quotation)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 8: DEDICATED A4 QUOTATION VOUCHER STUDIO (PREVIEW)                   */}
      {/* ========================================================================= */}
      {activeTab === 'quotation_preview' && selectedQuotation && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="no-print rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('quotations')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>दरपत्रक यादी (Quotations)</span>
              </button>

              <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl">
                {selectedQuotation.quotationNumber}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* 1-Click Convert to Invoice Button */}
              {selectedQuotation.status !== 'CONVERTED' && (
                <button
                  type="button"
                  onClick={() => handleConvertQuotationToInvoice(selectedQuotation.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition cursor-pointer"
                  title="या दरपत्रकाचे अधिकृत बिलामध्ये रूपांतर करा"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>🔄 अधिकृत बिलामध्ये रूपांतर करा</span>
                </button>
              )}

              {/* WhatsApp Share */}
              <button
                type="button"
                onClick={() => handleWhatsAppQuotationSend(selectedQuotation)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition cursor-pointer"
                title="ग्राहकाच्या WhatsApp वर थेट दरपत्रक पाठवा"
              >
                <MessageCircle className="w-4 h-4" />
                <span>📲 WhatsApp वर पाठवा</span>
              </button>

              {/* A4 Print */}
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-black shadow-md transition cursor-pointer"
                title="A4 दरपत्रक प्रिंट करा"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>🖨️ A4 प्रिंट</span>
              </button>
            </div>
          </div>

          {/* Official A4 Quotation Voucher Canvas */}
          <div className="py-2 flex justify-center no-shadow">
            <div
              id="printable-quotation-voucher"
              style={{ boxShadow: 'none', border: 'none', outline: 'none' }}
              className="w-full max-w-[800px] bg-white p-8 sm:p-10 space-y-6 text-slate-900 mx-auto border-0 shadow-none outline-none"
            >
              {/* 1. Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-indigo-700 pb-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-700 text-white font-black text-xl">
                      24
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950 font-serif">
                        <span>Info</span>
                        <span className="text-indigo-700">News</span>
                        <span className="ml-1.5 text-xs bg-slate-950 text-white px-2 py-0.5 rounded font-sans">
                          UPDATE24
                        </span>
                      </h2>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                        डिजिटल वृत्तपत्र, वेब पोर्टल व जाहिरात माध्यम समूह
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-600 leading-tight space-y-0.5 pt-1 font-medium">
                    <p>{billingSettings.businessAddress}</p>
                    <p>
                      फोन / WhatsApp: <strong>{billingSettings.phone}</strong> &bull; ईमेल:{' '}
                      <strong>{billingSettings.email}</strong>
                    </p>
                    <p className="font-mono">
                      {billingSettings.showGstin && billingSettings.gstin ? (
                        <span>GSTIN: {billingSettings.gstin} &bull; RNI क्र. {billingSettings.rniNumber}</span>
                      ) : (
                        <span>RNI क्र. {billingSettings.rniNumber} &bull; अधिकृत वृत्तपत्र माध्यम समूह</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1 shrink-0">
                  <span className="inline-block rounded-md bg-indigo-700 text-white px-3 py-1 text-xs font-black tracking-wide uppercase">
                    अधिकृत जाहिरात दरपत्रक
                  </span>
                  <p className="text-[11px] font-bold text-slate-500">ADVERTISEMENT QUOTATION / ESTIMATE</p>
                  <div className="pt-2 font-mono text-xs space-y-0.5">
                    <p className="font-bold text-indigo-900">
                      कोटेशन क्र.: <strong>{selectedQuotation.quotationNumber}</strong>
                    </p>
                    <p className="text-slate-600">तारीख: {selectedQuotation.date}</p>
                    <p className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      वैधता: {selectedQuotation.validUntil} पर्यंत
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Client & Proposal Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-indigo-50/40 p-4 rounded-xl border border-indigo-200/80 text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-900 block mb-1">
                    प्रति (Quotation For):
                  </span>
                  <h3 className="font-bold text-sm text-slate-950">{selectedQuotation.clientName}</h3>
                  {selectedQuotation.businessName && (
                    <p className="text-slate-700 font-semibold">{selectedQuotation.businessName}</p>
                  )}
                  {selectedQuotation.clientAddress && (
                    <p className="text-slate-600 text-[11px] mt-0.5">{selectedQuotation.clientAddress}</p>
                  )}
                  <p className="text-slate-600 font-mono text-[11px] mt-0.5">
                    मोबाईल: <strong>{selectedQuotation.clientPhone}</strong>
                  </p>
                  {billingSettings.showGstin && selectedQuotation.clientGstin && (
                    <p className="text-slate-700 font-mono text-[11px] mt-0.5 font-bold">
                      GSTIN: {selectedQuotation.clientGstin}
                    </p>
                  )}
                </div>

                <div className="sm:text-right space-y-1">
                  <span className="text-[10px] font-black uppercase text-indigo-900 block mb-1">
                    प्रस्तावित जाहिरात वर्ग (Category):
                  </span>
                  <span className="inline-block font-bold text-xs bg-indigo-100 text-indigo-950 px-2.5 py-1 rounded">
                    {selectedQuotation.categoryLabelMarathi}
                  </span>
                  {selectedQuotation.notes && (
                    <p className="text-[11px] text-slate-600 italic pt-1">{selectedQuotation.notes}</p>
                  )}
                </div>
              </div>

              {/* 3. Items Table */}
              <div className="overflow-hidden rounded-lg border border-slate-300">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-indigo-900 text-white font-bold text-[11px]">
                      <th className="py-2.5 px-3 w-10 text-center">अ.क्र.</th>
                      <th className="py-2.5 px-3">जाहिरात तपशील / सेवेचे वर्णन</th>
                      <th className="py-2.5 px-3 text-center w-24">SAC Code</th>
                      <th className="py-2.5 px-3 text-center w-16">नग</th>
                      <th className="py-2.5 px-3 text-right w-24">दर (₹)</th>
                      <th className="py-2.5 px-3 text-right w-28">रक्कम (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {selectedQuotation.items.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="py-3 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-950">{item.description}</p>
                          <p className="text-[10px] text-slate-500">वृत्तपत्र व वेब प्रसिद्धी सेवा</p>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-600">
                          {item.hsnSacCode || '998361'}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">₹{item.rate.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-950">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 4. Calculation Summary & Amount in Words */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start text-xs pt-1">
                {/* Left: Words & Validity Box */}
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-300">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500 block">
                      अक्षरी एकूण रक्कम (Amount in Words):
                    </span>
                    <p className="font-bold text-slate-950 mt-0.5 leading-snug">
                      🗣️ {BillingService.numberToMarathiWords(selectedQuotation.totalAmount)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-700 space-y-0.5">
                    <p className="font-bold text-indigo-900 flex items-center gap-1">
                      <span>💡 कोटेशन स्वीकृती सूचना:</span>
                    </p>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      हे दरपत्रक <strong>{selectedQuotation.validUntil}</strong> पर्यंत वैध आहे. जाहिरात निश्चित
                      करण्यासाठी कृपया <strong>+91 8799933629</strong> वर संपर्क साधावा.
                    </p>
                  </div>
                </div>

                {/* Right: Numerical Calculation */}
                <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-300 font-mono text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>मूळ रक्कम (Subtotal):</span>
                    <span>₹{selectedQuotation.subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {selectedQuotation.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>विशेष सूट (Discount):</span>
                      <span>- ₹{selectedQuotation.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {selectedQuotation.gstAmount > 0 && (
                    <div className="flex justify-between text-slate-700">
                      <span>GST (18%):</span>
                      <span>+ ₹{selectedQuotation.gstAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-300 flex justify-between font-black text-sm text-indigo-950">
                    <span>अंतिम एकूण अंदाजित रक्कम:</span>
                    <span className="text-indigo-700">₹{selectedQuotation.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* 5. Terms & Signatures */}
              <div className="pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-end justify-between gap-6 text-[10px] text-slate-600">
                <div className="space-y-1 max-w-sm">
                  <strong className="text-slate-800 font-bold block">अटी व शर्ती (Terms & Conditions):</strong>
                  <p className="whitespace-pre-line leading-relaxed">{selectedQuotation.terms}</p>
                </div>

                <div className="flex items-center gap-4 text-center sm:text-right">
                  {/* Indigo Stamp Badge */}
                  <div className="h-16 w-16 rounded-full border-2 border-dashed border-indigo-700 text-indigo-700 flex flex-col items-center justify-center p-1 text-[7px] font-black uppercase rotate-[-8deg]">
                    <span>InfoNews</span>
                    <span className="text-[9px] font-black">24</span>
                    <span>Estimate</span>
                  </div>

                  <div className="space-y-6 min-w-[170px]">
                    <p className="font-bold text-slate-900">InfoNewsUpdate24 माध्यम समूहासाठी</p>
                    <div className="border-t border-slate-400 pt-1">
                      <p className="font-bold text-slate-900">अधिकृत जाहिरात व्यवस्थापक</p>
                      <p className="text-[9px] text-slate-500">(Authorized Signatory)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 9: BANK, UPI & FIRM SETTINGS MANAGER                                 */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                <Settings className="h-6 w-6 text-purple-600" />
                <span>बँक, UPI व माध्यम समूह सेटिंग्ज व्यवस्थापक</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                येथे बदललेली बँक माहिती, UPI QR कोड, पत्ता व अटी सर्व छापील Tax Invoices व Quotations वर त्वरित लागू होतात.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetSettings}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>डिफॉल्टवर रिसेट करा</span>
            </button>
          </div>

          <form onSubmit={handleSaveSettingsSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Bank Account Details */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">१. बँक खाते तपशील (Bank Account)</h4>
                    <p className="text-[11px] text-slate-500">बिलावर NEFT / RTGS साठी छापले जाणारे खाते.</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      बँक खातेदाराचे नाव (Beneficiary / Account Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsFormData.bankAccountName}
                      onChange={(e) =>
                        setSettingsFormData({ ...settingsFormData, bankAccountName: e.target.value })
                      }
                      placeholder="उदा. InfoNewsUpdate24"
                      className="w-full h-9 rounded-xl border border-slate-200 px-3 font-medium focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">बँकेचे नाव (Bank Name) *</label>
                      <input
                        type="text"
                        required
                        value={settingsFormData.bankName}
                        onChange={(e) =>
                          setSettingsFormData({ ...settingsFormData, bankName: e.target.value })
                        }
                        placeholder="उदा. HDFC Bank / State Bank of India"
                        className="w-full h-9 rounded-xl border border-slate-200 px-3 font-medium focus:ring-1 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">खात्याचा प्रकार (Account Type)</label>
                      <input
                        type="text"
                        value={settingsFormData.bankAccountType}
                        onChange={(e) =>
                          setSettingsFormData({ ...settingsFormData, bankAccountType: e.target.value })
                        }
                        placeholder="उदा. चालू खाते (Current Account)"
                        className="w-full h-9 rounded-xl border border-slate-200 px-3 font-medium focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">बँक खाते क्रमांक (Account Number) *</label>
                      <input
                        type="text"
                        required
                        value={settingsFormData.bankAccountNumber}
                        onChange={(e) =>
                          setSettingsFormData({ ...settingsFormData, bankAccountNumber: e.target.value })
                        }
                        placeholder="उदा. 50200088991122"
                        className="w-full h-9 rounded-xl border border-slate-200 px-3 font-mono font-bold text-slate-900 focus:ring-1 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">IFSC कोड (IFSC Code) *</label>
                      <input
                        type="text"
                        required
                        value={settingsFormData.bankIfsc}
                        onChange={(e) =>
                          setSettingsFormData({ ...settingsFormData, bankIfsc: e.target.value })
                        }
                        placeholder="उदा. HDFC0001234"
                        className="w-full h-9 rounded-xl border border-slate-200 px-3 font-mono uppercase font-bold text-purple-900 focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">शाखा व पत्ता (Branch Name)</label>
                    <input
                      type="text"
                      value={settingsFormData.bankBranch}
                      onChange={(e) =>
                        setSettingsFormData({ ...settingsFormData, bankBranch: e.target.value })
                      }
                      placeholder="उदा. गडचिरोली मुख्य शाखा (Gadchiroli Branch)"
                      className="w-full h-9 rounded-xl border border-slate-200 px-3 font-medium focus:ring-1 focus:ring-purple-600"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: UPI & QR Code Settings */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">२. UPI ID व थेट पेमेंट QR कोड (UPI Setup)</h4>
                    <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm द्वारे १-क्लिक पेमेंटसाठी.</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      UPI ID / VPA ऍड्रेस *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsFormData.upiId}
                      onChange={(e) =>
                        setSettingsFormData({ ...settingsFormData, upiId: e.target.value })
                      }
                      placeholder="उदा. infonewsupdate24@okhdfcbank किंवा 9822334455@ybl"
                      className="w-full h-9 rounded-xl border border-emerald-300 bg-emerald-50/40 px-3 font-mono font-bold text-emerald-950 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      UPI Payee Name (ॲपवर दिसणारे नाव)
                    </label>
                    <input
                      type="text"
                      value={settingsFormData.upiPayeeName}
                      onChange={(e) =>
                        setSettingsFormData({ ...settingsFormData, upiPayeeName: e.target.value })
                      }
                      placeholder="उदा. InfoNewsUpdate24"
                      className="w-full h-9 rounded-xl border border-slate-200 px-3 font-medium focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  {/* Live UPI QR Code Preview Box */}
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-center gap-4">
                    <div className="h-20 w-20 bg-white p-1.5 rounded-xl border border-emerald-300 flex items-center justify-center shrink-0 shadow-2xs">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi%3A%2F%2Fpay%3Fpa%3D${encodeURIComponent(
                          settingsFormData.upiId || 'infonewsupdate24@okhdfcbank'
                        )}%26pn%3D${encodeURIComponent(
                          settingsFormData.upiPayeeName || 'InfoNewsUpdate24'
                        )}%26cu%3DINR`}
                        alt="Live UPI QR Preview"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        थेट QR कोड चाचणी पूर्वावलोकन
                      </span>
                      <p className="font-mono text-xs font-black text-slate-900">
                        {settingsFormData.upiId || 'infonewsupdate24@okhdfcbank'}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        हाच स्कॅन करण्याजोगा QR कोड सर्व नवीन छापील बिलांवर आपोआप दिसेल.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Newspaper Profile & Address */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">३. वृत्तपत्र व कार्यालयीन प्रोफाइल (Profile)</h4>
                    <p className="text-[11px] text-slate-500">बिलाच्या हेडरवर येणारे नाव, पत्ता व संपर्क.</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">वृत्तपत्र / एजन्सीचे नाव *</label>
                      <input
                        type="text"
                        required
                        value={settingsFormData.publicationName}
                        onChange={(e) =>
                          setSettingsFormData({ ...settingsFormData, publicationName: e.target.value })
                        }
                        placeholder="उदा. InfoNewsUpdate24"
                        className="w-full h-9 rounded-xl border border-slate-200 px-3 font-bold text-slate-900 focus:ring-1 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">टॅगलाईन / ब्रीदवाक्य</label>
                      <input
                        type="text"
                        value={settingsFormData.publicationTagline}
                        onChange={(e) =>
                          setSettingsFormData({ ...settingsFormData, publicationTagline: e.target.value })
                        }
                        placeholder="उदा. डिजिटल वृत्तपत्र व माध्यम समूह"
                        className="w-full h-9 rounded-xl border border-slate-200 px-3 font-medium focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">कार्यालयीन पत्ता (Address) *</label>
                    <input
                      type="text"
                      required
                      value={settingsFormData.businessAddress}
                      onChange={(e) =>
                        setSettingsFormData({ ...settingsFormData, businessAddress: e.target.value })
                      }
                      placeholder="उदा. मु. पो. ता. जि. गडचिरोली - ४४२६०५ (महाराष्ट्र)"
                      className="w-full h-9 rounded-xl border border-slate-200 px-3 font-medium focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">फोन / WhatsApp नंबर *</label>
                      <input
                        type="text"
                        required
                        value={settingsFormData.phone}
                        onChange={(e) =>
                          setSettingsFormData({ ...settingsFormData, phone: e.target.value })
                        }
                        placeholder="उदा. +91 8799933629"
                        className="w-full h-9 rounded-xl border border-slate-200 px-3 font-medium focus:ring-1 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">अधिकृत ईमेल आयडी</label>
                      <input
                        type="email"
                        value={settingsFormData.email}
                        onChange={(e) =>
                          setSettingsFormData({ ...settingsFormData, email: e.target.value })
                        }
                        placeholder="उदा. contact@infonewsupdate24.com"
                        className="w-full h-9 rounded-xl border border-slate-200 px-3 font-medium focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">GSTIN क्रमांक (ऐच्छिक)</label>
                      <input
                        type="text"
                        value={settingsFormData.gstin}
                        onChange={(e) =>
                          setSettingsFormData({ ...settingsFormData, gstin: e.target.value })
                        }
                        placeholder="उदा. 27AABCI1234F1Z9"
                        className="w-full h-9 rounded-xl border border-slate-200 px-3 font-mono uppercase font-bold text-slate-900 focus:ring-1 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">RNI नोंदणी क्रमांक</label>
                      <input
                        type="text"
                        value={settingsFormData.rniNumber}
                        onChange={(e) =>
                          setSettingsFormData({ ...settingsFormData, rniNumber: e.target.value })
                        }
                        placeholder="उदा. MAHMUR/2024/88990"
                        className="w-full h-9 rounded-xl border border-slate-200 px-3 font-mono focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                  </div>

                  {/* GSTIN SHOW / HIDE MASTER TOGGLE */}
                  <div className="rounded-2xl border border-purple-200/80 bg-purple-50/50 p-3.5 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                        <ShieldCheck className="h-4 w-4 text-purple-600" />
                        <span>बिलावर GSTIN क्रमांक दाखवा (Show/Hide GSTIN on Bills)</span>
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {settingsFormData.showGstin
                          ? '✅ GST क्रमांक बिलावर व कोटेशनवर दिसेल (Tax Invoice मोड).'
                          : '🚫 GST क्रमांक लपवला आहे (Non-GST / Bill of Supply मोड).'}
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settingsFormData.showGstin}
                        onChange={(e) =>
                          setSettingsFormData({ ...settingsFormData, showGstin: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {/* UPI QR CODE SHOW / HIDE TOGGLE */}
                  <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                        <QrCode className="h-4 w-4 text-emerald-600" />
                        <span>बिलावर UPI पेमेंट QR कोड दाखवा (Show/Hide QR Code)</span>
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {settingsFormData.showBankQr
                          ? '✅ स्कॅन पेमेंट QR कोड बिलावर दिसेल.'
                          : '🚫 QR कोड बिलावरून लपवला जाईल.'}
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settingsFormData.showBankQr}
                        onChange={(e) =>
                          setSettingsFormData({ ...settingsFormData, showBankQr: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Card 4: Prefixes & Terms Configuration */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">४. बिलिंग उपसर्ग व नियम (Terms & Prefix)</h4>
                    <p className="text-[11px] text-slate-500">बिल क्रमांक फॉरमॅट व डिफॉल्ट अटी.</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">बिल उपसर्ग (Invoice Prefix)</label>
                      <input
                        type="text"
                        value={settingsFormData.invoicePrefix}
                        onChange={(e) =>
                          setSettingsFormData({ ...settingsFormData, invoicePrefix: e.target.value })
                        }
                        placeholder="उदा. INU24/"
                        className="w-full h-9 rounded-xl border border-slate-200 px-3 font-mono font-bold text-red-700 focus:ring-1 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">दरपत्रक उपसर्ग (Quotation Prefix)</label>
                      <input
                        type="text"
                        value={settingsFormData.quotationPrefix}
                        onChange={(e) =>
                          setSettingsFormData({ ...settingsFormData, quotationPrefix: e.target.value })
                        }
                        placeholder="उदा. QTN-INU24/"
                        className="w-full h-9 rounded-xl border border-slate-200 px-3 font-mono font-bold text-indigo-700 focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">अधिकृत पदनाम (Signatory Title)</label>
                    <input
                      type="text"
                      value={settingsFormData.signatoryTitle}
                      onChange={(e) =>
                        setSettingsFormData({ ...settingsFormData, signatoryTitle: e.target.value })
                      }
                      placeholder="उदा. मुख्य संपादक / अधिकृत जाहिरात व्यवस्थापक"
                      className="w-full h-9 rounded-xl border border-slate-200 px-3 font-medium focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">बिलावरील डिफॉल्ट अटी व शर्ती</label>
                    <textarea
                      rows={3}
                      value={settingsFormData.defaultInvoiceTerms}
                      onChange={(e) =>
                        setSettingsFormData({ ...settingsFormData, defaultInvoiceTerms: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 p-2.5 font-medium leading-relaxed focus:ring-1 focus:ring-purple-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Save Action Button Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500 font-medium">
                बदल सेव्ह केल्यानंतर ते लगेच सर्व नवीन व जुन्या बिलांवर लागू होतील.
              </span>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md transition transform active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>💾 सर्व सेटिंग्ज जतन करा (Save Settings)</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span>{editingClient ? 'ग्राहक माहिती संपादन करा' : 'नवीन जाहिरातदार / ग्राहक जोडा'}</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ही माहिती बिल तयार करताना आपोआप भरण्यासाठी उपलब्ध राहील.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsClientModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClientSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ग्राहकाचे नाव (Client Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. राजेशजी मेश्राम"
                    value={clientFormData.name}
                    onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 font-medium focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">दुकान / कंपनीचे नाव (Business Name)</label>
                  <input
                    type="text"
                    placeholder="उदा. पतंजली मेगा स्टोअर"
                    value={clientFormData.businessName}
                    onChange={(e) => setClientFormData({ ...clientFormData, businessName: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 font-medium focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">मोबाईल / WhatsApp नंबर *</label>
                  <input
                    type="tel"
                    required
                    placeholder="उदा. 9822334455"
                    value={clientFormData.phone}
                    onChange={(e) => setClientFormData({ ...clientFormData, phone: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 font-medium focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN (ऐच्छिक)</label>
                  <input
                    type="text"
                    placeholder="उदा. 27AABCP1234F1Z5"
                    value={clientFormData.gstin}
                    onChange={(e) => setClientFormData({ ...clientFormData, gstin: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 font-mono uppercase focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ईमेल (Email ID)</label>
                  <input
                    type="email"
                    placeholder="उदा. client@gmail.com"
                    value={clientFormData.email}
                    onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 font-medium focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">नियमित जाहिरात वर्ग (Category)</label>
                  <select
                    value={clientFormData.category}
                    onChange={(e) => setClientFormData({ ...clientFormData, category: e.target.value as any })}
                    className="w-full h-9 rounded-xl border border-slate-200 px-2.5 font-bold text-slate-700"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">पत्ता व ठिकाण (Address)</label>
                  <input
                    type="text"
                    placeholder="उदा. मेन रोड, आंबेडकर चौक, गडचिरोली - ४४२६०५"
                    value={clientFormData.address}
                    onChange={(e) => setClientFormData({ ...clientFormData, address: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 font-medium focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">टीप / शेरा (Notes)</label>
                  <input
                    type="text"
                    placeholder="उदा. नियमित मासिक बॅनर जाहिरातदार"
                    value={clientFormData.notes}
                    onChange={(e) => setClientFormData({ ...clientFormData, notes: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 font-medium focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingClient ? 'बदल सेव्ह करा' : 'ग्राहक सेव्ह करा'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overdue Payment WhatsApp Reminder Modal */}
      {reminderModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-amber-500" />
                  <span>📲 थकबाकी पेमेंट स्मरणपत्र (WhatsApp Notice)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  बिल क्र. {reminderModalInvoice.invoiceNumber} &bull; ग्राहक: {reminderModalInvoice.clientName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReminderModalInvoice(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Summary Box */}
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase block">थकीत बाकी रक्कम:</span>
                <span className="font-mono text-xl font-black text-amber-950">
                  ₹{reminderModalInvoice.balanceDue.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-700 block mt-0.5">
                  देय तारीख: <strong>{reminderModalInvoice.dueDate}</strong>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 block">मोबाईल क्रमांक:</span>
                <span className="font-mono font-bold text-slate-800">{reminderModalInvoice.clientPhone}</span>
              </div>
            </div>

            {/* Template Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">संदेश प्रकार निवडा (Message Tone):</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReminderType('gentle')}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
                    reminderType === 'gentle'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-400'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>🟢</span>
                    <span>विनम्र स्मरणपत्र (Gentle)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-normal mt-0.5">सस्नेह आठवण व विनंती संदेश</p>
                </button>

                <button
                  type="button"
                  onClick={() => setReminderType('urgent')}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
                    reminderType === 'urgent'
                      ? 'border-rose-500 bg-rose-50 text-rose-900 ring-1 ring-rose-400'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>🔴</span>
                    <span>तात्काळ तगादा (Urgent)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-normal mt-0.5">अंतिम मुदत व तातडीची नोटीस</p>
                </button>
              </div>
            </div>

            {/* Live Message Preview */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">WhatsApp संदेश पूर्वावलोकन (Preview):</label>
              <div className="max-h-44 overflow-y-auto rounded-xl bg-slate-900 text-slate-100 p-3.5 text-xs font-mono whitespace-pre-line leading-relaxed border border-slate-800">
                {BillingService.generateOverdueReminderText(reminderModalInvoice, reminderType)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReminderModalInvoice(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                type="button"
                onClick={() => handleSendReminderWhatsApp(reminderModalInvoice, reminderType)}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>📲 थेट WhatsApp वर पाठवा</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Record Payment Modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-black text-slate-900">💰 पेमेंट नोंदवा (Record Payment)</h4>
                <p className="text-[11px] text-slate-500">बिल क्र. {paymentModalInvoice.invoiceNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">ग्राहक:</span>
                  <span className="font-bold text-slate-800">{paymentModalInvoice.clientName}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-500">शिल्लक बाकी रक्कम:</span>
                  <span className="font-mono font-black text-rose-600">
                    ₹{paymentModalInvoice.balanceDue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  आता जमा झालेली रक्कम (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={paymentModalInvoice.balanceDue}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm font-mono font-black text-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">पेमेंट पद्धत *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-2 font-bold text-slate-800"
                  >
                    <option value="UPI">UPI (GPay/PhonePe)</option>
                    <option value="CASH">रोख (Cash)</option>
                    <option value="NET_BANKING">Net Banking / NEFT</option>
                    <option value="CHEQUE">धनादेश (Cheque)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transaction Ref / पावती नं.</label>
                  <input
                    type="text"
                    placeholder="उदा. UPI/624198"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 px-2.5 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                type="button"
                onClick={handleRecordPaymentSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                पेमेंट जमा करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
