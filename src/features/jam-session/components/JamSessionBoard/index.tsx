'use client';

import React, { useMemo, useState } from 'react';

import { Container, Divider, Space, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import AddSongModal from '@/features/jam-session/components/AddSongModal';
import PersonModal from '@/features/jam-session/components/PersonModal';
import PresenceSection from '@/features/jam-session/components/PresenceSection';
import ProfileModal from '@/features/jam-session/components/ProfileModal';
import SharedArtists from '@/features/jam-session/components/SharedArtists';
import SongList from '@/features/jam-session/components/SongList';
import SongModal from '@/features/jam-session/components/SongModal';
import { useJamSessionBoard } from '@/features/jam-session/hooks/useJamSessionBoard';
import { useJamSessionMutations } from '@/features/jam-session/hooks/useJamSessionMutations';
import { artistKey } from '@/server/api/routers/jam-session/shared-artists';
import StickyBottomButton from '@/ui/components/button/StickyBottomButton';

import type { JamSessionBoard as Board } from '@/features/jam-session/types';

type Dialog =
  | { kind: 'profile' }
  | { kind: 'person'; userId: string }
  | { kind: 'song'; songId: string }
  | { kind: 'addSong'; artist?: string }
  | null;

export type JamSessionBoardProps = {
  initialData: Board;
};

/** セッションページの本体。スマホ幅だけを設計し、PC では同じ幅のまま中央に出す */
const JamSessionBoard: React.FC<JamSessionBoardProps> = ({ initialData }) => {
  const { participants, songs, viewer, participantsById } = useJamSessionBoard(initialData);
  const mutations = useJamSessionMutations();
  const { run, isPending } = mutations;
  const [dialog, setDialog] = useState<Dialog>(null);
  const close = () => setDialog(null);
  const openProfile = () => setDialog({ kind: 'profile' });

  const existingSpotifyIds = useMemo(
    () => new Set(songs.flatMap(({ spotifyId }) => (spotifyId ? [spotifyId] : []))),
    [songs],
  );
  // 曲名の無い「<アーティスト名> の曲なにか」が挙がっているアーティスト。チップは残し、印だけ付ける
  const listedArtists = useMemo(
    () =>
      new Set(songs.flatMap(({ name, artist }) => (!name && artist ? [artistKey(artist)] : []))),
    [songs],
  );
  const selectedSong =
    dialog?.kind === 'song' ? songs.find(({ id }) => id === dialog.songId) : undefined;
  const selectedPerson =
    dialog?.kind === 'person' ? participantsById.get(dialog.userId) : undefined;

  // 待っている間に別のポップアップへ移っていたら、そちらは閉じない
  const closeOnSuccess = (promise: Promise<unknown>) => {
    const openedDialog = dialog;
    void run(promise).then(
      (ok) => ok && setDialog((current) => (current === openedDialog ? null : current)),
    );
  };

  return (
    <Container size={480} px={12} py={12}>
      <Stack gap="md">
        <PresenceSection
          participants={participants}
          viewer={viewer}
          isPending={mutations.leave.isPending}
          onSelectPerson={(userId) => setDialog({ kind: 'person', userId })}
          onOpenProfile={openProfile}
          onLeave={() => void run(mutations.leave.mutateAsync())}
        />
        <SharedArtists
          participantsById={participantsById}
          listedArtists={listedArtists}
          onSelect={(artist) =>
            setDialog(viewer.isActive ? { kind: 'addSong', artist } : { kind: 'profile' })
          }
        />
        <Divider />
        <SongList
          songs={songs}
          participantsById={participantsById}
          viewerId={viewer.userId}
          onSelectSong={(songId) => setDialog({ kind: 'song', songId })}
        />
      </Stack>

      {/* My Best Songs の「追加」と同じく、一覧の下に付いてスクロール中は画面の下に留まるボタンにする */}
      <StickyBottomButton
        mt={32}
        onClick={() => setDialog(viewer.isActive ? { kind: 'addSong' } : { kind: 'profile' })}
      >
        <IconPlus size={16} />
        <Space w={4} />
        やりたい曲を挙げる
      </StickyBottomButton>

      <ProfileModal
        opened={dialog?.kind === 'profile'}
        profile={viewer.profile}
        isActive={viewer.isActive}
        isPending={mutations.join.isPending}
        onClose={close}
        onSubmit={(input) => closeOnSuccess(mutations.join.mutateAsync(input))}
      />
      <PersonModal
        person={selectedPerson}
        songs={songs}
        viewer={viewer}
        isPending={isPending}
        onClose={close}
        onKick={(userId) => closeOnSuccess(mutations.leave.mutateAsync({ userId }))}
        onEditProfile={openProfile}
      />
      <SongModal
        song={selectedSong}
        viewer={viewer}
        isPending={isPending}
        onClose={close}
        onRequestJoin={openProfile}
        onSaveParts={(input) =>
          closeOnSuccess(
            mutations.setMyParts.mutateAsync({
              songId: dialog?.kind === 'song' ? dialog.songId : '',
              ...input,
            }),
          )
        }
        onToggleHand={(input) =>
          void run(mutations.setMyParts.mutateAsync({ songId: selectedSong?.id ?? '', ...input }))
        }
        onSetPlayed={(played) =>
          void run(mutations.setPlayed.mutateAsync({ songId: selectedSong?.id ?? '', played }))
        }
        onDelete={() =>
          closeOnSuccess(mutations.deleteSong.mutateAsync({ songId: selectedSong?.id ?? '' }))
        }
      />
      <AddSongModal
        opened={dialog?.kind === 'addSong'}
        viewer={viewer}
        existingSpotifyIds={existingSpotifyIds}
        initialArtist={dialog?.kind === 'addSong' ? dialog.artist : undefined}
        isPending={mutations.createSong.isPending}
        onClose={close}
        onSubmit={(input) => closeOnSuccess(mutations.createSong.mutateAsync(input))}
      />
    </Container>
  );
};

export default JamSessionBoard;
