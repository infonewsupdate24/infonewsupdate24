import {
  DistrictInfo,
  MAHARASHTRA_DISTRICTS,
  GADCHIROLI_TALUKAS,
  TalukaInfo,
} from '../data/maharashtraDistricts';
import { Post } from '../types';

export class HyperlocalNewsService {
  public static getAllDistricts(): DistrictInfo[] {
    return MAHARASHTRA_DISTRICTS;
  }

  public static getGadchiroliTalukas(): TalukaInfo[] {
    return GADCHIROLI_TALUKAS;
  }

  public static getDistrictById(districtId: string): DistrictInfo | undefined {
    return MAHARASHTRA_DISTRICTS.find((d) => d.id === districtId);
  }

  public static getTalukaById(
    districtId: string,
    talukaId: string
  ): TalukaInfo | undefined {
    const dist = this.getDistrictById(districtId);
    if (!dist) return undefined;
    return dist.talukas.find((t) => t.id === talukaId);
  }

  /**
   * Smart matches a news post with a district and optional taluka
   */
  public static isPostMatchingLocation(
    post: Post,
    districtId?: string | null,
    talukaId?: string | null
  ): boolean {
    if (!districtId || districtId === 'ALL') return true;

    const district = this.getDistrictById(districtId);
    if (!district) return true;

    const postContentSearchable = [
      post.title,
      post.excerpt,
      post.content,
      post.location,
      ...(post.tags || []),
      post.slug,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    // 1. If a specific taluka is selected:
    if (talukaId && talukaId !== 'ALL_TALUKAS') {
      const taluka = district.talukas.find((t) => t.id === talukaId);
      if (taluka) {
        const talukaKeywords = [
          taluka.nameMr.toLowerCase(),
          taluka.nameEn.toLowerCase(),
          ...taluka.aliases.map((a) => a.toLowerCase()),
        ];
        return talukaKeywords.some((kw) => postContentSearchable.includes(kw));
      }
    }

    // 2. If district is selected without specific taluka:
    // Match district aliases or any of its talukas
    const districtKeywords = [
      district.nameMr.toLowerCase(),
      district.nameEn.toLowerCase(),
      ...district.aliases.map((a) => a.toLowerCase()),
      ...district.talukas.flatMap((t) => [
        t.nameMr.toLowerCase(),
        t.nameEn.toLowerCase(),
        ...t.aliases.map((a) => a.toLowerCase()),
      ]),
    ];

    return districtKeywords.some((kw) => postContentSearchable.includes(kw));
  }

  /**
   * Filters an array of news posts by district and taluka
   */
  public static filterPosts(
    posts: Post[],
    districtId?: string | null,
    talukaId?: string | null
  ): Post[] {
    if (!districtId || districtId === 'ALL') return posts;

    return posts.filter((post) =>
      this.isPostMatchingLocation(post, districtId, talukaId)
    );
  }

  /**
   * Returns count of posts for a given district or taluka
   */
  public static getPostCount(
    posts: Post[],
    districtId?: string | null,
    talukaId?: string | null
  ): number {
    return this.filterPosts(posts, districtId, talukaId).length;
  }
}
