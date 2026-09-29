import React from 'react';
import './BackButton.css';

/**
 * Reusable BackButton component for internal pages and sub-views.
 * Fits naturally into the GreenGuide botanical aesthetic with high contrast
 * and keyboard/screen-reader accessibility.
 */
function BackButton({
  onClick,
  onPageChange,
  onNavigate,
  fallbackPage = 'dashboard',
  label = 'Back',
  className = '',
  ariaLabel
}) {
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }

    const nav = onPageChange || onNavigate;
    if (nav) {
      nav(fallbackPage);
    } else if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <button
      type="button"
      className={`back-button ${className}`.trim()}
      onClick={handleClick}
      aria-label={ariaLabel || label || 'Go back to previous page'}
    >
      <span className="back-button-icon" aria-hidden="true">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </span>
      {label && <span className="back-button-label">{label}</span>}
    </button>
  );
}

export default BackButton;
