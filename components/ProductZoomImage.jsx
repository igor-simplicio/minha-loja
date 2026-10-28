"use client";

import { useState } from "react";

export default function ProductZoomImage({ src, alt, badge }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [zooming, setZooming] = useState(false);
  const [open, setOpen] = useState(false);

  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  }

  return (
    <>
      <div
        className="foto-produto foto-zoom"
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMove}
        onClick={() => setOpen(true)}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            style={
              zooming
                ? {
                    transform: "scale(2)",
                    transformOrigin: `${pos.x}% ${pos.y}%`,
                  }
                : undefined
            }
          />
        ) : (
          <span>{alt.charAt(0)}</span>
        )}
        {badge > 0 && <b className="selo">-{badge}%</b>}
        <span className="dica-zoom">Click to enlarge</span>
      </div>

      {open && (
        <div className="lightbox" onClick={() => setOpen(false)}>
          <img src={src} alt={alt} />
          <button
            type="button"
            className="fechar-lightbox"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
