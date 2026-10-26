import { t, type Locale } from '../i18n';
import type { Key } from '../content/types';

export type ChapterProps = { locale: Locale };

/** Bound translator for one locale. */
export function useT(locale: Locale): (k: Key) => string {
  return (k: Key) => t(locale, k);
}

/** Mono chapter label, e.g. "02 · One call". The dot is dimmed and hidden from assistive tech. */
export function Eyebrow({ text, className }: { text: string; className?: string }) {
  const m = /^(\S+)\s+·\s+(.+)$/.exec(text);
  return (
    <p className={className ? `lbl ${className}` : 'lbl'}>
      {m ? (
        <>
          {m[1]} <i aria-hidden="true">·</i> {m[2]}
        </>
      ) : (
        text
      )}
    </p>
  );
}

/** The part of an eyebrow after "NN · ", e.g. "Path" from "05 · Path". */
export function eyebrowTail(text: string): string {
  const m = /^\S+\s+·\s+(.+)$/.exec(text);
  return m ? m[1] : text;
}

/** The chapter's 3D mount point; see src/three/Stage.tsx for the scene API. */
export { SceneSlot } from '../three/SceneSlot';

export const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' } as const;
