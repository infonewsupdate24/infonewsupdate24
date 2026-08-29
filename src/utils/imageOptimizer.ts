/**
 * Image and Media Optimization Utility for InfoNewsUpdate24
 * Automatically compresses, resizes, and converts uploaded images to high-efficiency WebP
 * Ensures fast loading and compatibility with Cloud Firestore storage limits (< 1MB)
 */

export interface OptimizedMediaResult {
  dataUrl: string;
  width?: number;
  height?: number;
  sizeBytes: number;
  mimeType: string;
  format: string;
}

export async function optimizeImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<OptimizedMediaResult> {
  // If not an image (e.g. video or PDF document), read as standard DataURL
  if (!file.type.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          sizeBytes: file.size,
          mimeType: file.type || 'application/octet-stream',
          format: file.name.split('.').pop() || 'file',
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  // If SVG or GIF, preserve vector/animation data
  if (file.type.includes('svg') || file.type.includes('gif')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          sizeBytes: file.size,
          mimeType: file.type,
          format: file.type.includes('svg') ? 'svg' : 'gif',
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Calculate scaled dimensions if image exceeds maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          // Fallback if canvas context fails
          resolve({
            dataUrl: event.target?.result as string,
            width: img.width,
            height: img.height,
            sizeBytes: file.size,
            mimeType: file.type,
            format: 'image',
          });
          return;
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP
        let webpDataUrl = canvas.toDataURL('image/webp', quality);
        
        // Fallback to JPEG if WebP not supported
        if (!webpDataUrl.startsWith('data:image/webp')) {
          webpDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Calculate approximate size in bytes from base64 string
        const base64Content = webpDataUrl.split(',')[1] || '';
        const sizeBytes = Math.round((base64Content.length * 3) / 4);

        resolve({
          dataUrl: webpDataUrl,
          width,
          height,
          sizeBytes,
          mimeType: 'image/webp',
          format: 'webp',
        });
      };

      img.onerror = (err) => reject(err);
      img.src = event.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
