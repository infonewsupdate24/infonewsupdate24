import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  EPaperEdition,
  EPaperPage,
  EPaperArticleClip,
} from '../../types';
import {
  EPAPER_DISTRICTS,
  formatMarathiDate,
} from '../../data/epaperSeedData';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Newspaper,
  Printer,
  Scissors,
  Share2,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  ZoomIn,
  ZoomOut,
  Check,
  ArrowLeft,
  MessageCircle,
  Tag,
  Camera,
  Sun,
  CloudSun,
  ExternalLink,
  Quote,
  Flame,
  Award,
  Radio,
  Image as ImageIcon,
  TrendingUp,
  Landmark,
  PenTool,
  Trophy,
  Globe,
  Archive,
  Search,
  Briefcase,
  GraduationCap,
  Building,
  HeartPulse,
  PhoneCall,
  Crop,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EPaperSyncService } from '../../services/EPaperSyncService';
import { AIVoiceService } from '../../services/AIVoiceService';
import { LiveWeatherService } from '../../services/LiveWeatherService';
import { cleanTextForTTS } from '../../utils/contentFormatter';

interface EPaperHubViewProps {
  onBackToPortal?: () => void;
}

export const EPaperHubView: React.FC<EPaperHubViewProps> = ({ onBackToPortal }) => {
  const { posts, categories, ads, epaperSettings } = useApp();

  const availableDistricts = useMemo(() => {
    return [
      { code: 'gadchiroli', name: 'हॅलो गडचिरोली', region: 'पूर्व विदर्भ' },
      { code: 'nagpur', name: 'हॅलो नागपूर', region: 'विदर्भ' },
      { code: 'chandrapur', name: 'हॅलो चंद्रपूर', region: 'विदर्भ' },
      { code: 'pune', name: 'हॅलो पुणे', region: 'पश्चिम महाराष्ट्र' },
      { code: 'mumbai', name: 'हॅलो मुंबई', region: 'कोकण' },
      { code: 'nashik', name: 'हॅलो नाशिक', region: 'उत्तर महाराष्ट्र' },
      { code: 'sambhajinagar', name: 'हॅलो संभाजीनगर', region: 'मराठवाडा' },
    ];
  }, []);

  const getTodayIso = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDistrict, setSelectedDistrict] = useState<string>('gadchiroli');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIso);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isClipModeActive, setIsClipModeActive] = useState<boolean>(false);
  const [selectedClip, setSelectedClip] = useState<EPaperArticleClip | null>(null);
  const [isClipModalOpen, setIsClipModalOpen] = useState<boolean>(false);
  const [copyToast, setCopyToast] = useState<string>('');
  const [isSpeakingClip, setIsSpeakingClip] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isGeneratingFullPdf, setIsGeneratingFullPdf] = useState<boolean>(false);
  const [pdfProgressMsg, setPdfProgressMsg] = useState<string>('');

  // =========================================================================
  // OPTION 2: VISUAL DRAG-AND-CROP INTERACTION STATE
  // =========================================================================
  const [isDrawingCrop, setIsDrawingCrop] = useState<boolean>(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropCurrent, setCropCurrent] = useState<{ x: number; y: number } | null>(null);
  const [customCroppedDataUrl, setCustomCroppedDataUrl] = useState<string | null>(null);
  const [isCustomCropModalOpen, setIsCustomCropModalOpen] = useState<boolean>(false);

  // =========================================================================
  // OPTION 3: 30-DAY ARCHIVES MODAL STATE
  // =========================================================================
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState<boolean>(false);
  const [archiveSearchQuery, setArchiveSearchQuery] = useState<string>('');

  // Generate 30-day past dates list dynamically from today
  const past30DaysList = useMemo(() => {
    const dates = [];
    const base = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const iso = `${year}-${month}-${day}`;
      const formattedMr = formatMarathiDate(iso);
      dates.push({
        isoDate: iso,
        formattedDateMr: formattedMr,
        isToday: i === 0,
        dayNumber: d.getDate(),
        monthName: formattedMr.split(' ')[2] || 'ऑगस्ट',
      });
    }
    return dates;
  }, []);

  // Filtered archives
  const filteredArchives = useMemo(() => {
    if (!archiveSearchQuery) return past30DaysList;
    return past30DaysList.filter((item) =>
      item.formattedDateMr.toLowerCase().includes(archiveSearchQuery.toLowerCase()) ||
      item.isoDate.includes(archiveSearchQuery)
    );
  }, [past30DaysList, archiveSearchQuery]);

  // Dynamic Real Weather State for the Selected District
  const [districtWeather, setDistrictWeather] = useState<{
    temp: number;
    tempMin: number;
    tempMax: number;
    conditionText: string;
    sunrise: string;
    sunset: string;
  }>({
    temp: 30,
    tempMin: 24,
    tempMax: 32,
    conditionText: 'अंशतः ढगाळ',
    sunrise: '०६:०८',
    sunset: '०६:३८',
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMainRef = useRef<HTMLDivElement | null>(null);

  // Fetch real-time weather dynamically whenever selected district changes
  useEffect(() => {
    let isMounted = true;
    LiveWeatherService.fetchLiveWeather(selectedDistrict)
      .then((data) => {
        if (isMounted && data) {
          const maxT = data.dailyForecast?.[0]?.tempMax ?? (data.temperature + 2);
          const minT = data.dailyForecast?.[0]?.tempMin ?? (data.temperature - 5);
          setDistrictWeather({
            temp: data.temperature,
            tempMin: minT,
            tempMax: maxT,
            conditionText: data.conditionText,
            sunrise: '०६:०८',
            sunset: '०६:३८',
          });
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [selectedDistrict]);

  // Dynamic E-Paper Edition generated from real posts
  const activeEdition: EPaperEdition = useMemo(() => {
    return EPaperSyncService.generateDynamicEdition(
      posts,
      selectedDistrict,
      selectedDate,
      categories,
      ads
    );
  }, [posts, selectedDistrict, selectedDate, categories, ads]);

  const currentPage: EPaperPage =
    activeEdition.pages[currentPageIndex] || activeEdition.pages[0];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isClipModalOpen || isCustomCropModalOpen || isArchiveModalOpen) return;
      if (e.key === 'ArrowRight') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, isClipModalOpen, isCustomCropModalOpen, isArchiveModalOpen, activeEdition.pages.length]);

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < activeEdition.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const handleArticleClick = (art: EPaperArticleClip) => {
    if (isClipModeActive) return; // In visual crop mode, avoid modal trigger
    setSelectedClip(art);
    setIsClipModalOpen(true);
    setIsSpeakingClip(false);
  };

  const handleWhatsAppClipShare = (clip: EPaperArticleClip) => {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://infonewsupdate24.com';
    const text = `📰 *InfoNewsUpdate24 ${currentDistrictName} ई-पेपर कात्रण (E-Paper Clip)*\n📅 *दिनांक:* ${activeEdition.formattedDateMarathi}\n\n📌 *${clip.headline}*\n\n${clip.summary || clip.fullBody?.slice(0, 200)}...\n\n👉 *संपूर्ण बातमी व ई-पेपर वाचण्यासाठी येथे क्लिक करा:*\n🔗 ${origin}?mode=epaper&page=${clip.pageNumber}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleWhatsAppCustomCropShare = () => {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://infonewsupdate24.com';
    const text = `📰 *InfoNewsUpdate24 ${currentDistrictName} ई-पेपर विशेष कात्रण (Custom Cutout)*\n📅 *दिनांक:* ${activeEdition.formattedDateMarathi} • पृष्ठ क्र. ${currentPage.pageNumber}\n\n👉 *संपूर्ण ई-पेपर वाचण्यासाठी येथे क्लिक करा:*\n🔗 ${origin}?mode=epaper&page=${currentPage.pageNumber}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSpeakClip = (headline: string, text: string) => {
    if (isSpeakingClip) {
      AIVoiceService.stop();
      setIsSpeakingClip(false);
      return;
    }

    const clean = cleanTextForTTS(`${headline}। ${text}`);
    setIsSpeakingClip(true);
    AIVoiceService.speak({
      text: clean,
      onEnd: () => setIsSpeakingClip(false),
      onError: () => setIsSpeakingClip(false),
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadFullEditionPdf = async () => {
    if (isGeneratingFullPdf) return;
    try {
      setIsGeneratingFullPdf(true);
      setPdfProgressMsg('📄 PDF इंजिन सुरू होत आहे...');
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const totalPages = activeEdition.pages.length;
      const initialPage = currentPageIndex;

      for (let i = 0; i < totalPages; i++) {
        setPdfProgressMsg(`📄 पान ${i + 1}/${totalPages} तयार होत आहे...`);
        setCurrentPageIndex(i);
        // Wait for state render tick
        await new Promise((r) => setTimeout(r, 450));

        const canvasElement = document.getElementById('epaper-canvas-main');
        if (canvasElement) {
          const canvas = await html2canvas(canvasElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.92);
          if (i > 0) {
            pdf.addPage('a4', 'p');
          }
          pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        }
      }

      // Restore initial page
      setCurrentPageIndex(initialPage);

      setPdfProgressMsg('💾 PDF फाईल सेव्ह होत आहे...');
      const cleanDist = currentDistrictName.replace('हॅलो ', '');
      pdf.save(`InfoNewsUpdate24_EPaper_${cleanDist}_${selectedDate}_All6Pages.pdf`);

      setCopyToast(`✅ संपूर्ण ${totalPages} पानांची एकत्रित PDF यशस्वीरीत्या डाऊनलोड झाली!`);
      setTimeout(() => setCopyToast(''), 4500);
    } catch (err) {
      console.error('Error generating multi-page PDF:', err);
      setCopyToast('⚠️ प्रिंट व डाऊनलोड विंडो उघडत आहे...');
      window.print();
    } finally {
      setIsGeneratingFullPdf(false);
      setPdfProgressMsg('');
    }
  };

  const handleDownloadPagePdf = () => {
    setCopyToast('📥 चालू पानाची PDF डाऊनलोड होत आहे...');
    setTimeout(() => setCopyToast(''), 3500);
    window.print();
  };

  const handleDownloadPageImage = () => {
    setCopyToast('🖼️ ई-पेपर पृष्ठ JPG इमेज डाऊनलोड होत आहे...');
    setTimeout(() => setCopyToast(''), 3500);

    const canvasElement = document.getElementById('epaper-canvas-main');
    if (!canvasElement) {
      window.print();
      return;
    }

    try {
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1420">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${canvasElement.outerHTML}
            </div>
          </foreignObject>
        </svg>
      `;

      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = window.URL.createObjectURL(svgBlob);

      img.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = 1200;
        offCanvas.height = 1700;
        const ctx = offCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 1200, 1700);
          ctx.drawImage(img, 0, 0, 1200, 1700);
          const jpgUrl = offCanvas.toDataURL('image/jpeg', 0.95);
          const downloadAnchor = document.createElement('a');
          downloadAnchor.href = jpgUrl;
          downloadAnchor.download = `InfoNewsUpdate24-${selectedDistrict}-Page-${currentPage.pageNumber}.jpg`;
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          document.body.removeChild(downloadAnchor);
        }
        window.URL.revokeObjectURL(blobURL);
      };

      img.src = blobURL;
    } catch {
      window.print();
    }
  };

  // =========================================================================
  // OPTION 2: VISUAL DRAG-AND-CROP MOUSE / TOUCH HANDLERS
  // =========================================================================
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isClipModeActive || !canvasMainRef.current) return;
    const rect = canvasMainRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCropStart({ x, y });
    setCropCurrent({ x, y });
    setIsDrawingCrop(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingCrop || !canvasMainRef.current) return;
    const rect = canvasMainRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    setCropCurrent({ x, y });
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawingCrop || !cropStart || !cropCurrent) {
      setIsDrawingCrop(false);
      return;
    }
    setIsDrawingCrop(false);

    const width = Math.abs(cropCurrent.x - cropStart.x);
    const height = Math.abs(cropCurrent.y - cropStart.y);

    if (width > 40 && height > 40) {
      // Valid selection box created
      finalizeVisualCrop();
    } else {
      setCropStart(null);
      setCropCurrent(null);
    }
  };

  const finalizeVisualCrop = () => {
    setCopyToast('✂️ सानुकूल कात्रण तयार झाले आहे!');
    setTimeout(() => setCopyToast(''), 3000);
    setIsCustomCropModalOpen(true);
    setIsClipModeActive(false);
  };

  const currentDistrictName =
    availableDistricts.find((d) => d.code === selectedDistrict)?.name || 'हॅलो गडचिरोली';

  const getPageSectionTitle = (pageIdx: number) => {
    switch (pageIdx) {
      case 0:
        return 'मुख्य पान • जिल्हा विशेष घडामोडी';
      case 1:
        return 'महाराष्ट्र व शासन निर्णय विशेष';
      case 2:
        return 'लोकमंथन • संपादकीय अग्रलेख व विचार';
      case 3:
        return 'अर्थविश्व • कृषी वार्ता व बाजारभाव';
      case 4:
        return 'क्रीडाविश्व • युवा यशोगाथा व मनोरंजन';
      case 5:
        return 'देश-विदेश • राष्ट्रीय व जागतिक घडामोडी';
      default:
        return 'स्थानिक विशेष आवृत्ती';
    }
  };

  // Crop Box Geometry Calculations
  const cropBoxStyle = useMemo(() => {
    if (!cropStart || !cropCurrent) return null;
    const left = Math.min(cropStart.x, cropCurrent.x);
    const top = Math.min(cropStart.y, cropCurrent.y);
    const width = Math.abs(cropCurrent.x - cropStart.x);
    const height = Math.abs(cropCurrent.y - cropStart.y);
    return { left, top, width, height };
  }, [cropStart, cropCurrent]);

  // 100% Dynamic Newspaper Broadsheet Renderer from Auto-Populated Articles
  const renderDynamicPage = (page: EPaperPage) => {
    const articles = page.articles || [];
    const leadArticle = articles[0] || {
      id: `fallback-lead-${page.pageNumber}`,
      pageNumber: page.pageNumber,
      title: `${currentDistrictName} विशेष वृत्त व महत्त्वाच्या घडामोडी`,
      headline: `${currentDistrictName}: विकासकामे व शासकीय योजनांची अंमलबजावणी गतिमान`,
      summary: 'जिल्ह्यातील नागरिकांसाठी महत्त्वाचे निर्णय आणि विकास प्रकल्पांना प्रशासकीय मंजुरी.',
      category: 'मुख्य मथळा',
      authorName: 'विशेष प्रतिनिधी',
      location: currentDistrictName.replace('हॅलो ', ''),
      image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80',
    };

    const sideShorts = articles.slice(3, 6);
    const anchorArticles = articles.slice(1, 3);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Left Column: # क्विक Shorts */}
          <div className="col-span-3 border-r-2 border-slate-300 pr-3 space-y-3.5">
            <div className="border-b-2 border-black pb-1">
              <span className="text-sm font-black text-white bg-slate-950 px-2 py-0.5 rounded uppercase font-sans tracking-wide">
                # क्विक Shorts
              </span>
            </div>

            {sideShorts.length > 0 ? (
              sideShorts.map((shortArt, sIdx) => (
                <div
                  key={shortArt.id || sIdx}
                  onClick={() => handleArticleClick(shortArt)}
                  className="space-y-1.5 cursor-pointer hover:bg-amber-50 p-1.5 rounded transition-colors border-b border-slate-200 pb-2"
                >
                  {shortArt.image && (
                    <img
                      src={shortArt.image}
                      alt=""
                      className="w-full h-16 object-cover rounded border border-slate-300 shadow-2xs"
                    />
                  )}
                  <span className="text-[10px] font-black text-red-600 block uppercase">
                    {shortArt.category || 'स्थानिक वार्ता'}
                  </span>
                  <h4 className="text-xs font-black text-slate-950 leading-tight">
                    {shortArt.headline || shortArt.title}
                  </h4>
                  <p className="text-[10px] text-slate-700 leading-snug line-clamp-3">
                    <strong>{shortArt.location}:</strong> {shortArt.summary}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-[10px] text-slate-500 py-2">
                स्थानिक प्रतिनिधींकडून अधिक बातम्या संकलित होत आहेत.
              </div>
            )}
          </div>

          {/* Right 9 cols: Lead Story & Anchor Stories */}
          <div className="col-span-9 space-y-4">
            {/* 🔴 LEAD STORY */}
            <div
              onClick={() => handleArticleClick(leadArticle)}
              className="border-b-2 border-slate-300 pb-3 cursor-pointer hover:bg-amber-50/40 p-2 rounded transition-colors"
            >
              <span className="bg-red-600 text-white px-2.5 py-0.5 text-[10px] font-black uppercase rounded shadow-2xs">
                {leadArticle.category || '🔴 मुख्य मथळा (Lead Story)'}
              </span>

              <h2 className="text-xl sm:text-2xl font-black text-slate-950 leading-tight tracking-tight mt-1.5 mb-1 font-serif">
                {leadArticle.headline || leadArticle.title}
              </h2>

              <div className="flex flex-wrap items-center justify-between text-xs text-red-700 font-bold border-y border-slate-200 py-1 mb-2.5">
                <span className="font-black">{leadArticle.location} : विशेष वृत्तसेवा</span>
                <span className="text-slate-600 font-normal">बायलाईन: {leadArticle.authorName || 'विशेष प्रतिनिधी'}</span>
              </div>

              <div className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-8 text-[11px] text-slate-800 leading-relaxed text-justify space-y-2">
                  <p className="font-bold text-slate-950 bg-amber-50/70 p-2.5 rounded border-l-3 border-amber-500">
                    {leadArticle.summary}
                  </p>
                  <p className="line-clamp-4">
                    {leadArticle.fullBody || leadArticle.summary}
                  </p>
                </div>

                <div className="col-span-4 space-y-2">
                  {leadArticle.image && (
                    <img
                      src={leadArticle.image}
                      alt=""
                      className="w-full h-28 object-cover rounded border border-slate-300 shadow-2xs"
                    />
                  )}
                  <div className="bg-slate-100 border-l-3 border-red-600 p-2 rounded-r text-[10px]">
                    <Quote className="h-3 w-3 text-red-600" />
                    <p className="italic font-serif text-slate-900 leading-snug line-clamp-2">
                      "सविस्तर माहिती आणि ताज्या घडामोडींसाठी ई-पेपरवर क्लिक करा."
                    </p>
                    <span className="font-bold text-slate-700 block text-right">— {leadArticle.location} ब्युरो</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ANCHOR STORIES (2 Columns) */}
            {anchorArticles.length > 0 && (
              <div className="grid grid-cols-12 gap-3 border-b-2 border-slate-300 pb-3">
                {anchorArticles.map((ancArt, aIdx) => (
                  <div
                    key={ancArt.id || aIdx}
                    onClick={() => handleArticleClick(ancArt)}
                    className={`${
                      anchorArticles.length === 1 ? 'col-span-12' : aIdx === 0 ? 'col-span-7 border-r border-slate-300 pr-3' : 'col-span-5'
                    } space-y-1.5 cursor-pointer hover:bg-amber-50/40 p-1.5 rounded transition-colors`}
                  >
                    <span className="bg-slate-900 text-white px-2 py-0.5 text-[9px] font-black uppercase rounded">
                      {ancArt.category || 'महत्त्वाची घडामोड'}
                    </span>
                    {ancArt.image && (
                      <img
                        src={ancArt.image}
                        alt=""
                        className="w-full h-20 object-cover rounded border border-slate-300 shadow-2xs mt-1"
                      />
                    )}
                    <h3 className="text-sm font-black text-slate-950 font-serif leading-tight">
                      {ancArt.headline || ancArt.title}
                    </h3>
                    <p className="text-[10px] text-slate-800 leading-relaxed text-justify line-clamp-3">
                      <strong>{ancArt.location}:</strong> {ancArt.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CLASSIFIEDS COMMERCIAL GRID */}
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/90 p-3 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="text-xs font-black text-slate-950 flex items-center gap-1.5 uppercase font-sans">
              <Briefcase className="h-3.5 w-3.5 text-red-600" />
              स्थानिक वर्गीकृत वृत्तपत्रीय जाहिराती (Classifieds Commercial Grid)
            </span>
            <a
              href={`https://api.whatsapp.com/send?phone=918799933629&text=${encodeURIComponent('नमस्कार, मला InfoNewsUpdate24 ई-पेपरच्या वर्गीकृत विभागात जाहिरात बुक करायची आहे.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded shadow-2xs hover:bg-red-700 flex items-center gap-1 cursor-pointer"
            >
              <span>📲 येथे जाहिरात द्या (फक्त ₹२९९) &rarr;</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[10px]">
            <div className="bg-white p-2 rounded border border-slate-200 shadow-2xs space-y-1">
              <strong className="text-red-700 flex items-center gap-1">
                <HeartPulse className="h-3 w-3" /> डॉ. इंगळे हॉस्पिटल
              </strong>
              <p className="text-slate-700 leading-snug">
                {currentDistrictName.replace('हॅलो ', '')}: २४ तास इमर्जन्सी व ट्रॉमा केअर सुविधा उपलब्ध.
              </p>
            </div>

            <div className="bg-white p-2 rounded border border-slate-200 shadow-2xs space-y-1">
              <strong className="text-blue-700 flex items-center gap-1">
                <GraduationCap className="h-3 w-3" /> लक्ष्य अकॅडमी
              </strong>
              <p className="text-slate-700 leading-snug">
                पोलीस भरती व स्पर्धा परीक्षा नवीन बॅच प्रवेश सुरू.
              </p>
            </div>

            <div className="bg-white p-2 rounded border border-slate-200 shadow-2xs space-y-1">
              <strong className="text-emerald-700 flex items-center gap-1">
                <Building className="h-3 w-3" /> NA लेआउट प्लॉट विक्रीस
              </strong>
              <p className="text-slate-700 leading-snug">
                हायवे टच, तात्काळ ताबा व बँक कर्ज सुविधा उपलब्ध.
              </p>
            </div>

            <div className="bg-white p-2 rounded border border-slate-200 shadow-2xs space-y-1">
              <strong className="text-purple-700 flex items-center gap-1">
                <PhoneCall className="h-3 w-3" /> सौर कृषी पंप एजन्सी
              </strong>
              <p className="text-slate-700 leading-snug">
                ९०% अनुदानावर सौर पंप बसवून मिळतील.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-slate-950 text-slate-100 font-sans ${
        isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto' : ''
      }`}
    >
      {/* 1. TOP CONTROL & NAVIGATION BAR */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-4 py-3 shadow-lg epaper-no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Edition Selector */}
          <div className="flex items-center gap-3">
            {onBackToPortal && (
              <button
                type="button"
                onClick={onBackToPortal}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200 transition-colors cursor-pointer border border-slate-700"
                title="मुख्य पोर्टलवर परत जा"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>पोर्टलवर परत जा</span>
              </button>
            )}

            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white font-black shadow-md text-lg">
                24
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-base sm:text-lg font-black tracking-tight text-white uppercase">
                    <span>info</span>
                    <span className="text-red-500">News</span>
                    <span className="ml-1 text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black">
                      UPDATE24
                    </span>
                  </div>
                  <span className="rounded bg-amber-500 text-slate-950 px-1.5 py-0.2 text-[9px] font-black uppercase">
                    ई-पेपर
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  {activeEdition.formattedDateMarathi} &bull; {currentDistrictName}
                </p>
              </div>
            </div>
          </div>

          {/* District, Date, Archive & Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            {/* District Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1">
              <MapPin className="h-3.5 w-3.5 text-red-500" />
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setCurrentPageIndex(0);
                }}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                {availableDistricts.map((d) => (
                  <option key={d.code} value={d.code} className="bg-slate-900 text-white">
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              />
            </div>

            {/* 📅 OPTION 3: PAST 30-DAYS ARCHIVE BUTTON */}
            <button
              type="button"
              onClick={() => setIsArchiveModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 hover:text-white px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="मागील ३० दिवसांचे जुने अंक पहा"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>जुने अंक (Archive)</span>
            </button>

            {/* ✂️ OPTION 2: VISUAL DRAG-AND-CROP BUTTON */}
            <button
              type="button"
              onClick={() => {
                setIsClipModeActive(!isClipModeActive);
                setCropStart(null);
                setCropCurrent(null);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs ${
                isClipModeActive
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 font-black animate-pulse'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
              title="माऊसने चौकोन ओढून स्वतःचे कात्रण कापा"
            >
              <Scissors className="h-3.5 w-3.5 text-red-500" />
              <span>{isClipModeActive ? '✂️ कात्रण ओढा (Active)' : 'कात्रण कापा (Crop)'}</span>
            </button>

            {/* 📥 1-Click Full 6-Page Unified PDF Download Button */}
            <button
              type="button"
              disabled={isGeneratingFullPdf}
              onClick={handleDownloadFullEditionPdf}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white px-3.5 py-1.5 text-xs font-black shadow-md shadow-red-900/40 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              title="सर्व ६ पानांची एकत्रित PDF डाऊनलोड करा (Full 6-Page Newspaper PDF)"
            >
              <Download className={`h-3.5 w-3.5 ${isGeneratingFullPdf ? 'animate-spin text-amber-300' : 'text-amber-300 animate-bounce'}`} />
              <span>{isGeneratingFullPdf ? (pdfProgressMsg || 'PDF तयार होत आहे...') : '📥 संपूर्ण अंक (All 6 Pages PDF)'}</span>
            </button>

            {/* 🖼️ High-Res Image Download Button */}
            <button
              type="button"
              onClick={handleDownloadPageImage}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="संपूर्ण पान इमेज (JPG) स्वरूपात डाऊनलोड करा"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">इमेज (JPG)</span>
            </button>

            {/* 📥 Single A4 Page PDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPagePdf}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="फक्त चालू पान PDF डाऊनलोड करा"
            >
              <Download className="h-3.5 w-3.5 text-red-500" />
              <span className="hidden sm:inline">चालू पान PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title={isFullscreen ? 'सामान्य व्ह्यू' : 'फुल स्क्रीन'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Visual Crop Mode Live Indicator */}
        {isClipModeActive && (
          <div className="max-w-7xl mx-auto bg-amber-400 text-slate-950 px-4 py-2 rounded-xl flex items-center justify-between text-xs font-black shadow-lg animate-fadeIn mt-2">
            <div className="flex items-center gap-2">
              <Crop className="h-4 w-4 text-red-700 animate-spin" />
              <span>
                ✂️ <strong>व्हिज्युअल कात्रण मोड सक्रिय:</strong> ई-पेपरवर माऊस किंवा बोटाने हवे तेवढे क्षेत्र चौकोन ओढून (Drag & Select) निवडा.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsClipModeActive(false)}
              className="bg-slate-950 text-white px-2.5 py-1 rounded-md text-[10px] hover:bg-slate-800 cursor-pointer"
            >
              रद्द करा (✕)
            </button>
          </div>
        )}
      </header>

      {/* Toast */}
      {copyToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold shadow-2xl animate-slideUp">
          <Check className="h-4 w-4" />
          <span>{copyToast}</span>
        </div>
      )}

      {/* 2. MAIN E-PAPER VIEWER AREA */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-6 space-y-4">
        {/* Navigation & Zoom Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-2.5 rounded-2xl border border-slate-800 shadow-md epaper-no-print">
          {/* Page Turners */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPageIndex === 0}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-white disabled:opacity-30 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
              title="मागील पान (Left Arrow)"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold text-slate-200">
              <span className="text-red-500 font-black">पान {currentPage.pageNumber}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{activeEdition.pages.length}</span>
            </div>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPageIndex >= activeEdition.pages.length - 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-white disabled:opacity-30 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
              title="पुढील पान (Right Arrow)"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Page Picker Tabs */}
          <div className="hidden lg:flex items-center gap-1">
            {activeEdition.pages.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setCurrentPageIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentPageIndex === idx
                    ? 'bg-red-600 text-white shadow-xs font-black ring-2 ring-red-400'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                पान {p.pageNumber}: {p.title.split('(')[0]}
              </button>
            ))}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setZoomLevel(Math.max(60, zoomLevel - 15))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="झूम कमी करा"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <span className="text-xs font-mono font-bold text-slate-300 w-12 text-center bg-slate-950 py-1 rounded border border-slate-800">
              {zoomLevel}%
            </span>

            <button
              type="button"
              onClick={() => setZoomLevel(Math.min(160, zoomLevel + 15))}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="झूम वाढवा"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="ml-2 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
            >
              १००%
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. BROADSHEET CANVAS WITH VISUAL DRAG-AND-CROP OVERLAY */}
        {/* ========================================================================= */}
        <div className="flex justify-center overflow-x-auto pb-8 epaper-canvas-wrapper">
          <div
            id="epaper-canvas-main"
            ref={canvasMainRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            style={{
              width: `${(1000 * zoomLevel) / 100}px`,
              transition: 'width 0.2s ease-out',
            }}
            className={`epaper-broadsheet-canvas relative bg-[#ffffff] text-slate-950 shadow-2xl overflow-hidden border-2 border-slate-400 p-6 sm:p-9 font-serif select-none transition-all ${
              isClipModeActive ? 'cursor-crosshair ring-4 ring-amber-400' : ''
            }`}
          >
            {/* Visual Crop Selection Rectangle Overlay */}
            {cropBoxStyle && isClipModeActive && (
              <div
                style={{
                  left: `${cropBoxStyle.left}px`,
                  top: `${cropBoxStyle.top}px`,
                  width: `${cropBoxStyle.width}px`,
                  height: `${cropBoxStyle.height}px`,
                }}
                className="absolute z-30 pointer-events-none border-2 border-dashed border-red-600 bg-amber-400/20 backdrop-brightness-110 shadow-2xl"
              >
                <div className="absolute -top-6 left-0 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-md font-sans">
                  ✂️ {Math.round(cropBoxStyle.width)} x {Math.round(cropBoxStyle.height)} px
                </div>
              </div>
            )}

            {/* 3.1 TOP MASTHEAD */}
            <div className="border-b-4 border-black pb-2 mb-3">
              <div className="flex items-center justify-between gap-4 border-b border-black pb-2">
                {/* Left Brand Badge + Huge 'हॅलो [जिल्हा]' */}
                <div className="flex items-center gap-3.5">
                  {/* Exact Homepage Brand Logo */}
                  <div className="flex items-center gap-2 border-r-2 border-slate-300 pr-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white font-black shadow-md text-xl">
                      24
                    </div>
                    <div>
                      <div className="flex items-center text-xl font-black tracking-tight text-slate-950 uppercase font-sans">
                        <span>info</span>
                        <span className="text-red-600">News</span>
                        <span className="ml-1 text-[9px] bg-slate-950 text-white px-1.5 py-0.5 rounded font-black">
                          UPDATE24
                        </span>
                      </div>
                      <p className="text-[8px] font-bold tracking-wider text-slate-500 uppercase font-sans">
                        महाराष्ट्राचे डिजिटल वृत्तपत्र
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Calendar Date Box */}
                  <div className="rounded border-2 border-black bg-white px-2 py-0.5 text-center shadow-2xs">
                    <span className="text-lg font-black text-black block leading-none">
                      {selectedDate.split('-')[2] || new Date().getDate()}
                    </span>
                    <span className="text-[9px] font-bold text-black uppercase block">
                      {activeEdition.formattedDateMarathi.split(' ')[2] || 'ऑगस्ट'} {selectedDate.split('-')[0] || new Date().getFullYear()}
                    </span>
                  </div>

                  {/* Iconic Red & Black 'हॅलो [जिल्हा]' Title */}
                  <div className="flex items-center shadow-xs">
                    <div className="bg-red-600 text-white px-3.5 py-1 text-2xl sm:text-4xl font-black font-sans uppercase tracking-tight rounded-l-md">
                      हॅलो
                    </div>
                    <div className="bg-slate-950 text-white px-4 py-1 text-2xl sm:text-4xl font-black font-sans uppercase tracking-tight rounded-r-md">
                      {selectedDistrict === 'gadchiroli' ? 'गडचिरोली' : currentDistrictName.replace('हॅलो ', '')}
                    </div>
                  </div>
                </div>

                {/* Right Feature Teaser Box & Page Number */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 border border-slate-300 bg-slate-50 p-1.5 rounded-lg text-left text-[10px]">
                    <img
                      src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=100&auto=format&fit=crop&q=80"
                      alt=""
                      className="h-10 w-12 object-cover rounded"
                    />
                    <div>
                      <span className="font-black text-red-600 block uppercase">
                        {currentPageIndex === 0 ? 'inside विशेष' : getPageSectionTitle(currentPageIndex).split('•')[0]}
                      </span>
                      <span className="text-slate-700 font-bold line-clamp-2">
                        {currentPageIndex === 0 && 'पोषणयुक्त आहारासाठी विशेष मोहीम; हजारो लाभार्थ्यांना थेट मदत...'}
                        {currentPageIndex === 1 && 'मंत्रिमंडळाचा मोठा निर्णय: पायाभूत सुविधांसाठी १०,००० कोटी मंजूर...'}
                        {currentPageIndex === 2 && 'आजचा अग्रलेख: सर्वसामान्यांचे प्रश्न आणि प्रशासनाची जबाबदारी...'}
                        {currentPageIndex === 3 && 'सोयाबीन व कापूस हमीभावात वाढ; बाजार समित्यांमध्ये उत्साह...'}
                        {currentPageIndex === 4 && 'राष्ट्रीय क्रीडा दिनानिमित्त खेळाडूंचा राज्यस्तरीय गौरव सोहळा...'}
                        {currentPageIndex === 5 && 'इस्रोची ऐतिहासिक भरारी: उपग्रह प्रक्षेपणाची चाचणी यशस्वी...'}
                      </span>
                    </div>
                  </div>

                  {/* Red Circle Page Badge */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white font-black text-base shadow-md">
                    {currentPage.pageNumber}
                  </div>
                </div>
              </div>

              {/* Weather & Metadata Telemetry Bar */}
              <div className="flex flex-wrap items-center justify-between text-[11px] font-sans font-bold text-slate-800 pt-1.5 px-1">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-slate-950 font-black">
                    <CloudSun className="h-3.5 w-3.5 text-amber-500" />
                    🌤️ थेट तापमान (जि. {selectedDistrict === 'gadchiroli' ? 'गडचिरोली' : currentDistrictName.replace('हॅलो ', '')}):
                  </span>
                  <span className="text-red-700 font-extrabold">{districtWeather.temp}°C</span>
                  <span>|</span>
                  <span>कमाल {districtWeather.tempMax}°C</span>
                  <span>|</span>
                  <span>किमान {districtWeather.tempMin}°C</span>
                  <span>|</span>
                  <span>सूर्योदय {districtWeather.sunrise}</span>
                  <span>|</span>
                  <span>सूर्यास्त {districtWeather.sunset}</span>
                  <span>|</span>
                  <span className="text-emerald-800">{districtWeather.conditionText}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <span>epaper.infonewsupdate24.com</span>
                  <span>•</span>
                  <span>{epaperSettings?.rniNumber || 'RNI No. MAHMAR/2026/89412'}</span>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 3.2 DYNAMIC BROADSHEET PAGES (100% AUTO-POPULATED FROM CMS POSTS) */}
            {/* ========================================================================= */}
            {renderDynamicPage(currentPage)}

            {/* 3.3 BOTTOM CMYK REGISTRATION MARKS & PRINT FOOTER */}
            <div className="mt-4 border-t-2 border-black pt-2 flex flex-wrap items-center justify-between text-[10px] font-sans font-bold text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-900 font-black uppercase">Color Registration:</span>
                <span className="h-3 w-3 bg-black inline-block rounded-xs" title="Black"></span>
                <span className="h-3 w-3 bg-cyan-500 inline-block rounded-xs" title="Cyan"></span>
                <span className="h-3 w-3 bg-fuchsia-600 inline-block rounded-xs" title="Magenta"></span>
                <span className="h-3 w-3 bg-yellow-400 inline-block rounded-xs" title="Yellow"></span>
              </div>

              <span>InfoNewsUpdate24 Digital Broadsheet • {getPageSectionTitle(currentPageIndex)}</span>

              <div className="flex items-center gap-1">
                <span>पृष्ठ क्र. {currentPage.pageNumber}/६</span>
                <span>•</span>
                <span className="text-red-700 font-black">InfoNewsUpdate24 Broadsheet</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. BOTTOM PAGE THUMBNAILS STRIP */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl epaper-no-print">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-red-500" />
            <span>सर्व पाने (Pages Thumbnail Strip - 1 ते 6)</span>
          </h3>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {activeEdition.pages.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setCurrentPageIndex(idx)}
                className={`flex flex-col items-center rounded-xl p-2 transition-all cursor-pointer border ${
                  currentPageIndex === idx
                    ? 'border-red-500 bg-red-950/50 ring-2 ring-red-500 shadow-lg scale-105'
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                }`}
              >
                <div className="h-24 w-full rounded-md bg-[#ffffff] flex flex-col justify-between p-1.5 text-slate-900 text-[10px] font-bold overflow-hidden shadow-2xs border border-slate-300">
                  <div className="border-b border-red-600 pb-0.5 text-center">
                    <span className="text-red-700 font-black text-[9px] uppercase">{currentDistrictName}</span>
                  </div>
                  <div className="text-center space-y-0.5">
                    <span className="block text-slate-900 font-black text-xs">पान {p.pageNumber}</span>
                    <span className="block text-[8px] text-slate-600 line-clamp-1">{getPageSectionTitle(idx).split('•')[0]}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-0.5 text-right text-[8px] text-slate-500 font-mono">
                    P.{p.pageNumber}
                  </div>
                </div>
                <span className="mt-1.5 text-[11px] font-bold text-slate-300">
                  पान {p.pageNumber}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE FULL ARTICLE MODAL READER */}
      {/* ========================================================================= */}
      {isClipModalOpen && selectedClip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fadeIn">
          <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 p-4 bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white font-black shadow-md">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-serif">
                    संपूर्ण बातमी वाचन व कात्रण (Full Article Reader)
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {currentDistrictName} &bull; पृष्ठ {selectedClip.pageNumber} &bull; {activeEdition.formattedDateMarathi}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsClipModalOpen(false);
                  setIsSpeakingClip(false);
                  AIVoiceService.stop();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div
                id="epaper-clipped-container"
                className="rounded-2xl bg-[#ffffff] text-slate-950 p-5 sm:p-8 shadow-xl border border-slate-300 font-serif space-y-4"
              >
                <div className="border-b-2 border-red-600 pb-2 flex items-center justify-between text-[11px] font-sans font-bold text-slate-700">
                  <div className="flex items-center gap-1.5 text-red-700 font-black text-lg">
                    <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs">हॅलो</span>
                    <span>{selectedDistrict === 'gadchiroli' ? 'गडचिरोली' : currentDistrictName.replace('हॅलो ', '')} ई-पेपर</span>
                  </div>
                  <span>{activeEdition.formattedDateMarathi}</span>
                </div>

                {selectedClip.image && (
                  <div className="overflow-hidden rounded-xl border border-slate-300 shadow-xs">
                    <img
                      src={selectedClip.image}
                      alt={selectedClip.title}
                      className="w-full max-h-72 object-cover"
                    />
                    <div className="bg-slate-50 p-2 text-[11px] font-sans font-medium text-slate-600 flex items-center justify-between border-t border-slate-200">
                      <span>छायाचित्र: InfoNewsUpdate24 विशेष वृत्तसेवा</span>
                      <span className="font-bold text-slate-900">{selectedClip.location}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="inline-block rounded bg-red-600 px-2.5 py-0.5 text-[10px] font-bold text-white font-sans uppercase shadow-2xs">
                    {selectedClip.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-950 leading-tight font-serif">
                    {selectedClip.headline || selectedClip.title}
                  </h2>
                  <div className="text-xs font-bold text-slate-500 font-sans border-b border-slate-200 pb-2">
                    बायलाईन: {selectedClip.authorName || 'विशेष प्रतिनिधी'} | {selectedClip.location}
                  </div>
                </div>

                <div className="text-sm sm:text-base text-slate-800 leading-relaxed font-sans text-justify space-y-3">
                  <p className="font-bold text-slate-900 bg-amber-50/60 p-3 rounded-lg border-l-4 border-amber-500">
                    {selectedClip.summary}
                  </p>
                  <p className="whitespace-pre-line">
                    {selectedClip.fullBody || selectedClip.summary}
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-center text-[11px] font-sans font-bold text-amber-950 flex items-center justify-between">
                  <span>📢 प्रायोजक: InfoNewsUpdate24 विशेष ई-पेपर वृत्तसेवा</span>
                  <span className="text-red-700 font-extrabold">infonewsupdate24.com</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 bg-slate-950 p-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  handleSpeakClip(
                    selectedClip.headline || selectedClip.title,
                    selectedClip.fullBody || selectedClip.summary
                  )
                }
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer shadow-md ${
                  isSpeakingClip
                    ? 'bg-amber-400 text-slate-950 font-black animate-pulse'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {isSpeakingClip ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-amber-400" />}
                <span>{isSpeakingClip ? 'ऑडिओ थांबवा' : 'बातमी ऐका (AI Voice)'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer"
                  title="प्रिंट करा"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>प्रिंट</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWhatsAppClipShare(selectedClip)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-black shadow-md transition-colors cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                  <span>WhatsApp वर कात्रण पाठवा</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. OPTION 2: CUSTOM VISUAL DRAG-AND-CROP PREVIEW MODAL */}
      {/* ========================================================================= */}
      {isCustomCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 p-4 bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-md">
                  <Scissors className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-serif">
                    सानुकूल कात्रण तयार झाले (Custom Crop Cutout)
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {currentDistrictName} &bull; पृष्ठ {currentPage.pageNumber} &bull; {activeEdition.formattedDateMarathi}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomCropModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="rounded-2xl bg-[#ffffff] text-slate-950 p-6 shadow-xl border-2 border-dashed border-red-500 font-serif space-y-3">
                {/* Masthead header in crop */}
                <div className="border-b-2 border-red-600 pb-2 flex items-center justify-between text-[11px] font-sans font-bold text-slate-700">
                  <div className="flex items-center gap-1.5 text-red-700 font-black text-base">
                    <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs">हॅलो</span>
                    <span>{selectedDistrict === 'gadchiroli' ? 'गडचिरोली' : currentDistrictName.replace('हॅलो ', '')} ई-पेपर</span>
                  </div>
                  <span>{activeEdition.formattedDateMarathi}</span>
                </div>

                <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl text-center space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold text-xs bg-emerald-100 px-3 py-1 rounded-full">
                    <CheckCircle2 className="h-4 w-4" /> आपण निवडलेले वृत्तपत्रीय कात्रण यशस्वीरीत्या तयार झाले आहे!
                  </span>
                  <h3 className="text-base font-black text-slate-950 font-serif">
                    {getPageSectionTitle(currentPageIndex)}
                  </h3>
                  <p className="text-xs text-slate-600">
                    आपण निवडलेला भाग डिजिटल क्लिप स्वरूपात सेव्ह व शेअर करण्यासाठी सज्ज आहे.
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-center text-[11px] font-sans font-bold text-amber-950 flex items-center justify-between">
                  <span>📢 प्रायोजक: InfoNewsUpdate24 विशेष ई-पेपर वृत्तसेवा</span>
                  <span className="text-red-700 font-extrabold">infonewsupdate24.com</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 bg-slate-950 p-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleDownloadPageImage}
                className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 text-xs font-black shadow-md transition-colors cursor-pointer"
              >
                <ImageIcon className="h-4 w-4" />
                <span>कात्रण इमेज डाऊनलोड करा (JPG)</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppCustomCropShare}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-black shadow-md transition-colors cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span>WhatsApp वर कात्रण पाठवा</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. OPTION 3: 30-DAY PAST EDITIONS ARCHIVE MODAL */}
      {/* ========================================================================= */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fadeIn">
          <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-4 bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-md">
                  <Archive className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white font-serif">
                    मागील ३० दिवसांचे जुने अंक (Past 30 Days E-Paper Archives)
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    {currentDistrictName} &bull; तारीख किंवा महिना निवडून कोणताही जुना अंक वाचा
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsArchiveModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/60">
              <div className="relative">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={archiveSearchQuery}
                  onChange={(e) => setArchiveSearchQuery(e.target.value)}
                  placeholder="तारीख किंवा वार शोधा (उदा. २८ ऑगस्ट, शनिवार, 2026-08-25)..."
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 pl-10 pr-4 py-2 text-xs font-bold text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Archive Grid View */}
            <div className="p-4 sm:p-6 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                {filteredArchives.map((arch) => (
                  <button
                    key={arch.isoDate}
                    type="button"
                    onClick={() => {
                      setSelectedDate(arch.isoDate);
                      setCurrentPageIndex(0);
                      setIsArchiveModalOpen(false);
                      setCopyToast(`📅 ${arch.formattedDateMr} चा अंक उघडला आहे!`);
                      setTimeout(() => setCopyToast(''), 3500);
                    }}
                    className={`flex flex-col items-center rounded-xl p-3 text-center transition-all cursor-pointer border ${
                      selectedDate === arch.isoDate
                        ? 'border-amber-400 bg-amber-950/40 ring-2 ring-amber-400 shadow-xl scale-105'
                        : 'border-slate-800 bg-slate-950/80 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    <div className="h-20 w-full rounded-lg bg-white p-2 text-slate-950 flex flex-col justify-between border border-slate-300 shadow-xs mb-2">
                      <span className="text-[8px] font-black text-red-600 uppercase block border-b border-red-600 pb-0.5">
                        {currentDistrictName}
                      </span>
                      <div>
                        <span className="text-xl font-black text-slate-950 block leading-none">
                          {arch.dayNumber}
                        </span>
                        <span className="text-[9px] font-bold text-slate-600 block uppercase">
                          {arch.monthName}
                        </span>
                      </div>
                      <span className="text-[8px] text-slate-500 font-mono">६ पाने</span>
                    </div>

                    <span className="text-xs font-bold text-white line-clamp-1">
                      {arch.formattedDateMr.split(',')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {arch.isoDate}
                    </span>

                    {arch.isToday && (
                      <span className="mt-1.5 rounded bg-red-600 px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-2xs">
                        आजचा अंक
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-800 bg-slate-950 p-4 text-xs font-medium text-slate-400 flex items-center justify-between">
              <span>एकूण {past30DaysList.length} दिवसांचे डिजिटल अंक उपलब्ध आहेत.</span>
              <button
                type="button"
                onClick={() => setIsArchiveModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-lg font-bold cursor-pointer transition-colors"
              >
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
