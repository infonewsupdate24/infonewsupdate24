export interface PollOption {
  id: string;
  text: string;
  votes: number;
  color?: string;
}

export interface Poll {
  id: string;
  question: string;
  category: string;
  options: PollOption[];
  totalVotes: number;
  isActive: boolean;
  createdAt: string;
  endDate?: string;
}

const STORAGE_KEY_POLLS = 'infonews_polls_v3';
const STORAGE_KEY_USER_VOTES = 'infonews_user_votes_v3';

const INITIAL_POLLS: Poll[] = [
  {
    id: 'poll-1',
    question: 'महाराष्ट्रातील चालू राजकीय घडामोडींमध्ये आगामी निवडणुकीत कोणता मुद्दा सर्वाधिक निर्णायक ठरेल?',
    category: 'राजकारण व निवडणूक कौल',
    options: [
      { id: 'opt-1', text: 'शेतकरी हमीभाव व कर्जमाफी योजना', votes: 2450, color: 'bg-emerald-500' },
      { id: 'opt-2', text: 'स्थानिक रोजगार, उद्योग व महागाई', votes: 1820, color: 'bg-blue-500' },
      { id: 'opt-3', text: 'पायाभूत सुविधा, रस्ते व मेट्रो विकास', votes: 980, color: 'bg-amber-500' },
      { id: 'opt-4', text: 'सामाजिक व आरक्षण समीकरणे', votes: 1340, color: 'bg-purple-500' },
    ],
    totalVotes: 6590,
    isActive: true,
    createdAt: '२८ ऑगस्ट २०२६',
  },
  {
    id: 'poll-2',
    question: 'राज्यातील कृषी उत्पन्न बाजार समित्यांमध्ये (APMC) सुरू करण्यात आलेल्या डिजिटल ई-लिलाव पद्धतीचा शेतकऱ्यांना थेट फायदा होत आहे का?',
    category: 'शेतकरी व कृषी विशेष',
    options: [
      { id: 'opt-21', text: 'होय, पारदर्शकता वाढली असून योग्य भाव मिळतो', votes: 3120, color: 'bg-emerald-500' },
      { id: 'opt-22', text: 'नाही, अजूनही दलालांचे नियंत्रण कायम आहे', votes: 1450, color: 'bg-red-500' },
      { id: 'opt-23', text: 'सांगता येत नाही / मध्यम स्वरूपाचा फायदा', votes: 420, color: 'bg-slate-400' },
    ],
    totalVotes: 4990,
    isActive: true,
    createdAt: '२९ ऑगस्ट २०२६',
  },
  {
    id: 'poll-3',
    question: 'भारतीय क्रिकेट संघात युवा खेळाडूंना संधी देण्याच्या निवड समितीच्या निर्णयाशी आपण सहमत आहात का?',
    category: 'क्रीडा व क्रिकेट',
    options: [
      { id: 'opt-31', text: 'होय, भविष्यातील संघबांधणीसाठी योग्य निर्णय', votes: 4200, color: 'bg-blue-500' },
      { id: 'opt-32', text: 'नाही, ज्येष्ठ खेळाडूंची संघाला गरज आहे', votes: 1150, color: 'bg-amber-500' },
      { id: 'opt-33', text: 'सांगता येत नाही', votes: 210, color: 'bg-slate-400' },
    ],
    totalVotes: 5560,
    isActive: true,
    createdAt: '२९ ऑगस्ट २०२६',
  },
];

export class PollService {
  public static getPolls(): Poll[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_POLLS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading polls from localStorage', e);
    }
    this.savePolls(INITIAL_POLLS);
    return INITIAL_POLLS;
  }

  public static getActivePolls(): Poll[] {
    return this.getPolls().filter((p) => p.isActive);
  }

  public static getActivePoll(): Poll | null {
    const active = this.getActivePolls();
    return active[0] || this.getPolls()[0] || null;
  }

  public static savePolls(polls: Poll[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_POLLS, JSON.stringify(polls));
      window.dispatchEvent(new CustomEvent('infonews:polls-updated', { detail: polls }));
    } catch (e) {
      console.error('Error saving polls', e);
    }
  }

  public static getUserVotedOption(pollId: string): string | null {
    try {
      const votes = localStorage.getItem(STORAGE_KEY_USER_VOTES);
      if (votes) {
        const parsed = JSON.parse(votes);
        return parsed[pollId] || null;
      }
    } catch (e) {
      console.error('Error getting user voted option', e);
    }
    return null;
  }

  public static submitVote(pollId: string, optionId: string): { success: boolean; poll?: Poll } {
    const polls = this.getPolls();
    const pollIndex = polls.findIndex((p) => p.id === pollId);
    if (pollIndex === -1) return { success: false };

    const poll = { ...polls[pollIndex] };
    const optIndex = poll.options.findIndex((o) => o.id === optionId);
    if (optIndex === -1) return { success: false };

    poll.options[optIndex].votes += 1;
    poll.totalVotes += 1;
    polls[pollIndex] = poll;

    this.savePolls(polls);

    // Save user vote in localStorage
    try {
      const votesStr = localStorage.getItem(STORAGE_KEY_USER_VOTES) || '{}';
      const userVotes = JSON.parse(votesStr);
      userVotes[pollId] = optionId;
      localStorage.setItem(STORAGE_KEY_USER_VOTES, JSON.stringify(userVotes));
      window.dispatchEvent(
        new CustomEvent('infonews:poll-vote-updated', {
          detail: { pollId, optionId, poll },
        })
      );
    } catch (e) {
      console.error('Error writing user vote', e);
    }

    return { success: true, poll };
  }

  public static createPoll(poll: Omit<Poll, 'id' | 'totalVotes' | 'createdAt'>): Poll {
    const polls = this.getPolls();
    const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500', 'bg-red-500'];
    const newPoll: Poll = {
      ...poll,
      id: `poll-${Date.now()}`,
      options: poll.options.map((opt, idx) => ({
        ...opt,
        color: opt.color || colors[idx % colors.length],
      })),
      totalVotes: poll.options.reduce((sum, opt) => sum + opt.votes, 0),
      createdAt: new Date().toLocaleDateString('mr-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
    polls.unshift(newPoll);
    this.savePolls(polls);
    return newPoll;
  }

  public static deletePoll(pollId: string): Poll[] {
    const polls = this.getPolls().filter((p) => p.id !== pollId);
    this.savePolls(polls);
    return polls;
  }

  public static togglePollActive(pollId: string): Poll[] {
    const polls = this.getPolls().map((p) =>
      p.id === pollId ? { ...p, isActive: !p.isActive } : p
    );
    this.savePolls(polls);
    return polls;
  }

  public static resetPollVotes(pollId: string): Poll[] {
    const polls = this.getPolls().map((p) => {
      if (p.id !== pollId) return p;
      return {
        ...p,
        totalVotes: 0,
        options: p.options.map((opt) => ({ ...opt, votes: 0 })),
      };
    });
    this.savePolls(polls);
    return polls;
  }

  public static generateWhatsAppShareUrl(poll: Poll, votedOptionText?: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://infonewsupdate24.com';
    let text = `🗳️ *InfoNewsUpdate24 थेट जनमत चाचणी (Live Reader Poll)*\n\n📌 *प्रश्न:* ${poll.question}\n📊 *एकूण मते:* ${poll.totalVotes.toLocaleString('mr-IN')}\n`;
    if (votedOptionText) {
      text += `\n👉 *माझे मत:* "${votedOptionText}"\n`;
    }
    text += `\nतुमचे मत काय आहे? आताच मत नोंदवा व निकाल पहा:\n🔗 ${origin}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  }
}
