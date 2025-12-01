"use client";
import { TrackContext } from "@/lib/track.wrapper";
import { useHasMounted } from "@/utils/customHook";
import { AppBar, Container } from "@mui/material";
import { useContext, useEffect, useRef } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
const AppFooter = () => {
  const hashMouted = useHasMounted();
  const playerRef = useRef(null);
  const { currentTrack, setCurrentTrack } = useContext(
    TrackContext
  ) as ITrackContext;

  useEffect(() => {
    if (playerRef?.current && currentTrack?.isPlaying === false) {
      //@ts-ignore
      playerRef?.current?.audio?.current?.pause();
    }
    if (playerRef?.current && currentTrack?.isPlaying === true) {
      //@ts-ignore
      playerRef?.current?.audio?.current?.play();
    }
  }, [currentTrack]);
  if (!hashMouted) return <></>;

  return (
    <>
      {currentTrack._id && (
        <div style={{ marginTop: "50px" }}>
          <AppBar
            position="fixed"
            color="primary"
            sx={{ top: "auto", bottom: 0, backgroundColor: "#f2f2f2" }}
          >
            <Container
              sx={{
                display: "flex",
                gap: 10,
                ".rhap_main": {
                  gap: "30px",
                },
              }}
            >
              <AudioPlayer
                ref={playerRef}
                layout="horizontal-reverse"
                volume={0.5}
                style={{ boxShadow: "unset", backgroundColor: "#f2f2f2" }}
                src={
                  currentTrack?.trackUrl
                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/tracks/${currentTrack.trackUrl}`
                    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/tracks/hoidanit.mp3`
                }
                onPlay={() =>
                  setCurrentTrack({ ...currentTrack, isPlaying: true })
                }
                onPause={() =>
                  setCurrentTrack({ ...currentTrack, isPlaying: false })
                }
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: 100,
                }}
              >
                <div style={{ display: "flex", gap: "6px" }}>
                  <div style={{ color: "#ccc" }}>
                    {currentTrack.description}
                  </div>
                  <div style={{ color: "black" }}>{currentTrack.title}</div>
                </div>
              </div>
            </Container>
          </AppBar>
        </div>
      )}
    </>
  );
};
export default AppFooter;
