import greenhouseBannerImg from "../assets/greenhouse-banner.jpg";
import BackButton from "./BackButton";
import "./PageHeaderBanner.css";

function PageHeaderBanner({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  badgeIcon,
  badgeTitle,
  badgeSubtitle,
  extraRight,
  showBackButton = false,
  onBack,
  onPageChange,
  backFallbackPage = "dashboard",
  backLabel = "Back",
  bgImage = greenhouseBannerImg,
  className = "",
}) {
  return (
    <section
      className={`page-hero-banner slow-popup animate-slow-pop ${className}`}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="banner-glass-overlay" />
      <div className="banner-content-inner">
        <div className="banner-titles">
          {showBackButton && (
            <div className="banner-back-row">
              <BackButton
                onClick={onBack}
                onPageChange={onPageChange}
                fallbackPage={backFallbackPage}
                label={backLabel}
                className="back-button-on-banner"
              />
            </div>
          )}
          {eyebrow && <span className="banner-eyebrow">{eyebrow}</span>}
          <h1 className="banner-heading">
            {title} {titleAccent && <span>{titleAccent}</span>}
          </h1>
          {subtitle && <p className="banner-desc">{subtitle}</p>}
        </div>

        {(badgeTitle || extraRight) && (
          <div className="banner-right-wrapper">
            {badgeTitle && (
              <div className="banner-weather-badge">
                {badgeIcon && <div className="weather-badge-icon">{badgeIcon}</div>}
                <div className="weather-badge-info">
                  <strong>{badgeTitle}</strong>
                  {badgeSubtitle && <span>{badgeSubtitle}</span>}
                </div>
              </div>
            )}
            {extraRight}
          </div>
        )}
      </div>
    </section>
  );
}

export default PageHeaderBanner;

