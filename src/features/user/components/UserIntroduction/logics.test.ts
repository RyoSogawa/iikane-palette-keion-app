import { describe, expect, it } from 'vitest';

import { hasIntroductionText } from './logics';

describe('hasIntroductionText', () => {
  it('文字のある段落があれば true', () => {
    const value = JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'よろしく' }] }],
    });

    expect(hasIntroductionText(value)).toBe(true);
  });

  it('入力して消したあとの空の段落だけなら false', () => {
    const value = JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] });

    expect(hasIntroductionText(value)).toBe(false);
  });

  it('空白だけの段落なら false', () => {
    const value = JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '  \n' }] }],
    });

    expect(hasIntroductionText(value)).toBe(false);
  });

  it('入れ子のリストの中の文字も見つける', () => {
    const value = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'ギター' }] }],
            },
          ],
        },
      ],
    });

    expect(hasIntroductionText(value)).toBe(true);
  });

  it('空文字や null なら false', () => {
    expect(hasIntroductionText('')).toBe(false);
    expect(hasIntroductionText(null)).toBe(false);
  });

  it('JSON でない文字列はそのまま文字として扱う', () => {
    expect(hasIntroductionText('昔のプレーンテキスト')).toBe(true);
  });
});
