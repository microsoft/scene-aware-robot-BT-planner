import React, { useState, useRef, useEffect } from 'react';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

interface VideoPlayerProps {
  videoUrl: string;
  enableSlider?: boolean;
  onTimeSelected?: (startTime: number, endTime: number) => void;
  initialStartTime?: number;
  initialEndTime?: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  enableSlider = false,
  onTimeSelected,
  initialStartTime = 0,
  initialEndTime,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;

      const handleLoadedMetadata = () => {
        const videoDuration = video.duration;
        setDuration(videoDuration);

        // Adjust initial start and end times
        const adjustedStartTime = Math.max(0, Math.min(initialStartTime, videoDuration));
        const adjustedEndTime = initialEndTime !== undefined
          ? Math.max(adjustedStartTime, Math.min(initialEndTime, videoDuration))
          : videoDuration;

        setStartTime(adjustedStartTime);
        setEndTime(adjustedEndTime);
        video.currentTime = adjustedStartTime;
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [initialStartTime, initialEndTime]);

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      if (video.currentTime < startTime || video.currentTime > endTime) {
        video.currentTime = startTime;
        video.pause();
      }
    }
  }, [startTime, endTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      if (currentTime < startTime || currentTime > endTime) {
        videoRef.current.currentTime = startTime;
        videoRef.current.pause();
      }
    }
  };

  const handleStartChange = (event: Event, newValue: number | number[]) => {
    const newStartTime = newValue as number;
    if (newStartTime >= 0 && newStartTime < endTime) {
      setStartTime(newStartTime);
      if (videoRef.current) {
        videoRef.current.currentTime = newStartTime;
      }
    }
  };

  const handleEndChange = (event: Event, newValue: number | number[]) => {
    const newEndTime = newValue as number;
    if (newEndTime > startTime && newEndTime <= duration) {
      setEndTime(newEndTime);
      if (videoRef.current) {
        // Check if the video is playing
        const wasPlaying = !videoRef.current.paused;
        videoRef.current.currentTime = newEndTime;
        if (wasPlaying) {
          videoRef.current.play();
        }
      }
    }
  };

  const handleOkClick = () => {
    if (onTimeSelected) {
      onTimeSelected(startTime, endTime);
    }
  };

  const valueLabelFormat = (value: number) => {
    return `${Math.floor(value / 60)}:${('0' + Math.floor(value % 60)).slice(-2)}`;
  };

  return (
    <div className="video-container">
      <div>Here is your video:</div>
      <video
        id="sessionVideo"
        style={{ width: '100%' }}
        controls
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {enableSlider && (
        <>
          <Box sx={{ width: '100%', marginTop: '10px' }}>
            <Slider
              value={startTime}
              onChange={handleStartChange}
              min={0}
              max={duration}
              step={0.01}
              valueLabelDisplay="auto"
              valueLabelFormat={valueLabelFormat}
              aria-labelledby="start-slider"
              sx={{ color: 'secondary.main' }}
            />
            <div>Start: {startTime.toFixed(2)}s</div>
          </Box>
          <Box sx={{ width: '100%', marginTop: '10px' }}>
            <Slider
              value={endTime}
              onChange={handleEndChange}
              min={0}
              max={duration}
              step={0.01}
              valueLabelDisplay="auto"
              valueLabelFormat={valueLabelFormat}
              aria-labelledby="end-slider"
              sx={{ color: 'secondary.main' }}
            />
            <div>End: {endTime.toFixed(2)}s</div>
          </Box>
          <Button variant="contained" onClick={handleOkClick} sx={{ marginTop: '10px' }}>
            OK
          </Button>
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
