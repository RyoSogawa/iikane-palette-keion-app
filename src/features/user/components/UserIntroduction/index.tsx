'use client';

import React, { useEffect, useState } from 'react';

import { Anchor, Box } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';

import EditorViewer from '@/ui/components/input/EditorViewer';

import s from './style.module.css';

export type UserIntroductionProps = {
  value: string;
};

/**
 * メンバーのプロフィール文（Tiptap の JSON 文字列）。SNS の自己紹介のように最初の 5 行だけ見せ、「続きを読む」で全文を開く。
 * Spoiler の高さ指定だと行の途中で切れるので、line-clamp で畳んではみ出たかどうかを実寸で判定する。
 */
const UserIntroduction: React.FC<UserIntroductionProps> = ({ value }) => {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  // 本文はマウント後に描画される（immediatelyRender: false）ので、高さの変化を拾って判定し直す
  const { ref, height, width } = useElementSize<HTMLDivElement>();

  useEffect(() => {
    if (expanded || !ref.current) return;
    setOverflowing(ref.current.scrollHeight > ref.current.clientHeight);
  }, [expanded, height, width, ref]);

  return (
    <div>
      <Box ref={ref} className={`${s.body} ${expanded ? '' : s.clamped}`}>
        <EditorViewer value={value} />
      </Box>
      {overflowing && (
        <Anchor
          component="button"
          type="button"
          fz="sm"
          mt={4}
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? '閉じる' : '続きを読む'}
        </Anchor>
      )}
    </div>
  );
};

export default UserIntroduction;
