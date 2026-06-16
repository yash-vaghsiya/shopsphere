import React, { useState, useEffect } from "react";
import { ZoomIn } from "lucide-react";


export const ProductGallery = ({
  images = [],
  defaultImage = "",
}) => {
  const allImages = images.length > 0 ? images : [defaultImage];
  const [selected, setSelected] = useState(allImages[0]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  const imagesSerialized = images.join(",");

  useEffect(() => {
    const list = imagesSerialized ? images : [defaultImage];
    if (list.length > 0) {
      setSelected(list[0]);
    }
  }, [imagesSerialized, defaultImage]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const currentImg = selected || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600";

  return (
    <div className="space-y-4">
      {/* Active Featured Image with Elegant Hover-to-Zoom */}
      <div 
        className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 flex items-center justify-center p-4 cursor-zoom-in group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Subtle instructions overlay */}
        <div className="absolute top-3.5 right-3.5 z-10 px-2.5 py-1 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xs text-[9px] font-black uppercase tracking-wider text-gray-500 rounded-md border border-gray-150/50 dark:border-gray-800/50 shadow-xs pointer-events-none transition-all duration-300 group-hover:opacity-0 group-hover:scale-95 flex items-center gap-1">
          <ZoomIn size={10} className="text-gray-400" />
          Hover to Zoom
        </div>

        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <img
            src={currentImg}
            alt="Selected product thumbnail viewer"
            className="max-h-full max-w-full object-contain rounded-xl select-none transition-transform duration-150 ease-out"
            style={{
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              transform: isZoomed ? "scale(2.2)" : "scale(1)",
            }}
          />
        </div>
      </div>

      {/* Thumbnails list */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          {allImages.map((img, index) => {
            const isSelected = selected === img;
            return (
              <button
                key={index}
                onClick={() => setSelected(img)}
                className={`w-20 aspect-square rounded-xl overflow-hidden border-2 bg-white dark:bg-gray-900 p-1 flex-shrink-0 transition-all ${
                  isSelected
                    ? "border-blue-500 scale-105"
                    : "border-gray-200 hover:border-gray-400 dark:border-gray-800"
                }`}
              >
                <img
                  src={img}
                  alt={`Product thumbnail indicator ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
