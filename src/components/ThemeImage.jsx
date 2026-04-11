export default function ThemeImage({ theme, title, imageData }) {
  const style = imageData ? { backgroundImage: `url(${imageData})` } : undefined;

  return (
    <div className={`theme-image ${theme || 'theme-ai'} ${imageData ? 'theme-image-uploaded' : ''}`} style={style} aria-label={title}>
      <div className="theme-overlay" />
      <span>{title}</span>
    </div>
  );
}
