import { Flex, Loader } from '@mantine/core';

export default function Loading() {
  return (
    <Flex align="center" justify="center" pt={120}>
      <Loader />
    </Flex>
  );
}
