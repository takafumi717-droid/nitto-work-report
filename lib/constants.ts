// 作業時間の選択肢（0.25H刻み、0.25〜15.00）
export const WORK_HOURS_OPTIONS: number[] = Array.from(
  { length: 60 },
  (_, i) => Math.round((i + 1) * 0.25 * 100) / 100
);
