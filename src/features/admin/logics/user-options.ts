export type UserOptionSource = { id: string; name: string | null; image: string | null };

/** ユーザーを選ぶ Select の選択肢。ほかで選ばれているユーザーは選べなくする */
export const toUserOptions = (users: UserOptionSource[], disabledIds: readonly string[] = []) =>
  users.map((user) => ({
    value: user.id,
    label: user.name ?? user.id,
    disabled: disabledIds.includes(user.id),
  }));
