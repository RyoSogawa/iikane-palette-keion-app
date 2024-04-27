import React from 'react';

import { type User } from '@/types/generated/zod';
import { type SongWithImage } from '@/types/types';

export type UserOgpProps = {
  user: Pick<User, 'name' | 'image' | 'nickname'>;
  myBestSongs: Array<Pick<SongWithImage, 'image' | 'name'>>;
};

/**
 * @note edge上で実行されるため、Reactのコンポーネント等を使うことはできない
 */
const UserOgp: React.FC<UserOgpProps> = ({ myBestSongs, user }) => {
  return (
    <div
      style={{
        fontSize: 40,
        color: 'black',
        background: '#242424',
        width: '100%',
        height: '100%',
        padding: '50px 200px',
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
      }}
    >
      <img src={user?.image ?? ''} />
      {user?.name}
      👋 {myBestSongs[0]?.name}
      <img src={myBestSongs[0]?.image} />
    </div>
  );
};

export default UserOgp;
