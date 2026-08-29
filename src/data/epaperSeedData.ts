import { EPaperEdition, EPaperSettings } from '../types';

export const EPAPER_DISTRICTS = [
  { code: 'pune', name: 'पुणे आवृत्ती', region: 'पश्चिम महाराष्ट्र' },
  { code: 'mumbai', name: 'मुंबई-ठाणे आवृत्ती', region: 'कोकण' },
  { code: 'nagpur', name: 'नागपूर आवृत्ती', region: 'विदर्भ' },
  { code: 'nashik', name: 'नाशिक-उत्तर महाराष्ट्र', region: 'उत्तर महाराष्ट्र' },
  { code: 'sambhajinagar', name: 'छत्रपती संभाजीनगर', region: 'मराठवाडा' },
  { code: 'kolhapur', name: 'कोल्हापूर-सांगली', region: 'दक्षिण महाराष्ट्र' },
  { code: 'gadchiroli', name: 'गडचिरोली-चंद्रपूर', region: 'पूर्व विदर्भ' },
];

export const DEFAULT_EPAPER_SETTINGS: EPaperSettings = {
  newspaperName: 'InfoNewsUpdate24',
  newspaperTagline: 'महाराष्ट्राचे निर्भीड, विश्वासार्ह व अग्रगण्य डिजिटल वृत्तपत्र',
  rniNumber: 'RNI No. MAHMAR/2026/89412',
  priceText: 'मूल्य: मोफत / डिजिटल आवृत्ती',
  showFeaturedImages: true,
  showWeatherWidget: true,
  enableDropCap: true,
  autoSyncWithPosts: true,
  watermarkText: 'InfoNewsUpdate24 Digital Edition',
  clipSponsorText: '📢 प्रायोजक: InfoNewsUpdate24 विशेष वृत्तसेवा',
  enableAudioOnClip: true,
  adContactNumber: '९८XXXXXXXX',
  topSolusAdText: '📢 विशेष जाहिरातीसाठी येथे संपर्क साधा!',
  bottomStripAdText: '🏬 आपल्या ब्रँडची जाहिरात InfoNewsUpdate24 च्या लोकप्रिय डिजिटल ई-पेपरमध्ये द्या!',
  enabledDistricts: ['pune', 'mumbai', 'nagpur', 'nashik', 'sambhajinagar', 'kolhapur', 'gadchiroli'],
};

const MARATHI_MONTHS = [
  'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
  'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
];

const MARATHI_DAYS = [
  'रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'
];

const MARATHI_NUMERALS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export function formatMarathiDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'शनिवार, २९ ऑगस्ट २०२६';
    
    const dayName = MARATHI_DAYS[d.getDay()];
    const day = d.getDate();
    const month = MARATHI_MONTHS[d.getMonth()];
    const year = d.getFullYear();

    const marathiDay = day.toString().split('').map(n => MARATHI_NUMERALS[parseInt(n)] || n).join('');
    const marathiYear = year.toString().split('').map(n => MARATHI_NUMERALS[parseInt(n)] || n).join('');

    return `${dayName}, ${marathiDay} ${month} ${marathiYear}`;
  } catch {
    return 'शनिवार, २९ ऑगस्ट २०२६';
  }
}

