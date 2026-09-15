/** Tiny classnames joiner — not worth pulling in `clsx` for this. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
