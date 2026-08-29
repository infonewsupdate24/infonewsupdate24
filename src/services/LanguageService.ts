import { LanguageCode, LanguageOption } from '../types';

const STORAGE_KEY = 'infonews_selected_language_v1';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'mr',
    name: 'मराठी',
    englishName: 'Marathi',
    flagOrIcon: '🚩',
    scriptLabel: 'मरा',
    voiceLang: 'mr-IN',
  },
  {
    code: 'en',
    name: 'English',
    englishName: 'English',
    flagOrIcon: '🌐',
    scriptLabel: 'EN',
    voiceLang: 'en-IN',
  },
  {
    code: 'hi',
    name: 'हिंदी',
    englishName: 'Hindi',
    flagOrIcon: '🇮🇳',
    scriptLabel: 'हिं',
    voiceLang: 'hi-IN',
  },
  {
    code: 'te',
    name: 'తెలుగు',
    englishName: 'Telugu',
    flagOrIcon: '🌾',
    scriptLabel: 'తె',
    voiceLang: 'te-IN',
  },
  {
    code: 'gu',
    name: 'ગુજરાતી',
    englishName: 'Gujarati',
    flagOrIcon: '🦚',
    scriptLabel: 'ગુ',
    voiceLang: 'gu-IN',
  },
  {
    code: 'kn',
    name: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    flagOrIcon: '🌺',
    scriptLabel: 'ಕ',
    voiceLang: 'kn-IN',
  },
];

