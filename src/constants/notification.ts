import { type showNotification } from '@mantine/notifications';

export const NotificationOptions = {
  success: {
    withCloseButton: true,
    color: 'blue',
    message: '完了！',
  },
  error: {
    withCloseButton: true,
    color: 'red',
    message: 'エラーが発生しました🙏🏽',
  },
} as const satisfies Record<string, Parameters<typeof showNotification>[0]>;
