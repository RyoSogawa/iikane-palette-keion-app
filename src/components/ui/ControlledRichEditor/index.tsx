'use client';

import React, { useCallback } from 'react';

import { Input, type InputWrapperProps } from '@mantine/core';
import { Link as LinkExtension, RichTextEditor } from '@mantine/tiptap';
import { Placeholder } from '@tiptap/extension-placeholder';
import { type Content, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { type FieldValues, useController, type UseControllerProps } from 'react-hook-form';

export type ControlledRichEditorProps<T extends FieldValues> = Omit<
  InputWrapperProps,
  'error' | 'children'
> &
  Pick<UseControllerProps<T>, 'name' | 'control' | 'disabled' | 'rules'> & {
    placeholder?: string;
  };

const ControlledRichEditor = <T extends FieldValues>({
  name,
  control,
  disabled,
  rules,
  placeholder,
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
    extensions: [StarterKit, LinkExtension, Placeholder.configure({ placeholder })],
    content: value ? (JSON.parse(value) as Content) : undefined,
    editable: !disabled,
    onBlur,
    onUpdate: (arg) => {
      onChange(JSON.stringify(arg.editor.getJSON()));
    },
  });

  const handleClickContent = useCallback(() => {
    if (!editor?.isFocused) editor?.chain().focus();
  }, [editor]);

  return (
    <Input.Wrapper {...props} error={error?.message}>
      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar stickyOffset={60} sticky>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignRight />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content
          ref={ref}
          mih={100}
          style={{
            cursor: 'text',
          }}
          onClick={handleClickContent}
        />
      </RichTextEditor>
    </Input.Wrapper>
  );
};

export default ControlledRichEditor;