// Dictionary of Core UI Strings
const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  mr: {
    sendNews: 'बातमी पाठवा',
    bookAd: 'जाहिरात द्या',
    todayEPaper: 'आजचा ई-पेपर',
    breakingNews: 'ब्रेकिंग न्यूज',
    latestHeadlines: 'ताज्या ठळक घडामोडी',
    trendingNews: 'ट्रेंडिंग बातम्या',
    listenNews: 'पूर्ण बातमी ऐका',
    readFullStory: 'बातमी वाचा',
    krishiMandiRates: 'APMC कृषी बाजारभाव',
    liveWeather: 'थेट हवामान व पाऊस रडार',
    govtSchemes: 'शासकीय योजना व भरती',
    readerPolls: 'जनमत चाचणी',
    webStories: 'वेब स्टोरीज',
    shareOnWhatsApp: 'WhatsApp वर शेअर करा',
    comments: 'वाचक प्रतिक्रिया',
    searchPlaceholder: 'बातम्या, घडामोडी व विषय शोधा...',
    backToHeadlines: 'मुख्य पानावर परत जा',
    factChecked: 'पडताळणीकृत बातमी',
    readTimeMin: 'मिनिटे वाचन वेळ',
    viewsCount: 'वाचक',
    selectLanguage: 'भाषा बदला (Language)',
  },
  en: {
    sendNews: 'Send News',
    bookAd: 'Book Ad',
    todayEPaper: 'Today’s E-Paper',
    breakingNews: 'Breaking News',
    latestHeadlines: 'Latest Headlines',
    trendingNews: 'Trending News',
    listenNews: 'Listen News',
    readFullStory: 'Read Full Story',
    krishiMandiRates: 'APMC Mandi Rates',
    liveWeather: 'Live Weather Radar',
    govtSchemes: 'Govt Schemes & Jobs',
    readerPolls: 'Opinion Polls',
    webStories: 'Web Stories',
    shareOnWhatsApp: 'Share on WhatsApp',
    comments: 'Reader Comments',
    searchPlaceholder: 'Search news, topics & updates...',
    backToHeadlines: 'Back to Headlines',
    factChecked: 'Verified Fact-Check',
    readTimeMin: 'min read',
    viewsCount: 'views',
    selectLanguage: 'Select Language',
  },
  hi: {
    sendNews: 'खबर भेजें',
    bookAd: 'विज्ञापन दें',
    todayEPaper: 'आज का ई-पेपर',
    breakingNews: 'ब्रेकिंग न्यूज़',
    latestHeadlines: 'ताज़ा मुख्य समाचार',
    trendingNews: 'ट्रेंडिंग खबरें',
    listenNews: 'समाचार सुनें',
    readFullStory: 'पूरी खबर पढ़ें',
    krishiMandiRates: 'कृषि मंडी भाव',
    liveWeather: 'लाइव मौसम व वर्षा रडार',
    govtSchemes: 'सरकारी योजनाएं व भर्ती',
    readerPolls: 'जनमत सर्वेक्षण',
    webStories: 'वेब स्टोरीज़',
    shareOnWhatsApp: 'WhatsApp पर शेयर करें',
    comments: 'पाठक प्रतिक्रियाएं',
    searchPlaceholder: 'समाचार और विषय खोजें...',
    backToHeadlines: 'मुख्य पृष्ठ पर वापस जाएं',
    factChecked: 'सत्यापित समाचार',
    readTimeMin: 'मिनट पढ़ने का समय',
    viewsCount: 'पाठक',
    selectLanguage: 'भाषा चुनें',
  },
  te: {
    sendNews: 'వార్త పంపండి',
    bookAd: 'ప్రకటన ఇవ్వండి',
    todayEPaper: 'ఈ రోజు ఈ-పేపర్',
    breakingNews: 'తాజా వార్తలు (బ్రేకింగ్)',
    latestHeadlines: 'ముఖ్య ముఖ్యాంశాలు',
    trendingNews: 'ట్రెండింగ్ వార్తలు',
    listenNews: 'వార్తలు వినండి',
    readFullStory: 'పూర్తి వార్త చదవండి',
    krishiMandiRates: 'వ్యవసాయ మార్కెట్ ధరలు',
    liveWeather: 'వాతావరణ రాడార్',
    govtSchemes: 'ప్రభుత్వ పథకాలు & ఉద్యోగాలు',
    readerPolls: 'ప్రజాభిప్రాయ పోల్',
    webStories: 'వెబ్ స్టోరీలు',
    shareOnWhatsApp: 'WhatsApp లో షేర్ చేయండి',
    comments: 'పాఠకుల వ్యాఖ్యలు',
    searchPlaceholder: 'వార్తలు మరియు అంశాలను శోధించండి...',
    backToHeadlines: 'ప్రధాన పేజీకి తిరిగి వెళ్లండి',
    factChecked: 'ధృవీకరించబడిన వార్త',
    readTimeMin: 'నిమిషాల పఠనం',
    viewsCount: 'వీక్షకులు',
    selectLanguage: 'భాషను ఎంచుకోండి',
  },
  gu: {
    sendNews: 'સમાચાર મોકલો',
    bookAd: 'જાહેરાત આપો',
    todayEPaper: 'આજનું ઈ-પેપર',
    breakingNews: 'બ્રેકિંગ ન્યૂઝ',
    latestHeadlines: 'મુખ્ય તાજા સમાચાર',
    trendingNews: 'ટ્રેન્ડિંગ સમાચાર',
    listenNews: 'સમાચાર સાંભળો',
    readFullStory: 'સંપૂર્ણ સમાચાર વાંચો',
    krishiMandiRates: 'APMC બજાર ભાવ',
    liveWeather: 'લાઇવ હવામાન રડાર',
    govtSchemes: 'સરકારી યોજનાઓ અને ભરતી',
    readerPolls: 'જનમત પોલ',
    webStories: 'વેબ સ્ટોરીઝ',
    shareOnWhatsApp: 'WhatsApp પર શેર કરો',
    comments: 'વાચકોના પ્રતિભાવો',
    searchPlaceholder: 'સમાચાર શોધો...',
    backToHeadlines: 'મુખ્ય પૃષ્ઠ પર પાછા જાઓ',
    factChecked: 'ચકાસાયેલ સમાચાર',
    readTimeMin: 'મિનિટ વાંચન સમય',
    viewsCount: 'વાચકો',
    selectLanguage: 'ભાષા પસંદ કરો',
  },
  kn: {
    sendNews: 'ಸುದ್ದಿ ಕಳುಹಿಸಿ',
    bookAd: 'ಜಾಹೀರಾತು ನೀಡಿ',
    todayEPaper: 'ಇಂದಿನ ಇ-ಪೇಪರ್',
    breakingNews: 'ತಾಜಾ ಸುದ್ದಿ (ಬ್ರೇಕಿಂಗ್)',
    latestHeadlines: 'ಪ್ರಮುಖ ಮುಖ್ಯಾಂಶಗಳು',
    trendingNews: 'ಟ್ರೆಂಡಿಂಗ್ ಸುದ್ದಿಗಳು',
    listenNews: 'ಸುದ್ದಿ ಆಲಿಸಿ',
    readFullStory: 'ಪೂರ್ಣ ಸುದ್ದಿ ಓದಿ',
    krishiMandiRates: 'ಕೃಷಿ ಮಾರುಕಟ್ಟೆ ದರಗಳು',
    liveWeather: 'ನೇರ ಹವಾಮಾನ ರೇಡಾರ್',
    govtSchemes: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು & ನೇಮಕಾತಿ',
    readerPolls: 'ಅಭಿಪ್ರಾಯ ಸಮೀಕ್ಷೆ',
    webStories: 'ವೆಬ್ ಕಥೆಗಳು',
    shareOnWhatsApp: 'WhatsApp ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ',
    comments: 'ಓದುಗರ ಪ್ರತಿಕ್ರಿಯೆಗಳು',
    searchPlaceholder: 'ಸುದ್ದಿಗಳನ್ನು ಹುಡುಕಿ...',
    backToHeadlines: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
    factChecked: 'ಪರಿಶೀಲಿಸಿದ ಸುದ್ದಿ',
    readTimeMin: 'ನಿಮಿಷಗಳ ಓದುವಿಕೆ',
    viewsCount: 'ವೀಕ್ಷಕರು',
    selectLanguage: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
  },
};

