import { useState, useMemo, useCallback, useEffect } from 'react';
import DatePicker from './DatePicker';
import MenuDisplay, { type Menu } from './MenuDisplay';
import { getMenuForDate, getSessionId, getTodayInVietnam } from '@/utils/seeded-random';

export interface MenuWithDatePickerProps {
  menus: Menu[];
  locale: 'vi' | 'en';
  labels: {
    pageTitle: string;
    pageSubtitle: string;
    menuLabel: string;
    dishesLabel: string;
    shareButtonText: string;
    sourceCredit: string;
    datePickerTitle: string;
    todayLabel: string;
    selectDateTrigger: string;
    linkCopied: string;
    shareFacebook: string;
    shareTwitter: string;
    copyLink: string;
  };
  weekdayNames: string[];
  monthNames: string[];
}

export default function MenuWithDatePicker({
  menus,
  locale,
  labels,
  weekdayNames,
  monthNames,
}: MenuWithDatePickerProps) {
  // Initialize selected date to today in Vietnam timezone
  const [selectedDate, setSelectedDate] = useState(() => getTodayInVietnam());

  // Session ID state - initialized on client-side only
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize sessionId on component mount (client-side only)
  useEffect(() => {
    // Get or create sessionId from sessionStorage
    // This ensures new random menus on page reload
    const id = getSessionId();
    setSessionId(id);
  }, []);

  // Calculate min and max dates
  const { minDate, maxDate } = useMemo(() => {
    const today = getTodayInVietnam();
    const max = new Date(today);
    max.setDate(max.getDate() + 30);
    return { minDate: today, maxDate: max };
  }, []);

  // Get menu for selected date using session-based seeded random
  const currentMenu = useMemo(() => {
    // Wait for sessionId to be initialized
    if (!sessionId) {
      // Return first menu as placeholder during SSR/initial render
      return menus[0];
    }
    const menuIndex = getMenuForDate(selectedDate, menus.length, sessionId);
    return menus[menuIndex];
  }, [selectedDate, menus, sessionId]);

  // Handle date change
  const handleDateChange = useCallback((date: Date) => {
    // Normalize to start of day
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    setSelectedDate(normalizedDate);
  }, []);

  // Handle share tracking (optional analytics)
  const handleShare = useCallback((platform: 'facebook' | 'twitter' | 'copy-link') => {
    // Could add analytics tracking here
    console.log(`Shared on ${platform}`);
  }, []);

  return (
    <div className="menu-with-datepicker">
      {/* Header */}
      <header className="menu-with-datepicker__header">
        <h2 className="menu-with-datepicker__title">{labels.pageTitle}</h2>
        <p className="menu-with-datepicker__subtitle">{labels.pageSubtitle}</p>
      </header>

      {/* Main content with sidebar layout */}
      <div className="menu-with-datepicker__content">
        {/* Sidebar: DatePicker */}
        <div className="menu-with-datepicker__sidebar" role="region" aria-label={labels.datePickerTitle}>
          <DatePicker
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            minDate={minDate}
            maxDate={maxDate}
            locale={locale}
            labels={{
              datePickerTitle: labels.datePickerTitle,
              todayLabel: labels.todayLabel,
              selectDateTrigger: labels.selectDateTrigger,
            }}
            weekdayNames={weekdayNames}
            monthNames={monthNames}
          />
        </div>

        {/* Menu content area */}
        <div className="menu-with-datepicker__main">
          <MenuDisplay
            menu={currentMenu}
            selectedDate={selectedDate}
            onShare={handleShare}
            locale={locale}
            labels={{
              menuLabel: labels.menuLabel,
              dishesLabel: labels.dishesLabel,
              shareButtonText: labels.shareButtonText,
              sourceCredit: labels.sourceCredit,
              linkCopied: labels.linkCopied,
              shareFacebook: labels.shareFacebook,
              shareTwitter: labels.shareTwitter,
              copyLink: labels.copyLink,
            }}
          />
        </div>
      </div>

      <style>{`
        .menu-with-datepicker {
          min-height: 100vh;
          padding: 1.5rem 1rem 3rem;
          background: linear-gradient(
            135deg,
            var(--color-primary-50, #fef7ed) 0%,
            var(--color-secondary-50, #f0fdf4) 50%,
            var(--color-primary-50, #fef7ed) 100%
          );
        }

        /* Header */
        .menu-with-datepicker__header {
          text-align: center;
          margin-bottom: 2rem;
          padding: 0 1rem;
        }

        .menu-with-datepicker__title {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--color-neutral-900, #171717);
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }

        .menu-with-datepicker__subtitle {
          font-size: 1.0625rem;
          color: var(--color-neutral-600, #525252);
          margin: 0;
        }

        /* Content layout */
        .menu-with-datepicker__content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Sidebar */
        .menu-with-datepicker__sidebar {
          width: 100%;
        }

        /* Main content */
        .menu-with-datepicker__main {
          width: 100%;
          flex: 1;
        }

        /* Tablet and up: sidebar layout */
        @media (min-width: 768px) {
          .menu-with-datepicker {
            padding: 2rem 1.5rem 4rem;
          }

          .menu-with-datepicker__header {
            margin-bottom: 2.5rem;
          }

          .menu-with-datepicker__title {
            font-size: 2.5rem;
          }

          .menu-with-datepicker__subtitle {
            font-size: 1.125rem;
          }

          .menu-with-datepicker__content {
            flex-direction: row;
            align-items: flex-start;
            gap: 2rem;
          }

          .menu-with-datepicker__sidebar {
            width: 280px;
            flex-shrink: 0;
          }

          .menu-with-datepicker__main {
            max-width: 600px;
          }
        }

        /* Tablet specific */
        @media (min-width: 768px) and (max-width: 1023px) {
          .menu-with-datepicker__sidebar {
            width: 240px;
          }

          .menu-with-datepicker__content {
            gap: 1.5rem;
          }
        }

        /* Desktop */
        @media (min-width: 1024px) {
          .menu-with-datepicker {
            padding: 3rem 2rem 5rem;
          }

          .menu-with-datepicker__header {
            margin-bottom: 3rem;
          }

          .menu-with-datepicker__title {
            font-size: 3rem;
          }

          .menu-with-datepicker__content {
            gap: 3rem;
          }
        }
      `}</style>
    </div>
  );
}
