import { type FieldValues, type Path, type UseFormSetError } from 'react-hook-form';
import { type ZodError } from 'zod';

/**
 * サーバーと同じスキーマで検証したエラーを、フォームの各項目に表示する。
 * 配列など値の一部だけを検証したときは prefix にそのフィールド名を渡す。全体へのエラーは prefix の root に出す。
 */
export const setSchemaErrors = <T extends FieldValues>(
  error: ZodError,
  setError: UseFormSetError<T>,
  prefix?: string,
) => {
  error.issues.forEach((issue) => {
    const path = [prefix, ...issue.path].filter((key) => key !== undefined).join('.');
    if (path === prefix) {
      setError(`${prefix}.root` as Path<T>, { message: issue.message });
    } else if (path !== '') {
      setError(path as Path<T>, { message: issue.message });
    }
  });
};
