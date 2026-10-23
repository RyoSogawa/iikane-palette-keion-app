import { describe, expect, it } from 'vitest';

import { toLeavingHref } from './leaving-href';

const CURRENT = 'http://localhost:3000/admin/events/abc';

describe('toLeavingHref', () => {
  it('同じオリジンの別ページへのリンクは、遷移先のパスを返す', () => {
    expect(toLeavingHref('http://localhost:3000/admin/events?page=2#top', CURRENT)).toBe(
      '/admin/events?page=2#top',
    );
  });

  it('同じページ内のアンカーだけが変わるリンクはページを離れないので null を返す', () => {
    expect(toLeavingHref('http://localhost:3000/admin/events/abc#bands', CURRENT)).toBeNull();
  });

  it('別オリジンへのリンクは beforeunload に任せるので null を返す', () => {
    expect(toLeavingHref('https://drive.google.com/xxx', CURRENT)).toBeNull();
  });

  it('URL として解釈できない値は null を返す', () => {
    expect(toLeavingHref('javascript:void(0)', CURRENT)).toBeNull();
  });
});
