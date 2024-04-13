import React, { useCallback } from 'react';

import { ActionIcon, TextInput, type TextInputProps } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';

export type MusicSearchInputProps = Omit<TextInputProps, 'onChange'> & {
  onChange: (value: string) => void;
};

const MusicSearchInput: React.FC<MusicSearchInputProps> = ({ value, onChange, ...props }) => {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.currentTarget.value);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <TextInput
      {...props}
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
      onChange={handleChange}
    />
  );
};

export default MusicSearchInput;
