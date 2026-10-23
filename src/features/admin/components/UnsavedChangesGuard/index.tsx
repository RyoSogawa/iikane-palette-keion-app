'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { Button, Group, Modal, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';

import { toLeavingHref } from '@/features/admin/logics/leaving-href';

type SetDirty = (id: string, isDirty: boolean) => void;

const UnsavedChangesContext = createContext<SetDirty>(() => undefined);

/** 編集中で未保存の変更があることをガードに伝える。アンマウントすると取り消す */
export const useUnsavedChanges = (isDirty: boolean) => {
  const setDirty = useContext(UnsavedChangesContext);
  const id = useId();

  useEffect(() => {
    setDirty(id, isDirty);
    return () => setDirty(id, false);
  }, [id, isDirty, setDirty]);
};

const isPlainLeftClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

const findAnchor = (event: MouseEvent) => {
  const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target === '_blank' || anchor.hasAttribute('download')) return null;
  return anchor;
};

/**
 * 未保存の変更があるまま別ページへ移ろうとしたら確認する。
 * App Router には遷移を止める API がないので、リンクのクリックを document の capture で先に拾い、
 * next/link の遷移より前に止めてからモーダルで確認する。リロード・タブを閉じる・外部リンクは beforeunload で確認する。
 * ブラウザの戻る・進むは止められない。
 */
const UnsavedChangesGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  // クリックのリスナーから最新の値を読むため state ではなく ref に持つ
  const dirtyIds = useRef<ReadonlySet<string>>(new Set());
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const setDirty = useCallback<SetDirty>((id, isDirty) => {
    const others = [...dirtyIds.current].filter((dirtyId) => dirtyId !== id);
    dirtyIds.current = new Set(isDirty ? [...others, id] : others);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (dirtyIds.current.size === 0 || !isPlainLeftClick(event)) return;
      const anchor = findAnchor(event);
      const href = anchor ? toLeavingHref(anchor.href, window.location.href) : null;
      if (!href) return;
      event.preventDefault();
      event.stopPropagation();
      setPendingHref(href);
    };
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirtyIds.current.size === 0) return;
      event.preventDefault();
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleStay = useCallback(() => setPendingHref(null), []);
  const handleLeave = useCallback(() => {
    if (pendingHref) router.push(pendingHref);
    setPendingHref(null);
  }, [pendingHref, router]);

  return (
    <UnsavedChangesContext.Provider value={setDirty}>
      {children}
      <Modal
        opened={pendingHref !== null}
        title="保存していない変更があります"
        centered
        onClose={handleStay}
      >
        <Text size="sm">このページを離れると、保存していない変更は失われます。</Text>
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={handleStay}>
            編集を続ける
          </Button>
          <Button color="red" onClick={handleLeave}>
            破棄して移動
          </Button>
        </Group>
      </Modal>
    </UnsavedChangesContext.Provider>
  );
};

export default UnsavedChangesGuard;
