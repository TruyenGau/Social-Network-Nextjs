"use client";

import { useEffect, useState } from "react";

interface Track {
  id: string;
  name: string;
  artist: string;
  image: string;
  audio: string;
}

export default function MusicPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ===== DEMO NHẠC VIỆT (SELF-HOST) =====
    const vietnamTracks: Track[] = [
      {
        id: "vn1",
        name: "Em Thua Cô Ta (ACV Remix #2)",
        artist: "ACV",
        image: "/music/emthuacota.jpg",
        audio: "/music/emthuacota.mp3",
      },
      {
        id: "vn2",
        name: "Hẹn Hò Nhưng Không Yêu (Thazh x Đông Remix)",
        artist: "Thazh x Đông",
        image: "/music/henhonhungkhongyeu.jpg",
        audio: "/music/Hẹn Hò Nhưng Không Yêu (Thazh x Đông Remix).mp3",
      },
      {
        id: "vn3",
        name: "Mục Hạ Vô Nhân",
        artist: "Unknown",
        image: "/music/muchavonhan.jpg", // chưa có ảnh riêng → dùng tạm
        audio: "/music/Mục Hạ Vô Nhân.mp3",
      },
      {
        id: "vn1",
        name: "Em Thua Cô Ta (ACV Remix #2)",
        artist: "ACV",
        image: "/music/emthuacota.jpg",
        audio: "/music/emthuacota.mp3",
      },
      {
        id: "vn2",
        name: "Hẹn Hò Nhưng Không Yêu (Thazh x Đông Remix)",
        artist: "Thazh x Đông",
        image: "/music/henhonhungkhongyeu.jpg",
        audio: "/music/Hẹn Hò Nhưng Không Yêu (Thazh x Đông Remix).mp3",
      },
      {
        id: "vn3",
        name: "Mục Hạ Vô Nhân",
        artist: "Unknown",
        image: "/music/muchavonhan.jpg", // chưa có ảnh riêng → dùng tạm
        audio: "/music/Mục Hạ Vô Nhân.mp3",
      },
    ];

    setTracks(vietnamTracks);
    setLoading(false);
  }, []);

  return (
    <>
      <div className="music-wrapper">
        <h2 className="music-title">🎵 Nhạc Việt (Demo)</h2>

        {loading && <div className="music-loading">Đang tải nhạc...</div>}

        {!loading &&
          tracks.map((track) => (
            <div className="music-card" key={track.id}>
              <img src={track.image} alt={track.name} className="music-cover" />

              <div className="music-content">
                <div className="music-name">{track.name}</div>
                <div className="music-artist">{track.artist}</div>

                <audio controls src={track.audio} />
              </div>
            </div>
          ))}

        {!loading && tracks.length === 0 && (
          <div className="music-empty">Không có bài nhạc</div>
        )}
      </div>

      {/* ===== CSS TRONG TRANG ===== */}
      <style jsx>{`
        .music-wrapper {
          max-width: 760px;
          margin: 0 auto;
          padding: 20px;
          margin-left: 30px;
        }

        .music-title {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .music-card {
          display: flex;
          gap: 14px;
          padding: 14px;
          margin-bottom: 14px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
          transition: all 0.15s ease;
        }

        .music-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .music-cover {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          object-fit: cover;
        }

        .music-content {
          flex: 1;
        }

        .music-name {
          font-size: 15px;
          font-weight: 600;
        }

        .music-artist {
          font-size: 13px;
          color: #666;
          margin-bottom: 6px;
        }

        audio {
          width: 100%;
          height: 32px;
        }

        .music-loading,
        .music-empty {
          padding: 20px;
          text-align: center;
          color: #666;
        }

        :global(body) {
          background-color: #f0f2f5;
        }
      `}</style>
    </>
  );
}
