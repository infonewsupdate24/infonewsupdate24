import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  FileCode,
  FilePlus2,
  FileText,
  Filter,
  Globe,
  ImageIcon,
  Layout,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Undo2,
  User,
  X,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StaticPage } from '../../types';
import { transliterateMarathiToSlug } from '../../services/SEOAutoOptimizer';
import { MediaPickerModal } from './MediaPickerModal';
import { ArticleContentRenderer } from '../common/ArticleContentRenderer';

type PageFilterTab = 'ALL' | 'PUBLISHED' | 'DRAFT' | 'TRASH';

export const PageManagerView: React.FC = () => {
  const {
    pages,
    createPage,
    updatePage,
    deletePage,
    duplicatePage,
    setPortalMode,
    setCmsView,
    setPublicActivePageSlug,
    setPublicActivePostSlug,
  } = useApp();
  const { currentUser, hasPermission } = useAuth();

  // Mode: 'LIST' | 'EDITOR'
  const [viewMode, setViewMode] = useState<'LIST' | 'EDITOR'>('LIST');
  const [editingPageId, setEditingPageId] = useState<string | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<PageFilterTab>('ALL');
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Editor Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formStatus, setFormStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  const [formTemplate, setFormTemplate] = useState<'default' | 'full_width' | 'contact' | 'policy'>('default');
  const [formFeaturedImage, setFormFeaturedImage] = useState('');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formMetaDesc, setFormMetaDesc] = useState('');
  const [formOrder, setFormOrder] = useState<number>(0);
  const [editorActiveTab, setEditorActiveTab] = useState<'content' | 'preview' | 'seo'>('content');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4500);
  };

  // Switch to Add New Page
  const handleAddNewPage = () => {
    setEditingPageId(null);
    setFormTitle('');
    setFormSlug('');
    setFormContent('');
    setFormExcerpt('');
    setFormStatus('PUBLISHED');
    setFormTemplate('default');
    setFormFeaturedImage('');
    setFormSeoTitle('');
    setFormMetaDesc('');
    setFormOrder(pages.length + 1);
    setEditorActiveTab('content');
    setViewMode('EDITOR');
  };

  // Switch to Edit Page
  const handleEditPage = (page: StaticPage) => {
    setEditingPageId(page.id);
    setFormTitle(page.title);
    setFormSlug(page.slug);
    setFormContent(page.content || '');
    setFormExcerpt(page.excerpt || '');
    setFormStatus(page.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED');
    setFormTemplate(page.template || 'default');
    setFormFeaturedImage(page.featuredImage || '');
    setFormSeoTitle(page.seoTitle || '');
    setFormMetaDesc(page.metaDescription || '');
    setFormOrder(page.order || 0);
    setEditorActiveTab('content');
    setViewMode('EDITOR');
  };

  // Marathi Phonetic Auto-slug generator
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingPageId || !formSlug) {
      const generated = transliterateMarathiToSlug(val);
      setFormSlug(generated);
    }
  };

  const handleRegenerateSlug = () => {
    setFormSlug(transliterateMarathiToSlug(formTitle));
  };

  // 1-Click Mandatory Legal & AdSense Pages Generator
  const handleGenerateMandatoryPages = () => {
    const MANDATORY_PAGES = [
      {
        slug: 'about-us',
        title: 'आमच्याबद्दल (About InfoNewsUpdate24)',
        template: 'default' as const,
        order: 1,
        excerpt: 'InfoNewsUpdate24 महाराष्ट्र आणि गडचिरोलीचे अग्रगण्य डिजिटल वृत्तपत्र.',
        content: `## 🌟 InfoNewsUpdate24 - महाराष्ट्राचा अग्रगण्य डिजिटल न्यूज प्लॅटफॉर्म

**InfoNewsUpdate24** हे महाराष्ट्र, विदर्भ आणि विशेषतः गडचिरोली परिसरातील ताज्या, विश्वासार्ह आणि निर्भीड बातम्यांचे अग्रगण्य डिजिटल माध्यम आहे.

---

### 🎯 आमचे ध्येय व उद्दिष्ट
- **सत्य व पारदर्शकता:** कोणत्याही दबावाला बळी न पडता जनसामान्यांचे प्रश्न प्रशासनापर्यंत पोहोचवणे.
- **अफवांना आळा:** सोशल मीडियावरील दिशाभूल करणाऱ्या बातम्यांची सत्यता पडताळून अधिकृत वृत्त प्रसिद्ध करणे.
- **शेतकरी व योजना:** शासन निर्णय (GR), कृषी योजना, बाजारभाव आणि रोजगाराच्या संधींची सविस्तर माहिती देणे.

---

### 👥 संपादकीय मंडळ व मूल्ये
आमचे जिल्हा आणि तालुका पातळीवरील विशेष बातमीदार अविरतपणे कार्यरत असून सत्यता, अचूकता आणि नैतिकता या तत्त्वांवर आमची पत्रकारिता आधारलेली आहे.

---

*ताज्या घडामोडींसाठी वाचत राहा: [InfoNewsUpdate24](https://infonewsupdate24.com)*`,
      },
      {
        slug: 'contact-us',
        title: 'संपर्क आणि ब्युरो कार्यालय (Contact Us)',
        template: 'contact' as const,
        order: 2,
        excerpt: 'InfoNewsUpdate24 संपादकीय व जाहिरात विभागाशी संपर्क साधा.',
        content: `## 📍 आमच्याशी संपर्क साधा

बातम्या, जाहिरात, वृत्त पाठवण्यासाठी किंवा कोणत्याही माहितीसाठी खालील कार्यालयाशी संपर्क साधा.

- **मुख्य संपादक कार्यालय:** InfoNewsUpdate24 मीडिया हाऊस, गडचिरोली / मुंबई, महाराष्ट्र.
- **संपादकीय ईमेल:** contact@infonewsupdate24.com / editor@infonewsupdate24.com
- **व्हॉट्सॲप हेल्पलाइन:** +91 98765 43210
- **कार्यालयीन वेळ:** सकाळी ९:०० ते संध्याकाळी ७:०० (सोमवार ते शनिवार)`,
      },
      {
        slug: 'privacy-policy',
        title: 'गोपनीयता धोरण (Privacy Policy - AdSense Compliant)',
        template: 'policy' as const,
        order: 3,
        excerpt: 'InfoNewsUpdate24 युझर डेटा सुरक्षा व गुगल अ‍ॅडसेन्स गोपनीयता धोरण.',
        content: `## 🔒 गोपनीयता धोरण (Privacy Policy)

**InfoNewsUpdate24** आपल्या वाचकांच्या वैयक्तिक गोपनीयतेचा आदर करते. हे धोरण आम्ही कोणती माहिती संकलित करतो आणि तिचा कसा वापर करतो हे स्पष्ट करते.

---

### १. कुकीज आणि Google AdSense
आमचे पोर्टल गुगल अ‍ॅडसेन्स (Google AdSense) आणि इतर थर्ड-पार्टी जाहिरात नेटवर्कच्या कुकीज वापरते. या कुकीज वाचकांच्या आवडीनुसार योग्य जाहिराती दाखवण्यासाठी वापरल्या जातात. वाचक त्यांच्या ब्राउझर सेटिंग्जमधून कुकीज बंद करू शकतात.

---

### २. वैयक्तिक माहितीचे रक्षण
आम्ही कोणत्याही वाचकाचा ईमेल, फोन नंबर किंवा वैयक्तिक डेटा तृतीय पक्षाला विकत नाही अथवा अनधिकृतपणे सामायिक करत नाही.

---

### ३. संपर्क
गोपनीयता धोरणाबाबत काही शंका असल्यास कृपया privacy@infonewsupdate24.com वर संपर्क साधा.`,
      },
      {
        slug: 'terms-conditions',
        title: 'नियम आणि अटी (Terms and Conditions)',
        template: 'policy' as const,
        order: 4,
        excerpt: 'InfoNewsUpdate24 संकेतस्थळ वापरण्याच्या कायदेशीर अटी व नियम.',
        content: `## 📜 नियम आणि अटी (Terms of Service)

**InfoNewsUpdate24** या संकेतस्थळाचा वापर करताना खालील नियम व अटी लागू राहतील:

---

### १. कॉपीराइट व बौद्धिक संपदा
या संकेतस्थळावरील सर्व बातम्या, फोटो, लोगो आणि व्हिडिओ InfoNewsUpdate24 च्या मालकीचे आहेत. पूर्वपरवानगीशिवाय मजकुराची चोरी करणे अथवा पुनर्प्रकाशित करणे कायदेशीर गुन्हा आहे.

---

### २. वाचकांच्या प्रतिक्रिया व टिप्पण्या
वाचकांनी कोणत्याही व्यक्ती, धर्म किंवा समाजाचा अवमान करणारी भाषा वापरू नये. आक्षेपार्ह टिप्पणी आढळल्यास तात्काळ कायदेशीर कारवाई केली जाईल.`,
      },
      {
        slug: 'disclaimer',
        title: 'जबाबदारी नाकारणे व बातमी पडताळणी (Disclaimer)',
        template: 'policy' as const,
        order: 5,
        excerpt: 'InfoNewsUpdate24 बातमी पडताळणी आणि कायदेशीर अस्वीकरण.',
        content: `## ⚠️ जबाबदारी नाकारणे (Disclaimer)

**InfoNewsUpdate24** वर प्रसिद्ध होणाऱ्या बातम्यांची माहिती अधिकृत स्त्रोत, पत्रकार आणि शासकीय पत्रकांवरून पडताळून प्रसिद्ध केली जाते.

---

### १. माहितीची अचूकता
आम्ही जास्तीत जास्त अचूक माहिती देण्याचा प्रयत्न करतो, तरीही वाचकांनी कोणत्याही आर्थिक किंवा कायदेशीर निर्णयापूर्वी अधिकृत सरकारी गॅझेटची पडताळणी करावी.

---

### २. बाह्य दुवे (External Links)
पोर्टलवर दिलेल्या बाह्य संकेतस्थळांच्या लिंक्सवरील मजकुरासाठी किंवा सुरक्षिततेसाठी InfoNewsUpdate24 जबाबदार राहणार नाही.`,
      },
      {
        slug: 'grievance-redressal',
        title: 'तक्रार निवारण अधिकारी (Grievance Redressal - IT Rules 2021)',
        template: 'policy' as const,
        order: 6,
        excerpt: 'डिजिटल मीडिया आचारसंहिता IT Rules 2021 नुसार तक्रार निवारण अधिकारी.',
        content: `## ⚖️ तक्रार निवारण कक्ष (Grievance Redressal Mechanism)

भारतीय माहिती तंत्रज्ञान (मध्यस्थ मार्गदर्शक तत्त्वे आणि डिजिटल मीडिया आचारसंहिता) नियम २०२१ (IT Rules 2021) च्या तरतुदींनुसार तक्रार निवारण अधिकारी नियुक्त करण्यात आले आहेत.

---

### 👤 तक्रार निवारण अधिकारी संपर्क तपशील:
- **अधिकारी:** ॲड. सचिन मोरे (कायदेशीर सल्लागार व तक्रार निवारण प्रमुख)
- **ईमेल:** grievance@infonewsupdate24.com
- **पत्ता:** InfoNewsUpdate24 तक्रार निवारण कक्ष, गडचिरोली / मुंबई, महाराष्ट्र.
- **निवारण कालावधी:** तक्रार प्राप्त झाल्यापासून १५ दिवसांच्या आत सविस्तर चौकशी करून उत्तर दिले जाईल.`,
      },
    ];

    let createdCount = 0;
    MANDATORY_PAGES.forEach((item) => {
      const exists = pages.some((p) => p.slug === item.slug);
      if (!exists) {
        createPage({
          title: item.title,
          slug: item.slug,
          content: item.content,
          excerpt: item.excerpt,
          status: 'PUBLISHED',
          template: item.template,
          featuredImage: '',
          authorName: currentUser?.name || 'Chief Editor',
          authorRole: currentUser?.role || 'ADMIN',
          seoTitle: item.title,
          metaDescription: item.excerpt,
          order: item.order,
          views: 0,
        });
        createdCount++;
      }
    });

    if (createdCount > 0) {
      showNotification('success', `✨ ${createdCount} कायदेशीर व AdSense अनिवार्य पाने (About, Contact, Privacy Policy, Terms, Grievance) यशस्वीरित्या तयार झाली!`);
    } else {
      showNotification('success', 'सर्व कायदेशीर पाने आधीपासूनच तयार आहेत!');
    }
  };

  // Save Page
  const handleSavePage = (targetStatus?: 'PUBLISHED' | 'DRAFT') => {
    if (!formTitle.trim()) {
      showNotification('error', 'कृपया पानाचे शीर्षक (Page Title) प्रविष्ट करा.');
      return;
    }

    const finalStatus = targetStatus || formStatus;
    const finalSlug =
      formSlug.trim() ||
      transliterateMarathiToSlug(formTitle) ||
      `page-${Date.now()}`;

    if (editingPageId) {
      updatePage(editingPageId, {
        title: formTitle.trim(),
        slug: finalSlug,
        content: formContent,
        excerpt: formExcerpt,
        status: finalStatus,
        template: formTemplate,
        featuredImage: formFeaturedImage,
        seoTitle: formSeoTitle || formTitle,
        metaDescription: formMetaDesc || formExcerpt,
        order: Number(formOrder) || 0,
      });
      showNotification('success', `पान "${formTitle}" यशस्वीरित्या अपडेट केले गेले!`);
    } else {
      createPage({
        title: formTitle.trim(),
        slug: finalSlug,
        content: formContent,
        excerpt: formExcerpt,
        status: finalStatus,
        template: formTemplate,
        featuredImage: formFeaturedImage,
        authorName: currentUser?.name || 'Chief Editor',
        authorRole: currentUser?.role || 'ADMIN',
        seoTitle: formSeoTitle || formTitle,
        metaDescription: formMetaDesc || formExcerpt,
        order: Number(formOrder) || 0,
        views: 0,
      });
      showNotification('success', `नवीन पान "${formTitle}" यशस्वीरित्या तयार झाले!`);
    }

    setViewMode('LIST');
    setEditingPageId(null);
  };

  // Duplicate Page
  const handleDuplicate = (id: string) => {
    const dup = duplicatePage(id);
    if (dup) {
      showNotification('success', `पानाची प्रत तयार करण्यात आली: ${dup.title}`);
    }
  };

  // Delete / Trash Page
  const handleDeletePage = (id: string, title: string) => {
    if (window.confirm(`तुम्हाला खात्री आहे का की "${title}" हे पान कायमचे हटवायचे आहे?`)) {
      deletePage(id);
      setSelectedPageIds((prev) => prev.filter((item) => item !== id));
      showNotification('success', `पान "${title}" हटवण्यात आले.`);
    }
  };

  // Bulk Actions
  const handleApplyBulkAction = () => {
    if (!bulkAction || selectedPageIds.length === 0) return;

    if (bulkAction === 'publish') {
      selectedPageIds.forEach((id) => updatePage(id, { status: 'PUBLISHED' }));
      showNotification('success', `${selectedPageIds.length} पाने प्रकाशित करण्यात आली.`);
    } else if (bulkAction === 'draft') {
      selectedPageIds.forEach((id) => updatePage(id, { status: 'DRAFT' }));
      showNotification('success', `${selectedPageIds.length} पाने मसुदा (Draft) स्थितीत हलवण्यात आली.`);
    } else if (bulkAction === 'delete') {
      if (window.confirm(`निवडलेली ${selectedPageIds.length} पाने कायमची हटवायची आहेत का?`)) {
        selectedPageIds.forEach((id) => deletePage(id));
        showNotification('success', `${selectedPageIds.length} पाने यशस्वीरित्या हटवली.`);
      }
    }
    setSelectedPageIds([]);
    setBulkAction('');
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPageIds(filteredPages.map((p) => p.id));
    } else {
      setSelectedPageIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedPageIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // View on public portal
  const handleViewLivePage = (slug: string) => {
    setPublicActivePostSlug(null);
    setPublicActivePageSlug(slug);
    setPortalMode('PUBLIC');
  };

  // Filtered list
  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      if (currentTab === 'PUBLISHED' && page.status !== 'PUBLISHED') return false;
      if (currentTab === 'DRAFT' && page.status !== 'DRAFT') return false;
      if (currentTab === 'TRASH' && (page.status as string) !== 'TRASH') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = page.title.toLowerCase().includes(q);
        const slugMatch = page.slug.toLowerCase().includes(q);
        const contentMatch = page.content?.toLowerCase().includes(q);
        return titleMatch || slugMatch || contentMatch;
      }
      return true;
    });
  }, [pages, currentTab, searchQuery]);

  const counts = useMemo(() => {
    const all = pages.length;
    const published = pages.filter((p) => p.status === 'PUBLISHED').length;
    const draft = pages.filter((p) => p.status === 'DRAFT').length;
    return { all, published, draft };
  }, [pages]);

  // RENDER: WORDPRESS-STYLE FULL PAGE EDITOR
  if (viewMode === 'EDITOR') {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        {/* Top Bar Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>All Pages (सर्व पाने)</span>
            </button>
            <div className="h-5 w-px bg-slate-300" />
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-600" />
              <span>{editingPageId ? 'Edit Page (पान संपादन करा)' : 'Add New Page (नवीन पान जोडा)'}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleSavePage('DRAFT')}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
            >
              Save Draft (मसुदा जतन करा)
            </button>

            {editingPageId && formSlug && (
              <button
                type="button"
                onClick={() => handleViewLivePage(formSlug)}
                className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Live Preview</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSavePage('PUBLISHED')}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-all cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>{editingPageId ? 'Update Page (अपडेट करा)' : 'Publish Page (प्रकाशित करा)'}</span>
            </button>
          </div>
        </div>

        {/* Editor Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content Area (2 Cols) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title Input */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
                Page Title (पानाचे नाव / शीर्षक) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="उदा. About Us, Contact Us, Privacy Policy..."
                className="w-full text-lg font-bold text-slate-900 border border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden transition-all"
              />

              {/* Permalink / Slug Auto-Populate */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono">
                <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="shrink-0 font-bold text-slate-600">Permalink:</span>
                <span className="text-slate-400 truncate">https://infonewsupdate24.com/page/</span>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="flex-1 min-w-[150px] bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 font-bold focus:border-red-500 outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleRegenerateSlug}
                  title="शीर्षकावरून स्लग ऑटो-जनरेट करा"
                  className="flex items-center gap-1 rounded bg-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-300"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Auto-Generate</span>
                </button>
              </div>
            </div>

            {/* Tabbed Editor Section */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 pt-3 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditorActiveTab('content')}
                    className={`flex items-center gap-1.5 border-b-2 px-3 py-2 transition-all ${
                      editorActiveTab === 'content'
                        ? 'border-red-600 text-red-600 bg-white rounded-t-lg shadow-2xs'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Write / Markdown</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditorActiveTab('preview')}
                    className={`flex items-center gap-1.5 border-b-2 px-3 py-2 transition-all ${
                      editorActiveTab === 'preview'
                        ? 'border-red-600 text-red-600 bg-white rounded-t-lg shadow-2xs'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Eye className="h-4 w-4 text-blue-600" />
                    <span>Live Reader Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditorActiveTab('seo')}
                    className={`flex items-center gap-1.5 border-b-2 px-3 py-2 transition-all ${
                      editorActiveTab === 'seo'
                        ? 'border-red-600 text-red-600 bg-white rounded-t-lg shadow-2xs'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>SEO & Meta Settings</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  {formContent.split(/\s+/).filter(Boolean).length} शब्द
                </span>
              </div>

              <div className="p-5">
                {editorActiveTab === 'content' && (
                  <div className="space-y-4">
                    {/* Quick Formatting Toolbar */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-2 rounded-lg border border-slate-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setFormContent((prev) => prev + '\n## ')}
                        className="px-2 py-1 bg-white border border-slate-300 rounded font-bold hover:bg-slate-50 text-slate-700 text-[11px]"
                        title="Heading 2"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormContent((prev) => prev + '\n### ')}
                        className="px-2 py-1 bg-white border border-slate-300 rounded font-bold hover:bg-slate-50 text-slate-700 text-[11px]"
                        title="Heading 3"
                      >
                        H3
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormContent((prev) => prev + '\n- ')}
                        className="px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 text-slate-700 text-[11px]"
                        title="Bullet List"
                      >
                        &bull; List
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormContent((prev) => prev + '\n१. ')}
                        className="px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 text-slate-700 text-[11px]"
                        title="Numbered List"
                      >
                        १. २. List
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormContent((prev) => prev + '\n> ')}
                        className="px-2 py-1 bg-white border border-slate-300 rounded italic hover:bg-slate-50 text-slate-700 text-[11px]"
                        title="Quote"
                      >
                        &ldquo; Quote
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormContent((prev) => prev + '\n---\n')}
                        className="px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 text-slate-700 text-[11px]"
                        title="Divider Line"
                      >
                        Divider
                      </button>
                    </div>

                    <textarea
                      rows={14}
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      placeholder="पानाचा संपूर्ण मजकूर येथे लिहा किंवा पेस्ट करा..."
                      className="w-full rounded-xl border border-slate-200 p-4 text-sm text-slate-800 leading-relaxed focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-hidden font-normal"
                    />

                    {/* Excerpt */}
                    <div className="space-y-1.5 pt-2">
                      <label className="block text-xs font-bold text-slate-700">
                        Page Excerpt (संक्षिप्त गोषवारा / सारांश)
                      </label>
                      <textarea
                        rows={2}
                        value={formExcerpt}
                        onChange={(e) => setFormExcerpt(e.target.value)}
                        placeholder="पानाचा संक्षिप्त १-२ वाक्यांचा सारांश..."
                        className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-700 focus:border-red-500 outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {editorActiveTab === 'preview' && (
                  <div className="rounded-xl border border-slate-100 bg-white p-4">
                    <ArticleContentRenderer content={formContent || '*कोणताही मजकूर लिहिलेला नाही.*'} />
                  </div>
                )}

                {editorActiveTab === 'seo' && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">SEO Meta Title</label>
                      <input
                        type="text"
                        value={formSeoTitle}
                        onChange={(e) => setFormSeoTitle(e.target.value)}
                        placeholder={formTitle || 'Enter SEO Title'}
                        className="w-full rounded-lg border border-slate-200 p-2.5"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Google आणि इतर सर्च इंजिनसाठी सर्वोत्तम शीर्षक.
                      </p>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Meta Description</label>
                      <textarea
                        rows={3}
                        value={formMetaDesc}
                        onChange={(e) => setFormMetaDesc(e.target.value)}
                        placeholder="पानाचे मेटा वर्णन प्रविष्ट करा..."
                        className="w-full rounded-lg border border-slate-200 p-2.5"
                      />
                    </div>

                    {/* Google Search Snippet Preview */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Search Snippet Preview (गूगल सर्च पूर्वावलोकन)
                      </span>
                      <p className="text-xs font-medium text-blue-700 hover:underline truncate">
                        {formSeoTitle || formTitle || 'InfoNewsUpdate24 - Page Title'}
                      </p>
                      <p className="text-[11px] text-emerald-700 truncate font-mono">
                        https://infonewsupdate24.com/page/{formSlug || 'sample-page'}
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {formMetaDesc || formExcerpt || formContent.slice(0, 140) || 'No meta description configured yet.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: WordPress-Style Page Attributes & Publishing (1 Col) */}
          <div className="space-y-5 text-xs">
            {/* Publish Status Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between">
                <span>Publish Settings</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    formStatus === 'PUBLISHED'
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                      : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                  }`}
                >
                  {formStatus}
                </span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status (स्थिती)</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-medium"
                  >
                    <option value="PUBLISHED">Published (प्रकाशित)</option>
                    <option value="DRAFT">Draft (मसुदा)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Author (लेखक / विभाग)</label>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>{currentUser?.name || 'Chief Administrator'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setViewMode('LIST')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSavePage()}
                    className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-red-700"
                  >
                    {editingPageId ? 'Update' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>

            {/* Page Attributes & Template */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                <Layout className="h-4 w-4 text-slate-500" />
                <span>Page Attributes (पानाची रचना व लेआउट)</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Page Template (लेआउट टेम्प्लेट)</label>
                  <select
                    value={formTemplate}
                    onChange={(e) => setFormTemplate(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-medium"
                  >
                    <option value="default">Default News Template (मानक लेआउट)</option>
                    <option value="policy">Editorial & Policy Document (धोरण व नियम)</option>
                    <option value="contact">Contact & Bureau Directory (संपर्क फॉर्म व ब्युरो)</option>
                    <option value="full_width">Full Width Clean Canvas (विस्तृत पान)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Menu Order (अनुक्रम क्रमांक)</label>
                  <input
                    type="number"
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-mono"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Featured Image Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-slate-500" />
                  <span>Featured Image</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>लायब्ररीतून निवडा</span>
                </button>
              </div>

              {formFeaturedImage ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video group">
                  <img
                    src={formFeaturedImage}
                    alt="Page preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormFeaturedImage('')}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                    title="Remove Image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 hover:bg-slate-50 cursor-pointer"
                >
                  <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-50 text-red-600" />
                  <p className="text-[11px] font-bold text-slate-700">फोटो जोडण्यासाठी क्लिक करा</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Media Picker Modal */}
        <MediaPickerModal
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelectImage={(m) => {
            setFormFeaturedImage(m.url);
            setIsMediaPickerOpen(false);
          }}
        />
      </div>
    );
  }

  // RENDER: WORDPRESS-STYLE ALL PAGES TABLE
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>Pages (स्थिर पाने व्यवस्थापक)</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                  {pages.length}
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                WordPress-प्रमाणे About Us, Contact, Privacy Policy, आणि संपादकीय पाने तयार व व्यवस्थापित करा.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1-Click Mandatory Legal & AdSense Pages Generator */}
          <button
            type="button"
            onClick={handleGenerateMandatoryPages}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-100 transition-all cursor-pointer"
            title="AdSense व IT Rules 2021 साठी अनिवार्य पाने एका क्लिकवर तयार करा"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>📜 कायदेशीर व AdSense पाने ऑटो-जनरेट</span>
          </button>

          <button
            type="button"
            onClick={() => setCmsView('importer')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
          >
            <Globe className="h-4 w-4 text-red-600" />
            <span>WP Importer</span>
          </button>

          <button
            type="button"
            onClick={handleAddNewPage}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Page (नवीन पान जोडा)</span>
          </button>
        </div>
      </div>

      {/* Status Feedback Notification */}
      {notification && (
        <div
          className={`flex items-center gap-2 rounded-xl p-4 text-xs font-bold ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Tabs & Search Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          {/* WordPress Filter Tabs */}
          <div className="flex items-center gap-1 font-bold text-slate-600 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setCurrentTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentTab === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              All ({counts.all})
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => setCurrentTab('PUBLISHED')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentTab === 'PUBLISHED'
                  ? 'bg-emerald-600 text-white'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              Published ({counts.published})
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => setCurrentTab('DRAFT')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentTab === 'DRAFT'
                  ? 'bg-amber-600 text-white'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              Drafts ({counts.draft})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pages / पान शोधा..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-900 focus:bg-white focus:border-red-500 outline-hidden"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700"
            >
              <option value="">Bulk Actions (एकत्रित कृती)</option>
              <option value="publish">Set as Published</option>
              <option value="draft">Move to Draft</option>
              <option value="delete">Delete Permanently</option>
            </select>
            <button
              type="button"
              onClick={handleApplyBulkAction}
              disabled={!bulkAction || selectedPageIds.length === 0}
              className="rounded-lg bg-slate-800 px-3 py-1.5 font-bold text-white hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Apply
            </button>
            {selectedPageIds.length > 0 && (
              <span className="text-slate-500 font-medium ml-1">
                {selectedPageIds.length} pages selected
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            Showing {filteredPages.length} of {pages.length} pages
          </div>
        </div>
      </div>

      {/* Pages Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredPages.length > 0 &&
                      selectedPageIds.length === filteredPages.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                </th>
                <th className="p-4">Title & Slug</th>
                <th className="p-4">Author</th>
                <th className="p-4">Template</th>
                <th className="p-4">Order</th>
                <th className="p-4">Views</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-30 text-slate-500" />
                    <p className="font-bold text-slate-700">कोणतेही पान सापडले नाही.</p>
                    <p className="text-[11px] mt-1 text-slate-400">
                      नवीन पान तयार करण्यासाठी वरील "Add New Page" किंवा "कायदेशीर पाने ऑटो-जनरेट" बटण दाबा.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => {
                  const isSelected = selectedPageIds.includes(page.id);
                  return (
                    <tr
                      key={page.id}
                      className={`hover:bg-slate-50/80 transition-colors group ${
                        isSelected ? 'bg-red-50/40' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(page.id)}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                      </td>

                      {/* Title, Status & Quick Action Hover Links */}
                      <td className="p-4 max-w-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              onClick={() => handleEditPage(page)}
                              className="font-bold text-slate-900 text-sm hover:text-red-600 transition-colors cursor-pointer"
                            >
                              {page.title}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                page.status === 'PUBLISHED'
                                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                                  : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                              }`}
                            >
                              {page.status}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 truncate">
                            <Globe className="h-3 w-3 shrink-0" />
                            <span>/page/{page.slug}</span>
                          </div>

                          {/* Quick Action Links on Hover */}
                          <div className="flex items-center gap-2 text-[11px] pt-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleEditPage(page)}
                              className="font-bold text-blue-600 hover:underline"
                            >
                              Edit
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => handleDuplicate(page.id)}
                              className="font-bold text-slate-600 hover:underline"
                            >
                              Duplicate
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => handleViewLivePage(page.slug)}
                              className="font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
                            >
                              <span>View</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => handleDeletePage(page.id, page.title)}
                              className="font-bold text-red-600 hover:underline"
                            >
                              Trash
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="p-4">
                        <span className="font-semibold text-slate-700">
                          {page.authorName || 'Chief Admin'}
                        </span>
                      </td>

                      {/* Template */}
                      <td className="p-4">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600 capitalize">
                          {page.template || 'default'}
                        </span>
                      </td>

                      {/* Order */}
                      <td className="p-4 font-mono text-slate-500">
                        {page.order ?? 0}
                      </td>

                      {/* Views */}
                      <td className="p-4">
                        <span className="font-bold text-slate-700">
                          {(page.views || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-[11px] text-slate-500">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-700">
                            {page.status === 'PUBLISHED' ? 'Published' : 'Last Modified'}
                          </p>
                          <p className="text-slate-400">
                            {new Date(page.updatedAt || page.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </td>

                      {/* Row Action Buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleViewLivePage(page.slug)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
                            title="View on Public Portal"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditPage(page)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                            title="Edit Page"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePage(page.id, page.title)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete Page"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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
  );
};
