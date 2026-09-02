export interface StoredMediaUpload {
  downloadUrl: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
}

const CLOUDINARY_CLOUD_NAME = 'xbsim5b5';
const CLOUDINARY_UPLOAD_PRESET = 'infonewsupdate24_media';
const CLOUDINARY_UPLOAD_ENDPOINT =
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

interface CloudinaryUploadResponse {
  secure_url?: string;
  public_id?: string;
  resource_type?: string;
  bytes?: number;
  format?: string;
  error?: {
    message?: string;
  };
}

function sanitizeFileName(name: string): string {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || `media-${Date.now()}`;
}

async function uploadToCloudinary(
  fileOrBlob: File | Blob,
  fileName: string,
  mimeType: string
): Promise<StoredMediaUpload> {
  const safeName = sanitizeFileName(fileName);
  const formData = new FormData();

  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('file', fileOrBlob, safeName);

  const response = await fetch(CLOUDINARY_UPLOAD_ENDPOINT, {
    method: 'POST',
    body: formData,
  });

  let payload: CloudinaryUploadResponse;
  try {
    payload = (await response.json()) as CloudinaryUploadResponse;
  } catch {
    throw new Error(
      `Cloudinary upload failed (${response.status} ${response.statusText || 'Unknown error'}).`
    );
  }

  if (!response.ok || !payload.secure_url || !payload.public_id) {
    throw new Error(
      payload.error?.message ||
        `Cloudinary upload failed (${response.status} ${response.statusText || 'Unknown error'}).`
    );
  }

  return {
    downloadUrl: payload.secure_url,
    storagePath: payload.public_id,
    mimeType: mimeType || fileOrBlob.type || 'application/octet-stream',
    sizeBytes:
      typeof payload.bytes === 'number' && payload.bytes >= 0
        ? payload.bytes
        : fileOrBlob.size,
  };
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, payload] = dataUrl.split(',', 2);
  if (!header || payload === undefined) {
    throw new Error('Invalid optimized image data.');
  }

  const mimeMatch = header.match(/^data:([^;]+)(;base64)?$/i);
  const mimeType = mimeMatch?.[1] || 'application/octet-stream';
  const isBase64 = Boolean(mimeMatch?.[2]);

  if (isBase64) {
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
  }

  return new Blob([decodeURIComponent(payload)], { type: mimeType });
}

export async function uploadMediaFileToStorage(file: File): Promise<StoredMediaUpload> {
  return uploadToCloudinary(
    file,
    file.name,
    file.type || 'application/octet-stream'
  );
}

export async function uploadMediaBlobToStorage(
  blob: Blob,
  originalName: string,
  mimeType: string
): Promise<StoredMediaUpload> {
  return uploadToCloudinary(
    blob,
    originalName,
    mimeType || blob.type || 'application/octet-stream'
  );
}
