export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate: boolean,
): (...args: Parameters<T>) => void {
  let timeout: Nullable<ReturnType<typeof setTimeout>> = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeout as unknown as number);

    const callNow = immediate && !timeout;

    timeout = setTimeout(() => {
      timeout = null;

      if (!immediate) {
        func.apply(this, args);
      }
    }, wait);

    if (callNow) {
      func.apply(this, args);
    }
  };
}
