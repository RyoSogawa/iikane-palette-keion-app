import { describe, expect, it } from 'vitest';

import { toUserOptions } from './user-options';

const users = [
  { id: 'user-1', name: 'あおい', image: null },
  { id: 'user-2', name: null, image: null },
];

describe('toUserOptions', () => {
  it('名前を表示名にし、名前がなければ id を出す', () => {
    expect(toUserOptions(users)).toEqual([
      { value: 'user-1', label: 'あおい', disabled: false },
      { value: 'user-2', label: 'user-2', disabled: false },
    ]);
  });

  it('ほかで選ばれているユーザーは選べなくする', () => {
    expect(toUserOptions(users, ['user-2']).map((option) => option.disabled)).toEqual([
      false,
      true,
    ]);
  });
});
