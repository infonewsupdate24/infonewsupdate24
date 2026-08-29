export interface TalukaInfo {
  id: string;
  nameMr: string;
  nameEn: string;
  aliases: string[];
}

export interface DistrictInfo {
  id: string;
  nameMr: string;
  nameEn: string;
  divisionMr: string;
  isFlagship?: boolean;
  talukas: TalukaInfo[];
  aliases: string[];
}

export const GADCHIROLI_TALUKAS: TalukaInfo[] = [
  {
    id: 'gadchiroli_hq',
    nameMr: 'गडचिरोली',
    nameEn: 'Gadchiroli',
    aliases: ['गडचिरोली शहर', 'gadchiroli', 'gadchiroli city', 'मुख्यालय'],
  },
  {
    id: 'aheri',
    nameMr: 'अहेरी',
    nameEn: 'Aheri',
    aliases: ['अहेरी', 'aheri', 'आहेरी', 'प्राणहिता'],
  },
  {
    id: 'armori',
    nameMr: 'आरमोरी',
    nameEn: 'Armori',
    aliases: ['आरमोरी', 'armori', 'वैरागड'],
  },
  {
    id: 'chamorshi',
    nameMr: 'चामोर्शी',
    nameEn: 'Chamorshi',
    aliases: ['चामोर्शी', 'chamorshi', 'मार्कंडा', 'मार्कंडादेव'],
  },
  {
    id: 'dhanora',
    nameMr: 'धानोरा',
    nameEn: 'Dhanora',
    aliases: ['धानोरा', 'dhanora', 'लेखा मेंढा', 'मेंढा लेखा'],
  },
  {
    id: 'kurkheda',
    nameMr: 'कुरखेडा',
    nameEn: 'Kurkheda',
    aliases: ['कुरखेडा', 'kurkheda'],
  },
  {
    id: 'korchi',
    nameMr: 'कोरची',
    nameEn: 'Korchi',
    aliases: ['कोरची', 'korchi', 'बेडगाव'],
  },
  {
    id: 'desaiganj_wadsa',
    nameMr: 'देसाईगंज (वडसा)',
    nameEn: 'Desaiganj Wadsa',
    aliases: ['देसाईगंज', 'वडसा', 'desaiganj', 'wadsa', 'देसाईगंज वडसा'],
  },
  {
    id: 'bhamragad',
    nameMr: 'भामरागड',
    nameEn: 'Bhamragad',
    aliases: ['भामरागड', 'bhamragad', 'हेमलकसा', 'लोकबिरादरी', 'त्रिवेणी संगम'],
  },
  {
    id: 'sironcha',
    nameMr: 'सिरोंचा',
    nameEn: 'Sironcha',
    aliases: ['सिरोंचा', 'sironcha', 'गोदावरी संगम', 'प्राणहिता संगम'],
  },
  {
    id: 'etapalli',
    nameMr: 'एटापल्ली',
    nameEn: 'Etapalli',
    aliases: ['एटापल्ली', 'etapalli', 'सुरजागड', 'तोडगट्टा'],
  },
  {
    id: 'mulchera',
    nameMr: 'मुलचेरा',
    nameEn: 'Mulchera',
    aliases: ['मुलचेरा', 'mulchera', 'आष्टी'],
  },
];

