import { Post, WhatsAppBulletinConfig } from '../types';

const MARATHI_NUMBER_EMOJIS = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export class WhatsAppBulletinService {
  public static getSuggestedBulletinType(): 'MORNING' | 'EVENING' | 'BREAKING' {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 14) return 'MORNING';
    if (hours >= 14 && hours < 22) return 'EVENING';
    return 'BREAKING';
  }

  public static getFormattedDateString(): string {
    const days = ['रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const months = [
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
    ];
    const now = new Date();
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();

    return `${dayName}, ${date} ${monthName} ${year}`;
  }

  public static generateBulletinText(
    posts: Post[],
    config: WhatsAppBulletinConfig,
    channelUrl?: string,
    adContactNumber?: string
  ): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://infonewsupdate24.com';
    const dateStr = this.getFormattedDateString();

    let headerEmoji = '🌅';
    let headerTitle = 'सकाळचे बातमीपत्र | InfoNewsUpdate24';

    if (config.bulletinType === 'EVENING') {
      headerEmoji = '🌇';
      headerTitle = 'संध्याकाळचे बातमीपत्र (Evening Digest)';
    } else if (config.bulletinType === 'BREAKING') {
      headerEmoji = '⚡';
      headerTitle = 'ब्रेकिंग न्यूज विशेष बुलेटिन (Breaking Alert)';
    }

    if (config.customGreeting) {
      headerTitle = config.customGreeting;
    }

    const lines: string[] = [];

    // Header
    lines.push(`${headerEmoji} *${headerTitle}*`);
    lines.push(`📅 *${dateStr}*`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);

    // Articles Loop
    const selectedPosts = config.selectedPostIds?.length
      ? posts.filter((p) => config.selectedPostIds.includes(p.id))
      : posts.slice(0, 5);

    selectedPosts.forEach((post, index) => {
      const numEmoji = MARATHI_NUMBER_EMOJIS[index + 1] || `📌`;
      lines.push(``);
      lines.push(`${numEmoji} *${post.title}*`);
      if (post.excerpt) {
        const cleanExcerpt = post.excerpt.replace(/<[^>]*>?/gm, '').trim();
        lines.push(`📝 ${cleanExcerpt.slice(0, 120)}${cleanExcerpt.length > 120 ? '...' : ''}`);
      }
      if (config.includeReadMoreLinks) {
        lines.push(`👉 *पूर्ण बातमी वाचा:* ${origin}/?post=${post.slug}`);
      }
    });

    lines.push(``);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);

    // E-Paper Link
    if (config.includeEPaperLink) {
      lines.push(`📰 *आजचा डिजिटल ई-पेपर वाचा:*`);
      lines.push(`👉 ${origin}/?view=epaper`);
      lines.push(``);
    }

    // Official WhatsApp Channel Link
    if (config.includeChannelLink && channelUrl) {
      lines.push(`📢 *ताज्या घडामोडींसाठी आमचे अधिकृत चॅनल फॉलो करा:*`);
      lines.push(`👉 ${channelUrl}`);
      lines.push(``);
    }

    // Sponsor / Ad Banner
    if (config.includeAdText && config.customAdText) {
      lines.push(`✨ *प्रायोजक:* ${config.customAdText}`);
      lines.push(``);
    }

    // Ad Booking Contact
    if (adContactNumber) {
      lines.push(`📞 *जाहिरात व बातम्यांसाठी संपर्क:* ${adContactNumber}`);
    }

    lines.push(`🌐 *वेबसाईट:* ${origin}`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`🙏 *आपल्या मित्रांना व ग्रुप्सवर नक्की शेअर करा!*`);

    return lines.join('\n');
  }
}
