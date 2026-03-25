/**
 * Generates a unique session ID for menu randomization.
 * Combines timestamp with random string for uniqueness.
 * @returns A unique session ID string
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Gets or creates a session ID from sessionStorage.
 * Creates a new ID on first call or after page reload.
 * @returns The session ID string
 */
export function getSessionId(): string {
  const key = 'menu-session-id';
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    // Server-side: return a temporary ID (will be replaced on client)
    return generateSessionId();
  }

  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}

/**
 * Creates a seeded random number generator function.
 * Uses a simple hash function combined with sine for pseudo-randomness.
 * @param seed - A string seed (e.g., sessionId + date string)
 * @returns A function that returns a number between 0 and 1
 */
export function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Return a generator function for consistent random sequences
  let currentHash = hash;
  return () => {
    // Convert to 0-1 range using sine
    const x = Math.sin(currentHash++) * 10000;
    return x - Math.floor(x);
  };
}

/**
 * Formats a date to YYYY-MM-DD string in Vietnam timezone.
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDateForSeed(date: Date): string {
  const vietnamDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const year = vietnamDate.getFullYear();
  const month = String(vietnamDate.getMonth() + 1).padStart(2, '0');
  const day = String(vietnamDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date to YYYY-MM-DD string in Vietnam timezone.
 * @param date - The date to format
 * @returns Formatted date string
 * @deprecated Use formatDateForSeed instead
 */
export function formatDateToVietnam(date: Date): string {
  return formatDateForSeed(date);
}

/**
 * Gets the menu for a specific date using session-based seed.
 * Different sessions will get different random menus for the same date.
 * @param date - The date to get menu for
 * @param totalMenus - Total number of menus available
 * @param sessionId - The session ID for randomization
 * @returns Menu index (0-based)
 */
export function getMenuForDate(date: Date, totalMenus: number, sessionId: string): number {
  const dateStr = formatDateForSeed(date);
  const seed = `${sessionId}-${dateStr}`;
  const random = seededRandom(seed);
  return Math.floor(random() * totalMenus);
}

/**
 * Gets today's date in Vietnam timezone.
 * @returns Today's date normalized to Vietnam timezone
 */
export function getTodayInVietnam(): Date {
  const now = new Date();
  const vietnamStr = now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
  const vietnamDate = new Date(vietnamStr);
  // Reset to start of day
  vietnamDate.setHours(0, 0, 0, 0);
  return vietnamDate;
}
