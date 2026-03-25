import { useState, useCallback } from 'react';
import type { Menu, MenuCardTranslations } from '@/types/menu';

interface MenuCardProps {
  initialMenu: Menu;
  translations: MenuCardTranslations;
}

export default function MenuCard({
  initialMenu,
  translations,
}: MenuCardProps) {
  const [menu] = useState<Menu>(initialMenu);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleShare = useCallback(async () => {
    const shareUrl = window.location.href;
    const shareTitle = `${translations.menuLabel} #${menu.id}`;
    const shareText = menu.dishes.join(', ');

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or share failed
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  }, [menu, translations.menuLabel]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    }).catch(() => {
      // Fallback for older browsers or permission denied
      console.warn('Clipboard write failed');
    });
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="menu-card-container">
      <article
        className="menu-card"
        aria-live="polite"
      >
        {/* Menu Image */}
        {menu.image && !imageError && (
          <div className="menu-card__image-wrapper">
            <img
              src={menu.image}
              alt={`${translations.menuLabel} #${menu.id}`}
              className="menu-card__image"
              loading="lazy"
              onError={handleImageError}
            />
          </div>
        )}

        <header className="menu-card__header">
          <span className="menu-card__badge">
            {translations.menuLabel} #{menu.id}
          </span>
        </header>

        <div className="menu-card__content">
          <h2 className="menu-card__dishes-label">
            {translations.dishesLabel}:
          </h2>
          <ul className="menu-card__dishes-list">
            {menu.dishes.map((dish, index) => (
              <li key={index} className="menu-card__dish-item">
                {dish}
              </li>
            ))}
          </ul>
        </div>

        <footer className="menu-card__actions">
          <button
            type="button"
            onClick={handleShare}
            className="menu-card__button menu-card__button--share"
            aria-label={translations.shareButtonText}
          >
            <svg
              className="menu-card__icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            {translations.shareButtonText}
          </button>
        </footer>
      </article>

      {showCopiedToast && (
        <div className="menu-card__toast" role="status" aria-live="polite">
          {translations.linkCopied}
        </div>
      )}

      <style>{`
        .menu-card-container {
          position: relative;
        }

        .menu-card {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }

        .menu-card__image-wrapper {
          width: 100%;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background: var(--color-neutral-100);
        }

        .menu-card__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .menu-card:hover .menu-card__image {
          transform: scale(1.05);
        }

        .menu-card__header {
          padding: 1rem 1.5rem 0;
        }

        .menu-card__badge {
          display: inline-block;
          background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
          color: white;
          padding: 0.375rem 0.875rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .menu-card__content {
          text-align: left;
          padding: 1rem 1.5rem;
        }

        .menu-card__dishes-label {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-neutral-700);
          margin-bottom: 0.75rem;
        }

        .menu-card__dishes-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .menu-card__dish-item {
          position: relative;
          padding: 0.5rem 0 0.5rem 1.5rem;
          font-size: 1rem;
          color: var(--color-neutral-800);
        }

        .menu-card__dish-item:last-child {
          border-bottom: none;
        }

        .menu-card__dish-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 0.5rem;
          height: 0.5rem;
          background: var(--color-primary-400);
          border-radius: 50%;
        }

        .menu-card__actions {
          display: flex;
          justify-content: flex-end;
          padding: 0 1.5rem 1.5rem;
        }

        .menu-card__button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          min-height: 44px;
          font-size: 0.9375rem;
          font-weight: 500;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .menu-card__button--share {
          background: white;
          color: var(--color-neutral-900);
        }

        .menu-card__button--share:hover {
          background: var(--color-neutral-50);
          border-color: var(--color-neutral-300);
          transform: translateY(-1px);
        }

        .menu-card__icon {
          width: 1.125rem;
          height: 1.125rem;
        }

        .menu-card__toast {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: var(--color-neutral-900);
          color: white;
          padding: 0.75rem 1.25rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          animation: slideUp 0.3s ease;
          z-index: 50;
        }

        @keyframes slideUp {
          from {
            transform: translateX(-50%) translateY(1rem);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
