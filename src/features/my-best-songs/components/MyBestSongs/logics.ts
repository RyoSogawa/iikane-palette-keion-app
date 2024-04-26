import { useCallback, useMemo, useState } from 'react';

import type { SongWithImage } from '@/types/types';

export const useMusicModal = (data: Array<SongWithImage>) => {
  const [openedSongId, setOpenedSongId] = useState<string | null>(null);

  const handleOpen = useCallback(
    (id: string) => () => {
      setOpenedSongId(id);
    },
    [],
  );

  const handleClose = useCallback(() => {
    setOpenedSongId(null);
  }, []);

  const openedSong = useMemo(
    () => data.find((song) => song.id === openedSongId),
    [data, openedSongId],
  );

  const nextSongExists = useMemo(() => {
    const currentIndex = data.findIndex((song) => song.id === openedSongId);
    return currentIndex < data.length - 1;
  }, [data, openedSongId]);

  const prevSongExists = useMemo(() => {
    const currentIndex = data.findIndex((song) => song.id === openedSongId);
    return currentIndex > 0;
  }, [data, openedSongId]);

  const openNext = useCallback(() => {
    const currentIndex = data.findIndex((song) => song.id === openedSongId);
    const nextIndex = currentIndex === data.length - 1 ? 0 : currentIndex + 1;
    setOpenedSongId(data[nextIndex]?.id ?? null);
  }, [data, openedSongId]);

  const openPrev = useCallback(() => {
    const currentIndex = data.findIndex((song) => song.id === openedSongId);
    const prevIndex = currentIndex === 0 ? data.length - 1 : currentIndex - 1;
    setOpenedSongId(data[prevIndex]?.id ?? null);
  }, [data, openedSongId]);

  return {
    openedSong,
    isOpen: openedSongId !== null,
    handleOpen,
    handleClose,
    nextSongExists,
    prevSongExists,
    openNext,
    openPrev,
  };
};
