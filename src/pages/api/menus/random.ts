import type { APIRoute } from 'astro';
import type { Menu, MenuApiResponse } from '@/types/menu';
import menusData from '@/data/menus.json';

/**
 * Simple seeded random number generator
 * Uses a string (like date) as seed to generate consistent random numbers
 */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to positive number between 0 and 1
  return Math.abs(hash % 1000000) / 1000000;
}

/**
 * Get today's date string in YYYY-MM-DD format
 * Uses Vietnam timezone (UTC+7)
 */
function getTodayDateString(): string {
  const now = new Date();
  // Convert to Vietnam timezone
  const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  return vietnamTime.toISOString().split('T')[0];
}

export const GET: APIRoute = async ({ url }) => {
  const dateParam = url.searchParams.get('date');
  const forceRandom = url.searchParams.get('random') === 'true';

  const menus: Menu[] = menusData.menus;

  if (menus.length === 0) {
    const response: MenuApiResponse = {
      success: false,
      error: 'No menus available',
    };

    return new Response(JSON.stringify(response), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  let menu: Menu;

  if (forceRandom) {
    // Force random mode - truly random selection (for "Đổi món" button)
    const exclude = url.searchParams.get('exclude');
    let availableMenus = menus;

    if (exclude) {
      const excludeId = parseInt(exclude, 10);
      if (!isNaN(excludeId)) {
        availableMenus = menus.filter((m) => m.id !== excludeId);
      }
    }

    const randomIndex = Math.floor(Math.random() * availableMenus.length);
    menu = availableMenus[randomIndex];
  } else {
    // Date-based random mode - same menu for the same day
    const dateString = dateParam || getTodayDateString();
    const randomValue = seededRandom(dateString);
    const index = Math.floor(randomValue * menus.length);
    menu = menus[index];
  }

  const response: MenuApiResponse = {
    success: true,
    data: menu,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': forceRandom
        ? 'no-cache, no-store, must-revalidate'
        : 'public, max-age=3600', // Cache for 1 hour for date-based
    },
  });
};
