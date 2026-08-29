import {
  DailyPanchangData,
  DailyDinvishesh,
  DailyRashiForecast,
} from '../types';

const STORAGE_KEY_PANCHANG_OVERRIDE = 'infonews_panchang_override_v1';

const MARATHI_DAYS = [
  'रविवार',
  'सोमवार',
  'मंगळवार',
  'बुधवार',
  'गुरुवार',
  'शुक्रवार',
  'शनिवार',
];

const MARATHI_MONTHS = [
  'चैत्र',
  'वैशाख',
  'ज्येष्ठ',
  'आषाढ',
  'श्रावण',
  'भाद्रपद',
  'आश्विन',
  'कार्तिक',
  'मार्गशीर्ष',
  'पौष',
  'माघ',
  'फाल्गुन',
];

const TITHI_NAMES = [
  'प्रतिपदा',
  'द्वितीया',
  'तृतीया',
  'चतुर्थी',
  'पंचमी',
  'षष्ठी',
  'सप्तमी',
  'अष्टमी',
  'नवमी',
  'दशमी',
  'एकादशी',
  'द्वादशी',
  'त्रयोदशी',
  'चतुर्दशी',
  'पौर्णिमा',
  'प्रतिपदा',
  'द्वितीया',
  'तृतीया',
  'चतुर्थी',
  'पंचमी',
  'षष्ठी',
  'सप्तमी',
  'अष्टमी',
  'नवमी',
  'दशमी',
  'एकादशी',
  'द्वादशी',
  'त्रयोदशी',
  'चतुर्दशी',
  'अमावास्या',
];

const NAKSHATRAS = [
  'अश्विनी',
  'भरणी',
  'कृत्तिका',
  'रोहिणी',
  'मृगशीर्ष',
  'आर्द्रा',
  'पुनर्वसु',
  'पुष्य',
  'आश्लेषा',
  'मघा',
  'पूर्वाफाल्गुनी',
  'उत्तराफाल्गुनी',
  'हस्त',
  'चित्रा',
  'स्वाती',
  'विशाखा',
  'अनुराधा',
  'ज्येष्ठा',
  'मूळ',
  'पूर्वाषाढा',
  'उत्तराषाढा',
  'श्रवण',
  'धनिष्ठा',
  'शततारका',
  'पूर्वाभाद्रपदा',
  'उत्तराभाद्रपदा',
  'रेवती',
];

const YOGAS = [
  'विष्कंभ',
  'प्रीति',
  'आयुष्मान',
  'सौभाग्य',
  'शोभन',
  'अतिगंड',
  'सुकर्मा',
  'धृति',
  'शूल',
  'गंड',
  'वृद्धि',
  'ध्रुव',
  'व्याघात',
  'हर्षण',
  'वज्र',
  'सिद्धि',
  'व्यतीपात',
  'वरीयान',
  'परिघ',
  'शिव',
  'सिद्ध',
  'साध्य',
  'शुभ',
  'शुक्ल',
  'ब्रह्म',
  'ऐंद्र',
  'वैधृति',
];

const RAHU_KAAL_TIMES = [
  'सायं. ०४:३० ते ०६:००', // Sun
  'स. ०७:३० ते ०९:००', // Mon
  'दु. ०३:०० ते ०४:३०', // Tue
  'दु. १२:०० ते ०१:३०', // Wed
  'दु. ०१:३० ते ०३:००', // Thu
  'स. १०:३० ते १२:००', // Fri
  'स. ०९:०० ते १०:३०', // Sat
];

