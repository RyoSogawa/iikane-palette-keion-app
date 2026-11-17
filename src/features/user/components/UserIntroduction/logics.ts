type TiptapNode = {
  text?: string;
  content?: TiptapNode[];
};

const containsText = (node: TiptapNode): boolean =>
  Boolean(node.text?.trim()) || (node.content ?? []).some(containsText);

/**
 * プロフィール文（Tiptap の JSON 文字列）に読める文字があるか。
 * エディタで入力して消すと空の段落だけの JSON が保存され、文字列としては空にならないので中身を見る。
 * JSON でない値は従来どおり表示に回すため true にする。
 */
export const hasIntroductionText = (value: string | null): boolean => {
  if (!value) return false;
  try {
    return containsText(JSON.parse(value) as TiptapNode);
  } catch {
    return true;
  }
};
