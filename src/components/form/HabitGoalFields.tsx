"use client";

import {
  TIME_LIMITS,
  autoWeeklyMinutes,
  changePeriod,
  changeTrackType,
  effectiveWeeklyMinutes,
  maxTargetFor,
  needsTargetInput,
  resetTimeGoalToAuto,
  updateTimeGoal,
  type GoalFormState,
} from "@/lib/habit-form";
import type { PeriodUnit, TrackType } from "@/lib/types";
import { Choice, Field } from "./FormParts";
import { NumberField } from "./NumberField";

// 入力方式と目標頻度は独立。「週2回」のような習慣もチェック（やった日をタップ）で記録する
const TRACK_OPTIONS: { type: TrackType; label: string; desc: string }[] = [
  { type: "check", label: "チェック", desc: "やった日にタップ" },
  { type: "time", label: "時間", desc: "分数を記録" },
  { type: "count", label: "複数回", desc: "1日に何回も+1" },
];

const PERIOD_OPTIONS: { period: PeriodUnit; label: string }[] = [
  { period: "day", label: "毎日" },
  { period: "week", label: "週○回" },
  { period: "month", label: "月○回" },
];

interface Props {
  value: GoalFormState;
  onChange: (next: GoalFormState) => void;
  /** edit では記録タイプ（入力方式）を変更不可にする（過去データとの整合性のため） */
  mode: "create" | "edit";
}

/** 「続ける」習慣の目標設定。新規作成・編集の両方で使う */
export function HabitGoalFields({ value, onChange, mode }: Props) {
  const locked = mode === "edit";
  return (
    <>
      <Field label="入力方式">
        <div className="grid grid-cols-3 gap-2">
          {TRACK_OPTIONS.map((o) => (
            <Choice
              key={o.type}
              active={value.trackType === o.type}
              disabled={locked && value.trackType !== o.type}
              onClick={() => !locked && onChange(changeTrackType(value, o.type))}
              title={o.label}
              desc={o.desc}
            />
          ))}
        </div>
        {locked && <p className="mt-1.5 text-xs text-stone-500">記録タイプは作成後変更できません</p>}
      </Field>

      {value.trackType === "time" ? (
        <TimeGoalFields value={value} onChange={onChange} />
      ) : (
        <>
          <Field label="目標頻度">
            <div className="grid grid-cols-3 gap-2">
              {PERIOD_OPTIONS.map((o) => (
                <Choice
                  key={o.period}
                  active={value.period === o.period}
                  onClick={() => onChange(changePeriod(value, o.period))}
                  title={o.label}
                />
              ))}
            </div>
          </Field>
          {needsTargetInput(value) && (
            <Field label="目標">
              <NumberField
                label="目標回数"
                value={value.target}
                onChange={(target) => onChange({ ...value, target })}
                step={1}
                min={1}
                max={maxTargetFor(value.trackType, value.period)}
                prefix={value.period === "day" ? "1日" : value.period === "week" ? "週" : "月"}
                unit="回"
              />
              <p className="mt-1.5 text-xs text-stone-500">
                {value.trackType === "check"
                  ? "チェックした日数で数えます（1日1回まで）。"
                  : "1日に何回でも +1 で記録できます。"}
                {value.period !== "day" && "期間が終わるまでは失敗扱いになりません。"}
              </p>
            </Field>
          )}
        </>
      )}
    </>
  );
}

/** 時間型：1日の目安 × 週の実施日数 = 週間目標（手動で上書き可） */
function TimeGoalFields({ value, onChange }: { value: GoalFormState; onChange: (next: GoalFormState) => void }) {
  const time = value.time;
  const auto = autoWeeklyMinutes(time);
  const setTime = (patch: Parameters<typeof updateTimeGoal>[1]) => onChange({ ...value, time: updateTimeGoal(time, patch) });

  return (
    <>
      <Field label="1日の目安">
        <NumberField
          label="1日の目安"
          value={time.dailyMinutes}
          onChange={(dailyMinutes) => setTime({ dailyMinutes })}
          step={5}
          min={0}
          max={TIME_LIMITS.dailyMax}
          emptyValue={0}
          unit="分"
        />
      </Field>
      <Field label="週の実施日数">
        <NumberField
          label="週の実施日数"
          value={time.days}
          onChange={(days) => setTime({ days })}
          step={1}
          min={TIME_LIMITS.daysMin}
          max={TIME_LIMITS.daysMax}
          prefix="週"
          unit="日"
        />
      </Field>
      <Field label="週間目標">
        <NumberField
          label="週間目標"
          value={time.weeklyManual ? time.weeklyMinutes : auto}
          onChange={(weeklyMinutes) => setTime({ weeklyMinutes })}
          step={30}
          min={0}
          max={TIME_LIMITS.weeklyMax}
          emptyValue={0}
          unit="分"
        />
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-xs text-stone-500">
          {time.weeklyManual ? (
            <>
              <span>
                手動設定中（自動計算なら {time.dailyMinutes ?? 0}分 × {time.days ?? 0}日 = {auto}分）
              </span>
              <button
                type="button"
                onClick={() => onChange({ ...value, time: resetTimeGoalToAuto(time) })}
                className="font-bold text-emerald-700 underline"
              >
                自動計算に戻す
              </button>
            </>
          ) : (
            <span>
              自動計算：{time.dailyMinutes ?? 0}分 × {time.days ?? 0}日 = {auto}分（直接入力で変更できます）
            </span>
          )}
        </div>
        {effectiveWeeklyMinutes(time) <= 0 && (
          <p className="mt-1 text-xs text-amber-600">週間目標を1分以上にしてください</p>
        )}
        <p className="mt-1 text-xs text-stone-500">
          週（月〜日）の合計で評価：★150%以上 ◎100%以上 ○70%以上 △50%超 ×50%以下
        </p>
      </Field>
    </>
  );
}
