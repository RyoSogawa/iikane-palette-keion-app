import React from 'react';

import { Box, Container, Flex, Image, Text, VisuallyHidden } from '@mantine/core';
import { IconBrandDiscordFilled, IconBrandGithubFilled } from '@tabler/icons-react';
import Link from 'next/link';

import { LINK } from '@/constants/external-service';
import IconLink from '@/features/application/components/Footer/parts/IconLink';
import ImageLink from '@/features/application/components/Footer/parts/ImageLink';
import LoginLink from '@/features/application/components/Footer/parts/LoginLink';

const Footer: React.FC = () => {
  return (
    <Box component="footer" pt="xl" pb="md" bg="dark">
      <Container ta="center">
        <LoginLink />
        <Box component={Link} href="/" display="inline-block">
          <Image
            src="/images/logo/keion-logo.webp"
            alt="ロゴ"
            width={60}
            height={60}
            w={60}
            h={60}
            display="inline-block"
            radius="xl"
            bg="white"
            loading="lazy"
          />
          <VisuallyHidden>いいかねパレット軽音楽部</VisuallyHidden>
        </Box>
        <Flex mt={32} align="center" justify="center" gap="md">
          <ImageLink
            href={LINK.IIKANE_PALETTE}
            src="/images/logo/iikane-palette.png"
            title="いいかねパレット"
            bg="#f2f1ed"
            imageW={20}
          />
          <ImageLink
            href={LINK.SUZURI}
            src="/images/logo/suzuri-logo-with-surisurikun.png"
            title="SUZURI"
            imageW={64}
            imageH={64}
            bg="white"
          />
          <IconLink href={LINK.DISCORD} title="Discord" bg="#5865f2" c="white">
            <IconBrandDiscordFilled />
          </IconLink>
          <IconLink href={LINK.GITHUB} title="GitHub" bg="black" c="white">
            <IconBrandGithubFilled />
          </IconLink>
        </Flex>
        <Flex align="center" justify="center" mt="lg">
          <Text fz="xs">&copy; ぱおん</Text>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;
