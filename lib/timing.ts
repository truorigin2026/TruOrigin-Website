/**
 * Pads a response so it always takes at least `minMs`, regardless of which
 * branch of the caller's logic actually ran. Used on auth endpoints where
 * "the real work" (a bcrypt compare, a DB write, an external email send)
 * only happens on some branches — without this, how long a response takes
 * leaks which branch ran, which leaks account existence/eligibility even
 * when every branch returns an identical, generic response body.
 *
 * This is a mitigation, not a perfect fix: it closes the obvious gap
 * (near-instant vs. hundreds-of-ms), but a branch that's slower than
 * minMs (e.g. a slow external API call) still stands out. Pick minMs
 * comfortably above the slowest *expected* real-work branch.
 */
export async function padToMinimumDuration(startedAt: number, minMs: number): Promise<void> {
  const elapsed = Date.now() - startedAt;
  if (elapsed < minMs) {
    await new Promise((resolve) => setTimeout(resolve, minMs - elapsed));
  }
}