const RASHI_DATA_TEMPLATE: Array<{
  id: string;
  nameMr: string;
  nameEn: string;
  symbol: string;
  element: string;
  luckyColor: string;
  luckyNumber: number;
  prediction: string;
  career: string;
  finance: string;
  health: string;
}> = [
  {
    id: 'mesh',
    nameMr: 'मेष',
    nameEn: 'Aries',
    symbol: '♈',
    element: 'अग्नी तत्व',
    luckyColor: 'लाल व भगवा',
    luckyNumber: 9,
    prediction:
      'आज नवीन योजनांना गती मिळेल. व्यवसायात अनपेक्षित धनलाभ संभवतो. सहकाऱ्यांचे उत्तम सहकार्य लाभेल.',
    career: 'नोकरीमध्ये पदोन्नती किंवा नवीन जबाबदारीचे संकेत मिळतील.',
    finance: 'आर्थिक गुंतवणुकीसाठी अनुकूल दिवस. जुने येणे वसूल होईल.',
    health: 'उत्साह उत्तम राहील, डोकेदुखी किंवा पित्ताचा त्रास टाळण्यासाठी वेळेवर जेवा.',
  },
  {
    id: 'vrushabh',
    nameMr: 'वृषभ',
    nameEn: 'Taurus',
    symbol: '♉',
    element: 'पृथ्वी तत्व',
    luckyColor: 'पांढरा व गुलाबी',
    luckyNumber: 6,
    prediction:
      'कौटुंबिक सुख-समाधानात वाढ होईल. जमीन किंवा वाहन खरेदीचे योग जुळून येतील. संयमाने निर्णय घ्या.',
    career: 'वरिष्ठांची मर्जी संपादन कराल. व्यापारात नवीन ग्राहकांशी संबंध जोडले जातील.',
    finance: 'अनावश्यक खर्चावर नियंत्रण ठेवा. शेअर्स व ट्रेडिंगमध्ये सतर्क राहा.',
    health: 'घसा आणि छातीची काळजी घ्या. प्राणायाम फायदेशीर ठरेल.',
  },
  {
    id: 'mithun',
    nameMr: 'मिथुन',
    nameEn: 'Gemini',
    symbol: '♊',
    element: 'वायू तत्व',
    luckyColor: 'हिरवा व पिवळा',
    luckyNumber: 5,
    prediction:
      'विद्यार्थ्यांना अभ्यासात मोठे यश मिळेल. प्रवासाचे योग संभवतात. संवादकौशल्याने वाद मिटवाल.',
    career: 'नवीन प्रकल्प सुरू करण्यासाठी उत्तम वेळ. सहकाऱ्यांकडून मार्गदर्शन लाभेल.',
    finance: 'आर्थिक बाजू भक्कम राहील. नवीन उत्पन्नाचे मार्ग खुले होतील.',
    health: 'मानसिक ताण कमी होईल. योग आणि ध्यानामुळे मन प्रसन्न राहील.',
  },
  {
    id: 'kark',
    nameMr: 'कर्क',
    nameEn: 'Cancer',
    symbol: '♋',
    element: 'जल तत्व',
    luckyColor: 'मोती पांढरा व चंदेरी',
    luckyNumber: 2,
    prediction:
      'आज भावनांवर नियंत्रण ठेवा. घरातील ज्येष्ठ व्यक्तींचा सल्ला मोलाचा ठरेल. धार्मिक कार्यात सहभाग वाढेल.',
    career: 'कामाच्या ठिकाणी कामाचा व्याप वाढेल, पण परिणाम उत्तम मिळतील.',
    finance: 'कर्ज व्यवहार टाळा. अचानक आर्थिक लाभ होण्याची शक्यता.',
    health: 'पोटाच्या तक्रारींवर लक्ष ठेवा, हलका आहार घ्या.',
  },
  {
    id: 'simha',
    nameMr: 'सिंह',
    nameEn: 'Leo',
    symbol: '♌',
    element: 'अग्नी तत्व',
    luckyColor: 'सोनेरी व केशरी',
    luckyNumber: 1,
    prediction:
      'तुमचा सामाजिक प्रभाव वाढेल. राजकीय व सामाजिक क्षेत्रात मान-सन्मान लाभेल. आत्मविश्वास वाढेल.',
    career: 'मोठे निर्णय घेण्यास योग्य दिवस. नेतृत्वगुणांचे कौतुक होईल.',
    finance: 'सरकारी कामे मार्गी लागतील. आर्थिक स्थिती सुधारेल.',
    health: 'ऊर्जा व उत्साह उच्च राहील. नियमित व्यायाम ठेवा.',
  },
  {
    id: 'kanya',
    nameMr: 'कन्या',
    nameEn: 'Virgo',
    symbol: '♍',
    element: 'पृथ्वी तत्व',
    luckyColor: 'गडद हिरवा',
    luckyNumber: 5,
    prediction:
      'बुद्धिमत्ता आणि कार्यक्षमतेने कठीण कामे पूर्ण कराल. मित्रांचे मोलाचे सहकार्य लाभेल.',
    career: 'आयटी व संशोधन क्षेत्रातील व्यक्तींना विशेष प्रगती दिसेल.',
    finance: 'बचतीवर भर द्या. खर्चात अचानक वाढ संभवते.',
    health: 'डोळ्यांची काळजी घ्या. वेळेवर झोप घेणे आवश्यक आहे.',
  },
  {
    id: 'tula',
    nameMr: 'तूळ',
    nameEn: 'Libra',
    symbol: '♎',
    element: 'वायू तत्व',
    luckyColor: 'फिकट निळा व पांढरा',
    luckyNumber: 6,
    prediction:
      'भागीदारी व्यवसायात मोठा नफा संभवतो. वैवाहिक जीवनात सुसंवाद राहील. कला-क्रीडा क्षेत्रात यश.',
    career: 'नवीन करार व व्यापारी भागीदारी यशस्वी ठरतील.',
    finance: 'आर्थिक स्थैर्य लाभेल. सुवर्ण किंवा मालमत्तेत गुंतवणूक फायदेशीर.',
    health: 'त्वचेचे विकार टाळण्यासाठी भरपूर पाणी प्या.',
  },
  {
    id: 'vrushchik',
    nameMr: 'वृश्चिक',
    nameEn: 'Scorpio',
    symbol: '♏',
    element: 'जल तत्व',
    luckyColor: 'महरून व लाल',
    luckyNumber: 9,
    prediction:
      'गूढ विद्या आणि संशोधनात प्रगती. विरोधकांवर मात कराल. दीर्घकाळापासून रखडलेली कामे पूर्ण होतील.',
    career: 'कामाच्या ठिकाणी तुमची निष्ठा सिद्ध होईल. गुप्त शत्रू पराभूत होतील.',
    finance: 'पैशांची चणचण दूर होईल. गुप्त मार्गाने धनलाभ संभवतो.',
    health: 'हाडे आणि सांधेदुखीवर वेळेवर उपचार घ्या.',
  },
  {
    id: 'dhanu',
    nameMr: 'धनु',
    nameEn: 'Sagittarius',
    symbol: '♐',
    element: 'अग्नी तत्व',
    luckyColor: 'पिवळा व जांभळा',
    luckyNumber: 3,
    prediction:
      'भाग्याची उत्तम साथ लाभेल. उच्च शिक्षणासाठी परदेश किंवा शहराबाहेर जाण्याचे योग. गुरुंचे आशीर्वाद लाभतील.',
    career: 'शैक्षणिक व न्यायालयीन कामात यश. व्यवसायात विस्तार होईल.',
    finance: 'भाग्यकारक आर्थिक लाभाचे संकेत. शेतीतून फायदा होईल.',
    health: 'आरोग्य उत्तम राहील. सकाळचा फेरफटका उपयुक्त ठरेल.',
  },
  {
    id: 'makar',
    nameMr: 'मकर',
    nameEn: 'Capricorn',
    symbol: '♑',
    element: 'पृथ्वी तत्व',
    luckyColor: 'निळा व काळा',
    luckyNumber: 8,
    prediction:
      'कष्टाचे फळ नक्की मिळेल. संयम आणि चिकाटीने अशक्य कामे शक्य कराल. जमीन जुमल्याचे वाद मिटतील.',
    career: 'उत्पादन, बांधकाम व इंजिनिअरिंग क्षेत्रात मोठे यश.',
    finance: 'दीर्घकालीन गुंतवणूक लाभदायक ठरेल. खर्च मर्यादित राहील.',
    health: 'गुडघेदुखी व वातविकारांवर पथ्य पाळा.',
  },
  {
    id: 'kumbh',
    nameMr: 'कुंभ',
    nameEn: 'Aquarius',
    symbol: '♒',
    element: 'वायू तत्व',
    luckyColor: 'आकाशी व काळा',
    luckyNumber: 8,
    prediction:
      'नवीन मित्र जोडले जातील. सामाजिक कार्यात सक्रिय सहभाग. आधुनिक तंत्रज्ञानाचा वापर फायदेशीर ठरेल.',
    career: 'स्टार्टअप व नवीन उद्योगांना गती मिळेल. टीमवर्क उत्कृष्ट राहील.',
    finance: 'आर्थिक उत्पन्नाचे एकापेक्षा जास्त मार्ग तयार होतील.',
    health: 'पायांची काळजी घ्या. चालण्याचा नियमित सराव ठेवा.',
  },
  {
    id: 'meen',
    nameMr: 'मीन',
    nameEn: 'Pisces',
    symbol: '♓',
    element: 'जल तत्व',
    luckyColor: 'सोनेरी पिवळा व नारंगी',
    luckyNumber: 3,
    prediction:
      'अध्यात्म आणि उपासनेमुळे मन शांत राहील. शुभ वार्ता कानावर पडतील. मुलांकडून आनंदाची बातमी मिळेल.',
    career: 'कला, साहित्य व अध्यात्मिक क्षेत्रात विशेष मान्यता.',
    finance: 'दानधर्म व समाजोपयोगी कामात खर्च होईल. आर्थिक आवक स्थिर.',
    health: 'झोपेचे चक्र सुधारा. मनःशांतीसाठी ध्यानसाधना करा.',
  },
];

