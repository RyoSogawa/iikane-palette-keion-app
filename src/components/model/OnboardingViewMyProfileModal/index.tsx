'use client';

import React, { useEffect, useRef } from 'react';

import { Avatar, Button, Group, Modal, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { api } from '@/trpc/react';

const OnboardingViewMyProfileModal: React.FC = () => {
  const hasOpened = useRef(false);
  const [opened, { open, close }] = useDisclosure();
  const { data: session, status } = useSession();
  const { data } = api.onboarding.findByCurrentUser.useQuery({
    step: 'VIEW_MY_PROFILE',
  });
  const { mutate } = api.onboarding.create.useMutation();

  useEffect(() => {
    if (hasOpened.current) return;
    if (status === 'unauthenticated') return;
    if (data && !data?.createdAt) {
      open();
      mutate({
        step: 'VIEW_MY_PROFILE',
      });
      hasOpened.current = true;
    }
  }, [data, mutate, open, status]);

  if (status !== 'authenticated' || !session?.user) return null;
  return (
    <Modal opened={opened} title="ようこそ！🎉" onClose={close}>
      <Avatar src={session.user.image} alt="" mx="auto" size={100} mt={24} />
      <Text mt={24} ta="center">
        <Text display="inline-block" mr={4} span>
          <Text fw="bold" span>
            {session.user.name}
          </Text>
          さん
        </Text>
        <Text display="inline-block" span>
          いいかねパレット軽音部へようこそ！{' '}
        </Text>
        <br />
        まずは自分のプロフィールを見てみましょう！
      </Text>
      <Group mt={24} justify="space-between">
        <Button variant="outline" color="gray" onClick={close}>
          あとで
        </Button>
        <Button component={Link} href={`/members/${session.user.id}`}>
          プロフィールを見る
        </Button>
      </Group>
    </Modal>
  );
};

export default OnboardingViewMyProfileModal;
