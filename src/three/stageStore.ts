import { useSyncExternalStore, type ComponentType } from 'react';
import type { SceneProps } from './SceneSlot';

/** One registered scene slot. `track` is the slot's DOM element, as drei <View track> wants it. */
export type StageSlot = {
  id: string;
  track: { current: HTMLElement };
  Scene: ComponentType<SceneProps>;
  visible: boolean;
};

let slots: StageSlot[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function stageSlots(): StageSlot[] {
  return slots;
}

export function registerSlot(slot: StageSlot): () => void {
  slots = [...slots.filter((s) => s.id !== slot.id), slot];
  emit();
  return () => {
    slots = slots.filter((s) => s !== slot && s.id !== slot.id);
    emit();
  };
}

export function setSlotVisible(id: string, visible: boolean): void {
  const s = slots.find((x) => x.id === id);
  if (!s || s.visible === visible) return;
  slots = slots.map((x) => (x === s ? { ...x, visible } : x));
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStageSlots(): StageSlot[] {
  return useSyncExternalStore(subscribe, stageSlots, stageSlots);
}
