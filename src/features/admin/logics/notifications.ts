import { showNotification } from '@mantine/notifications';

import { NotificationOptions } from '@/constants/notification';

/** 管理画面での保存失敗を知らせる。サーバーのメッセージがあればそれを出す */
export const notifyError = (error: unknown) => {
  console.error(error);
  showNotification({
    ...NotificationOptions.error,
    message:
      error instanceof Error && error.message ? error.message : NotificationOptions.error.message,
  });
};

export const notifySuccess = (message = '保存しました') => {
  showNotification({ ...NotificationOptions.success, message });
};
