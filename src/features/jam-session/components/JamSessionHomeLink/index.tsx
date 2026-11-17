'use client';

import React from 'react';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

/**
 * トップページの「セッション」のリンク。ログインしている人にだけ出す。
 * サーバーでセッションを読むとトップページが静的に作れなくなるので、画面側で出し分ける。
 */
const JamSessionHomeLink: React.FC = () => {
  const { status } = useSession();
  if (status !== 'authenticated') return null;

  return (
    <li>
      <Link href="/jam-session">セッション</Link>
    </li>
  );
};

export default JamSessionHomeLink;
