'use client';

import React from 'react';

import { Link as LinkExtension, RichTextEditor, type RichTextEditorProps } from '@mantine/tiptap';
import { type Content, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';

import s from './style.module.css';

export type EditorViewerProps = Omit<RichTextEditorProps, 'editor' | 'children'> & {
  value: string;
};

const EditorViewer: React.FC<EditorViewerProps> = ({ value, className, ...props }) => {
  const editor = useEditor({
    extensions: [StarterKit, LinkExtension],
    content: value ? (JSON.parse(value) as Content) : undefined,
    editable: false,
  });

  return (
    <RichTextEditor editor={editor} className={`${s.wrapper} ${className}`} {...props}>
      <RichTextEditor.Content />
    </RichTextEditor>
  );
};

export default EditorViewer;
