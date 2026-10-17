const smooth = (value) => {
  const p = Math.max(0, Math.min(1, value));
  return p * p * (3 - 2 * p);
};
export function educationReveal(scroll, start, end, height, reduced = false) {
  if (reduced) return scroll >= start && scroll < end ? 1 : 0;
  return (
    smooth((scroll - start) / (height * 0.35)) *
    (1 - smooth((scroll - end + height * 0.45) / (height * 0.45)))
  );
}
