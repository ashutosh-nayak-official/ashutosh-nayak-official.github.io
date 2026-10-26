import { act, cleanup, render } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useVisibility } from '../../src/app/useVisibility';

type IOCallback = (entries: { isIntersecting: boolean }[]) => void;
const observers: { cb: IOCallback; targets: Element[] }[] = [];

class FakeIO {
  cb: IOCallback;
  targets: Element[] = [];
  constructor(cb: IOCallback) {
    this.cb = cb;
    observers.push(this);
  }
  observe(el: Element) {
    this.targets.push(el);
  }
  disconnect() {}
}

function Probe({ late }: { late?: boolean }) {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [show, setShow] = useState(!late);
  const visible = useVisibility(el);
  return (
    <>
      <output data-testid="v">{String(visible)}</output>
      <button onClick={() => setShow(true)}>show</button>
      {show && <div ref={setEl} data-testid="target" />}
    </>
  );
}

afterEach(() => {
  cleanup();
  observers.length = 0;
  vi.unstubAllGlobals();
});

describe('useVisibility', () => {
  it('fails open (true) when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { getByTestId } = render(<Probe />);
    expect(getByTestId('v').textContent).toBe('true');
  });

  it('attaches to an element that appears after the first effect', () => {
    vi.stubGlobal('IntersectionObserver', FakeIO);
    const { getByTestId, getByText } = render(<Probe late />);
    expect(observers.flatMap((o) => o.targets)).toHaveLength(0);
    act(() => getByText('show').click());
    const target = getByTestId('target');
    const io = observers.find((o) => o.targets.includes(target));
    expect(io).toBeDefined();
    expect(getByTestId('v').textContent).toBe('false');
    act(() => io!.cb([{ isIntersecting: true }]));
    expect(getByTestId('v').textContent).toBe('true');
  });

  it('is false while the document is hidden', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const spy = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    const { getByTestId } = render(<Probe />);
    expect(getByTestId('v').textContent).toBe('false');
    spy.mockRestore();
  });
});
