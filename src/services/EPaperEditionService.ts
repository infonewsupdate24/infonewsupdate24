import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { uploadMediaFileToStorage } from './MediaStorageService';

export type EPaperEditionStatus = 'DRAFT' | 'PUBLISHED';

export interface StoredEPaperEdition {
  id: string;
  districtCode: string;
  districtName: string;
  publicationDate: string;
  title: string;
  status: EPaperEditionStatus;
  pdfUrl: string;
  storagePath: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  totalPages?: number;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  publishedAt?: unknown;
}

export interface EPaperDistrict {
  code: string;
  name: string;
  isActive: boolean;
  displayOrder: number;
}

const EDITIONS_COLLECTION = 'epaper_editions';
const DISTRICTS_COLLECTION = 'epaper_districts';
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const sortEditions = (items: StoredEPaperEdition[]) =>
  [...items].sort((a, b) => b.publicationDate.localeCompare(a.publicationDate));

export class EPaperEditionService {
  static subscribePublished(onUpdate: (items: StoredEPaperEdition[]) => void): Unsubscribe {
    const editionsQuery = query(
      collection(db, EDITIONS_COLLECTION),
      where('status', '==', 'PUBLISHED')
    );
    return onSnapshot(editionsQuery, (snapshot) => {
      onUpdate(sortEditions(snapshot.docs.map((item) => item.data() as StoredEPaperEdition)));
    });
  }

  static subscribeAll(onUpdate: (items: StoredEPaperEdition[]) => void): Unsubscribe {
    return onSnapshot(collection(db, EDITIONS_COLLECTION), (snapshot) => {
      onUpdate(sortEditions(snapshot.docs.map((item) => item.data() as StoredEPaperEdition)));
    });
  }

  static subscribeDistricts(onUpdate: (items: EPaperDistrict[]) => void): Unsubscribe {
    return onSnapshot(collection(db, DISTRICTS_COLLECTION), (snapshot) => {
      const districts = snapshot.docs
        .map((item) => item.data() as EPaperDistrict)
        .filter((item) => item.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder);
      onUpdate(districts.length ? districts : [this.defaultDistrict]);
    });
  }

  static readonly defaultDistrict: EPaperDistrict = {
    code: 'gadchiroli',
    name: 'गडचिरोली',
    isActive: true,
    displayOrder: 1,
  };

  static async ensureDefaultDistrict(): Promise<void> {
    await setDoc(
      doc(db, DISTRICTS_COLLECTION, this.defaultDistrict.code),
      this.defaultDistrict,
      { merge: true }
    );
  }

  static async saveDistrict(district: EPaperDistrict): Promise<void> {
    await setDoc(doc(db, DISTRICTS_COLLECTION, district.code), district, { merge: true });
  }

  static validatePdf(file: File): void {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('फक्त PDF file upload करा.');
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      throw new Error('PDF file 25 MB पेक्षा लहान असावी.');
    }
  }

  static async createEdition(
    input: { district: EPaperDistrict; publicationDate: string; title: string; file: File },
    onProgress: (value: number) => void
  ): Promise<StoredEPaperEdition> {
    this.validatePdf(input.file);
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('E-paper upload करण्यासाठी पुन्हा login करा.');

    const id = `${input.district.code}-${input.publicationDate}`;
    const existingEdition = await getDoc(doc(db, EDITIONS_COLLECTION, id));
    if (existingEdition.exists()) {
      throw new Error('या district आणि तारखेचा अंक आधीपासून आहे. आधी तो delete करा.');
    }
    onProgress(10);
    const uploaded = await uploadMediaFileToStorage(input.file);
    onProgress(90);
    const edition: StoredEPaperEdition = {
      id,
      districtCode: input.district.code,
      districtName: input.district.name,
      publicationDate: input.publicationDate,
      title: input.title.trim() || `${input.district.name} ई-पेपर`,
      status: 'DRAFT',
      pdfUrl: uploaded.downloadUrl,
      storagePath: uploaded.storagePath,
      fileName: input.file.name,
      fileSizeBytes: input.file.size,
      mimeType: 'application/pdf',
      createdBy: uid,
    };

    await setDoc(doc(db, EDITIONS_COLLECTION, id), {
      ...edition,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    onProgress(100);
    return edition;
  }

  static async setPublished(edition: StoredEPaperEdition, published: boolean): Promise<void> {
    await updateDoc(doc(db, EDITIONS_COLLECTION, edition.id), {
      status: published ? 'PUBLISHED' : 'DRAFT',
      publishedAt: published ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteEdition(edition: StoredEPaperEdition): Promise<void> {
    await deleteDoc(doc(db, EDITIONS_COLLECTION, edition.id));
  }
}
