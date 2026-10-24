type Size = { width: number; height: number };

const DEFAULT_MAX_EDGE = 1200;
// Server Action の 1MB には画像以外の項目も含まれるので、少し余裕を残す
const MAX_BYTES = 900 * 1024;
const QUALITIES = [0.9, 0.8, 0.7];

export const fitWithin = (size: Size, maxEdge: number): Size => {
  const scale = Math.min(1, maxEdge / Math.max(size.width, size.height));
  return {
    width: Math.round(size.width * scale),
    height: Math.round(size.height * scale),
  };
};

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

// WebP を書き出せないブラウザは toBlob が PNG を返す。PNG だと 1MB を超えうるので JPEG にする
const encode = async (canvas: HTMLCanvasElement, quality: number) => {
  const webp = await toBlob(canvas, 'image/webp', quality);
  return webp?.type === 'image/webp' ? webp : toBlob(canvas, 'image/jpeg', quality);
};

const encodeWithinLimit = async (canvas: HTMLCanvasElement) => {
  for (const quality of QUALITIES) {
    const blob = await encode(canvas, quality);
    if (!blob || blob.size <= MAX_BYTES) return blob;
  }
  throw new Error('画像が大きすぎます');
};

/**
 * アップロード前に、長い辺を maxEdge に縮めた WebP にする。
 * server action は 1MB を超えるリクエストを 413 で弾くので、スマホの写真をそのまま送れない。
 * 収まらなければ画質を下げて書き出し直す。
 * 用途ごとの大きさへの変換はサーバーで行うので、ここでは送れる大きさにするだけ。
 */
export const resizeImageForUpload = async (
  file: File,
  maxEdge = DEFAULT_MAX_EDGE,
): Promise<File> => {
  // createImageBitmap は EXIF の向きを反映するので、スマホの写真が横倒しにならない
  const bitmap = await createImageBitmap(file);
  const { width, height } = fitWithin(bitmap, maxEdge);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await encodeWithinLimit(canvas);
  if (!blob) {
    throw new Error('Failed to resize image.');
  }

  const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
  return new File([blob], `image.${extension}`, { type: blob.type });
};
