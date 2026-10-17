const clamp = (value) => Math.max(0, Math.min(1, value));
const smooth = (value) => {
  const p = clamp(value);
  return p * p * (3 - 2 * p);
};
export function coreMotion(progress, reduced = false) {
  if (reduced) return { cover: 0, modules: Array(6).fill(0) };
  const p = clamp(Number.isFinite(progress) ? progress : 0);
  return {
    cover: smooth(p / 0.3),
    modules: Array.from({ length: 6 }, (_, i) =>
      smooth((p - 0.18 - i * 0.065) / 0.46),
    ),
  };
}
