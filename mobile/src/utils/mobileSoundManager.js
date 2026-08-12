// Sound & Haptic Manager for KidLearn Android App
import { Vibration } from 'react-native';

let soundMuted = false;

export const setMobileSoundMuted = (muted) => {
  soundMuted = muted;
};

export const isMobileSoundMuted = () => soundMuted;

export const playMobileTap = () => {
  Vibration.vibrate(12);
};

export const playMobileCorrect = () => {
  if (!soundMuted) {
    Vibration.vibrate([0, 30, 40, 30]);
  }
};

export const playMobileError = () => {
  if (!soundMuted) {
    Vibration.vibrate([0, 50, 60, 50]);
  }
};

export const playMobileLevelUp = () => {
  if (!soundMuted) {
    Vibration.vibrate([0, 40, 40, 40, 40, 80]);
  }
};
