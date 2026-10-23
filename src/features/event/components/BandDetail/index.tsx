import React from 'react';

import { AspectRatio, Avatar, Box, Group, Image, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

import type { EventDetail } from '@/server/api/routers/event/event-detail-select';

export type BandDetailProps = {
  band: EventDetail['Band'][number];
};

/**
 * バンド詳細ページの本体。公開ページと管理画面のプレビューで共有する。
 */
const BandDetail: React.FC<BandDetailProps> = ({ band }) => {
  return (
    <>
      <Title size="h2" mt="xl">
        No.{band.liveOrder} :「{band.name}」
      </Title>
      <Box pos="relative">
        <Image
          src={band.photo}
          alt=""
          mt="md"
          loading="lazy"
          width={393}
          height={262}
          w="100%"
          h="auto"
          fit="cover"
          bg="gray"
        />
        {band.image && (
          <Image
            src={band.image}
            alt=""
            pos="absolute"
            bottom={0}
            left={0}
            w={{ base: 30, md: 50 }}
            h={{ base: 30, md: 50 }}
            fit="cover"
          />
        )}
        {band.typoImage && (
          <Image
            src={band.typoImage}
            alt={band.name}
            pos="absolute"
            bottom={0}
            left={band.image ? { base: 30, md: 50 } : 0}
            w="auto"
            h={{ base: 30, md: 50 }}
            fit="cover"
          />
        )}
      </Box>
      <Title order={2} size="h3" mt="xl">
        メンバー
      </Title>
      <Stack mt="md">
        {band.members.map(({ user, userName, order, part }) =>
          userName ? (
            <Group key={`${order}.${userName}`}>
              <Box w="38px" h="38px" />
              <Text c="bright">{userName}</Text>
              <Text c="dimmed">({part})</Text>
            </Group>
          ) : (
            <Link key={user.id} href={`/members/${user.id}/profile`}>
              <Group>
                <Avatar
                  src={user.image}
                  alt={user.name ?? ''}
                  imageProps={{ loading: 'lazy' }}
                  bg="gray"
                />
                <Text c="bright">{user.name}</Text>
                <Text c="dimmed">({part})</Text>
              </Group>
            </Link>
          ),
        )}
      </Stack>
      {band.movie && (
        <div>
          <Title order={2} size="h3" mt="xl">
            ライブの様子
          </Title>
          <AspectRatio ratio={16 / 9} mt="md" bg="gray">
            <iframe
              width="560"
              height="315"
              src={band.movie}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
              allowFullScreen
            />
          </AspectRatio>
        </div>
      )}
      {band.description && (
        <Text mt="lg" style={{ whiteSpace: 'pre-wrap' }}>
          {band.description}
        </Text>
      )}
    </>
  );
};

export default BandDetail;
