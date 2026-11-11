import React from 'react';

import { Chip, Fieldset, Group, Input, TextInput } from '@mantine/core';

import { JAM_SESSION_PARTS } from '@/features/jam-session/logics/parts';
import { JamSessionPartSchema, type JamSessionPartType } from '@/types/generated/zod';

export type PartChipsProps = {
  legend: string;
  value: JamSessionPartType[];
  onChange: (value: JamSessionPartType[]) => void;
  partNote: string;
  onChangePartNote: (value: string) => void;
  error?: string;
  partNoteError?: string;
};

/** パートの複数選択。「その他」を選んだときだけ楽器名の入力を出す */
const PartChips: React.FC<PartChipsProps> = ({
  legend,
  value,
  onChange,
  partNote,
  onChangePartNote,
  error,
  partNoteError,
}) => (
  <Fieldset legend={legend} variant="unstyled">
    <Chip.Group
      value={value}
      multiple
      onChange={(next) => onChange(JamSessionPartSchema.array().parse(next))}
    >
      <Group gap={6}>
        {JAM_SESSION_PARTS.map(({ value: part, label }) => (
          <Chip key={part} value={part} size="md">
            {label}
          </Chip>
        ))}
      </Group>
    </Chip.Group>
    {error && (
      <Input.Error mt={6} role="alert">
        {error}
      </Input.Error>
    )}
    {value.includes('other') && (
      <TextInput
        mt="sm"
        label="「その他」の楽器名"
        description="30 文字まで"
        maxLength={30}
        value={partNote}
        error={partNoteError}
        onChange={(event) => onChangePartNote(event.currentTarget.value)}
      />
    )}
  </Fieldset>
);

export default PartChips;
