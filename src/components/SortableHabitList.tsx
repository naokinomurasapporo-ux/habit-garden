"use client";

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { HabitSummary } from "@/lib/habit-logic";
import { reorderHabits } from "@/lib/store";
import type { DateKey, HabitKind } from "@/lib/types";
import { HabitCard } from "./HabitCard";

interface Props {
  kind: HabitKind;
  summaries: HabitSummary[];
  /** 表示日（入力の保存先） */
  date: DateKey;
  today: DateKey;
  onOpenEditor: (id: string) => void;
  onSaved: () => void;
}

/**
 * セクション（続ける / やらない）ごとの並び替え可能なリスト。
 * セクションごとに DndContext を分けているので、セクションを跨いだ移動は起こらない。
 * ドラッグはカード左端のハンドルからのみ開始（タッチは長押し 200ms、マウスは 5px 移動）。
 */
export function SortableHabitList({ kind, summaries, date, today, onOpenEditor, onSaved }: Props) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = summaries.map((s) => s.habit.id);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    reorderHabits(kind, arrayMove(ids, from, to));
    onSaved();
  };

  return (
    <DndContext
      id={`habit-sort-${kind}`}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {summaries.map((s) => (
            <SortableHabitCard
              key={s.habit.id}
              summary={s}
              date={date}
              today={today}
              onOpenEditor={() => onOpenEditor(s.habit.id)}
              onSaved={onSaved}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableHabitCard({
  summary,
  date,
  today,
  onOpenEditor,
  onSaved,
}: {
  summary: HabitSummary;
  date: DateKey;
  today: DateKey;
  onOpenEditor: () => void;
  onSaved: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: summary.habit.id,
  });

  return (
    <HabitCard
      summary={summary}
      date={date}
      today={today}
      onOpenEditor={onOpenEditor}
      onSaved={onSaved}
      sortable={{
        setNodeRef,
        style: { transform: CSS.Translate.toString(transform), transition },
        isDragging,
        handle: (
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`${summary.habit.name}を並び替え（長押ししてドラッグ）`}
            aria-roledescription="並び替えハンドル"
            // 長押し中にスクロール・文字選択・iOS のコールアウトが起きないようにする
            style={{ WebkitTouchCallout: "none" }}
            className={`flex w-6 shrink-0 cursor-grab touch-none items-center justify-center self-stretch rounded-lg text-stone-300 select-none active:cursor-grabbing ${isDragging ? "text-emerald-600" : "active:text-stone-500"}`}
          >
            <svg viewBox="0 0 10 16" width="10" height="16" fill="currentColor" aria-hidden>
              {[2, 8, 14].map((y) => (
                <g key={y}>
                  <circle cx="2.5" cy={y} r="1.4" />
                  <circle cx="7.5" cy={y} r="1.4" />
                </g>
              ))}
            </svg>
          </button>
        ),
      }}
    />
  );
}
