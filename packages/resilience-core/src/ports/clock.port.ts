export interface Clock {
  now(): number;
  sleep(delayMs: number, signal?: AbortSignal): Promise<void>;
}

export class SystemClock implements Clock {
  now(): number {
    return performance.now();
  }

  sleep(delayMs: number, signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, Math.max(0, delayMs));
      const abort = () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      };
      signal?.addEventListener('abort', abort, { once: true });
    });
  }
}
