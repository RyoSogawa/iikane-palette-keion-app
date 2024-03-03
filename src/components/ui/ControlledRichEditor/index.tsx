'use client';

import React from 'react';

import { Input, type InputWrapperProps } from '@mantine/core';
import { Link as LinkExtension, RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { type FieldValues, useController, type UseControllerProps } from 'react-hook-form';

export type ControlledRichEditorProps<T extends FieldValues> = Omit<
  InputWrapperProps,
  'error' | 'children'
> &
  Pick<UseControllerProps<T>, 'name' | 'control' | 'disabled' | 'rules'>;

const ControlledRichEditor = <T extends FieldValues>({
  name,
  control,
  disabled,
  rules,
  ...props
}: ControlledRichEditorProps<T>) => {
  const {
    field: { onBlur, ref, value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
    disabled,
    rules,
  });

  const editor = useEditor({
    extensions: [StarterKit, LinkExtension],
    content: value,
    editable: !disabled,
    onBlur,
    onUpdate: (arg) => {
      onChange(arg.editor.getHTML());
    },
  });

  return (
    <Input.Wrapper {...props} error={error?.message}>
      <RichTextEditor editor={editor}>
        <RichTextEditor.Content ref={ref} mih={100} />
      </RichTextEditor>
    </Input.Wrapper>
  );
};

export default ControlledRichEditor;
