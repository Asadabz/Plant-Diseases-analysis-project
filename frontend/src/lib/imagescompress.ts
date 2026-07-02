// frontend/src/lib/imagescompress.ts

/**
 * Camera/gallery se li gayi image ko resize aur compress karta hai
 * taaki low-memory phones par crash na ho aur upload fast ho.
 *
 * Note: FileReader.readAsDataURL() ki jagah createObjectURL() use kiya hai —
 * ye zyada reliable hai aur bade images pe fail nahi hota.
 */
export function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // aspect ratio maintain karte hue resize
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      // object URL ko turant revoke karo memory free karne ke liye
      URL.revokeObjectURL(objectUrl);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Compression failed: canvas could not export blob'));
          }
          // canvas memory free karo
          canvas.width = 0;
          canvas.height = 0;
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image load failed: file may not be a valid image'));
    };

    img.src = objectUrl;
  });
}