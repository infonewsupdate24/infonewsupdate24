import { WhatsAppChannelSettings } from '../types';

export const DEFAULT_WHATSAPP_SETTINGS: WhatsAppChannelSettings = {
  isEnabled: true,
  officialChannelUrl: 'https://whatsapp.com/channel/0029Va9SampleInfoNewsUpdate24',
  channelName: 'InfoNewsUpdate24 Official Channel',
  subscriberCountText: '५०,०००+ वाचक जोडले गेले आहेत',
  showFloatingButton: true,
  showInArticleBanner: true,
  inArticleBannerText:
    '📢 दररोजच्या ताज्या घडामोडी व ब्रेकिंग न्यूज सर्वात आधी WhatsApp वर मिळवण्यासाठी आमच्या अधिकृत चॅनलला फॉलो करा!',
  districtGroups: [
    {
      id: 'pune',
      districtName: 'पुणे जिल्हा न्यूज ग्रुप',
      inviteLink: 'https://chat.whatsapp.com/SamplePuneGroup',
      memberCount: '१,०२४ सदस्य',
      isActive: true,
    },
    {
      id: 'mumbai',
      districtName: 'मुंबई-ठाणे एक्सप्रेस ग्रुप',
      inviteLink: 'https://chat.whatsapp.com/SampleMumbaiGroup',
      memberCount: '९८० सदस्य',
      isActive: true,
    },
    {
      id: 'nashik',
      districtName: 'नाशिक व उत्तर महाराष्ट्र ग्रुप',
      inviteLink: 'https://chat.whatsapp.com/SampleNashikGroup',
      memberCount: '८९० सदस्य',
      isActive: true,
    },
    {
      id: 'latur',
      districtName: 'लातूर व मराठवाडा ग्रुप',
      inviteLink: 'https://chat.whatsapp.com/SampleLaturGroup',
      memberCount: '७५० सदस्य',
      isActive: true,
    },
    {
      id: 'kolhapur',
      districtName: 'कोल्हापूर-सांगली पश्चिम महाराष्ट्र ग्रुप',
      inviteLink: 'https://chat.whatsapp.com/SampleKolhapurGroup',
      memberCount: '६२० सदस्य',
      isActive: true,
    },
    {
      id: 'krishi',
      districtName: '🌾 कृषी व बाजारभाव विशेष शेतकरी ग्रुप',
      inviteLink: 'https://chat.whatsapp.com/SampleKrishiGroup',
      memberCount: '१,५०० सदस्य',
      isActive: true,
    },
  ],
};
