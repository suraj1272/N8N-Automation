import React from "react";

export default function VideosList({ videos }) {
  if (!videos?.length) return <p className="muted">No video recommendations.</p>;

  // videos may be strings (urls) or objects from YouTube API
  return (
    <div className="video-drawer">
      {videos.map((v, i) => {
        if (!v) return null;
        if (typeof v === "string") {
          return (
            <div key={i} className="video-card">
              <a href={v} target="_blank" rel="noreferrer">{v}</a>
            </div>
          );
        }
        const title = v.title || v.snippet?.title || v.url || v.videoId;
        const url = v.url || (v.videoId ? `https://www.youtube.com/watch?v=${v.videoId}` : null);
        return (
          <div key={i} className="video-card">
            <a href={url || "#"} target="_blank" rel="noreferrer">
              <div className="thumb" style={{ backgroundImage: `url(${v.thumbnail || v.snippet?.thumbnails?.default?.url || ''})` }} />
              <div className="meta">
                <div className="title">{title}</div>
                <div className="meta-muted muted">{v.channelTitle || v.snippet?.channelTitle || ''}</div>
                <div className="meta-muted muted">{v.publishedAt || v.snippet?.publishedAt || ''}</div>
              </div>
            </a>
          </div>
        );
      })}
    </div>
  );
}
