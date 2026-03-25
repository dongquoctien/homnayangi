import { useState, useCallback, useEffect, useRef } from 'react';
import { Share2, Facebook, Twitter, Link2, Check } from 'lucide-react';

export interface Menu {
  id: number;
  dishes: string[];
  image?: string;
}

export interface MenuDisplayProps {
  menu: Menu;
  selectedDate: Date;
  onShare?: (platform: 'facebook' | 'twitter' | 'copy-link') => void;
  labels?: {
    menuLabel: string;
    dishesLabel: string;
    shareButtonText: string;
    sourceCredit: string;
    linkCopied?: string;
    shareFacebook?: string;
    shareTwitter?: string;
    copyLink?: string;
  };
  locale?: 'vi' | 'en';
}

export default function MenuDisplay({
  menu,
  selectedDate,
  onShare,
  labels = {
    menuLabel: 'Menu',
    dishesLabel: 'Dishes',
    shareButtonText: 'Share',
    sourceCredit: 'Source: suckhoedoisong.vn',
    linkCopied: 'Link copied!',
    shareFacebook: 'Share on Facebook',
    shareTwitter: 'Share on Twitter',
    copyLink: 'Copy link',
  },
  locale = 'vi',
}: MenuDisplayProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const prevMenuRef = useRef(menu.id);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Trigger animation when menu changes
  useEffect(() => {
    if (prevMenuRef.current !== menu.id) {
      setIsAnimating(true);
      setImageError(false);
      setImageLoaded(false);
      const timer = setTimeout(() => setIsAnimating(false), 400);
      prevMenuRef.current = menu.id;
      return () => clearTimeout(timer);
    }
  }, [menu.id]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  const formatDate = useCallback((date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (locale === 'vi') {
      return `${day}/${month}/${year}`;
    }
    return `${month}/${day}/${year}`;
  }, [locale]);

  const handleShare = useCallback(async (platform: 'facebook' | 'twitter' | 'copy-link') => {
    const shareUrl = window.location.href;
    const shareTitle = `${labels.menuLabel} #${menu.id} - ${formatDate(selectedDate)}`;
    const shareText = menu.dishes.join(', ');

    setShowShareMenu(false);

    switch (platform) {
      case 'facebook': {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`;
        window.open(fbUrl, '_blank', 'width=600,height=400');
        break;
      }
      case 'twitter': {
        const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`${shareTitle}\n${shareText}`)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
        break;
      }
      case 'copy-link': {
        try {
          await navigator.clipboard.writeText(shareUrl);
          setShowCopiedToast(true);
          setTimeout(() => setShowCopiedToast(false), 2000);
        } catch {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = shareUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setShowCopiedToast(true);
          setTimeout(() => setShowCopiedToast(false), 2000);
        }
        break;
      }
    }

    onShare?.(platform);
  }, [menu, selectedDate, labels.menuLabel, formatDate, onShare]);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  return (
    <div className="menu-display">
      <article
        className={`menu-display__card ${isAnimating ? 'menu-display__card--animating' : ''}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Menu Image with Skeleton Loading */}
        {menu.image && !imageError && (
          <div className="menu-display__image-wrapper">
            {/* Skeleton placeholder */}
            {!imageLoaded && (
              <div className="menu-display__skeleton" aria-hidden="true">
                <div className="menu-display__skeleton-shimmer" />
              </div>
            )}
            <img
              src={menu.image}
              alt={`${labels.menuLabel} #${menu.id}`}
              className={`menu-display__image ${imageLoaded ? 'menu-display__image--loaded' : ''}`}
              loading="lazy"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </div>
        )}

        {/* Menu Header */}
        <header className="menu-display__header">
          <div className="menu-display__badge-row">
            <h3 className="menu-display__badge">
              {labels.menuLabel} #{menu.id}
            </h3>
            <span className="menu-display__date">
              {formatDate(selectedDate)}
            </span>
          </div>
        </header>

        {/* Dishes List */}
        <div className="menu-display__content">
          <h4 className="menu-display__dishes-label">
            {labels.dishesLabel}:
          </h4>
          <ul className="menu-display__dishes-list">
            {menu.dishes.map((dish, index) => (
              <li
                key={index}
                className="menu-display__dish-item"
                style={{ animationDelay: isAnimating ? `${index * 50}ms` : '0ms' }}
              >
                <span className="menu-display__dish-bullet" aria-hidden="true" />
                <span className="menu-display__dish-name">{dish}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <footer className="menu-display__footer">
          <div className="menu-display__share-container" ref={shareMenuRef}>
            <button
              type="button"
              className="menu-display__share-btn"
              onClick={() => setShowShareMenu(!showShareMenu)}
              aria-expanded={showShareMenu}
              aria-haspopup="menu"
              aria-label={labels.shareButtonText}
            >
              <Share2 className="menu-display__share-icon" aria-hidden="true" />
              <span>{labels.shareButtonText}</span>
            </button>

            {/* Share dropdown menu */}
            {showShareMenu && (
              <div className="menu-display__share-menu" role="menu">
                <button
                  type="button"
                  className="menu-display__share-option"
                  onClick={() => handleShare('facebook')}
                  role="menuitem"
                >
                  <Facebook className="menu-display__share-option-icon" aria-hidden="true" />
                  <span>{labels.shareFacebook || 'Facebook'}</span>
                </button>
                <button
                  type="button"
                  className="menu-display__share-option"
                  onClick={() => handleShare('twitter')}
                  role="menuitem"
                >
                  <Twitter className="menu-display__share-option-icon" aria-hidden="true" />
                  <span>{labels.shareTwitter || 'Twitter'}</span>
                </button>
                <button
                  type="button"
                  className="menu-display__share-option"
                  onClick={() => handleShare('copy-link')}
                  role="menuitem"
                >
                  <Link2 className="menu-display__share-option-icon" aria-hidden="true" />
                  <span>{labels.copyLink || 'Copy link'}</span>
                </button>
              </div>
            )}
          </div>

          <p className="menu-display__source">{labels.sourceCredit}</p>
        </footer>
      </article>

      {/* Toast notification */}
      {showCopiedToast && (
        <div className="menu-display__toast" role="status" aria-live="polite">
          <Check className="menu-display__toast-icon" aria-hidden="true" />
          <span>{labels.linkCopied}</span>
        </div>
      )}

      <style>{`
        .menu-display {
          position: relative;
          width: 100%;
        }

        .menu-display__card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .menu-display__card:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        /* Animation on date change */
        .menu-display__card--animating {
          animation: fadeSlideIn 0.4s ease-out;
        }

        @keyframes fadeSlideIn {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Image */
        .menu-display__image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #e0e0e0;
          border-radius: 12px 12px 0 0;
        }

        /* Skeleton Loading */
        .menu-display__skeleton {
          position: absolute;
          inset: 0;
          background: #e0e0e0;
          z-index: 1;
        }

        .menu-display__skeleton-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            #f5f5f5 50%,
            transparent 100%
          );
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .menu-display__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.3s ease-out, transform 0.3s ease;
        }

        .menu-display__image--loaded {
          opacity: 1;
        }

        .menu-display__card:hover .menu-display__image--loaded {
          transform: scale(1.03);
        }

        /* Header */
        .menu-display__header {
          padding: 1.25rem 1.5rem 0;
        }

        .menu-display__badge-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .menu-display__badge {
          display: inline-block;
          background: linear-gradient(135deg, var(--color-primary-500, #ed7512), var(--color-primary-600, #de5a08));
          color: white;
          padding: 0.375rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(237, 117, 18, 0.25);
          margin: 0;
        }

        .menu-display__date {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-neutral-500, #737373);
        }

        /* Content */
        .menu-display__content {
          padding: 1rem 1.5rem 1.25rem;
        }

        .menu-display__dishes-label {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-neutral-700, #404040);
          margin-bottom: 0.875rem;
        }

        .menu-display__dishes-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .menu-display__dish-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.625rem 0;
          border-bottom: 1px solid var(--color-neutral-100, #f5f5f5);
        }

        .menu-display__card--animating .menu-display__dish-item {
          animation: dishFadeIn 0.3s ease-out forwards;
          opacity: 0;
        }

        @keyframes dishFadeIn {
          0% {
            opacity: 0;
            transform: translateX(-8px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .menu-display__dish-item:last-child {
          border-bottom: none;
        }

        .menu-display__dish-bullet {
          flex-shrink: 0;
          width: 8px;
          height: 8px;
          margin-top: 0.5rem;
          background: linear-gradient(135deg, var(--color-primary-400, #f19132), var(--color-primary-500, #ed7512));
          border-radius: 50%;
        }

        .menu-display__dish-name {
          font-size: 1rem;
          color: var(--color-neutral-800, #262626);
          line-height: 1.5;
        }

        /* Footer */
        .menu-display__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem 1.25rem;
          border-top: 1px solid var(--color-neutral-100, #f5f5f5);
          background: var(--color-neutral-50, #fafafa);
        }

        .menu-display__share-container {
          position: relative;
        }

        .menu-display__share-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: white;
          border: 1px solid var(--color-neutral-200, #e5e5e5);
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-neutral-700, #404040);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .menu-display__share-btn:hover {
          background: var(--color-neutral-100, #f5f5f5);
          border-color: var(--color-neutral-300, #d4d4d4);
        }

        .menu-display__share-icon {
          width: 1rem;
          height: 1rem;
        }

        /* Share dropdown menu */
        .menu-display__share-menu {
          position: absolute;
          bottom: 100%;
          left: 0;
          margin-bottom: 0.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          min-width: 210px;
          z-index: 10;
          animation: dropdownFadeIn 0.15s ease-out;
        }

        @keyframes dropdownFadeIn {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .menu-display__share-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.875rem 1rem;
          background: transparent;
          border: none;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-neutral-700, #404040);
          cursor: pointer;
          text-align: left;
          transition: background 0.15s ease;
        }

        .menu-display__share-option:hover {
          background: var(--color-neutral-50, #fafafa);
        }

        .menu-display__share-option:not(:last-child) {
          border-bottom: 1px solid var(--color-neutral-100, #f5f5f5);
        }

        .menu-display__share-option-icon {
          width: 1.125rem;
          height: 1.125rem;
          color: var(--color-neutral-500, #737373);
        }

        /* Source credit */
        .menu-display__source {
          font-size: 0.75rem;
          color: var(--color-neutral-400, #a3a3a3);
          margin: 0;
        }

        /* Toast */
        .menu-display__toast {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--color-neutral-900, #171717);
          color: white;
          padding: 0.875rem 1.25rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          z-index: 100;
          animation: toastSlideUp 0.3s ease-out;
        }

        @keyframes toastSlideUp {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(1rem);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .menu-display__toast-icon {
          width: 1rem;
          height: 1rem;
          color: var(--color-secondary-400, #4ade80);
        }

        /* Responsive */
        @media (min-width: 768px) {
          .menu-display__content {
            padding: 1.25rem 1.75rem 1.5rem;
          }

          .menu-display__header {
            padding: 1.5rem 1.75rem 0;
          }

          .menu-display__footer {
            padding: 1rem 1.75rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
