import React from "react";

export default function SkeletonLoader() {
  const SKELETON_COUNT = 8;
  return (
    <div className="grid">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <div key={i} className="card skeleton-card" style={{ display: "flex", flexDirection: "column", height: "400px" }}>
          <div className="skeleton-img"></div>
          <div className="skeleton-title"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-btn" style={{ marginTop: "auto" }}></div>
        </div>
      ))}
    </div>
  );
}
