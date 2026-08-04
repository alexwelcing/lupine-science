export function deterministicInitScript({ seed, epochMs }) {
  return `(() => {
    let state = ${Number(seed)} >>> 0;
    const random = () => {
      state += 0x6D2B79F5;
      let value = state;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
    Math.random = random;
    const fixedNow = ${Number(epochMs)};
    const NativeDate = Date;
    class FixedDate extends NativeDate {
      constructor(...args) { super(...(args.length ? args : [fixedNow])); }
      static now() { return fixedNow; }
    }
    FixedDate.now = () => fixedNow;
    Object.defineProperty(globalThis, 'Date', { value: FixedDate });
    Date.now = () => fixedNow;
    Object.defineProperty(globalThis, 'devicePixelRatio', { value: 1, configurable: true });
    globalThis.requestAnimationFrame = (callback) => setTimeout(() => callback(fixedNow), 16);
    globalThis.cancelAnimationFrame = clearTimeout;
    const style = document.createElement('style');
    style.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';
    document.documentElement.appendChild(style);
  })();`;
}
