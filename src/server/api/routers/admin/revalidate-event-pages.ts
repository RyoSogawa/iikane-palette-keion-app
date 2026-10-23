import { revalidatePath } from 'next/cache';

/**
 * 管理画面での変更を公開ページに反映する。公開ページは 1 時間キャッシュされるので、
 * イベントに関わるミューテーションの後は必ず呼ぶ。
 * レク王の回数やイベント名はメンバーページにも出るので、そちらも消す。
 */
export const revalidateEventPages = (eventId: string) => {
  revalidatePath('/events');
  revalidatePath(`/events/${eventId}`, 'layout');
  revalidatePath('/members', 'layout');
};
