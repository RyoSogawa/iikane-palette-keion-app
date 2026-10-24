import { describe, expect, it } from 'vitest';

import { fitWithin } from './resize-image';

describe('fitWithin', () => {
  it.each([
    ['横長', { width: 4000, height: 3000 }, { width: 1200, height: 900 }],
    ['縦長', { width: 3000, height: 4000 }, { width: 900, height: 1200 }],
    ['正方形', { width: 2400, height: 2400 }, { width: 1200, height: 1200 }],
  ])('%s の画像は長い辺を 1200px にし、縦横比を保つ', (_, size, expected) => {
    expect(fitWithin(size, 1200)).toEqual(expected);
  });

  it('上限以下の画像は大きさを変えない', () => {
    expect(fitWithin({ width: 800, height: 600 }, 1200)).toEqual({ width: 800, height: 600 });
  });

  it('縮めた結果の端数は四捨五入する', () => {
    expect(fitWithin({ width: 4032, height: 3024 }, 1200)).toEqual({ width: 1200, height: 900 });
    expect(fitWithin({ width: 3000, height: 1999 }, 1200)).toEqual({ width: 1200, height: 800 });
  });
});
