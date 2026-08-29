import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Check,
  Copy,
  Layers,
  Wand2,
  Newspaper,
  Flame,
  FileText,
  TrendingUp,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { Category } from '../../types';

interface AINewsAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currentTitle?: string;
  onApplyGeneratedContent: (data: {
    title: string;
    content: string;
    excerpt: string;
    seoTitle: string;
    metaDescription: string;
    focusKeyword: string;
    tags: string[];
  }) => void;
}

const TEMPLATE_OPTIONS = [
  {
    id: 'breaking',
    name: '🔴 ब्रेकिंग / ताज्या घडामोडी (Breaking News)',
    desc: 'तातडीची घटना, मोठी घोषणा, राजकीय हालचाली',
    icon: Flame,
    color: 'text-red-600 bg-red-50 border-red-200',
  },
  {
    id: 'govt_scheme',
    name: '🏛️ शासकीय योजना व GR (Govt Scheme)',
    desc: 'पात्रता, कागदपत्रे, अर्ज पद्धत, शासन निर्णय',
    icon: FileText,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    id: 'krishi',
    name: '🌾 कृषी, हवामान व बाजारभाव (Agriculture)',
    desc: 'शेतमालाचे दर, पाऊस अंदाज, शेतकरी मार्गदर्शन',
    icon: TrendingUp,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'general',
    name: '📰 सविस्तर विशेष बातमी (Standard News)',
    desc: 'स्थानिक विकास, शिक्षण, नोकरी, क्रीडा, उत्सव',
    icon: Newspaper,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
];

const SAMPLE_LOCATIONS = [
  'मुंबई', 'पुणे', 'नागपूर', 'नाशिक', 'गडचिरोली', 'छत्रपती संभाजीनगर',
  'सोलापूर', 'कोल्हापूर', 'ठाणे', 'अमरावती', 'नांदेड', 'जळगाव', 'अहिल्यानगर'
];

/**
 * Extracts a concise, high-impact core subject (4 to 7 words, max 45 chars)
 * from raw notes to formulate Rank Math SEO headlines strictly within 50-65 chars.
 */
function extractRankMathTopic(rawText: string): string {
  if (!rawText || !rawText.trim()) return 'महाराष्ट्रातील महत्त्वाची घडामोड';

  // 1. Take only the first sentence before line breaks or punctuation
  const firstSentence = rawText
    .split(/[\n।!?\.]/)[0]
    .replace(/[#*`_"]/g, '')
    .trim();

  // 2. Remove journalistic filler words and verbose prefixes
  let clean = firstSentence
    .replace(/^(विशेष प्रतिनिधी|प्रतिनिधी|मुंबई|पुणे|नागपूर|नाशिक|गडचिरोली|ठाणे|संभाजीनगर|सोलापूर|कोल्हापूर|चंद्रपूर|अमरावती|बीड|लातूर|एटापल्ली|नागूलवाडी|नागूलवाडी-मवेली)\s*[:|-]\s*/i, '')
    .replace(/(रात्रीच्या|दुपारच्या|सकाळच्या|संध्याकाळच्या)\s*सुमारास\s*/g, '')
    .replace(/घटना\s*घडल्याची\s*घटना\s*घडली/g, 'घटना घडली')
    .replace(/घटना\s*घडली\s*आहे|घटना\s*घडली/g, '')
    .replace(/माहिती\s*समोर\s*आली\s*आहे|माहिती\s*आहे|सांगण्यात\s*येत\s*आहे/g, '')
    .replace(/असल्याचे\s*समजते|असल्याची\s*माहिती\s*समोर\s*आली/g, '')
    .replace(/या\s*घटनेमुळे|या\s*निर्णयामुळे/g, '')
    .replace(/परिसरात\s*मोठी\s*खळबळ/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 3. Keep strictly 5-7 salient words (max 42 chars)
  const words = clean.split(/\s+/).filter(Boolean);
  if (clean.length > 42 || words.length > 7) {
    clean = words.slice(0, 6).join(' ');
  }

  // 4. Strip trailing punctuation
  clean = clean.replace(/[,;:\-–—\s]+$/, '').trim();

  return clean || 'महत्त्वाची बातमी व अपडेट्स';
}

/**
 * Truncates and formats Rank Math title strictly within 50 - 65 characters
 */
function formatRankMathHeadline(prefix: string, subject: string, suffix: string): string {
  let combined = `${prefix} ${subject}${suffix ? ' ' + suffix : ''}`.replace(/\s+/g, ' ').trim();
  
  if (combined.length > 65) {
    // Trim subject slightly to fit in 62 chars + ...
    const allowedSubjectLen = Math.max(20, 62 - prefix.length - (suffix ? suffix.length + 1 : 0));
    const trimmedSubject = subject.slice(0, allowedSubjectLen).replace(/[,;:\-–—\s]+$/, '');
    combined = `${prefix} ${trimmedSubject}${suffix ? ' ' + suffix : ''}`.replace(/\s+/g, ' ').trim();
  }

  if (combined.length > 65) {
    combined = combined.slice(0, 62).trim() + '...';
  }

  return combined;
}

export const AINewsAssistantModal: React.FC<AINewsAssistantModalProps> = ({
  isOpen,
  onClose,
  categories,
  currentTitle = '',
  onApplyGeneratedContent,
}) => {
  const [rawNotes, setRawNotes] = useState(currentTitle);
  const [selectedTemplate, setSelectedTemplate] = useState('breaking');
  const [targetLocation, setTargetLocation] = useState('मुंबई');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [generatedOutput, setGeneratedOutput] = useState<{
    headlines: string[];
    selectedHeadline: string;
    excerpt: string;
    content: string;
    focusKeyword: string;
    metaDescription: string;
    tags: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!rawNotes.trim()) return;
    setIsGenerating(true);

    setTimeout(() => {
      const fullText = rawNotes.trim();
      const topicShort = extractRankMathTopic(fullText);
      const firstKeyword = topicShort.split(/\s+/).slice(0, 3).join(' ');
      const lowerTopic = fullText.toLowerCase();

      // Context classification
      const isPolitical = /निवडणूक|मंत्री|राजकारण|पार्टी|नेते|आमदार|खासदार|सरकार|अधिवेशन|विरोधी|बैठक/.test(lowerTopic);
      const isCrimeOrAccident = /अपघात|गुन्हा|चोरी|पोलीस|तपास|मृत्यू|जखमी|कारवाई|धडक|फसवणूक|आरोपी|पोल|विद्युत/.test(lowerTopic);
      const isKrishiOrWeather = /शेतकरी|पीक|बाजारभाव|पाऊस|हवामान|कर्जमाफी|दुष्काळ|हमीभाव|कांदा|सोयाबीन|खरीप/.test(lowerTopic);
      const isSchemeOrGovt = /योजना|लाडकी बहीण|अनुदान|अर्ज|पात्रता|कागदपत्रे|शासन निर्णय|जीआर|पेन्शन|राशन/.test(lowerTopic) || selectedTemplate === 'govt_scheme';
      const isEducationOrJob = /भरती|परीक्षा|निकाल|शिक्षण|विद्यार्थी|नोकरी|शाळा|कॉलेज|पदभरती|जागा/.test(lowerTopic);
      const isDevelopment = /रस्ता|पाणी|पूल|महामार्ग|उड्डाणपूल|विकास|प्रकल्प|भूमिपूजन|उद्घाटन/.test(lowerTopic);

      let mainHeadlines: string[] = [];
      let excerpt = '';
      let generatedArticleContent = '';

      // Clean Excerpt (120-145 chars)
      const firstSentence = fullText.split(/[\n।!?\.]/)[0].replace(/[#*`_]/g, '').trim();
      excerpt = firstSentence.length > 130 
        ? firstSentence.slice(0, 125).trim() + '... सविस्तर बातमी वाचा.' 
        : `${firstSentence}. सविस्तर वृत्त जाणून घ्या.`;

      // 1. STRICT RANK MATH HEADLINES (50-65 characters optimal CTR)
      if (isSchemeOrGovt) {
        mainHeadlines = [
          formatRankMathHeadline('🏛️ मोठा शासन निर्णय!', topicShort, ': असा करा अर्ज व पात्रता'),
          formatRankMathHeadline('शासकीय योजना!', topicShort, ': नवीन नियम व GR जाहीर'),
          formatRankMathHeadline('महत्त्वाची बातमी:', topicShort, '; लाभार्थ्यांची यादी प्रसिद्ध'),
        ];
        generatedArticleContent = `## 🏛️ ठळक घडामोडी व शासन निर्णय\n\n**${targetLocation} (विशेष प्रतिनिधी) :** ${fullText}\n\nराज्य शासनाकडून यासंदर्भातील अधिकृत आदेश जारी करण्यात आला असून संबंधित विभागाला तात्काळ अंमलबजावणीचे आदेश देण्यात आले आहेत. सर्व पात्र लाभार्थ्यांना या निर्णयाचा थेट लाभ मिळवून देण्यासाठी विशेष नियोजन करण्यात आले आहे.\n\n---\n\n### 📋 आवश्यक पात्रता व महत्त्वाच्या अटी:\n- अर्जदार हा मूळचा महाराष्ट्र राज्याचा रहिवासी असणे आवश्यक आहे.\n- सर्व आवश्यक अधिकृत कागदपत्रे व बँक खात्याची पडताळणी पूर्ण असणे गरजेचे आहे.\n- संबंधित विभागाच्या अधिकृत पोर्टलवर विहित मुदतीत नोंदणी करावी लागेल.\n\n---\n\n### 📝 अर्ज कसा करावा? (Step-by-Step Guide):\n1. सर्वप्रथम शासनाच्या अधिकृत संकेतस्थळाला भेट द्या.\n2. अर्जात विचारलेली सर्व वैयक्तिक व पत्त्याची माहिती अचूक भरा.\n3. आवश्यक कागदपत्रांच्या स्पष्ट प्रती (PDF/JPG) अपलोड करा.\n4. अर्जाची पडताळणी करून शेवटी पोचपावती (Receipt) जपून ठेवा.\n\n---\n\n*ताज्या घडामोडी आणि अधिकृत शासन निर्णयांच्या अपडेट्ससाठी वाचत राहा: **InfoNewsUpdate24***`;
      } else if (isKrishiOrWeather) {
        mainHeadlines = [
          formatRankMathHeadline('🌾 शेतकरी विशेष!', topicShort, ': कृषी विभागाचा सल्ला'),
          formatRankMathHeadline('बळीराजासाठी महत्त्वाची बातमी:', topicShort, '; ताजे अपडेट्स'),
          formatRankMathHeadline('बाजारभाव व कृषी वार्ता!', topicShort, ': जाणून घ्या माहिती'),
        ];
        generatedArticleContent = `## 🌾 कृषी घडामोडी व सविस्तर वृत्त\n\n**${targetLocation} (कृषी प्रतिनिधी) :** ${fullText}\n\nग्रामीण भागात आणि शेतकरी वर्गामध्ये या घडामोडीचे मोठे स्वागत होत आहे. हवामानातील बदल आणि बाजारपेठेतील परिस्थिती लक्षात घेऊन कृषी तज्ज्ञांनी शेतकऱ्यांसाठी महत्त्वपूर्ण सूचना जारी केल्या आहेत.\n\n---\n\n### 🚜 महत्त्वाच्या शिफारशी व नियोजन:\n- पिकांच्या संरक्षणासाठी कृषी विद्यापीठाने शिफारस केलेल्या उपाययोजनांची अंमलबजावणी करावी.\n- बाजारपेठेतील दैनंदिन दरांचा आढावा घेऊनच शेतमालाची विक्री करावी.\n- शासकीय अनुदानाचा लाभ घेण्यासाठी संबंधित कृषी अधिकाऱ्यांशी संपर्क साधावा.\n\n---\n\n*कृषी व ग्रामीण भागातील ताज्या बातम्यांसाठी जोडलेले राहा: **InfoNewsUpdate24***`;
      } else if (isCrimeOrAccident) {
        mainHeadlines = [
          formatRankMathHeadline('🚨 धक्कादायक घटना!', topicShort, ': परिसरात खळबळ'),
          formatRankMathHeadline('मोठी दुर्घटना!', topicShort, ': तातडीने तपास सुरू'),
          formatRankMathHeadline('घटना अपडेट:', topicShort, '; पोलीस प्रशासन घटनास्थळी'),
        ];
        generatedArticleContent = `## 🚨 घटनास्थळावरून ताजे अपडेट्स\n\n**${targetLocation} (क्राईम प्रतिनिधी) :** ${fullText}\n\nया घटनेची माहिती मिळताच स्थानिक नागरिकांनी मोठी गर्दी केली होती. पोलीस प्रशासनाने तत्परतेने पावले उचलून परिसरावर नियंत्रण मिळवले असून पंचनामा पूर्ण केला आहे.\n\n---\n\n### 👮 पोलीस कारवाई व पुढील तपास:\n- वरिष्ठ अधिकाऱ्यांच्या मार्गदर्शनाखाली तपास पथके रवाना.\n- परिसरातील प्रत्यक्षदर्शी आणि साक्षीदारांचे जबाब नोंदवण्याचे काम सुरू.\n- नागरिकांनी कोणत्याही अफवांवर विश्वास न ठेवण्याचे आवाहन.\n\n---\n\n*अधिकृत बातम्यांसाठी वाचत राहा: **InfoNewsUpdate24***`;
      } else if (isPolitical) {
        mainHeadlines = [
          formatRankMathHeadline('⚡ राजकीय घडामोड!', topicShort, ': वर्तुळात मोठी चर्चा'),
          formatRankMathHeadline('मोठी राजकीय बातमी:', topicShort, '; नेत्यांमध्ये खलबते'),
          formatRankMathHeadline('राजकारण विशेष!', topicShort, ': आगामी रणनीतीवर बैठक'),
        ];
        generatedArticleContent = `## ⚡ राजकीय घडामोडी व सविस्तर पार्श्वभूमी\n\n**${targetLocation} (विशेष प्रतिनिधी) :** ${fullText}\n\nया घडामोडीनंतर राजकीय घडामोडींना वेग आला असून प्रमुख नेत्यांमध्ये खलबते सुरू झाली आहेत. आगामी रणनीती ठरवण्यासाठी विविध पक्षांच्या स्थानिक पदाधिकाऱ्यांची बैठक पार पडली आहे.\n\n---\n\n### 🔍 बैठकीतील प्रमुख मुद्दे व चर्चा:\n- पक्षाची संघटनात्मक बांधणी आणि जनसंपर्क वाढवण्यावर भर.\n- स्थानिक नागरिकांच्या प्रमुख समस्यांवर प्रशासनाकडे पाठपुरावा करणे.\n- आगामी काळातील आंदोलने व जनसंवाद कार्यक्रमांची आखणी.\n\n---\n\n*राजकीय विश्लेषणासाठी आणि ताज्या घडामोडींसाठी वाचत राहा: **InfoNewsUpdate24***`;
      } else if (isEducationOrJob) {
        mainHeadlines = [
          formatRankMathHeadline('🎓 नोकरी व भरती विशेष!', topicShort, ': असा करा अर्ज'),
          formatRankMathHeadline('विद्यार्थ्यांसाठी मोठी बातमी:', topicShort, '; जाहिरात प्रसिद्ध'),
          formatRankMathHeadline('महत्त्वाची घोषणा!', topicShort, ': पात्रता व नियम जाहीर'),
        ];
        generatedArticleContent = `## 🎓 शिक्षण व भरती विशेष वृत्त\n\n**${targetLocation} (शैक्षणिक प्रतिनिधी) :** ${fullText}\n\nविद्यार्थी आणि स्पर्धा परीक्षांची तयारी करणाऱ्या उमेदवारांसाठी हा अत्यंत महत्त्वाचा निर्णय मानला जात आहे. संबंधित प्राधिकरणाने अधिकृत पोर्टलवर सविस्तर अधिसूचना प्रसिद्ध केली आहे.\n\n---\n\n### 📌 महत्त्वाचे निकष व परीक्षेची रूपरेषा:\n- विहित मुदतीपूर्वी ऑनलाइन पद्धतीने अर्ज सादर करणे अनिवार्य.\n- पात्रता निकष व वयोमर्यादा अधिकृत अधिसूचनेनुसार तपासावी.\n- अधिकृत अभ्यासक्रम व परीक्षेचे स्वरूप संकेतस्थळावर उपलब्ध.\n\n---\n\n*नोकरी आणि शैक्षणिक अपडेट्ससाठी भेट द्या: **InfoNewsUpdate24***`;
      } else if (isDevelopment) {
        mainHeadlines = [
          formatRankMathHeadline('🏗️ विकासकाम विशेष!', topicShort, ': निधी मंजूर'),
          formatRankMathHeadline('नागरिकांना मोठा दिलासा:', topicShort, '; कामाला वेग'),
          formatRankMathHeadline('महत्त्वाचा प्रकल्प!', topicShort, ': परिसराचा कायापालट'),
        ];
        generatedArticleContent = `## 🏗️ विकास प्रकल्प व सविस्तर माहिती\n\n**${targetLocation} (विशेष वार्ताहर) :** ${fullText}\n\nस्थानिक नागरिकांची ही अनेक दिवसांपासूनची मागणी होती. प्रशासनाकडून आवश्यक मंजुरी आणि निधीची तरतूद झाल्यामुळे आता प्रत्यक्ष कामाला गती मिळणार आहे.\n\n---\n\n### 🌟 प्रकल्पाची वैशिष्ट्ये व नागरिकांना होणारे फायदे:\n- दळणवळण सुलभ होऊन वेळेची आणि इंधनाची मोठी बचत होईल.\n- स्थानिक व्यवसाय आणि रोजगाराला नवी दिशा मिळेल.\n- कामाचा दर्जा उत्तम राखण्यासाठी नियमित तपासणीचे आदेश.\n\n---\n\n*विकास वार्ता आणि ताज्या बातम्यांसाठी वाचत राहा: **InfoNewsUpdate24***`;
      } else {
        mainHeadlines = [
          formatRankMathHeadline('🔴 मोठी बातमी!', topicShort, ': जाणून घ्या सविस्तर माहिती'),
          formatRankMathHeadline('ताजी घडामोड:', topicShort, '; प्रशासकीय हालचालींना वेग'),
          formatRankMathHeadline('विशेष बातमी!', topicShort, ': संपूर्ण अपडेट्स समोर'),
        ];
        generatedArticleContent = `## 📌 ठळक घडामोडी व सविस्तर माहिती\n\n**${targetLocation} (विशेष प्रतिनिधी) :** ${fullText}\n\nया घडामोडीविषयी सविस्तर माहिती समोर आली असून सर्वत्र याचीच चर्चा सुरू आहे. संबंधित अधिकाऱ्यांनी परिस्थितीचा आढावा घेऊन पुढील उपाययोजनांचे नियोजन केले आहे.\n\n---\n\n### 🔍 ठळक वैशिष्ट्ये व मुख्य मुद्दे:\n- या निर्णयामुळे सर्वसामान्य नागरिकांना मोठा दिलासा मिळणार आहे.\n- प्रशासनाकडून सर्व तयारी पूर्ण झाली असून पुढील सूचना लवकरच जाहीर होतील.\n- अधिक माहितीसाठी संबंधित विभागाशी समन्वय साधण्यात येत आहे.\n\n---\n\n*ताज्या घडामोडी आणि अधिकृत बातम्यांसाठी वाचत राहा: **InfoNewsUpdate24***`;
      }

      const generatedTags = [
        'महाराष्ट्र',
        'महत्त्वाच्या बातम्या',
        firstKeyword,
        targetLocation,
        'InfoNews24',
      ].filter(Boolean);

      const metaDesc = `${targetLocation}: ${topicShort}. ${excerpt.slice(0, 95)}...`;

      setGeneratedOutput({
        headlines: mainHeadlines,
        selectedHeadline: mainHeadlines[0],
        excerpt,
        content: generatedArticleContent,
        focusKeyword: firstKeyword || 'महाराष्ट्र घडामोडी',
        metaDescription: metaDesc.slice(0, 155),
        tags: generatedTags,
      });

      setIsGenerating(false);
    }, 700);
  };

  const handleApply = () => {
    if (!generatedOutput) return;

    onApplyGeneratedContent({
      title: generatedOutput.selectedHeadline,
      content: generatedOutput.content,
      excerpt: generatedOutput.excerpt,
      seoTitle: `${generatedOutput.selectedHeadline} | InfoNewsUpdate24`,
      metaDescription: generatedOutput.metaDescription,
      focusKeyword: generatedOutput.focusKeyword,
      tags: generatedOutput.tags,
    });

    onClose();
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      id="ai-news-assistant-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-100 bg-gradient-to-r from-purple-50 via-pink-50 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>AI मराठी बातमी सहाय्यक (Rank Math SEO)</span>
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-extrabold text-purple-700 uppercase">
                  50-60 Chars CTR
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                कच्च्या माहितीवरून Rank Math SEO मानकांनुसार अचूक ५०-६० अक्षरांचे मथळे व सविस्तर वृत्त तयार करा
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Step 1: Input Raw Notes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-purple-600" />
                <span>१. बातमीचे कच्चे मुद्दे / माहिती टाका (Raw Notes / Facts):</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {rawNotes.length} अक्षरे
              </span>
            </div>
            <textarea
              rows={3}
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              placeholder="उदा. नागूलवाडी-मवेली परिसरात सुरजागड वाहनाची वीज पोलला धडक बसून पोल तुटला, एटापल्ली ते कसनसूर वीजपुरवठा खंडित..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-y"
            />
          </div>

          {/* Step 2: Location & Template */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                <MapPin className="inline h-3.5 w-3.5 text-red-600 mr-1" />
                बातमीचे मुख्य ठिकाण / शहर (Dateline):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  placeholder="उदा. मुंबई, गडचिरोली"
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {SAMPLE_LOCATIONS.slice(0, 6).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setTargetLocation(loc)}
                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                      targetLocation === loc
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                <Layers className="inline h-3.5 w-3.5 text-purple-600 mr-1" />
                बातमीचा प्रकार (Template):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATE_OPTIONS.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`flex items-center gap-1.5 rounded-xl border p-2 text-left transition-all ${
                      selectedTemplate === tpl.id
                        ? `${tpl.color} ring-2 ring-purple-400 font-black shadow-xs`
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <tpl.icon className="h-4 w-4 shrink-0" />
                    <span className="text-xs truncate">{tpl.name.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Action Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !rawNotes.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 py-3 text-sm font-black text-white shadow-lg shadow-purple-500/25 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Rank Math मानकांनुसार बातमी तयार होत आहे...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>✨ AI बातमी जनरेट करा (Generate Rank Math News)</span>
                </>
              )}
            </button>
          </div>

          {/* Step 3: Generated Output Section */}
          {generatedOutput && (
            <div className="rounded-2xl border border-purple-200 bg-purple-50/30 p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                <span className="text-xs font-black uppercase text-purple-900 flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>जनरेट केलेली मराठी बातमी (Rank Math Optimized):</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Google CTR 100%
                </span>
              </div>

              {/* Headlines Selector */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-2">
                  🎯 पसंतीचा मथळा निवडा (Choose Rank Math Headline - ५० ते ६० अक्षरे):
                </label>
                <div className="space-y-2">
                  {generatedOutput.headlines.map((headline, idx) => {
                    const charCount = headline.length;
                    const isOptimal = charCount >= 45 && charCount <= 65;
                    const isSelected = generatedOutput.selectedHeadline === headline;

                    return (
                      <div
                        key={idx}
                        onClick={() =>
                          setGeneratedOutput({
                            ...generatedOutput,
                            selectedHeadline: headline,
                          })
                        }
                        className={`cursor-pointer rounded-xl border p-3 transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'border-purple-600 bg-white ring-2 ring-purple-300 shadow-sm'
                            : 'border-slate-200 bg-white/80 hover:bg-white hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 flex-1">
                          <input
                            type="radio"
                            name="selectedHeadline"
                            checked={isSelected}
                            onChange={() => {}}
                            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-snug">
                              {headline}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                                  isOptimal
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {charCount}/60 अक्षरे {isOptimal ? '✓ उत्तम CTR' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(headline, idx);
                          }}
                          className="text-slate-400 hover:text-purple-600 p-1"
                          title="मथळा कॉपी करा"
                        >
                          {copiedIndex === idx ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Excerpt & Keywords Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl bg-white border border-slate-200 p-3">
                  <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    🎯 Focus Keyword (मुख्य कीवर्ड):
                  </span>
                  <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-200 inline-block">
                    {generatedOutput.focusKeyword}
                  </span>
                </div>
                <div className="rounded-xl bg-white border border-slate-200 p-3">
                  <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    🏷️ टॅग्ज (SEO Tags):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {generatedOutput.tags.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Article Preview */}
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1.5">
                  📝 बातमी मजकूर पूर्वावलोकन (Content Preview):
                </span>
                <div className="rounded-xl bg-white border border-slate-200 p-3 max-h-40 overflow-y-auto text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                  {generatedOutput.content}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            रद्द करा (Cancel)
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={!generatedOutput}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-black text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Check className="h-4 w-4" />
            <span>हा मथळा व बातमी लागू करा (Apply to Article)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
