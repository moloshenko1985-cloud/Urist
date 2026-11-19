/**
 * Subtle tactile feedback helper for mobile browsers that support the Vibration API.
 * Gracefully no-ops on desktop and iOS Safari where navigator.vibrate is unavailable.
 */
function vibrate(pattern: number | number[]): void {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch {
    // ignore unsupported or blocked vibration calls
  }
}

export const haptics = {
  light: () => vibrate(8),
  medium: () => vibrate(14),
  success: () => vibrate([10, 36, 12]),
  warning: () => vibrate([18, 45, 18]),
};