export class LanguageService {
  public static getCurrentLanguage(): LanguageCode {
    if (typeof window === 'undefined') return 'mr';
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode;
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch {}
    return 'mr';
  }

  public static getLanguageOption(code: LanguageCode): LanguageOption {
    return (
      SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0]
    );
  }

  public static setLanguage(langCode: LanguageCode): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, langCode);
    } catch {}

    // 1. Dispatch custom event for React components
    window.dispatchEvent(
      new CustomEvent('infonews:language-changed', {
        detail: {
          code: langCode,
          option: this.getLanguageOption(langCode),
        },
      })
    );

    // 2. Trigger Google Neural Translate Widget Bridge if language != 'mr'
    this.applyGoogleTranslateBridge(langCode);
  }

  public static t(key: string, customLang?: LanguageCode): string {
    const lang = customLang || this.getCurrentLanguage();
    const langDict = TRANSLATIONS[lang] || TRANSLATIONS.mr;
    return langDict[key] || TRANSLATIONS.mr[key] || key;
  }

  /**
   * Seamless bridge to translate live dynamic articles and HTML content
   */
  public static applyGoogleTranslateBridge(langCode: LanguageCode): void {
    if (typeof window === 'undefined') return;

    // If Marathi (native original language), reset Google translate cookie
    if (langCode === 'mr') {
      document.cookie =
        'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie =
        'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' +
        window.location.hostname;
      const iframe = document.querySelector('.goog-te-banner-frame');
      if (iframe) (iframe as HTMLElement).style.display = 'none';

      // Reload softly if google translate was active
      const hasTransCookie = document.cookie.includes('googtrans=');
      if (hasTransCookie) {
        window.location.reload();
      }
      return;
    }

    // Set Google Translate Cookie (/mr/{target_lang})
    const transVal = `/mr/${langCode}`;
    document.cookie = `googtrans=${transVal}; path=/;`;
    document.cookie = `googtrans=${transVal}; path=/; domain=${window.location.hostname}`;

    // Inject Google Translate script if not already present
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.head.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        if ((window as any).google?.translate?.TranslateElement) {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: 'mr',
              includedLanguages: 'mr,en,hi,te,gu,kn',
              autoDisplay: false,
            },
            'google_translate_element'
          );
        }
      };
    } else {
      // Trigger select dropdown if already initialized
      const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (combo) {
        combo.value = langCode;
        combo.dispatchEvent(new Event('change'));
      }
    }
  }
}
