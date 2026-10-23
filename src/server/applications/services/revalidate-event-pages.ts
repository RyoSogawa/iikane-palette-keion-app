import { revalidatePath } from 'next/cache';

/**
 * 管理画面での変更を公開ページに反映する。公開ページは 1 時間キャッシュされるので、
 * イベントに関わるミューテーションの後は必ず呼ぶ。
 * レク王の回数は別のイベントの詳細ページやメンバーページにも出るので、変えたイベントだけでなく
 * イベント配下とメンバー配下をまとめて消す。イベントの数は多くないので、作り直しの負担は小さい。
 */
export const revalidateEventPages = () => {
  revalidatePath('/events', 'layout');
  revalidatePath('/members', 'layout');
};
