import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import './ControlPanel.css';

const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function ControlPanel() {
  const {
    playback,
    play,
    pause,
    nextStep,
    prevStep,
    reset,
    goToStep,
    setSpeed,
  } = useStore();

  const progressRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);

  // 自动播放
  useEffect(() => {
    if (playback.isPlaying) {
      const interval = 1000 / playback.speed;
      intervalRef.current = window.setInterval(() => {
        const { currentStep, totalSteps } = useStore.getState().playback;
        if (currentStep < totalSteps - 1) {
          nextStep();
        } else {
          pause();
        }
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [playback.isPlaying, playback.speed, nextStep, pause]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略输入框中的按键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevStep();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextStep();
          break;
        case ' ':
          e.preventDefault();
          if (playback.isPlaying) {
            pause();
          } else {
            play();
          }
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          reset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playback.isPlaying, play, pause, nextStep, prevStep, reset]);

  // 进度条拖拽
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const step = Math.round(percentage * (playback.totalSteps - 1));
    goToStep(step);
  }, [playback.totalSteps, goToStep]);

  const handleProgressDrag = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    handleProgressClick(e);
  }, [handleProgressClick]);

  const progress = playback.totalSteps > 0
    ? (playback.currentStep / (playback.totalSteps - 1)) * 100
    : 0;

  return (
    <div className="control-panel">
      <div className="controls-row">
        <div className="control-buttons">
          <button
            className="control-btn"
            onClick={prevStep}
            disabled={playback.currentStep === 0}
            title="上一步 (←)"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
            <span className="btn-hint">←</span>
          </button>

          <button
            className="control-btn play-btn"
            onClick={playback.isPlaying ? pause : play}
            title={playback.isPlaying ? '暂停 (空格)' : '播放 (空格)'}
          >
            {playback.isPlaying ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
            <span className="btn-hint">空格</span>
          </button>

          <button
            className="control-btn"
            onClick={nextStep}
            disabled={playback.currentStep >= playback.totalSteps - 1}
            title="下一步 (→)"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
            <span className="btn-hint">→</span>
          </button>

          <button
            className="control-btn reset-btn"
            onClick={reset}
            title="重置 (R)"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            <span className="btn-hint">R</span>
          </button>
        </div>

        <div className="speed-control">
          <span className="speed-label">速度:</span>
          <div className="speed-buttons">
            {speedOptions.map((speed) => (
              <button
                key={speed}
                className={`speed-btn ${playback.speed === speed ? 'active' : ''}`}
                onClick={() => setSpeed(speed)}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        <div className="step-info">
          <span className="step-current">{playback.currentStep + 1}</span>
          <span className="step-separator">/</span>
          <span className="step-total">{playback.totalSteps}</span>
        </div>
      </div>

      <div
        className="progress-bar"
        ref={progressRef}
        onClick={handleProgressClick}
        onMouseMove={handleProgressDrag}
      >
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
        <div
          className="progress-handle"
          style={{ left: `${progress}%` }}
        />
      </div>
    </div>
  );
}
