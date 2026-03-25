import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  locale?: 'vi' | 'en';
  labels?: {
    datePickerTitle: string;
    todayLabel: string;
    selectDateTrigger: string;
  };
  weekdayNames?: string[];
  monthNames?: string[];
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

const DEFAULT_WEEKDAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const DEFAULT_WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DEFAULT_MONTHS_VI = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];
const DEFAULT_MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isDateBefore(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return d1.getTime() < d2.getTime();
}

function isDateAfter(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return d1.getTime() > d2.getTime();
}

export default function DatePicker({
  selectedDate,
  onDateChange,
  minDate,
  maxDate,
  locale = 'vi',
  labels = {
    datePickerTitle: locale === 'vi' ? 'Chọn ngày' : 'Select date',
    todayLabel: locale === 'vi' ? 'Hôm nay' : 'Today',
    selectDateTrigger: locale === 'vi' ? 'Chọn ngày khác' : 'Select another date',
  },
  weekdayNames = locale === 'vi' ? DEFAULT_WEEKDAYS_VI : DEFAULT_WEEKDAYS_EN,
  monthNames = locale === 'vi' ? DEFAULT_MONTHS_VI : DEFAULT_MONTHS_EN,
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  });
  const [isCollapsed, setIsCollapsed] = useState(true);

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const calendarDays = useMemo((): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Get the day of week for the first day (0 = Sunday)
    const startDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];

    // Add days from previous month to fill the first week
    const prevMonthLastDay = new Date(year, month, 0);
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay.getDate() - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        isSelected: isSameDay(date, selectedDate),
        isDisabled: (minDate && isDateBefore(date, minDate)) || (maxDate && isDateAfter(date, maxDate)) || false,
      });
    }

    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        isSelected: isSameDay(date, selectedDate),
        isDisabled: (minDate && isDateBefore(date, minDate)) || (maxDate && isDateAfter(date, maxDate)) || false,
      });
    }

    // Add days from next month to complete the grid (6 rows x 7 days = 42)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        isSelected: isSameDay(date, selectedDate),
        isDisabled: (minDate && isDateBefore(date, minDate)) || (maxDate && isDateAfter(date, maxDate)) || false,
      });
    }

    return days;
  }, [currentMonth, selectedDate, today, minDate, maxDate]);

  const canGoPrevMonth = useMemo(() => {
    if (!minDate) return true;
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    return prevMonth >= minMonth;
  }, [currentMonth, minDate]);

  const canGoNextMonth = useMemo(() => {
    if (!maxDate) return true;
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    return nextMonth <= maxMonth;
  }, [currentMonth, maxDate]);

  const goToPrevMonth = useCallback(() => {
    if (canGoPrevMonth) {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  }, [canGoPrevMonth]);

  const goToNextMonth = useCallback(() => {
    if (canGoNextMonth) {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  }, [canGoNextMonth]);

  const handleDateSelect = useCallback((day: CalendarDay) => {
    if (!day.isDisabled) {
      onDateChange(day.date);
      setIsCollapsed(true);
    }
  }, [onDateChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, day: CalendarDay) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDateSelect(day);
    }
  }, [handleDateSelect]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const formatSelectedDate = useCallback((date: Date) => {
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    if (locale === 'vi') {
      return `${day} ${month}, ${year}`;
    }
    return `${month} ${day}, ${year}`;
  }, [monthNames, locale]);

  return (
    <div className="datepicker">
      {/* Mobile collapse trigger */}
      <button
        type="button"
        className="datepicker__mobile-trigger"
        onClick={toggleCollapse}
        aria-expanded={!isCollapsed}
        aria-controls="datepicker-calendar"
      >
        <Calendar className="datepicker__trigger-icon" aria-hidden="true" />
        <span className="datepicker__trigger-text">
          {isCollapsed ? labels.selectDateTrigger : formatSelectedDate(selectedDate)}
        </span>
        <ChevronRight
          className={`datepicker__trigger-chevron ${!isCollapsed ? 'datepicker__trigger-chevron--open' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Calendar container */}
      <div
        id="datepicker-calendar"
        className={`datepicker__calendar ${isCollapsed ? 'datepicker__calendar--collapsed' : ''}`}
        role="application"
        aria-label={labels.datePickerTitle}
      >
        {/* Header with month navigation */}
        <div className="datepicker__header">
          <h2 className="datepicker__title">{labels.datePickerTitle}</h2>
          <div className="datepicker__nav">
            <button
              type="button"
              className="datepicker__nav-btn"
              onClick={goToPrevMonth}
              disabled={!canGoPrevMonth}
              aria-label={locale === 'vi' ? 'Tháng trước' : 'Previous month'}
            >
              <ChevronLeft className="datepicker__nav-icon" aria-hidden="true" />
            </button>
            <span className="datepicker__month-label">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              type="button"
              className="datepicker__nav-btn"
              onClick={goToNextMonth}
              disabled={!canGoNextMonth}
              aria-label={locale === 'vi' ? 'Tháng sau' : 'Next month'}
            >
              <ChevronRight className="datepicker__nav-icon" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="datepicker__weekdays" role="row">
          {weekdayNames.map((day, index) => (
            <div
              key={index}
              className="datepicker__weekday"
              role="columnheader"
              aria-label={day}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="datepicker__grid" role="grid">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              type="button"
              className={`datepicker__day ${!day.isCurrentMonth ? 'datepicker__day--outside' : ''} ${day.isToday ? 'datepicker__day--today' : ''} ${day.isSelected ? 'datepicker__day--selected' : ''} ${day.isDisabled ? 'datepicker__day--disabled' : ''}`}
              onClick={() => handleDateSelect(day)}
              onKeyDown={(e) => handleKeyDown(e, day)}
              disabled={day.isDisabled}
              aria-label={`${day.date.getDate()} ${monthNames[day.date.getMonth()]} ${day.date.getFullYear()}${day.isToday ? ` (${labels.todayLabel})` : ''}`}
              aria-selected={day.isSelected}
              aria-disabled={day.isDisabled}
              tabIndex={day.isSelected ? 0 : -1}
            >
              <span className="datepicker__day-number">{day.date.getDate()}</span>
            </button>
          ))}
        </div>

        {/* Today indicator */}
        <div className="datepicker__footer">
          <button
            type="button"
            className="datepicker__today-btn"
            onClick={() => {
              if (!minDate || !isDateBefore(today, minDate)) {
                onDateChange(today);
                setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
              }
            }}
            disabled={minDate ? isDateBefore(today, minDate) : false}
          >
            {labels.todayLabel}
          </button>
        </div>
      </div>

      <style>{`
        .datepicker {
          width: 100%;
        }

        /* Mobile trigger button */
        .datepicker__mobile-trigger {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 1rem;
          background: white;
          border: 1px solid var(--color-border, #e5e5e5);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .datepicker__mobile-trigger:hover {
          border-color: var(--color-primary-400, #f19132);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .datepicker__trigger-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: var(--color-primary-500, #ed7512);
          flex-shrink: 0;
        }

        .datepicker__trigger-text {
          flex: 1;
          text-align: left;
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--color-neutral-700, #404040);
        }

        .datepicker__trigger-chevron {
          width: 1.25rem;
          height: 1.25rem;
          color: var(--color-neutral-400, #a3a3a3);
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }

        .datepicker__trigger-chevron--open {
          transform: rotate(90deg);
        }

        /* Calendar container */
        .datepicker__calendar {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          margin-top: 0.75rem;
        }

        .datepicker__calendar--collapsed {
          display: none;
        }

        /* Header */
        .datepicker__header {
          padding: 1rem 1rem 0.75rem;
          border-bottom: 1px solid var(--color-neutral-100, #f5f5f5);
        }

        .datepicker__title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-neutral-500, #737373);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .datepicker__nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .datepicker__nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          background: var(--color-neutral-50, #fafafa);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .datepicker__nav-btn:hover:not(:disabled) {
          background: var(--color-neutral-100, #f5f5f5);
        }

        .datepicker__nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .datepicker__nav-icon {
          width: 1.125rem;
          height: 1.125rem;
          color: var(--color-neutral-600, #525252);
        }

        .datepicker__month-label {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-neutral-800, #262626);
        }

        /* Weekday headers */
        .datepicker__weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          padding: 0.75rem 0.5rem 0.5rem;
        }

        .datepicker__weekday {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-neutral-400, #a3a3a3);
          text-transform: uppercase;
        }

        /* Calendar grid */
        .datepicker__grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
          padding: 0 0.5rem 0.5rem;
        }

        .datepicker__day {
          display: flex;
          align-items: center;
          justify-content: center;
          aspect-ratio: 1;
          border: none;
          border-radius: 10px;
          background: transparent;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
        }

        .datepicker__day:hover:not(:disabled):not(.datepicker__day--selected) {
          background: var(--color-neutral-100, #f5f5f5);
        }

        .datepicker__day:focus-visible {
          outline: 2px solid var(--color-primary-500, #ed7512);
          outline-offset: 2px;
        }

        .datepicker__day-number {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-neutral-700, #404040);
        }

        /* Outside current month */
        .datepicker__day--outside .datepicker__day-number {
          color: var(--color-neutral-300, #d4d4d4);
        }

        /* Today */
        .datepicker__day--today {
          background: transparent;
          box-shadow: inset 0 0 0 2px var(--color-primary-400, #f19132);
        }

        .datepicker__day--today .datepicker__day-number {
          color: var(--color-primary-600, #de5a08);
          font-weight: 600;
        }

        /* Selected */
        .datepicker__day--selected {
          background: linear-gradient(135deg, var(--color-primary-500, #ed7512), var(--color-primary-600, #de5a08));
          box-shadow: 0 4px 12px rgba(237, 117, 18, 0.3);
        }

        .datepicker__day--selected .datepicker__day-number {
          color: white;
          font-weight: 600;
        }

        .datepicker__day--selected.datepicker__day--today {
          box-shadow: 0 4px 12px rgba(237, 117, 18, 0.3);
        }

        /* Disabled */
        .datepicker__day--disabled {
          cursor: not-allowed;
          opacity: 0.4;
        }

        .datepicker__day--disabled .datepicker__day-number {
          text-decoration: line-through;
          color: var(--color-neutral-400, #a3a3a3);
        }

        /* Footer */
        .datepicker__footer {
          padding: 0.75rem 1rem 1rem;
          border-top: 1px solid var(--color-neutral-100, #f5f5f5);
        }

        .datepicker__today-btn {
          width: 100%;
          padding: 0.625rem 1rem;
          background: var(--color-neutral-50, #fafafa);
          border: 1px solid var(--color-neutral-200, #e5e5e5);
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-neutral-700, #404040);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .datepicker__today-btn:hover:not(:disabled) {
          background: var(--color-neutral-100, #f5f5f5);
          border-color: var(--color-neutral-300, #d4d4d4);
        }

        .datepicker__today-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Desktop/Tablet: always visible */
        @media (min-width: 768px) {
          .datepicker {
            width: 280px;
            position: sticky;
            top: 1.5rem;
          }

          .datepicker__mobile-trigger {
            display: none;
          }

          .datepicker__calendar {
            display: block !important;
            margin-top: 0;
          }

          .datepicker__calendar--collapsed {
            display: block !important;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .datepicker {
            width: 240px;
          }

          .datepicker__day-number {
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </div>
  );
}
