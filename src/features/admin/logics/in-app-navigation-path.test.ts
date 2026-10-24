import { describe, expect, it } from 'vitest';

import { toInAppNavigationPath } from './in-app-navigation-path';

const CURRENT = 'http://localhost:3000/admin/events/abc';

describe('toInAppNavigationPath', () => {
  it('同じオリジンの別ページへのリンクは、遷移先のパスを返す', () => {
    expect(toInAppNavigationPath('http://localhost:3000/admin/events?page=2#top', CURRENT)).toBe(
      '/admin/events?page=2#top',
    );
  });

  it('同じページ内のアンカーだけが変わるリンクはページを離れないので null を返す', () => {
    expect(
      toInAppNavigationPath('http://localhost:3000/admin/events/abc#bands', CURRENT),
    ).toBeNull();
  });

  it('別オリジンへのリンクは beforeunload に任せるので null を返す', () => {
    expect(toInAppNavigationPath('https://drive.google.com/xxx', CURRENT)).toBeNull();
  });

  it('URL として解釈できない値は null を返す', () => {
    expect(toInAppNavigationPath('http://[', CURRENT)).toBeNull();
  });

  it('javascript: などオリジンを持たない URL は null を返す', () => {
    expect(toInAppNavigationPath('javascript:void(0)', CURRENT)).toBeNull();
  });
});