export const INITIAL_EPAPER_EDITIONS: EPaperEdition[] = [
  // 1. PUNE EDITION
  {
    id: 'epaper-pune-today',
    editionCode: 'pune',
    districtName: 'पुणे आवृत्ती',
    date: '2026-08-29',
    formattedDateMarathi: 'शनिवार, २९ ऑगस्ट २०२६',
    totalPages: 6,
    coverImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
    pages: [
      {
        id: 'pune-p1',
        pageNumber: 1,
        title: 'मुख्य पान (Front Page)',
        pageType: 'main',
        imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&auto=format&fit=crop&q=80',
        articles: [
          {
            id: 'p1-art-1',
            pageNumber: 1,
            title: 'पुणे मेट्रोच्या तिसऱ्या टप्प्याला राज्य मंत्रिमंडळाची अंतिम मंजुरी',
            category: 'पुणे विशेष',
            headline: '🔴 पुणे मेट्रोचा विस्तार: हिंजवडी ते शिवाजीनगर मार्गावर नवीन ३ स्थानके जोडली जाणार',
            summary: 'पुणे महानगर प्रदेश विकास प्राधिकरणाने (PMRDA) सादर केलेल्या प्रस्तावाला राज्य सरकारने हिरवा कंदील दाखवला असून येत्या वर्षात काम वेगाने पूर्ण करण्याचा संकल्प करण्यात आला आहे.',
            fullBody: 'पुणे: पुणे आणि पिंपरी-चिंचवड परिसरातील वाहतूक कोंडी फोडण्यासाठी मेट्रोच्या तिसऱ्या टप्प्याला आज मंत्रिमंडळ बैठकीत औपचारिक मंजुरी मिळाली. या प्रकल्पामुळे दररोज सुमारे २.५ लाख प्रवाशांना जलद आणि प्रदूषणमुक्त प्रवासाची सोय उपलब्ध होणार आहे. मुख्यमंत्र्यांनी यावेळी निधीची कोणतीही कमतरता भासू दिली जाणार नाही अशी ग्वाही दिली.',
            authorName: 'रोहित जोशी, पुणे ब्युरो',
            location: 'पुणे',
            bounds: { x: 5, y: 8, width: 90, height: 28 },
          },
          {
            id: 'p1-art-2',
            pageNumber: 1,
            title: 'लाडकी बहीण योजनेचा नवीन हप्ता थेट बँक खात्यात जमा सुरू',
            category: 'महाराष्ट्र शासन',
            headline: '⚡ लाडकी बहीण योजना: राज्यातील १.८ कोटी महिलांच्या खात्यात प्रत्येकी १५०० रुपये वर्ग',
            summary: 'तांत्रिक अडचणी दूर करून सर्व पात्र लाभार्थ्यांची यादी अद्ययावत करण्यात आली असून कोणत्याही महिलेचा लाभ थांबणार नसल्याचे प्रशासनाने स्पष्ट केले.',
            fullBody: 'मुंबई: मुख्यमंत्री माझी लाडकी बहीण योजनेचा चालू महिन्याचा हप्ता थेट लाभ हस्तांतरणाद्वारे (DBT) महिलांच्या आधार लिंक बँक खात्यात जमा होण्यास सुरुवात झाली आहे. ज्या महिलांचे केवायसी प्रलंबित होते, त्यांना स्थानिक सेतू केंद्रांवर विशेष सुविधा देण्यात आली आहे.',
            authorName: 'विशेष प्रतिनिधी',
            location: 'मुंबई',
            bounds: { x: 5, y: 38, width: 45, height: 30 },
          },
          {
            id: 'p1-art-3',
            pageNumber: 1,
            title: 'खडकवासला धरणातून विसर्ग सुरू; नदीकाठच्या गावांना सतर्कतेचा इशारा',
            category: 'हवामान व जलसंपदा',
            headline: '🌊 मुठा नदी पात्रात १० हजार क्युसेक पाण्याचा विसर्ग; आपत्ती व्यवस्थापन यंत्रणा सज्ज',
            summary: 'घाटमाथ्यावर झालेल्या मुसळधार पावसामुळे धरणातील पाणीसाठा ९८ टक्क्यांवर पोहोचला असून खबरदारीचा उपाय म्हणून पाण्याचा विसर्ग वाढवण्यात आला आहे.',
            fullBody: 'पुणे: खडकवासला धरण साखळी परिसरात गेल्या २४ तासांत संततधार पाऊस सुरू असल्याने धरणाचे दरवाजे उघडून विसर्ग सुरू करण्यात आला आहे. नदीपात्रातील भिडे पूल आणि लगतच्या सखल भागातील नागरिकांना सुरक्षित स्थळी स्थलांतरित होण्याचे आवाहन महापालिकेने केले आहे.',
            authorName: 'जलसंपदा वार्ताहर',
            location: 'पुणे',
            bounds: { x: 52, y: 38, width: 43, height: 30 },
          },
          {
            id: 'p1-art-4',
            pageNumber: 1,
            title: 'शेतकऱ्यांसाठी कांदा अनुदान थेट खात्यात जमा होणार',
            category: 'कृषी घडामोडी',
            headline: '🌾 कांदा उत्पादक शेतकऱ्यांना प्रतिक्विंटल ३५० रुपये अनुदान मंजूर; पोर्टलवर यादी जाहीर',
            summary: 'शासनाने अखेर कांदा अनुदानाची रक्कम मंजूर केली असून शेतकऱ्यांनी बँक खात्याची पडताळणी करण्याचे आवाहन पणन विभागाने केले आहे.',
            fullBody: 'पुणे/नाशिक: लेट खरीप व रब्बी हंगामातील कांदा अनुदानाची बहुप्रतिक्षित रक्कम शेतकऱ्यांच्या खात्यात वर्ग करण्यास वित्त विभागाने मंजुरी दिली आहे. यामुळे नाशिक, पुणे, सोलापूर आणि अहिल्यानगर जिल्ह्यातील लाखो शेतकऱ्यांना दिलासा मिळाला आहे.',
            authorName: 'कृषी प्रतिनिधी',
            location: 'पुणे',
            bounds: { x: 5, y: 70, width: 90, height: 25 },
          },
        ],
      },
      {
        id: 'pune-p2',
        pageNumber: 2,
        title: 'महाराष्ट्र वार्ता (State News)',
        pageType: 'maharashtra',
        imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&auto=format&fit=crop&q=80',
        articles: [
          {
            id: 'p2-art-1',
            pageNumber: 2,
            title: 'विधानसभा निवडणुकांसाठी सर्वपक्षीय मोर्चेबांधणीला वेग',
            category: 'राजकारण',
            headline: '🏛️ जागावाटपाची अंतिम चर्चा निर्णायक टप्प्यात; प्रमुख नेत्यांच्या बैठकांचे सत्र सुरू',
            summary: 'राज्यातील राजकीय समीकरणांमध्ये मोठे बदल घडत असून इच्छुकांनी आपापल्या मतदारसंघात जोरदार जनसंपर्क अभियान सुरू केले आहे.',
            fullBody: 'मुंबई: आगामी विधानसभा निवडणुकांसाठी सर्वच राजकीय आघाड्यांनी जागावाटपाचा तिढा सोडवण्यासाठी वेगवान हालचाली सुरू केल्या आहेत.',
            authorName: 'राजकीय ब्युरो',
            location: 'मुंबई',
            bounds: { x: 5, y: 10, width: 90, height: 80 },
          },
        ],
      },
    ],
  },

  // 2. MUMBAI EDITION
  {
    id: 'epaper-mumbai-today',
    editionCode: 'mumbai',
    districtName: 'मुंबई-ठाणे आवृत्ती',
    date: '2026-08-29',
    formattedDateMarathi: 'शनिवार, २९ ऑगस्ट २०२६',
    totalPages: 6,
    coverImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&auto=format&fit=crop&q=80',
    pages: [
      {
        id: 'mumbai-p1',
        pageNumber: 1,
        title: 'मुख्य पान (Front Page)',
        pageType: 'main',
        imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=300&auto=format&fit=crop&q=80',
        articles: [
          {
            id: 'mum-p1-art-1',
            pageNumber: 1,
            title: 'मुंबई कोस्टल रोडचा दुसरा टप्पा वाहतुकीसाठी सज्ज',
            category: 'मुंबई विशेष',
            headline: '🚗 मरिन ड्राईव्ह ते वरळी प्रवास अवघ्या १० मिनिटांत; उद्यापासून नवीन बोगदा खुला होणार',
            summary: 'मुंबई महानगरपालिकेच्या महत्वाकांक्षी कोस्टल रोड प्रकल्पाचा दुसरा टप्पा पूर्ण झाला असून मुख्यमंत्री उद्या लोकार्पण करणार आहेत.',
            fullBody: 'मुंबई: मुंबईकरांचा प्रवास सुसाट करणारा कोस्टल रोड आता पूर्ण क्षमतेने वाहतुकीसाठी सज्ज झाला आहे.',
            authorName: 'ब्युरो चीफ, मुंबई',
            location: 'मुंबई',
            bounds: { x: 5, y: 10, width: 90, height: 40 },
          },
          {
            id: 'mum-p1-art-2',
            pageNumber: 1,
            title: 'ठाणे-बोरिवली भुयारी मार्गाचे काम युद्धपातळीवर सुरू',
            category: 'ठाणे नागरी',
            headline: '🚇 संजय गांधी राष्ट्रीय उद्यानाखालून धावणार बोगदा; ठाणेकरांचा वेळ वाचणार',
            summary: 'पर्यावरणाचा समतोल राखत अत्याधुनिक तंत्रज्ञानाचा वापर करून बोगदा खणण्याचे काम सुरू करण्यात आले आहे.',
            fullBody: 'ठाणे: ठाणे ते बोरिवली दरम्यानचा प्रवास अवघ्या १५ ते २० मिनिटांत शक्य करणाऱ्या भुयारी मार्गाचे काम वेगाने सुरू आहे.',
            authorName: 'ठाणे प्रतिनिधी',
            location: 'ठाणे',
            bounds: { x: 5, y: 55, width: 90, height: 35 },
          },
        ],
      },
    ],
  },

  // 3. NAGPUR EDITION
  {
    id: 'epaper-nagpur-today',
    editionCode: 'nagpur',
    districtName: 'नागपूर आवृत्ती',
    date: '2026-08-29',
    formattedDateMarathi: 'शनिवार, २९ ऑगस्ट २०२६',
    totalPages: 6,
    coverImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
    pages: [
      {
        id: 'nag-p1',
        pageNumber: 1,
        title: 'मुख्य पान (Front Page)',
        pageType: 'main',
        imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&auto=format&fit=crop&q=80',
        articles: [
          {
            id: 'nag-p1-art-1',
            pageNumber: 1,
            title: 'मिहान प्रकल्पात ५ नवीन आयटी आणि लॉजिस्टिक कंपन्यांचे आगमन',
            category: 'विदर्भ विशेष',
            headline: '🔴 नागपूर मिहानमध्ये १० हजार कोटींची गुंतवणूक; विदर्भातील तरुणांसाठी सुवर्णसंधी',
            summary: 'महाराष्ट्र विमानतळ विकास कंपनीने (MADC) नवीन भूखंड वाटप प्रक्रिया पूर्ण केली असून येत्या ६ महिन्यांत उत्पादन सुरू होईल.',
            fullBody: 'नागपूर: उपराजधानी नागपूरच्या औद्योगिक विकासाला गती देणाऱ्या मिहान विशेष आर्थिक क्षेत्रात नवीन राष्ट्रीय व आंतरराष्ट्रीय कंपन्या दाखल झाल्या आहेत.',
            authorName: 'नागपूर ब्युरो',
            location: 'नागपूर',
            bounds: { x: 5, y: 10, width: 90, height: 45 },
          },
          {
            id: 'nag-p1-art-2',
            pageNumber: 1,
            title: 'विदर्भातील कापूस व सोयाबीन खरेदीसाठी विशेष केंद्रांची स्थापना',
            category: 'कृषी वार्ता',
            headline: '🌾 हमीभावाने शेतमाल खरेदी सुरू; शेतकऱ्यांच्या बँक खात्यात थेट चुकारे जमा होणार',
            summary: 'कापूस पणन महासंघाने सर्व खरेदी केंद्रांवर सीसीटीव्ही व इलेक्ट्रॉनिक वजनकाट्यांची सक्ती केली आहे.',
            fullBody: 'नागपूर/अमरावती: विदर्भातील शेतकऱ्यांना योग्य भाव मिळवून देण्यासाठी शासकीय कापूस खरेदी केंद्रांची घोषणा करण्यात आली आहे.',
            authorName: 'कृषी वार्ताहर',
            location: 'नागपूर',
            bounds: { x: 5, y: 60, width: 90, height: 35 },
          },
        ],
      },
    ],
  },

  // 4. NASHIK EDITION
  {
    id: 'epaper-nashik-today',
    editionCode: 'nashik',
    districtName: 'नाशिक-उत्तर महाराष्ट्र आवृत्ती',
    date: '2026-08-29',
    formattedDateMarathi: 'शनिवार, २९ ऑगस्ट २०२६',
    totalPages: 6,
    coverImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
    pages: [
      {
        id: 'nsk-p1',
        pageNumber: 1,
        title: 'मुख्य पान (Front Page)',
        pageType: 'main',
        imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&auto=format&fit=crop&q=80',
        articles: [
          {
            id: 'nsk-p1-art-1',
            pageNumber: 1,
            title: 'नाशिक-पुणे सेमी हायस्पीड रेल्वे प्रकल्पाला अंतिम गती',
            category: 'उत्तर महाराष्ट्र',
            headline: '🚆 नाशिक-पुणे प्रवास अवघ्या २ तासांत; भूसंपादनासाठी विशेष निधीची तरतूद',
            summary: 'महारेलने सादर केलेल्या सुधारित आराखड्याला रेल्वे मंत्रालयाने मान्यता दिली असून कामाला लवकरच प्रारंभ होईल.',
            fullBody: 'नाशिक: नाशिक, अहिल्यानगर आणि पुणे या तीन औद्योगिक केंद्रांना जोडणारा सेमी हायस्पीड रेल्वे प्रकल्प मार्गी लागत आहे.',
            authorName: 'नाशिक प्रतिनिधी',
            location: 'नाशिक',
            bounds: { x: 5, y: 10, width: 90, height: 45 },
          },
          {
            id: 'nsk-p1-art-2',
            pageNumber: 1,
            title: 'द्राक्ष आणि डाळिंब बागायतदारांसाठी विशेष हवामान विमा कवच',
            category: 'कृषी व फलोत्पादन',
            headline: '🍇 अवकाळी पावसापासून फळबागांच्या संरक्षणासाठी स्वयंचलित हवामान केंद्रांची निर्मिती',
            summary: 'जिल्ह्यातील सर्व तालुक्यांमध्ये डिजिटल सेन्सर बसवण्यात आले असून अचूक अंदाज थेट शेतकऱ्यांच्या मोबाईलवर उपलब्ध होईल.',
            fullBody: 'नाशिक/दिंडोरी: देशाची द्राक्ष राजधानी म्हणून ओळखल्या जाणाऱ्या नाशिक जिल्ह्यातील शेतकऱ्यांना हवामान बदलाचा फटका बसू नये यासाठी योजना जाहीर करण्यात आली.',
            authorName: 'फलोत्पादन वार्ताहर',
            location: 'नाशिक',
            bounds: { x: 5, y: 60, width: 90, height: 35 },
          },
        ],
      },
    ],
  },

  // 5. CHHATRAPATI SAMBHAJINAGAR EDITION
  {
    id: 'epaper-sambhajinagar-today',
    editionCode: 'sambhajinagar',
    districtName: 'छत्रपती संभाजीनगर आवृत्ती',
    date: '2026-08-29',
    formattedDateMarathi: 'शनिवार, २९ ऑगस्ट २०२६',
    totalPages: 6,
    coverImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
    pages: [
      {
        id: 'csn-p1',
        pageNumber: 1,
        title: 'मुख्य पान (Front Page)',
        pageType: 'main',
        imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&auto=format&fit=crop&q=80',
        articles: [
          {
            id: 'csn-p1-art-1',
            pageNumber: 1,
            title: 'मराठवाडा वॉटर ग्रीड प्रकल्पासाठी केंद्र शासनाकडून विशेष पॅकेज',
            category: 'मराठवाडा विशेष',
            headline: '💧 मराठवाड्याचा पाण्याचा प्रश्न कायमस्वरूपी सुटणार; जायकवाडीतून थेट पाईपलाईनचे जाळे',
            summary: 'सर्व ८ जिल्ह्यांना बाराही महिने पिण्याचे व शेतीचे पाणी पुरवण्यासाठी आधुनिक ग्रीड प्रणाली उभारण्यात येत आहे.',
            fullBody: 'छत्रपती संभाजीनगर: दुष्काळमुक्त मराठवाड्याचे स्वप्न साकार करण्यासाठी वॉटर ग्रीड प्रकल्पाच्या पहिल्या टप्प्याला निधी वितरित करण्यात आला आहे.',
            authorName: 'मराठवाडा ब्युरो',
            location: 'छत्रपती संभाजीनगर',
            bounds: { x: 5, y: 10, width: 90, height: 45 },
          },
          {
            id: 'csn-p1-art-2',
            pageNumber: 1,
            title: 'शेंद्रा-बिडकीन ऑरिक सिटीत आंतरराष्ट्रीय ऑटो कंपन्यांचे युनिट सुरू',
            category: 'उद्योग घडामोडी',
            headline: '🏭 डीएमआयसी स्मार्ट सिटीमध्ये ५ हजार नवीन रोजगारांची निर्मिती',
            summary: 'अत्याधुनिक पायाभूत सुविधा आणि अखंड वीज-पाणी पुरवठ्यामुळे उद्योजकांची पसंती वाढत आहे.',
            fullBody: 'छत्रपती संभाजीनगर: ऑरिक सिटीतील नवीन उत्पादन प्रकल्पाचे उद्घाटन करण्यात आले.',
            authorName: 'औद्योगिक प्रतिनिधी',
            location: 'छत्रपती संभाजीनगर',
            bounds: { x: 5, y: 60, width: 90, height: 35 },
          },
        ],
      },
    ],
  },

  // 6. KOLHAPUR EDITION
  {
    id: 'epaper-kolhapur-today',
    editionCode: 'kolhapur',
    districtName: 'कोल्हापूर-सांगली आवृत्ती',
    date: '2026-08-29',
    formattedDateMarathi: 'शनिवार, २९ ऑगस्ट २०२६',
    totalPages: 6,
    coverImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
    pages: [
      {
        id: 'kol-p1',
        pageNumber: 1,
        title: 'मुख्य पान (Front Page)',
        pageType: 'main',
        imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&auto=format&fit=crop&q=80',
        articles: [
          {
            id: 'kol-p1-art-1',
            pageNumber: 1,
            title: 'यंदाच्या ऊस गाळप हंगामासाठी एफआरपी अधिक २०० रुपये देण्याची मागणी',
            category: 'दक्षिण महाराष्ट्र',
            headline: '🌾 कोल्हापूर-सांगलीतील साखर कारखान्यांची तयारी पूर्ण; ऊस दराबाबत संयुक्त बैठक',
            summary: 'शेतकरी संघटना आणि साखर कारखानदार यांच्यातील चर्चेनंतर गाळप हंगामाची तारीख निश्चित होणार आहे.',
            fullBody: 'कोल्हापूर: पश्चिम महाराष्ट्रातील साखर पट्ट्यात यंदाच्या ऊस गाळप हंगामाचे वेध लागले आहेत. साखर आयुक्त कार्यालयाने परवाने देण्याची प्रक्रिया सुरू केली आहे.',
            authorName: 'कोल्हापूर प्रतिनिधी',
            location: 'कोल्हापूर',
            bounds: { x: 5, y: 10, width: 90, height: 45 },
          },
          {
            id: 'kol-p1-art-2',
            pageNumber: 1,
            title: 'पंचगंगा नदी प्रदूषण मुक्तीसाठी १०० कोटींचा बृहत आराखडा',
            category: 'पर्यावरण व नागरी',
            headline: '🌊 सांडपाणी प्रक्रिया केंद्रांचे आधुनिकीकरण; नदीकाठच्या गावांमध्ये स्वच्छता मोहीम',
            summary: 'नदीपात्रात थेट सांडपाणी सोडणाऱ्या घटकांवर कठोर कारवाई करण्याचे प्रदूषण नियंत्रण मंडळाचे निर्देश.',
            fullBody: 'कोल्हापूर: ऐतिहासिक पंचगंगा नदीचे पावित्र्य राखण्यासाठी जिल्हा प्रशासनाने विशेष मोहीम हाती घेतली आहे.',
            authorName: 'पर्यावरण प्रतिनिधी',
            location: 'कोल्हापूर',
            bounds: { x: 5, y: 60, width: 90, height: 35 },
          },
        ],
      },
    ],
  },

  // 7. GADCHIROLI EDITION
  {
    id: 'epaper-gadchiroli-today',
    editionCode: 'gadchiroli',
    districtName: 'गडचिरोली-चंद्रपूर आवृत्ती',
    date: '2026-08-29',
    formattedDateMarathi: 'शनिवार, २९ ऑगस्ट २०२६',
    totalPages: 6,
    coverImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
    pages: [
      {
        id: 'gad-p1',
        pageNumber: 1,
        title: 'मुख्य पान (Front Page)',
        pageType: 'main',
        imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&auto=format&fit=crop&q=80',
        articles: [
          {
            id: 'gad-p1-art-1',
            pageNumber: 1,
            title: 'गडचिरोलीत चौदाशे ग्रामसभांच्या सक्षमीकरणासाठी विराट ग्रामसभा यात्रा',
            category: 'गडचिरोली विशेष',
            headline: '🔴 कोरची ते सिरोंचा विशाल पदयात्रा; जल, जंगल, जमीन हक्कांवर जनजागृती',
            summary: 'मेंढा (लेखा) येथील प्रसिद्ध सामाजिक कार्यकर्ते देवाजी तोफा यांच्या नेतृत्वाखाली ऐतिहासिक बैठक पार पडली.',
            fullBody: 'गडचिरोली: गडचिरोली जिल्ह्यातील सुमारे चौदाशे ग्रामसभा सक्षमीकरणासाठी कोरची ते सिरोंचा अशी विराट ग्रामसभा यात्रा काढण्याचा निर्धार बैठकीत करण्यात आला. "मावा नाटे, मावा राज" या विचारांना केंद्रस्थानी ठेवून पेसा कायद्यानुसार ग्रामसभांचे हक्क अबाधित ठेवण्याचे आवाहन करण्यात आले.',
            authorName: 'विशेष प्रतिनिधी, गडचिरोली',
            location: 'गडचिरोली',
            bounds: { x: 5, y: 10, width: 90, height: 45 },
          },
          {
            id: 'gad-p1-art-2',
            pageNumber: 1,
            title: 'सुरजागड लोहखनिज प्रकल्पामुळे स्थानिक आदिवासी तरुणांना कौशल्य प्रशिक्षण',
            category: 'रोजगार व विकास',
            headline: '🛠️ गडचिरोलीत नवीन आयटीआय व तंत्रशिक्षण केंद्र; २ हजार तरुणांना थेट रोजगाराची संधी',
            summary: 'जिल्हा खनिज प्रतिष्ठान (DMF) निधीतून ग्रामीण भागात आधुनिक शाळा आणि आरोग्य केंद्रांची उभारणी.',
            fullBody: 'गडचिरोली/एटापल्ली: नक्षलग्रस्त भागातून विकासाकडे वाटचाल करणाऱ्या गडचिरोली जिल्ह्यात औद्योगिक प्रशिक्षणाला गती मिळाली आहे.',
            authorName: 'जिल्हा प्रतिनिधी',
            location: 'गडचिरोली',
            bounds: { x: 5, y: 60, width: 90, height: 35 },
          },
        ],
      },
    ],
  },
];
