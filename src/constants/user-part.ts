import { type PartIconType } from '@/types/generated/zod';

export const UserPartMap = {
  VOCAL: {
    icon: '🎤',
    name: 'ボーカル',
  },
  GUITAR: {
    icon: '🎸',
    name: 'ギター',
  },
  BASS: {
    icon: '🎸',
    name: 'ベース',
  },
  DRUM: {
    icon: '🥁',
    name: 'ドラム',
  },
  KEYBOARD: {
    icon: '🎹',
    name: 'キーボード',
  },
  WIND: {
    icon: '🎷',
    name: '管楽器',
  },
  STRINGS: {
    icon: '🎻',
    name: '弦楽器',
  },
  PERCUSSION: {
    icon: '🥁',
    name: '打楽器',
  },
  OTHERS: {
    icon: '🎵',
    name: 'その他',
  },
} as const satisfies Record<
  PartIconType,
  {
    name: string;
    icon: string;
  }
>;
