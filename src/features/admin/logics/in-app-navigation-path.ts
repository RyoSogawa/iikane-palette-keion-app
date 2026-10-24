/**
 * クリックされたリンクがアプリ内の別ページへの遷移なら、router.push に渡すパスを返す。
 * 別オリジンはページごと離れるので beforeunload の確認に任せ、ここでは扱わない。
 */
export const toInAppNavigationPath = (href: string, currentHref: string): string | null => {
  const current = new URL(currentHref);
  const next = URL.canParse(href, current) ? new URL(href, current) : null;
  if (next?.origin !== current.origin) return null;
  if (next.pathname === current.pathname && next.search === current.search) return null;
  return `${next.pathname}${next.search}${next.hash}`;
};