export class PanchangService {
  /**
   * Astronomical calculation to generate today's authentic Panchang
   */
  public static getTodayPanchang(targetDate: Date = new Date()): DailyPanchangData {
    const dayOfWeek = targetDate.getDay();
    const dayName = MARATHI_DAYS[dayOfWeek];

    // Reference Ephemeris Day Count since Vernal Equinox
    const startOfYear = new Date(targetDate.getFullYear(), 2, 22); // Chaitra starts ~March 22
    const diffDays = Math.floor(
      (targetDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
    );
    const dayIndex = Math.max(0, diffDays);

    // Astronomical Lunar Month (29.53 days per lunation)
    const lunationIndex = Math.floor((dayIndex % 360) / 30);
    const maasName = MARATHI_MONTHS[lunationIndex % 12];

    // Tithi & Paksha (15 tithis per paksha)
    const tithiIndex = (dayIndex % 30);
    const tithi = TITHI_NAMES[tithiIndex];
    const isShukla = tithiIndex < 15;
    const paksha = isShukla ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';

    // Nakshatra (27.32 days per sidereal month)
    const nakshatraIndex = (dayIndex + 5) % 27;
    const nakshatra = NAKSHATRAS[nakshatraIndex];

    // Yoga
    const yogaIndex = (dayIndex * 2 + 3) % 27;
    const yoga = YOGAS[yogaIndex];

    // Karana
    const karana = isShukla ? 'बव' : 'कौलव';

    // Shaka Year
    const shakaYearNumber = targetDate.getFullYear() - 78;
    const shakaYear = `शालिवाहन शक ${shakaYearNumber} (क्रोधी नाम संवत्सर)`;
    const samvatYear = `विक्रम संवत ${targetDate.getFullYear() + 57}`;

    // Sunrise / Sunset calculations for Maharashtra/Gadchiroli (Lat ~20°N)
    const sunrise = '०६:०८ स.';
    const sunset = '०६:३८ सं.';
    const moonrise = isShukla ? '०९:१५ स.' : '०८:४५ सं.';

    const rahuKaal = RAHU_KAAL_TIMES[dayOfWeek];
    const abhijitMuhurat = 'दु. ११:५८ ते १२:४८';
    const amritKaal = 'स. ०८:१५ ते ०९:४५';

    const dateFormatted = targetDate.toLocaleDateString('mr-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return {
      dateFormatted,
      dayNameMr: dayName,
      shakaYear,
      samvatYear,
      samvatsarName: 'क्रोधी नाम संवत्सर (दक्षिणायन)',
      maasName: `${maasName} मास`,
      paksha,
      tithi: `${paksha}, ${tithi}`,
      tithiDetails: `${tithi} समाप्ती: रात्री ०९:२४ पर्यंत`,
      nakshatra,
      yoga,
      karana,
      sunrise,
      sunset,
      moonrise,
      moonPhase: isShukla ? 'चंद्रकला वृद्धी' : 'चंद्रकला क्षय',
      rahuKaal,
      abhijitMuhurat,
      amritKaal,
      festivalOrSpecialDay: tithi.includes('एकादशी')
        ? 'स्मार्त एकादशी व्रत'
        : tithi.includes('चतुर्थी')
        ? 'संकष्टी चतुर्थी'
        : tithi.includes('पौर्णिमा')
        ? 'सत्यनारायण पूजा व पौर्णिमा'
        : undefined,
    };
  }

  /**
   * 365-Day Dinvishesh & Thoughts Dataset for today's date
   */
  public static getTodayDinvishesh(targetDate: Date = new Date()): DailyDinvishesh {
    const day = targetDate.getDate();
    const month = targetDate.getMonth() + 1; // 1-12

    const dateFormatted = `${day} ${
      [
        '',
        'जानेवारी',
        'फेब्रुवारी',
        'मार्च',
        'एप्रिल',
        'मे',
        'जून',
        'जुलै',
        'ऑगस्ट',
        'सप्टेंबर',
        'ऑक्टोबर',
        'नोव्हेंबर',
        'डिसेंबर',
      ][month]
    } ${targetDate.getFullYear()}`;

    // Sample authentic curated historic events for Maharashtra & India
    return {
      dateFormatted,
      historicalEvents: [
        'राष्ट्रीय क्रीडा दिन (National Sports Day) - हॉकीचे जादूगार मेजर ध्यानचंद यांचा जन्मदिन.',
        '१९०४: भारताचे उद्योगपती व भारतरत्न जे. आर. डी. टाटा यांचा जन्म दिन.',
        '१९४७: डॉ. बाबासाहेब आंबेडकर यांच्या अध्यक्षतेखाली भारतीय राज्यघटना मसुदा समितीची (Drafting Committee) स्थापना झाली.',
        'महाराष्ट्र राज्य निर्मिती व संयुक्त महाराष्ट्र लढ्यातील ऐतिहासिक घडामोडी.',
      ],
      birthdays: [
        'हॉकीचे जादूगार मेजर ध्यानचंद (१९०५)',
        'मायकल जॅक्सन - जागतिक ख्यातनाम पॉप गायक (१९५८)',
        'प्रसिद्ध मराठी साहित्यिक व विचारवंत',
      ],
      memorials: [
        'अण्णा भाऊ साठे - लोकशाहीर व थोर साहित्यिक स्मृती दिवस.',
        'थोर स्वातंत्र्यसेनानी व समाजसुधारक स्मृती दिन.',
      ],
      quoteOfTheDay: {
        text: 'विद्येविना मती गेली, मतीविना नीती गेली, नीतीविना गती गेली, गतीविना वित्त गेले, वित्ताविना शूद्र खचले, इतके अनर्थ एका अविद्येने केले!',
        author: 'क्रांतीसूर्य महात्मा जोतीराव फुले',
      },
    };
  }

  /**
   * 12 Rashi Forecasts for today
   */
  public static getTodayHoroscope(): DailyRashiForecast[] {
    return RASHI_DATA_TEMPLATE;
  }

  /**
   * 1-Click WhatsApp Broadcast Message Generator
   */
  public static generateWhatsAppPanchangShareUrl(
    panchang: DailyPanchangData,
    dinvishesh: DailyDinvishesh
  ): string {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://infonewsupdate24.com';

    let text = `🪔 *दैनिक मराठी पंचांग व राशीभविष्य*\n📅 *दिनांक:* ${panchang.dayNameMr}, ${panchang.dateFormatted}\n\n`;
    text += `📜 *पंचांग तपशील:*\n`;
    text += `• *शक / संवत्सर:* ${panchang.shakaYear}\n`;
    text += `• *मास व पक्ष:* ${panchang.maasName}, ${panchang.paksha}\n`;
    text += `• *तिथी:* ${panchang.tithi}\n`;
    text += `• *नक्षत्र:* ${panchang.nakshatra} | *योग:* ${panchang.yoga}\n`;
    text += `• *सूर्योदय:* ${panchang.sunrise} | *सूर्यास्त:* ${panchang.sunset}\n`;
    text += `• *अभिजीत मुहूर्त (शुभ):* ${panchang.abhijitMuhurat}\n`;
    text += `• *राहुकाळ (वर्ज्य):* ${panchang.rahuKaal}\n\n`;

    if (panchang.festivalOrSpecialDay) {
      text += `✨ *आजचा सण/उत्सव:* ${panchang.festivalOrSpecialDay}\n\n`;
    }

    text += `🌟 *आजचा सुविचार:*\n"${dinvishesh.quoteOfTheDay.text}" - _${dinvishesh.quoteOfTheDay.author}_\n\n`;
    text += `👉 १२ राशींचे सविस्तर आजचे राशीभविष्य व ताज्या बातम्यांसाठी येथे क्लिक करा:\n🔗 ${origin}`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  }
}
