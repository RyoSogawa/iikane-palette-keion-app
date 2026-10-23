type Size = { width: number; height: number };

const MAX_EDGE = 1200;
const QUALITY = 0.9;

export const fitWithin = (size: Size, maxEdge: number): Size => {
  const scale = Math.min(1, maxEdge / Math.max(size.width, size.height));
  return {
    width: Math.round(size.width * scale),
    height: Math.round(size.height * scale),
  };
};

const toBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));

/**
 * アップロード前に、長い辺を 1200px に縮めた WebP にする。
 * server action は 1MB を超えるリクエストを 413 で弾くので、スマホの写真をそのまま送れない。
 * 300x300 への変換はサーバーで行うので、ここでは送れる大きさにするだけ。
 */
export const resizeImageForUpload = async (file: File): Promise<File> => {
  // createImageBitmap は EXIF の向きを反映するので、スマホの写真が横倒しにならない
  const bitmap = await createImageBitmap(file);
  const { width, height } = fitWithin(bitmap, MAX_EDGE);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // WebP を書き出せないブラウザは toBlob が PNG を返す。PNG だと 1MB を超えうるので JPEG にする
  const webp = await toBlob(canvas, 'image/webp');
  const blob = webp?.type === 'image/webp' ? webp : await toBlob(canvas, 'image/jpeg');
  if (!blob) {
    throw new Error('Failed to resize image.');
  }

  const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
  return new File([blob], `avatar.${extension}`, { type: blob.type });
};
