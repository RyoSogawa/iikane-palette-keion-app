import React, { useState } from 'react';

import {
  Button,
  Loader,
  Modal,
  Paper,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';

import PartChips from '@/features/jam-session/components/PartChips';
import { songTitle } from '@/features/jam-session/logics/song-title';
import MusicCard from '@/features/my-best-songs/components/MusicCard';
import MusicSearchInput from '@/features/my-best-songs/components/MusicSearchInput';
import { useSearchSpotify } from '@/features/my-best-songs/hooks/useSearchSpotify';
import {
  createSongInputSchema,
  type CreateSongInput,
} from '@/server/api/routers/jam-session/schemas';

import type { JamSessionViewer } from '@/features/jam-session/types';
import type { RouterOutputs } from '@/trpc/shared';
import type { JamSessionPartType } from '@/types/generated/zod';

type Source = 'spotify' | 'free';
type Track = RouterOutputs['myBestSongs']['search'][number];
type Errors = { name?: string; parts?: string; partNote?: string };

const SOURCE_OPTIONS: Array<{ value: Source; label: string }> = [
  { value: 'spotify', label: 'Spotify で探す' },
  { value: 'free', label: '自分で入力' },
];

export type AddSongModalProps = {
  opened: boolean;
  viewer: JamSessionViewer;
  existingSpotifyIds: Set<string>;
  /** 重なっているアーティストから開いたときは、自分で入力にしてアーティスト名を入れておく */
  initialArtist?: string;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (input: CreateSongInput) => void;
};

/** 曲を挙げるポップアップ。Spotify のトラックを選ぶか、曲名かアーティスト名を入力し、自分のパートを選ぶ */
const AddSongModal: React.FC<AddSongModalProps> = ({ opened, onClose, ...props }) => (
  <Modal opened={opened} title="曲を挙げる" onClose={onClose}>
    {opened && <AddSongForm {...props} />}
  </Modal>
);

const AddSongForm: React.FC<Omit<AddSongModalProps, 'opened' | 'onClose'>> = ({
  viewer,
  existingSpotifyIds,
  initialArtist,
  isPending,
  onSubmit,
}) => {
  const [source, setSource] = useState<Source>(initialArtist ? 'free' : 'spotify');
  const [keyword, setKeyword] = useState('');
  const [track, setTrack] = useState<Track>();
  const [name, setName] = useState('');
  const [artist, setArtist] = useState(initialArtist ?? '');
  const [parts, setParts] = useState<JamSessionPartType[]>(viewer.profile?.parts ?? []);
  const [partNote, setPartNote] = useState(viewer.profile?.partNote ?? '');
  const [errors, setErrors] = useState<Errors>({});
  const { data: results, isFetching } = useSearchSpotify(keyword, 'track');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const input: CreateSongInput =
      source === 'spotify'
        ? { spotifyId: track?.spotifyId ?? '', parts, partNote }
        : { name, artist, parts, partNote };
    if (source === 'spotify' && !track) {
      setErrors({ name: 'Spotify から曲を選んでください' });
      return;
    }
    const result = createSongInputSchema.safeParse(input);
    if (!result.success) {
      const issueOf = (key: string) =>
        result.error.issues.find(({ path }) => path[0] === key)?.message;
      setErrors({ name: issueOf('name'), parts: issueOf('parts'), partNote: issueOf('partNote') });
      return;
    }
    setErrors({});
    onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <SegmentedControl
          aria-label="曲の探し方"
          data={SOURCE_OPTIONS}
          value={source}
          fullWidth
          onChange={(value) => {
            setSource(value === 'free' ? 'free' : 'spotify');
            setErrors({});
          }}
        />

        {source === 'spotify' ? (
          <SpotifyPicker
            keyword={keyword}
            track={track}
            results={results}
            isFetching={isFetching}
            existingSpotifyIds={existingSpotifyIds}
            error={errors.name}
            onChangeKeyword={setKeyword}
            onSelect={setTrack}
          />
        ) : (
          <>
            <Text c="dimmed" fz="sm">
              曲名かアーティスト名のどちらかがあれば
              OK。「このアーティストの何かをやりたい」でも挙げられます。
            </Text>
            <TextInput
              label="アーティスト名"
              maxLength={100}
              value={artist}
              error={errors.name}
              onChange={(event) => setArtist(event.currentTarget.value)}
            />
            <TextInput
              label="曲名（決まっていなければ空のままで）"
              placeholder="例：Wonderwall"
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
            />
            {(name.trim() || artist.trim()) && (
              <Paper p="sm" style={{ borderStyle: 'dashed' }} withBorder>
                <Text fz="xs" c="dimmed">
                  一覧での見え方
                </Text>
                <Text fw={700} c="bright">
                  {songTitle({ name: name.trim() || null, artist: artist.trim() || null })}
                </Text>
              </Paper>
            )}
          </>
        )}

        <PartChips
          legend="あなたのパート（1 つ以上）"
          value={parts}
          partNote={partNote}
          error={errors.parts}
          partNoteError={errors.partNote}
          onChange={setParts}
          onChangePartNote={setPartNote}
        />
        <Button type="submit" size="md" loading={isPending}>
          この内容で挙げる
        </Button>
      </Stack>
    </form>
  );
};

type SpotifyPickerProps = {
  keyword: string;
  track: Track | undefined;
  results: Track[] | undefined;
  isFetching: boolean;
  existingSpotifyIds: Set<string>;
  error?: string;
  onChangeKeyword: (value: string) => void;
  onSelect: (track: Track | undefined) => void;
};

const SpotifyPicker: React.FC<SpotifyPickerProps> = ({
  keyword,
  track,
  results,
  isFetching,
  existingSpotifyIds,
  error,
  onChangeKeyword,
  onSelect,
}) => {
  if (track) {
    return (
      <Stack gap={4}>
        <MusicCard type="track" name={track.name} artist={track.artist} image={track.image} />
        <Button variant="subtle" size="compact-sm" onClick={() => onSelect(undefined)}>
          選び直す
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="xs">
      <MusicSearchInput type="track" value={keyword} hideTypeSwitcher onChange={onChangeKeyword} />
      {error && (
        <Text c="red" fz="sm" role="alert">
          {error}
        </Text>
      )}
      {isFetching && <Loader size="sm" mx="auto" />}
      {keyword && !isFetching && results && (
        <ScrollArea.Autosize mah="40vh">
          <Stack gap={4}>
            {results.length === 0 && (
              <Text c="dimmed" fz="sm">
                見つかりませんでした。「自分で入力」でも挙げられます。
              </Text>
            )}
            {results.map((result) => {
              const isListed = existingSpotifyIds.has(result.spotifyId);
              return (
                <UnstyledButton
                  key={result.spotifyId}
                  disabled={isListed}
                  aria-label={`${result.name} / ${result.artist}`}
                  style={{ opacity: isListed ? 0.5 : 1 }}
                  onClick={() => onSelect(result)}
                >
                  <MusicCard
                    type="track"
                    name={result.name}
                    artist={isListed ? `${result.artist}（挙がっています）` : result.artist}
                    image={result.image}
                  />
                </UnstyledButton>
              );
            })}
          </Stack>
        </ScrollArea.Autosize>
      )}
    </Stack>
  );
};

export default AddSongModal;
