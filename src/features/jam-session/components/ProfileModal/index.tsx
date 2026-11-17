import React, { useState } from 'react';

import { Button, Chip, Fieldset, Group, Modal, Stack, Text, TextInput } from '@mantine/core';

import PartChips from '@/features/jam-session/components/PartChips';
import { ROOT_OPTIONS } from '@/features/jam-session/logics/roots';
import { joinInputSchema } from '@/server/api/routers/jam-session/schemas';

import type { JamSessionViewer } from '@/features/jam-session/types';
import type { JamSessionPartType } from '@/types/generated/zod';

const splitFreeRoots = (text: string) =>
  text
    .split(/[、,，]/)
    .map((root) => root.trim())
    .filter(Boolean);

type Errors = { parts?: string; partNote?: string; roots?: string };

export type ProfileModalProps = {
  opened: boolean;
  profile: JamSessionViewer['profile'];
  isActive: boolean;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (input: { parts: JamSessionPartType[]; partNote: string; roots: string[] }) => void;
};

/** 参加するとき、と参加中にパートとルーツを直すときのポップアップ。開くたびに保存済みの内容から始める */
const ProfileModal: React.FC<ProfileModalProps> = ({ opened, onClose, ...props }) => (
  <Modal opened={opened} title="自分のパートとルーツ" onClose={onClose}>
    {opened && <ProfileForm {...props} />}
  </Modal>
);

const ProfileForm: React.FC<Omit<ProfileModalProps, 'opened' | 'onClose'>> = ({
  profile,
  isActive,
  isPending,
  onSubmit,
}) => {
  const savedRoots = profile?.roots ?? [];
  const [parts, setParts] = useState<JamSessionPartType[]>(profile?.parts ?? []);
  const [partNote, setPartNote] = useState(profile?.partNote ?? '');
  const [rootOptions, setRootOptions] = useState(
    savedRoots.filter((root) => ROOT_OPTIONS.includes(root)),
  );
  const [freeRoots, setFreeRoots] = useState(
    savedRoots.filter((root) => !ROOT_OPTIONS.includes(root)).join('、'),
  );
  const [errors, setErrors] = useState<Errors>({});

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const input = { parts, partNote, roots: [...rootOptions, ...splitFreeRoots(freeRoots)] };
    const result = joinInputSchema.safeParse(input);
    if (!result.success) {
      const issueOf = (key: string) =>
        result.error.issues.find(({ path }) => path[0] === key)?.message;
      setErrors({
        parts: issueOf('parts'),
        partNote: issueOf('partNote'),
        roots: issueOf('roots'),
      });
      return;
    }
    setErrors({});
    onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <Text c="dimmed" fz="sm">
          「いまここにいる人」に表示されます。あとからいつでも変えられます。
        </Text>
        <PartChips
          legend="できるパート（1 つ以上・複数選べます）"
          value={parts}
          error={errors.parts}
          partNote={partNote}
          partNoteError={errors.partNote}
          onChange={setParts}
          onChangePartNote={setPartNote}
        />
        <Fieldset legend="ルーツ（複数選べます）" variant="unstyled">
          <Chip.Group value={rootOptions} multiple onChange={setRootOptions}>
            <Group gap={6}>
              {ROOT_OPTIONS.map((root) => (
                <Chip key={root} value={root} size="md">
                  {root}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        </Fieldset>
        <TextInput
          label="ほかのルーツ（自由に入力）"
          description="「、」で区切ると複数入れられます。1 つ 20 文字・全部で 8 つまで"
          placeholder="例：シティポップ、ボカロ"
          value={freeRoots}
          error={errors.roots}
          onChange={(event) => setFreeRoots(event.currentTarget.value)}
        />
        <Button type="submit" size="md" loading={isPending}>
          {isActive ? '保存する' : '保存して参加する'}
        </Button>
      </Stack>
    </form>
  );
};

export default ProfileModal;
