import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { setSchemaErrors } from './form-errors';

const errorOf = (schema: z.ZodTypeAny, value: unknown) => {
  const result = schema.safeParse(value);
  if (result.success) throw new Error('検証が通ってしまった');
  return result.error;
};

describe('setSchemaErrors', () => {
  it('項目ごとのエラーを、その項目のパスに出す', () => {
    const setError = vi.fn();

    setSchemaErrors(errorOf(z.object({ name: z.string().min(1, '必須') }), { name: '' }), setError);

    expect(setError).toHaveBeenCalledWith('name', { message: '必須' });
  });

  it('配列の中のエラーは、prefix をつけた入れ子のパスに出す', () => {
    const setError = vi.fn();
    const schema = z.array(z.object({ userId: z.string().min(1, '必須') }));

    setSchemaErrors(errorOf(schema, [{ userId: 'a' }, { userId: '' }]), setError, 'members');

    expect(setError).toHaveBeenCalledWith('members.1.userId', { message: '必須' });
  });

  it('配列全体へのエラーは、prefix の root に出す', () => {
    const setError = vi.fn();
    const schema = z.array(z.string()).max(1, '多すぎます');

    setSchemaErrors(errorOf(schema, ['a', 'b']), setError, 'members');

    expect(setError).toHaveBeenCalledWith('members.root', { message: '多すぎます' });
  });
});
