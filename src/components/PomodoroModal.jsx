import { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Settings } from 'lucide-react';

const PomodoroModal = ({ onClose }) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer finished
            playNotificationSound();
            if (isBreak) {
              setIsBreak(false);
              setMinutes(workDuration);
            } else {
              setIsBreak(true);
              setMinutes(breakDuration);
            }
            setSeconds(0);
            setIsActive(false);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, isBreak, workDuration, breakDuration]);

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAc+ltryxnMnBSl+zPLaizsIGGS56uilUBELTKXh8bllHAU2kNXzzn0vBSR1xe/glEILElyx6OyqWBUIQ5zd8sFuJAUuhM/z1YU2Bhpr');
    audio.play().catch(() => {});
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(workDuration);
    setSeconds(0);
  };

  const applySettings = () => {
    setMinutes(isBreak ? breakDuration : workDuration);
    setSeconds(0);
    setShowSettings(false);
  };

  const formatTime = (min, sec) => {
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const progress = isBreak
    ? ((breakDuration * 60 - (minutes * 60 + seconds)) / (breakDuration * 60)) * 100
    : ((workDuration * 60 - (minutes * 60 + seconds)) / (workDuration * 60)) * 100;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pomodoro-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isBreak ? '☕ Break Time' : '🍅 Focus Time'}</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowSettings(!showSettings)} className="btn-icon">
              <Settings size={20} />
            </button>
            <button onClick={onClose} className="btn-icon">
              <X size={20} />
            </button>
          </div>
        </div>

        {showSettings ? (
          <div className="modal-body">
            <div className="pomodoro-settings">
              <div className="setting-group">
                <label>Work Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={workDuration}
                  onChange={(e) => setWorkDuration(parseInt(e.target.value) || 25)}
                  className="setting-input"
                />
              </div>
              <div className="setting-group">
                <label>Break Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)}
                  className="setting-input"
                />
              </div>
              <button onClick={applySettings} className="btn-primary">
                Apply Settings
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-body">
            <div className="pomodoro-timer">
              <div className="timer-circle">
                <svg className="timer-svg" viewBox="0 0 200 200">
                  <circle
                    className="timer-circle-bg"
                    cx="100"
                    cy="100"
                    r="90"
                  />
                  <circle
                    className="timer-circle-progress"
                    cx="100"
                    cy="100"
                    r="90"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 90}`,
                      strokeDashoffset: `${2 * Math.PI * 90 * (1 - progress / 100)}`,
                    }}
                  />
                </svg>
                <div className="timer-display">
                  {formatTime(minutes, seconds)}
                </div>
              </div>

              <div className="timer-controls">
                <button
                  onClick={toggleTimer}
                  className="timer-btn timer-btn-primary"
                  title={isActive ? 'Pause' : 'Start'}
                >
                  {isActive ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button
                  onClick={resetTimer}
                  className="timer-btn"
                  title="Reset"
                >
                  <RotateCcw size={24} />
                </button>
              </div>

              <div className="timer-status">
                {isActive ? 'Timer running...' : 'Ready to focus'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PomodoroModal;
