'use client';

import React, { useCallback, useState } from 'react';

import { Avatar, FileButton, Flex, Skeleton, UnstyledButton } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCamera } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';

import { NotificationOptions } from '@/constants/notification';
import { type User } from '@/types/generated/zod';

import { updateUserAvatar } from '../actions';

export type AvatarInputProps = {
  user: Pick<User, 'id' | 'image'>;
};

const AvatarInput: React.FC<AvatarInputProps> = ({ user }) => {
  const [src, setSrc] = useState(user.image);
  const { update } = useSession();
  const [isUploading, setIsUploading] = useState(false);

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

        const formData = new FormData();
        formData.append('userId', user.id);
        formData.append('file', file);
        const imagePath = await updateUserAvatar(formData);

        setSrc(imagePath);
        await update({ image: imagePath });

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
    [update, user.id],
  );

  return (
    <div>
      <FileButton accept="image/*" disabled={isUploading} onChange={handleChange}>
        {(buttonProps) => (
          <UnstyledButton aria-label="アバターを変更する" {...buttonProps} pos="relative">
            {isUploading ? (
              <Skeleton w={80} h={80} circle />
            ) : (
              <>
                <Avatar src={src} alt="" size={80} imageProps={{ loading: 'lazy' }} />
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
              </>
            )}
          </UnstyledButton>
        )}
      </FileButton>
    </div>
  );
};

export default AvatarInput;
