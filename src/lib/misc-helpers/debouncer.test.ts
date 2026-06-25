describe('useDebounce', () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.doUnmock('react');
  });

  it('returns the current state value and schedules an update effect', async () => {
    const setDebouncedValue = vi.fn();
    const clearTimeoutSpy = vi
      .spyOn(globalThis, 'clearTimeout')
      .mockImplementation(() => undefined);
    const setTimeoutSpy = vi
      .spyOn(globalThis, 'setTimeout')
      .mockImplementation(((callback: TimerHandler) => {
        callback();
        return 123 as unknown as ReturnType<typeof setTimeout>;
      }) as typeof setTimeout);

    const useEffectMock = vi.fn((effect: () => void | (() => void)) => effect());

    vi.doMock('react', () => ({
      useEffect: useEffectMock,
      useRef: vi.fn(() => ({ current: 999 })),
      useState: vi.fn(() => ['initial', setDebouncedValue]),
    }));

    const { default: useDebounce } = await import('@/lib/misc-helpers/debouncer');

    const result = useDebounce('next', 250);

    expect(result).toBe('initial');
    expect(useEffectMock).toHaveBeenCalledTimes(1);
    expect(clearTimeoutSpy).toHaveBeenCalledWith(999);
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 250);
    expect(setDebouncedValue).toHaveBeenCalledWith('next');
  });

  it('cleans up the scheduled timeout when the effect unmounts', async () => {
    const cleanupFns: Array<() => void> = [];
    const clearTimeoutSpy = vi
      .spyOn(globalThis, 'clearTimeout')
      .mockImplementation(() => undefined);

    vi.doMock('react', () => ({
      useEffect: vi.fn((effect: () => void | (() => void)) => {
        const cleanup = effect();
        if (cleanup) {
          cleanupFns.push(cleanup);
        }
      }),
      useRef: vi.fn(() => ({ current: 321 })),
      useState: vi.fn(() => ['value', vi.fn()]),
    }));

    const { default: useDebounce } = await import('@/lib/misc-helpers/debouncer');

    useDebounce('value', 100);
    cleanupFns[0]?.();

    expect(clearTimeoutSpy).toHaveBeenCalledWith(321);
  });
});
