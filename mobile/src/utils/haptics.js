import { Vibration } from 'react-native';

export const hapticTap = () => Vibration.vibrate(10);
export const hapticSuccess = () => Vibration.vibrate([0, 20, 30, 20]);
export const hapticError = () => Vibration.vibrate([0, 30, 60, 30]);
