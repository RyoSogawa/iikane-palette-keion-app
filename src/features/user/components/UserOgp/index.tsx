import React from 'react';

import { type User } from '@/types/generated/zod';
import { type SongWithImage } from '@/types/types';

const wrapperStyle: React.CSSProperties = {
  position: 'relative',
  fontSize: 40,
  color: 'white',
  background: '#242424',
  width: '100%',
  height: '100%',
  textAlign: 'center',
  paddingLeft: 320,
  justifyContent: 'center',
  alignItems: 'center',
  display: 'flex',
};

const userStyle: React.CSSProperties = {
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: 320,
  padding: '0 24px',
  top: '50%',
  left: 0,
  transform: 'translateY(-50%)',
  zIndex: 1,
};

const avatarStyle: React.CSSProperties = {
  width: 100,
  height: 100,
  borderRadius: '50%',
};

const songsWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  transform: 'translate(0, -12px)',
  width: '100%',
  height: '100%',
};

const songImageStyle: React.CSSProperties = {
  width: 120,
  height: 120,
  borderRadius: 8,
};

export type UserOgpProps = {
  user: Pick<User, 'name' | 'image' | 'nickname'>;
  myBestSongs: Array<Pick<SongWithImage, 'image' | 'name'>>;
};

/**
 * @note edge上で実行されるため、Reactのコンポーネント等を使うことはできない
 */
const UserOgp: React.FC<UserOgpProps> = ({ myBestSongs, user }) => {
  return (
    <div style={wrapperStyle}>
      <div style={songsWrapperStyle}>
        {myBestSongs.map((song) => (
          <img
            key={song.name}
            src={song.image}
            alt={song.name}
            style={songImageStyle}
            tw="shadow"
          />
        ))}
      </div>
      <div style={userStyle}>
        <img src={user?.image ?? ''} style={avatarStyle} />
        {user?.name}
      </div>
    </div>
  );
};

export default UserOgp;
