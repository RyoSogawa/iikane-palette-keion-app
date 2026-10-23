'use client';

import React, { useCallback, useMemo } from 'react';

import { type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ActionIcon,
  Button,
  Flex,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconCheck, IconGripVertical, IconPlus, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import {
  type Control,
  Controller,
  useFieldArray,
  useForm,
  type UseFormClearErrors,
  useWatch,
} from 'react-hook-form';

import { useUnsavedChanges } from '@/features/admin/components/UnsavedChangesGuard';
import { createUserOptionRenderer, UserAvatar } from '@/features/admin/components/UserOption';
import { setSchemaErrors } from '@/features/admin/logics/form-errors';
import { notifyError, notifySaved } from '@/features/admin/logics/notifications';
import { toUserOptions, type UserOptionSource } from '@/features/admin/logics/user-options';
import { membersInputSchema } from '@/server/api/routers/admin/schemas';
import { api } from '@/trpc/react';
import DnDContext from '@/ui/components/functional/DnDContext';

type MemberRow = { userId: string | null; userName: string; part: string };
type MembersFormValues = { members: MemberRow[] };

export type BandMembersEditorProps = {
  bandId: string;
  members: Array<{ userId: string | null; userName: string | null; part: string | null }>;
  users: UserOptionSource[];
};

type MemberRowEditorProps = {
  sortableId: string;
  index: number;
  control: Control<MembersFormValues>;
  users: UserOptionSource[];
  renderUserOption: ReturnType<typeof createUserOptionRenderer>;
  clearErrors: UseFormClearErrors<MembersFormValues>;
  onRemove: () => void;
};

const MemberRowEditor: React.FC<MemberRowEditorProps> = ({
  sortableId,
  index,
  control,
  users,
  renderUserOption,
  clearErrors,
  onRemove,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: sortableId,
  });
  const members = useWatch({ control, name: 'members' });
  // 同じ人を 2 行に入れられないよう、ほかの行で選ばれているユーザーは選べなくする
  const userOptions = useMemo(
    () =>
      toUserOptions(
        users,
        members.flatMap((member, i) => (i !== index && member.userId ? [member.userId] : [])),
      ),
    [index, members, users],
  );

  return (
    <Paper
      ref={setNodeRef}
      p="sm"
      style={{ transform: CSS.Transform.toString(transform), transition }}
      withBorder
      {...attributes}
    >
      <Flex
        gap="sm"
        align={{ base: 'stretch', sm: 'flex-start' }}
        direction={{ base: 'column', sm: 'row' }}
      >
        <IconGripVertical
          aria-label="ドラッグアンドドロップで並び替える"
          size={20}
          cursor="grab"
          style={{ touchAction: 'none', flexShrink: 0, marginTop: 30 }}
          {...listeners}
        />
        <Controller
          control={control}
          name={`members.${index}.userId`}
          render={({ field, fieldState }) => (
            <Select
              label="ユーザー（任意）"
              placeholder="名前で検索"
              data={userOptions}
              renderOption={renderUserOption}
              leftSection={
                field.value ? (
                  <UserAvatar src={users.find((user) => user.id === field.value)?.image} />
                ) : undefined
              }
              value={field.value}
              error={fieldState.error?.message}
              flex={2}
              searchable
              clearable
              onChange={(userId) => {
                field.onChange(userId);
                clearErrors(`members.${index}.userId`);
              }}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name={`members.${index}.userName`}
          render={({ field, fieldState }) => (
            <TextInput
              label="表示名（任意）"
              placeholder="ユーザーの代わりに表示"
              {...field}
              error={fieldState.error?.message}
              flex={2}
              onChange={(event) => {
                field.onChange(event);
                // 「ユーザーか表示名のどちらか」のエラーはユーザー欄に出しているので、こちらの入力でも消す
                clearErrors(`members.${index}.userId`);
              }}
            />
          )}
        />
        <Controller
          control={control}
          name={`members.${index}.part`}
          render={({ field, fieldState }) => (
            <TextInput
              label="パート"
              placeholder="Vo, Gt など"
              {...field}
              error={fieldState.error?.message}
              flex={1}
            />
          )}
        />
        <ActionIcon
          variant="subtle"
          color="red"
          aria-label="メンバーを外す"
          mt={{ base: 0, sm: 28 }}
          onClick={onRemove}
        >
          <IconTrash size={18} />
        </ActionIcon>
      </Flex>
    </Paper>
  );
};

const toFormValues = (members: BandMembersEditorProps['members']): MembersFormValues => ({
  members: members.map((member) => ({
    userId: member.userId,
    userName: member.userName ?? '',
    part: member.part ?? '',
  })),
});

/** バンドメンバーの編集。並べた順がそのまま表示順になり、保存で一覧ごと置き換える */
const BandMembersEditor: React.FC<BandMembersEditorProps> = ({ bandId, members, users }) => {
  const router = useRouter();
  const {
    control,
    getValues,
    reset,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<MembersFormValues>({ defaultValues: toFormValues(members) });
  const { fields, append, remove, move } = useFieldArray({ control, name: 'members' });
  useUnsavedChanges(isDirty);
  const setMembers = api.admin.band.setMembers.useMutation();
  const renderUserOption = useMemo(() => createUserOptionRenderer(users), [users]);

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return;
      move(
        fields.findIndex((field) => field.id === active.id),
        fields.findIndex((field) => field.id === over.id),
      );
    },
    [fields, move],
  );

  // handleSubmit は setError で付けた配列全体へのエラーが残ると送信しないので、自前で検証する
  const handleSave = useCallback(async () => {
    clearErrors();
    const values = getValues();
    const input = values.members.map(({ userId, userName, part }) => ({
      userId: userId ?? '',
      userName,
      part,
    }));
    const parsed = membersInputSchema.safeParse(input);
    if (!parsed.success) {
      setSchemaErrors(parsed.error, setError, 'members');
      return;
    }
    try {
      await setMembers.mutateAsync({ bandId, members: input });
      // 保存した値を新しい基準にして、未保存の変更なしに戻す
      reset(values);
      notifySaved('メンバーを保存しました');
      router.refresh();
    } catch (error) {
      notifyError(error);
    }
  }, [bandId, clearErrors, getValues, reset, router, setError, setMembers]);

  return (
    <Stack>
      {fields.length === 0 && <Text c="dimmed">メンバーはまだいません</Text>}
      <DnDContext onDragEnd={handleDragEnd}>
        <SortableContext
          items={fields.map((field) => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <Stack gap="xs">
            {fields.map((field, index) => (
              <MemberRowEditor
                key={field.id}
                sortableId={field.id}
                index={index}
                control={control}
                users={users}
                renderUserOption={renderUserOption}
                clearErrors={clearErrors}
                onRemove={() => remove(index)}
              />
            ))}
          </Stack>
        </SortableContext>
      </DnDContext>
      {errors.members?.root?.message && (
        <Text c="red" size="sm">
          {errors.members.root.message}
        </Text>
      )}
      <Group justify="space-between">
        <Button
          variant="light"
          leftSection={<IconPlus size={16} />}
          onClick={() => append({ userId: null, userName: '', part: '' })}
        >
          メンバーを追加
        </Button>
        <Button
          loading={setMembers.isPending}
          leftSection={<IconCheck size={18} />}
          onClick={handleSave}
        >
          メンバーを保存
        </Button>
      </Group>
    </Stack>
  );
};

export default BandMembersEditor;
