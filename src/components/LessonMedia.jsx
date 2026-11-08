import React, { useState } from 'react';

const assetPrefix = () => {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
};

const resolveImageUrl = (src) => {
  if (!src) return '';
  if (/^https?:/.test(src) || src.startsWith('data:')) return src;
  return `${assetPrefix()}${src.replace(/^\//, '')}`;
};

const extractYoutubeId = (ref) => {
  if (!ref) return '';
  const s = String(ref).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const watchMatch = s.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = s.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  return '';
};

const LessonMedia = ({ image, imageCaption, youtube, youtubeStart, youtubeCaption }) => {
  const imgSrc = image ? resolveImageUrl(image) : '';
  const ytId = youtube ? extractYoutubeId(youtube) : '';
  // image introuvable (ex. pas encore produite) : on masque la figure plutôt qu'afficher une icône cassée
  const [failedSrc, setFailedSrc] = useState(null);
  const showImg = imgSrc && failedSrc !== imgSrc;

  if (!showImg && !ytId) return null;

  return (
    <div className="lesson-media">
      {showImg && (
        <figure className="lesson-media-figure">
          <img src={imgSrc} alt={imageCaption || ''} className="lesson-media-image" loading="lazy" onError={() => setFailedSrc(imgSrc)} />
          {imageCaption && <figcaption className="lesson-media-caption">{imageCaption}</figcaption>}
        </figure>
      )}
      {ytId && (
        <figure className="lesson-media-figure">
          <div className="lesson-media-youtube">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0${youtubeStart ? `&start=${youtubeStart}` : ''}`}
              title={youtubeCaption || 'YouTube'}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <figcaption className="lesson-media-caption">
            {youtubeCaption}{youtubeCaption && ' · '}
            <a href={`https://www.youtube.com/watch?v=${ytId}${youtubeStart ? `&t=${youtubeStart}s` : ''}`} target="_blank" rel="noopener noreferrer">YouTube ↗</a>
          </figcaption>
        </figure>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .lesson-media { margin: 20px 0; display: flex; flex-direction: column; gap: 18px; }
        .lesson-media-figure { margin: 0; }
        .lesson-media-image {
          max-width: 100%;
          height: auto;
          border: 3px solid #333;
          border-radius: 12px;
          box-shadow: 5px 5px 0 rgba(0,0,0,0.12);
          display: block;
          margin: 0 auto;
        }
        .lesson-media-youtube {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          border: 3px solid #333;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 5px 5px 0 rgba(0,0,0,0.12);
          background: #000;
        }
        .lesson-media-youtube iframe {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          border: 0;
        }
        .lesson-media-caption {
          margin-top: 10px;
          font-size: 0.85rem;
          font-style: italic;
          color: #666;
          text-align: center;
        }
      `}} />
    </div>
  );
};

export default LessonMedia;
