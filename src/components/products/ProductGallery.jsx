import React, { useState, useEffect } from "react";
import { ZoomIn, Play } from "lucide-react";

const isVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase();
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') ||
    lower.endsWith('.avi') || lower.includes('video');
};

const MEDIA_TYPE_VIDEO = 'video';
const MEDIA_TYPE_IMAGE = 'image';

const getMediaType = (url) => isVideoUrl(url) ? MEDIA_TYPE_VIDEO : MEDIA_TYPE_IMAGE;

export const ProductGallery = ({
  images = [],
  defaultImage = "",
  videoUrl = "",
}) => {
  const allMedia = [];
  if (images.length > 0) {
    images.forEach(u => allMedia.push({ url: u, type: getMediaType(u) }));
  } else if (defaultImage) {
    allMedia.push({ url: defaultImage, type: getMediaType(defaultImage) });
  }
  if (videoUrl) {
    allMedia.push({ url: videoUrl, type: MEDIA_TYPE_VIDEO });
  }
  if (allMedia.length === 0) {
    allMedia.push({ url: '', type: MEDIA_TYPE_IMAGE });
  }

  const [selected, setSelected] = useState(allMedia[0]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  const mediaSerialized = allMedia.map(m => m.url).join(",");

  useEffect(() => {
    if (allMedia.length > 0) {
      setSelected(allMedia[0]);
    }
  }, [mediaSerialized, defaultImage, videoUrl]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const currentUrl = selected?.url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600";
  const isCurrentVideo = selected?.type === MEDIA_TYPE_VIDEO;

  return (
    <div className="space-y-4">
      {/* Active Featured Media with Elegant Hover-to-Zoom */}
      <div
        className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 flex items-center justify-center p-4 cursor-zoom-in group"
        onMouseEnter={() => !isCurrentVideo && setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={!isCurrentVideo ? handleMouseMove : undefined}
      >
        <div className="absolute top-3.5 right-3.5 z-10 px-2.5 py-1 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xs text-[9px] font-black uppercase tracking-wider text-gray-500 rounded-md border border-gray-150/50 dark:border-gray-800/50 shadow-xs pointer-events-none transition-all duration-300 group-hover:opacity-0 group-hover:scale-95 flex items-center gap-1">
          <ZoomIn size={10} className="text-gray-400" />
          {isCurrentVideo ? 'Playing Video' : 'Hover to Zoom'}
        </div>

        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {isCurrentVideo ? (
            <video
              src={currentUrl}
              controls
              autoPlay
              className="max-h-full max-w-full rounded-xl"
              style={{ objectFit: 'contain' }}
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <img
              src={currentUrl}
              alt="Selected product thumbnail viewer"
              className="max-h-full max-w-full object-contain rounded-xl select-none transition-transform duration-150 ease-out"
              style={{
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                transform: isZoomed ? "scale(2.2)" : "scale(1)",
              }}
            />
          )}
        </div>
      </div>

      {/* Thumbnails list */}
      {allMedia.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          {allMedia.map((media, index) => {
            const isSelected = selected?.url === media.url && selected?.type === media.type;
            return (
              <button
                key={index}
                onClick={() => setSelected(media)}
                className={`relative w-20 aspect-square rounded-xl overflow-hidden border-2 bg-white dark:bg-gray-900 p-1 flex-shrink-0 transition-all ${
                  isSelected
                    ? "border-blue-500 scale-105"
                    : "border-gray-200 hover:border-gray-400 dark:border-gray-800"
                }`}
              >
                {media.type === MEDIA_TYPE_VIDEO ? (
                  <>
                    <video
                      src={media.url}
                      className="w-full h-full object-contain"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                      <Play size={14} className="text-white fill-white" />
                    </div>
                  </>
                ) : (
                  <img
                    src={media.url}
                    alt={`Product thumbnail indicator ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
