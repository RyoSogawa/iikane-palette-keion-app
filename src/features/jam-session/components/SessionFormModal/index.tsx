import React, { useState } from 'react';

import { Button, Modal, Stack, TextInput } from '@mantine/core';

import { sessionInputSchema, type SessionInput } from '@/server/api/routers/jam-session/schemas';

type Errors = { name?: string; heldOn?: string };

export type SessionFormModalProps = {
  opened: boolean;
  title: string;
  submitLabel: string;
  initialValue: SessionInput;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (input: SessionInput) => void;
};

/** セッションの名前と日付を入れるポップアップ。作るときと直すときで使う */
const SessionFormModal: React.FC<SessionFormModalProps> = ({
  opened,
  title,
  onClose,
  ...props
}) => (
  <Modal opened={opened} title={title} onClose={onClose}>
    {opened && <SessionForm {...props} />}
  </Modal>
);

const SessionForm: React.FC<Omit<SessionFormModalProps, 'opened' | 'title' | 'onClose'>> = ({
  submitLabel,
  initialValue,
  isPending,
  onSubmit,
}) => {
  const [name, setName] = useState(initialValue.name);
  const [heldOn, setHeldOn] = useState(initialValue.heldOn);
  const [errors, setErrors] = useState<Errors>({});

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = sessionInputSchema.safeParse({ name, heldOn });
    if (!result.success) {
      const issueOf = (key: string) =>
        result.error.issues.find(({ path }) => path[0] === key)?.message;
      setErrors({ name: issueOf('name'), heldOn: issueOf('heldOn') });
      return;
    }
    setErrors({});
    onSubmit({ name, heldOn });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          label="名前"
          placeholder="例：11 月のセッション"
          maxLength={50}
          value={name}
          error={errors.name}
          onChange={(event) => setName(event.currentTarget.value)}
        />
        <TextInput
          label="日付"
          type="date"
          value={heldOn}
          error={errors.heldOn}
          onChange={(event) => setHeldOn(event.currentTarget.value)}
        />
        <Button type="submit" size="md" loading={isPending}>
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
};

export default SessionFormModal;