export const MAHARASHTRA_DISTRICTS: DistrictInfo[] = [
  {
    id: 'gadchiroli',
    nameMr: 'गडचिरोली',
    nameEn: 'Gadchiroli',
    divisionMr: 'नागपूर विभाग (विदर्भ)',
    isFlagship: true,
    aliases: ['गडचिरोली', 'gadchiroli', 'दंकारण्य'],
    talukas: GADCHIROLI_TALUKAS,
  },
  {
    id: 'nagpur',
    nameMr: 'नागपूर',
    nameEn: 'Nagpur',
    divisionMr: 'नागपूर विभाग (विदर्भ)',
    aliases: ['नागपूर', 'nagpur', 'उपराजधानी'],
    talukas: [
      { id: 'nagpur_urban', nameMr: 'नागपूर शहर', nameEn: 'Nagpur City', aliases: ['नागपूर शहर'] },
      { id: 'kamthi', nameMr: 'कामठी', nameEn: 'Kamthi', aliases: ['कामठी'] },
      { id: 'katol', nameMr: 'काटोल', nameEn: 'Katol', aliases: ['काटोल'] },
      { id: 'ramtek', nameMr: 'रामटेक', nameEn: 'Ramtek', aliases: ['रामटेक'] },
      { id: 'hingna', nameMr: 'हिंगणा', nameEn: 'Hingna', aliases: ['हिंगणा'] },
      { id: 'umred', nameMr: 'उमरेड', nameEn: 'Umred', aliases: ['उमरेड'] },
      { id: 'savner', nameMr: 'सावनेर', nameEn: 'Savner', aliases: ['सावनेर'] },
    ],
  },
  {
    id: 'chandrapur',
    nameMr: 'चंद्रपूर',
    nameEn: 'Chandrapur',
    divisionMr: 'नागपूर विभाग (विदर्भ)',
    aliases: ['चंद्रपूर', 'chandrapur', 'ताडोबा'],
    talukas: [
      { id: 'chandrapur_city', nameMr: 'चंद्रपूर', nameEn: 'Chandrapur', aliases: ['चंद्रपूर'] },
      { id: 'ballarpur', nameMr: 'बल्लारपूर', nameEn: 'Ballarpur', aliases: ['बल्लारपूर'] },
      { id: 'warora', nameMr: 'वरोरा', nameEn: 'Warora', aliases: ['वरोरा', 'आनंदवन'] },
      { id: 'bhadravati', nameMr: 'भद्रावती', nameEn: 'Bhadravati', aliases: ['भद्रावती'] },
      { id: 'rajura', nameMr: 'राजुरा', nameEn: 'Rajura', aliases: ['राजुरा'] },
      { id: 'chimur', nameMr: 'चिमूर', nameEn: 'Chimur', aliases: ['चिमूर'] },
      { id: 'brahmapuri', nameMr: 'ब्रह्मपुरी', nameEn: 'Brahmapuri', aliases: ['ब्रह्मपुरी'] },
      { id: 'mul', nameMr: 'मूल', nameEn: 'Mul', aliases: ['मूल'] },
    ],
  },
  {
    id: 'gondia',
    nameMr: 'गोंदिया',
    nameEn: 'Gondia',
    divisionMr: 'नागपूर विभाग (विदर्भ)',
    aliases: ['गोंदिया', 'gondia'],
    talukas: [
      { id: 'gondia_city', nameMr: 'गोंदिया', nameEn: 'Gondia', aliases: ['गोंदिया'] },
      { id: 'tiroda', nameMr: 'तिरोडा', nameEn: 'Tiroda', aliases: ['तिरोडा'] },
      { id: 'arjuni_morgaon', nameMr: 'अर्जुनी मोरगाव', nameEn: 'Arjuni Morgaon', aliases: ['अर्जुनी मोरगाव', 'नवेगावबांध'] },
      { id: 'goregaon_gondia', nameMr: 'गोरेगाव', nameEn: 'Goregaon', aliases: ['गोरेगाव'] },
      { id: 'amgaon', nameMr: 'आमगाव', nameEn: 'Amgaon', aliases: ['आमगाव'] },
      { id: 'salekasa', nameMr: 'सालेकसा', nameEn: 'Salekasa', aliases: ['सालेकसा'] },
    ],
  },
  {
    id: 'bhandara',
    nameMr: 'भंडारा',
    nameEn: 'Bhandara',
    divisionMr: 'नागपूर विभाग (विदर्भ)',
    aliases: ['भंडारा', 'bhandara'],
    talukas: [
      { id: 'bhandara_city', nameMr: 'भंडारा', nameEn: 'Bhandara', aliases: ['भंडारा'] },
      { id: 'tumsar', nameMr: 'तुमसर', nameEn: 'Tumsar', aliases: ['तुमसर'] },
      { id: 'sakoli', nameMr: 'साकोली', nameEn: 'Sakoli', aliases: ['साकोली'] },
      { id: 'pauni', nameMr: 'पवनी', nameEn: 'Pauni', aliases: ['पवनी'] },
    ],
  },
  {
    id: 'wardha',
    nameMr: 'वर्धा',
    nameEn: 'Wardha',
    divisionMr: 'नागपूर विभाग (विदर्भ)',
    aliases: ['वर्धा', 'wardha', 'सेवाग्राम'],
    talukas: [
      { id: 'wardha_city', nameMr: 'वर्धा', nameEn: 'Wardha', aliases: ['वर्धा', 'सेवाग्राम'] },
      { id: 'hinganghat', nameMr: 'हिंगणघाट', nameEn: 'Hinganghat', aliases: ['हिंगणघाट'] },
      { id: 'arvi', nameMr: 'आर्वी', nameEn: 'Arvi', aliases: ['आर्वी'] },
    ],
  },
  {
    id: 'amravati',
    nameMr: 'अमरावती',
    nameEn: 'Amravati',
    divisionMr: 'अमरावती विभाग (विदर्भ)',
    aliases: ['अमरावती', 'amravati'],
    talukas: [
      { id: 'amravati_city', nameMr: 'अमरावती', nameEn: 'Amravati', aliases: ['अमरावती'] },
      { id: 'achlapur', nameMr: 'अचलपूर', nameEn: 'Achalpur', aliases: ['अचलपूर', 'परतवाडा'] },
      { id: 'chandurbazar', nameMr: 'चांदूर बाजार', nameEn: 'Chandurbazar', aliases: ['चांदूर बाजार'] },
      { id: 'chikhaldara', nameMr: 'चिखलदरा', nameEn: 'Chikhaldara', aliases: ['चिखलदरा'] },
    ],
  },
  {
    id: 'yavatmal',
    nameMr: 'यवतमाळ',
    nameEn: 'Yavatmal',
    divisionMr: 'अमरावती विभाग (विदर्भ)',
    aliases: ['यवतमाळ', 'yavatmal'],
    talukas: [
      { id: 'yavatmal_city', nameMr: 'यवतमाळ', nameEn: 'Yavatmal', aliases: ['यवतमाळ'] },
      { id: 'pusad', nameMr: 'पुसद', nameEn: 'Pusad', aliases: ['पुसद'] },
      { id: 'wani', nameMr: 'वणी', nameEn: 'Wani', aliases: ['वणी'] },
      { id: 'darwha', nameMr: 'दारव्हा', nameEn: 'Darwha', aliases: ['दारव्हा'] },
      { id: 'umarkhed', nameMr: 'उमरखेड', nameEn: 'Umarkhed', aliases: ['उमरखेड'] },
    ],
  },
  {
    id: 'pune',
    nameMr: 'पुणे',
    nameEn: 'Pune',
    divisionMr: 'पुणे विभाग (पश्चिम महाराष्ट्र)',
    aliases: ['पुणे', 'pune'],
    talukas: [
      { id: 'pune_city', nameMr: 'पुणे शहर / हवेली', nameEn: 'Pune City', aliases: ['पुणे शहर', 'हवेली'] },
      { id: 'baramati', nameMr: 'बारामती', nameEn: 'Baramati', aliases: ['बारामती'] },
      { id: 'shirur', nameMr: 'शिरूर', nameEn: 'Shirur', aliases: ['शिरूर'] },
      { id: 'junnar', nameMr: 'जुन्नर', nameEn: 'Junnar', aliases: ['जुन्नर'] },
      { id: 'khed_pune', nameMr: 'खेड (राजगुरुनगर)', nameEn: 'Khed', aliases: ['खेड', 'राजगुरुनगर'] },
      { id: 'maval', nameMr: 'मावळ', nameEn: 'Maval', aliases: ['मावळ', 'तळेगाव', 'लोणावळा'] },
    ],
  },
  {
    id: 'mumbai',
    nameMr: 'मुंबई / उपनगर',
    nameEn: 'Mumbai',
    divisionMr: 'कोकण विभाग',
    aliases: ['मुंबई', 'mumbai', 'मुंबई उपनगर', 'बॉम्बे'],
    talukas: [
      { id: 'mumbai_city', nameMr: 'मुंबई शहर', nameEn: 'Mumbai City', aliases: ['दक्षिण मुंबई', 'फोर्ट', 'दादर'] },
      { id: 'mumbai_suburban', nameMr: 'मुंबई उपनगर', nameEn: 'Mumbai Suburban', aliases: ['अंधेरी', 'बोरिवली', 'कुर्ला'] },
    ],
  },
  {
    id: 'thane',
    nameMr: 'ठाणे',
    nameEn: 'Thane',
    divisionMr: 'कोकण विभाग',
    aliases: ['ठाणे', 'thane'],
    talukas: [
      { id: 'thane_city', nameMr: 'ठाणे शहर', nameEn: 'Thane City', aliases: ['ठाणे'] },
      { id: 'kalyan_dombivli', nameMr: 'कल्याण-डोंबिवली', nameEn: 'Kalyan Dombivli', aliases: ['कल्याण', 'डोंबिवली'] },
      { id: 'bhiwandi', nameMr: 'भिवंडी', nameEn: 'Bhiwandi', aliases: ['भिवंडी'] },
      { id: 'ulhasnagar', nameMr: 'उल्हासनगर', nameEn: 'Ulhasnagar', aliases: ['उल्हासनगर'] },
      { id: 'mira_bhayandar', nameMr: 'मीरा-भाईंदर', nameEn: 'Mira Bhayandar', aliases: ['मीरा-भाईंदर'] },
    ],
  },
  {
    id: 'nashik',
    nameMr: 'नाशिक',
    nameEn: 'Nashik',
    divisionMr: 'नाशिक विभाग (उत्तर महाराष्ट्र)',
    aliases: ['नाशिक', 'nashik'],
    talukas: [
      { id: 'nashik_city', nameMr: 'नाशिक शहर', nameEn: 'Nashik City', aliases: ['नाशिक'] },
      { id: 'malegaon', nameMr: 'मालेगाव', nameEn: 'Malegaon', aliases: ['मालेगाव'] },
      { id: 'sinnar', nameMr: 'सिन्नर', nameEn: 'Sinnar', aliases: ['सिन्नर'] },
      { id: 'niphad', nameMr: 'निफाड', nameEn: 'Niphad', aliases: ['निफाड'] },
      { id: 'yeola', nameMr: 'येवला', nameEn: 'Yeola', aliases: ['येवला'] },
    ],
  },
  {
    id: 'chhatrapati_sambhajinagar',
    nameMr: 'छत्रपती संभाजीनगर',
    nameEn: 'Chhatrapati Sambhajinagar',
    divisionMr: 'मराठवाडा विभाग',
    aliases: ['छत्रपती संभाजीनगर', 'औरंगाबाद', 'sambhajinagar', 'aurangabad'],
    talukas: [
      { id: 'csn_city', nameMr: 'संभाजीनगर शहर', nameEn: 'City', aliases: ['संभाजीनगर', 'औरंगाबाद'] },
      { id: 'paithan', nameMr: 'पैठण', nameEn: 'Paithan', aliases: ['पैठण'] },
      { id: 'vaijapur', nameMr: 'वैजापूर', nameEn: 'Vaijapur', aliases: ['वैजापूर'] },
      { id: 'gangapur', nameMr: 'गंगापूर', nameEn: 'Gangapur', aliases: ['गंगापूर'] },
    ],
  },
  {
    id: 'kolhapur',
    nameMr: 'कोल्हापूर',
    nameEn: 'Kolhapur',
    divisionMr: 'पुणे विभाग (पश्चिम महाराष्ट्र)',
    aliases: ['कोल्हापूर', 'kolhapur'],
    talukas: [
      { id: 'karveer', nameMr: 'करवीर (कोल्हापूर)', nameEn: 'Karveer', aliases: ['करवीर', 'कोल्हापूर'] },
      { id: 'hatkanangale', nameMr: 'हातकणंगले (इचलकरंजी)', nameEn: 'Hatkanangale', aliases: ['हातकणंगले', 'इचलकरंजी'] },
      { id: 'shirol', nameMr: 'शिरोळ', nameEn: 'Shirol', aliases: ['शिरोळ'] },
    ],
  },
  {
    id: 'solapur',
    nameMr: 'सोलापूर',
    nameEn: 'Solapur',
    divisionMr: 'पुणे विभाग',
    aliases: ['सोलापूर', 'solapur', 'पंढरपूर'],
    talukas: [
      { id: 'solapur_city', nameMr: 'सोलापूर', nameEn: 'Solapur', aliases: ['सोलापूर'] },
      { id: 'pandharpur', nameMr: 'पंढरपूर', nameEn: 'Pandharpur', aliases: ['पंढरपूर'] },
      { id: 'barshi', nameMr: 'बार्शी', nameEn: 'Barshi', aliases: ['बार्शी'] },
      { id: 'akkalkot', nameMr: 'अक्कलकोट', nameEn: 'Akkalkot', aliases: ['अक्कलकोट'] },
    ],
  },
  {
    id: 'latur',
    nameMr: 'लातूर',
    nameEn: 'Latur',
    divisionMr: 'मराठवाडा विभाग',
    aliases: ['लातूर', 'latur'],
    talukas: [
      { id: 'latur_city', nameMr: 'लातूर', nameEn: 'Latur', aliases: ['लातूर'] },
      { id: 'udgir', nameMr: 'उदगीर', nameEn: 'Udgir', aliases: ['उदगीर'] },
      { id: 'ahmadpur', nameMr: 'अहमदपूर', nameEn: 'Ahmadpur', aliases: ['अहमदपूर'] },
      { id: 'nilanga', nameMr: 'निलंगा', nameEn: 'Nilanga', aliases: ['निलंगा'] },
    ],
  },
  {
    id: 'nanded',
    nameMr: 'नांदेड',
    nameEn: 'Nanded',
    divisionMr: 'मराठवाडा विभाग',
    aliases: ['नांदेड', 'nanded'],
    talukas: [
      { id: 'nanded_city', nameMr: 'नांदेड', nameEn: 'Nanded', aliases: ['नांदेड'] },
      { id: 'degloor', nameMr: 'देगलूर', nameEn: 'Degloor', aliases: ['देगलूर'] },
      { id: 'kinwat', nameMr: 'किनवट', nameEn: 'Kinwat', aliases: ['किनवट'] },
      { id: 'mukhed', nameMr: 'मुखेड', nameEn: 'Mukhed', aliases: ['मुखेड'] },
    ],
  },
  {
    id: 'ahilyanagar',
    nameMr: 'अहिल्यानगर (अहमदनगर)',
    nameEn: 'Ahilyanagar',
    divisionMr: 'नाशिक विभाग',
    aliases: ['अहिल्यानगर', 'अहमदनगर', 'ahmednagar', 'ahilyanagar', 'शिर्डी'],
    talukas: [
      { id: 'nagar_city', nameMr: 'अहिल्यानगर', nameEn: 'Ahilyanagar', aliases: ['अहिल्यानगर', 'अहमदनगर'] },
      { id: 'shirdi_rahata', nameMr: 'राहाता (शिर्डी)', nameEn: 'Rahata Shirdi', aliases: ['शिर्डी', 'राहाता'] },
      { id: 'sangamner', nameMr: 'संगमनेर', nameEn: 'Sangamner', aliases: ['संगमनेर'] },
      { id: 'shrigonda', nameMr: 'श्रीगोंदा', nameEn: 'Shrigonda', aliases: ['श्रीगोंदा'] },
    ],
  },
  {
    id: 'jalgaon',
    nameMr: 'जळगाव',
    nameEn: 'Jalgaon',
    divisionMr: 'नाशिक विभाग',
    aliases: ['जळगाव', 'jalgaon', 'भुसावळ'],
    talukas: [
      { id: 'jalgaon_city', nameMr: 'जळगाव', nameEn: 'Jalgaon', aliases: ['जळगाव'] },
      { id: 'bhusawal', nameMr: 'भुसावळ', nameEn: 'Bhusawal', aliases: ['भुसावळ'] },
      { id: 'chalisgaon', nameMr: 'चाळीसगाव', nameEn: 'Chalisgaon', aliases: ['चाळीसगाव'] },
    ],
  },
  {
    id: 'satara',
    nameMr: 'सातारा',
    nameEn: 'Satara',
    divisionMr: 'पुणे विभाग',
    aliases: ['सातारा', 'satara', 'महाबळेश्वर'],
    talukas: [
      { id: 'satara_city', nameMr: 'सातारा', nameEn: 'Satara', aliases: ['सातारा'] },
      { id: 'karad', nameMr: 'कराड', nameEn: 'Karad', aliases: ['कराड'] },
      { id: 'mahabaleshwar', nameMr: 'महाबळेश्वर', nameEn: 'Mahabaleshwar', aliases: ['महाबळेश्वर', 'पाचगणी'] },
    ],
  },
];
