'use client';

import React, { useEffect, useRef } from 'react';

import { Avatar, Button, Group, Modal, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';

import { api } from '@/trpc/react';
import { type User } from '@/types/generated/zod';

export type OnboardingViewMyProfileModalProps = {
  user: {
    id: User['id'];
    name?: User['name'] | null | undefined;
    image?: User['image'] | null | undefined;
  };
};

const OnboardingViewMyProfileModal: React.FC<OnboardingViewMyProfileModalProps> = ({ user }) => {
  const hasOpened = useRef(false);
  const [opened, { open, close }] = useDisclosure();
  const { mutate } = api.onboarding.create.useMutation();

  useEffect(() => {
    if (hasOpened.current) return;
    open();
    mutate({
      step: 'VIEW_MY_PROFILE',
    });
    hasOpened.current = true;
  }, [mutate, open]);

  return (
    <Modal opened={opened} title="ようこそ！🎉" onClose={close}>
      {user.image && (
        <Avatar
          src={user.image}
          alt=""
          mx="auto"
          size={100}
          mt={24}
          imageProps={{ loading: 'lazy' }}
        />
      )}
      <Text mt={24} ta="center">
        {user.name && (
          <Text display="inline-block" mr={4} span>
            <Text fw="bold" span>
              {user.name}
            </Text>
            さん
          </Text>
        )}
        <Text display="inline-block" span>
          いいかねパレット軽音部へようこそ！{' '}
        </Text>
        <br />
        <Text display="inline-block" span>
          早速プロフィールを
        </Text>
        <Text display="inline-block" span>
          編集してみましょう！
        </Text>
      </Text>
      <Group mt={24} justify="space-between">
        <Button variant="outline" color="gray" onClick={close}>
          あとで
        </Button>
        <Button component={Link} href={`/members/${user.id}`} onClick={close}>
          プロフィールを見る
        </Button>
      </Group>
    </Modal>
  );
};

export default OnboardingViewMyProfileModal;
