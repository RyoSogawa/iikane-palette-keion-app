'use client';

import React, { useCallback, useState } from 'react';

import { FileButton, Flex, UnstyledButton } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCamera } from '@tabler/icons-react';

import CurrentUserAvatar from '@/components/model/CurrentUserAvatar';
import { updateUserAvatar } from '@/components/model/UserForm/server-actions';
import { NotificationOptions } from '@/constants/notification';
import { STORAGE_PATH } from '@/constants/supabase';
import { useAvatarUpdatedAt } from '@/store/avatar-updated-at';
import { type User } from '@/types/generated/zod';
import { createSupabaseBrowserClient } from '@/utils/supabase';

export type AvatarInputProps = {
  user: Pick<User, 'id' | 'image'>;
};

const AvatarInput: React.FC<AvatarInputProps> = ({ user }) => {
  const [src, setSrc] = useState(user.image);
  const [isUploading, setIsUploading] = useState(false);
  const updateAvatarUpdatedAt = useAvatarUpdatedAt((store) => store.update);

  const handleChange = useCallback(
    async (file: File | null) => {
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
          .from('profiles')
          .upload(filename, file, {
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }
        if (!data) {
          throw new Error('Failed to upload image.');
        }

        const imagePath = `${STORAGE_PATH}/profiles/${data.path}`;

        await updateUserAvatar({
          id: user.id,
          image: imagePath,
        });

        setSrc(imagePath);
        updateAvatarUpdatedAt();

        showNotification({
          ...NotificationOptions.success,
          message: 'アバターを更新しました 📸',
        });
      } catch (error) {
        showNotification(NotificationOptions.error);
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    },
    [updateAvatarUpdatedAt, user.id],
  );

  return (
    <div>
      <FileButton accept="image/*" disabled={isUploading} onChange={handleChange}>
        {(buttonProps) => (
          <UnstyledButton aria-label="アバターを変更する" {...buttonProps} pos="relative">
            <CurrentUserAvatar src={src} alt="" size={80} />
            <Flex
              pos="absolute"
              inset={0}
              align="center"
              justify="center"
              style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '50%',
              }}
            >
              <IconCamera color="white" />
            </Flex>
          </UnstyledButton>
        )}
      </FileButton>
    </div>
  );
};

export default AvatarInput;
