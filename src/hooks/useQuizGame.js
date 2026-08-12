import { useState, useRef, useEffect, useCallback } from 'react';
import { saveScore, getMaxUnlockedLevel } from '../utils/scoreManager';
import { playCorrect, playWrong, playGameComplete } from '../utils/soundManager';

/**
 * Shared state machine for every multiple-choice game.
 *
 * Eleven games used to carry their own near-identical copy of this logic, and
 * the copies had drifted apart — some counted the score correctly, some lost a
 * point on the last question, one started at level 12. Centralising it means a
 * fix lands everywhere at once.
 *
 * Phases: 'pick' → 'play' → 'done'
 */
export default function useQuizGame({
  gameKey,
  total = 10,
  makeQuestions,
  isCorrect = (choice, question) => choice === question.answer,
  keyOf = (choice) => choice,
  feedbackMs = 1000,
}) {
  const [phase, setPhase] = useState('pick');
  const [level, setLevel] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const advanceTimer = useRef(null);
  const confettiTimer = useRef(null);
  const scoreRef = useRef(0);          // authoritative score; state is for render only

  const clearTimers = () => {
    clearTimeout(advanceTimer.current);
    clearTimeout(confettiTimer.current);
  };

  // Timers outliving the component was a real leak here: navigating home
  // mid-answer left a setTimeout that called setState on an unmounted tree.
  useEffect(() => clearTimers, []);

  const startGame = useCallback((lvl) => {
    clearTimers();
    const safeLevel = Math.max(1, lvl || 1);
    setLevel(safeLevel);
    setQuestions(makeQuestions(safeLevel));
    setCurrent(0);
    scoreRef.current = 0;
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setShowConfetti(false);
    setPhase('play');
  }, [makeQuestions]);

  const finish = useCallback((finalScore) => {
    saveScore(gameKey, level, finalScore, total);
    playGameComplete();
    setPhase('done');
  }, [gameKey, level, total]);

  const advance = useCallback((finalScore) => {
    setSelected(null);
    setFeedback(null);
    // Deliberately not a functional setState updater: React StrictMode invokes
    // updaters twice in dev, which would fire finish() twice.
    if (current + 1 >= total) {
      finish(finalScore);
    } else {
      setCurrent(current + 1);
    }
  }, [current, total, finish]);

  const answer = useCallback((choice) => {
    if (feedback) return;                       // ignore double taps mid-feedback
    const q = questions[current];
    if (!q) return;

    const correct = isCorrect(choice, q);
    setSelected(keyOf(choice));
    setFeedback(correct ? 'correct' : 'wrong');

    if (correct) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      playCorrect();
      setShowConfetti(true);
      clearTimeout(confettiTimer.current);
      confettiTimer.current = setTimeout(() => setShowConfetti(false), 1200);
    } else {
      playWrong();
    }

    clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => advance(scoreRef.current), feedbackMs);
  }, [feedback, questions, current, isCorrect, keyOf, advance, feedbackMs]);

  /**
   * Skip / next. Previously this restarted the whole round on the last
   * question, silently throwing away the child's score. Now it completes the
   * round like any other answer — the skipped question simply doesn't score.
   */
  const skip = useCallback(() => {
    clearTimers();
    setShowConfetti(false);
    advance(scoreRef.current);
  }, [advance]);

  const openPicker = useCallback(() => {
    clearTimers();
    setPhase('pick');
  }, []);

  const suggestedLevel = getMaxUnlockedLevel(gameKey) + 1;
  const question = questions[current];

  const statusFor = useCallback((choice, correctKey) => {
    const key = keyOf(choice);
    if (selected === key) return feedback === 'correct' ? 'correct' : 'wrong';
    if (feedback === 'wrong' && key === correctKey) return 'correct';
    return null;
  }, [selected, feedback, keyOf]);

  return {
    phase, level, questions, question, current, score, selected, feedback,
    showConfetti, total, suggestedLevel,
    startGame, answer, skip, next: skip, openPicker, statusFor, setPhase,
  };
}
