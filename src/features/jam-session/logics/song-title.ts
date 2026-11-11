type SongNames = { name: string | null; artist: string | null };

/** 一覧での曲名。曲名の無い曲は「やりたいアーティスト」として挙がったものなので、そう読める形にする */
export const songTitle = ({ name, artist }: SongNames) => name ?? `${artist ?? ''} の曲なにか`;

export const songSubtitle = ({ name, artist }: SongNames) => (name ? artist : null);
