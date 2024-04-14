import React, { useCallback } from 'react';

import { ActionIcon, SegmentedControl, Stack, TextInput } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';

import { SongTypeSchema, type SongTypeType } from '@/types/generated/zod';

const SongTypeDataMap: Array<{ value: SongTypeType; label: string }> = [
  { value: 'track', label: 'Track' },
  { value: 'album', label: 'Album' },
];

export type MusicSearchInputProps = {
  value: string;
  type: SongTypeType;
  onChange: (value: string) => void;
  onChangeType: (type: SongTypeType) => void;
};

const MusicSearchInput: React.FC<MusicSearchInputProps> = ({
  value,
  type,
  onChange,
  onChangeType,
}) => {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.currentTarget.value);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  const handleChangeType = useCallback(
    (typeValue: string) => {
      onChangeType(SongTypeSchema.parse(typeValue));
    },
    [onChangeType],
  );

  return (
    <Stack>
      <TextInput
        leftSection={<IconSearch size={14} />}
        rightSection={
          value && (
            <ActionIcon aria-label="値をクリア" variant="subtle" color="gray" onClick={handleClear}>
              <IconX size={14} />
            </ActionIcon>
          )
        }
        placeholder="Spotifyから検索..."
        value={value}
        flex={1}
        onChange={handleChange}
      />
      <SegmentedControl data={SongTypeDataMap} value={type} fullWidth onChange={handleChangeType} />
    </Stack>
  );
};

export default MusicSearchInput;
