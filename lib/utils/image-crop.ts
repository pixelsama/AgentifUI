// --- BEGIN COMMENT ---
// 图片裁切工具函数
// 用于将裁切区域转换为实际的图片文件
// --- END COMMENT ---

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

// --- BEGIN COMMENT ---
// 创建裁切后的图片
// --- END COMMENT ---
export const createCroppedImage = async (
  imageSrc: string,
  pixelCrop: Area,
  fileName = 'cropped-image.jpg',
  quality = 0.9
): Promise<File> => {
  const image = new Image();
  image.crossOrigin = 'anonymous';

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Cannot create canvas context'));
        return;
      }

      // 设置canvas尺寸为裁切区域尺寸
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      // 绘制裁切后的图片
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      // 转换为Blob，然后转为File
      canvas.toBlob(
        blob => {
          if (!blob) {
            reject(new Error('Canvas conversion failed'));
            return;
          }

          const file = new File([blob], fileName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          resolve(file);
        },
        'image/jpeg',
        quality
      );
    };

    image.onerror = () => {
      reject(new Error('Image loading failed'));
    };

    image.src = imageSrc;
  });
};

// --- BEGIN COMMENT ---
// 获取图片的自然尺寸
// --- END COMMENT ---
export const getImageDimensions = (
  imageSrc: string
): Promise<{
  width: number;
  height: number;
}> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };
    image.onerror = () => {
      reject(new Error('Cannot get image dimensions'));
    };
    image.src = imageSrc;
  });
};
