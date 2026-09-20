/**
 * Image upload helpers — convert a picked file into a compact data URL.
 *
 * Images are resized and re-encoded as JPEG in the browser before being
 * stored, so menu item images stay small enough for localStorage and the
 * in-memory backend (a raw phone photo would blow past the ~5 MB quota).
 */

/** Max stored dimensions (longest edge) and quality used when re-encoding. */
const MAX_EDGE = 800;
const JPEG_QUALITY = 0.82;

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB raw file limit

/** Human-readable list of accepted types, for UI hints. */
export const ACCEPTED_LABEL = 'JPG, PNG, WebP or GIF';

/**
 * Read an image file and return { dataUrl, width, height, size }.
 * Throws Error with a user-facing message when the file is not valid.
 */
export function fileToImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected.'));
      return;
    }
    if (!ACCEPTED.includes(file.type)) {
      reject(new Error(`Unsupported file type. Please choose ${ACCEPTED_LABEL}.`));
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      reject(new Error(`Image is too large (max ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB).`));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

/**
 * Load a data URL (or any image src) into an HTMLImageElement.
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('The selected file is not a valid image.'));
    img.src = src;
  });
}

/** Is this content type already a compact format we can store as-is? */
function isStorableDirectly(file) {
  return file.size <= 300 * 1024 && (file.type === 'image/jpeg' || file.type === 'image/webp');
}

/**
 * Convert a picked file to a storable data URL:
 * small JPEG/WebP files pass through unchanged; anything else is resized
 * (longest edge ≤ MAX_EDGE) and re-encoded as JPEG.
 */
export async function fileToStoredDataUrl(file) {
  const dataUrl = await fileToImage(file);

  // Small already-compressed images are stored as-is (keeps GIFs animated too).
  if (isStorableDirectly(file)) return dataUrl;

  const img = await loadImage(dataUrl);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}
