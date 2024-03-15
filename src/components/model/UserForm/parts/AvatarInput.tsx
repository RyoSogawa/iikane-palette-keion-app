'use client';

import React, { useCallback, useState } from 'react';

import { Avatar, FileButton, UnstyledButton } from '@mantine/core';

import { updateUserAvatar } from '@/components/model/UserForm/server-actions';
import { type User } from '@/types/generated/zod';
import { createSupabaseBrowserClient } from '@/utils/supabase';

export type AvatarInputProps = {
  user: Pick<User, 'id' | 'image'>;
};

const AvatarInput: React.FC<AvatarInputProps> = ({ user }) => {
  const [src, setSrc] = useState(user.image);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        if (!file) {
          throw new Error('You must select an image to upload.');
        }

        if (!file.type.match('image.*')) {
          throw new Error('You must select an image to upload.');
        }
        const fileExt = file.name.split('.').pop();
        const filename = `${user.id}/avatar.${fileExt}`;

        const supabase = createSupabaseBrowserClient();
        const { data, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filename, file, {
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        const imagePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data.fullPath}`;

        await updateUserAvatar({
          id: user.id,
          image: imagePath,
        });

        setSrc(imagePath);
      } catch (error) {
        alert('Error uploading avatar!');
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    },
    [user.id],
  );

  return (
    <FileButton accept="image/*" disabled={isUploading} onChange={handleChange}>
      {(buttonProps) => (
        <UnstyledButton aria-label="アバターを変更する" {...buttonProps}>
          <Avatar src={src} alt="" size={80} />
        </UnstyledButton>
      )}
    </FileButton>
  );
};

export default AvatarInput;
