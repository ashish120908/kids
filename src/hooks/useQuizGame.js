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
 * Advance rule: only a CORRECT answer moves the child on. A wrong answer
 * shakes, then hands the question back so they can try again — the same way
 * Alphabet Match, Spelling Bee and Memory Flip already behaved. Sliding past a
 * question the child just got wrong teaches nothing, and it let them reach the
 * summary without ever seeing a right answer.
 *
 * Scoring: only a FIRST-attempt correct answer scores. Otherwise retrying would
 * hand out a guaranteed 10/10 and the stars would stop meaning anything.
 *
 * Getting stuck: after `revealAfter` wrong attempts on the same question the
 * correct answer is highlighted, so a child who genuinely doesn't know can
 * still see it and move on.
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
  retryMs = 700,
  revealAfter = 2,
}) {
  const [phase, setPhase] = useState('pick');
  const [level, setLevel] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const advanceTimer = useRef(null);
  const confettiTimer = useRef(null);
  const scoreRef = useRef(0);          // authoritative score; state is for render only
  const missedRef = useRef(new Set()); // questions answered wrong at least once

  const clearTimers = () => {
    clearTimeout(advanceTimer.current);
    clearTimeout(confettiTimer.current);
  };

  // Timers outliving the component was a real leak here: navigating home
  // mid-answer left a setTimeout that called setState on an unmounted tree.
  useEffect(() => clearTimers, []);

  const resetQuestionState = () => {
    setSelected(null);
    setFeedback(null);
    setRevealAnswer(false);
    setWrongAttempts(0);
  };

  const startGame = useCallback((lvl) => {
    clearTimers();
    const safeLevel = Math.max(1, lvl || 1);
    setLevel(safeLevel);
    setQuestions(makeQuestions(safeLevel));
    setCurrent(0);
    scoreRef.current = 0;
    missedRef.current = new Set();
    setScore(0);
    setShowConfetti(false);
    resetQuestionState();
    setPhase('play');
  }, [makeQuestions]);

  const finish = useCallback((finalScore) => {
    saveScore(gameKey, level, finalScore, total);
    playGameComplete();
    setPhase('done');
  }, [gameKey, level, total]);

  const advance = useCallback((finalScore) => {
    resetQuestionState();
    // Deliberately not a functional setState updater: React StrictMode invokes
    // updaters twice in dev, which would fire finish() twice.
    if (current + 1 >= total) {
      finish(finalScore);
    } else {
      setCurrent(current + 1);
    }
  }, [current, total, finish]);

  const answer = useCallback((choice) => {
    if (feedback) return;                       // ignore taps during feedback
    const q = questions[current];
    if (!q) return;

    const correct = isCorrect(choice, q);
    setSelected(keyOf(choice));
    setFeedback(correct ? 'correct' : 'wrong');

    if (correct) {
      // Only a clean first attempt earns the point.
      if (!missedRef.current.has(current)) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }
      playCorrect();
      setShowConfetti(true);
      clearTimeout(confettiTimer.current);
      confettiTimer.current = setTimeout(() => setShowConfetti(false), 1200);

      clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => advance(scoreRef.current), feedbackMs);
      return;
    }

    // Wrong: no advance. Clear the shake so the same question is playable again.
    missedRef.current.add(current);
    playWrong();
    const attempts = wrongAttempts + 1;
    setWrongAttempts(attempts);

    clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      if (attempts >= revealAfter) setRevealAnswer(true);
    }, retryMs);
  }, [
    feedback, questions, current, isCorrect, keyOf, advance,
    feedbackMs, retryMs, wrongAttempts, revealAfter,
  ]);

  /**
   * Skip / next. Previously this restarted the whole round on the last
   * question, silently throwing away the child's score. Now it completes the
   * round like any other answer — the skipped question simply doesn't score.
   */
  const skip = useCallback(() => {
    clearTimers();
    setShowConfetti(false);
    missedRef.current.add(current);
    advance(scoreRef.current);
  }, [advance, current]);

  const openPicker = useCallback(() => {
    clearTimers();
    setPhase('pick');
  }, []);

  const suggestedLevel = getMaxUnlockedLevel(gameKey) + 1;
  const question = questions[current];

  const statusFor = useCallback((choice, correctKey) => {
    const key = keyOf(choice);
    if (selected === key) return feedback === 'correct' ? 'correct' : 'wrong';
    // The correct answer is only given away once the child has genuinely
    // struggled — revealing it on the first wrong tap would make "try again"
    // meaningless.
    if (revealAnswer && key === correctKey) return 'correct';
    return null;
  }, [selected, feedback, revealAnswer, keyOf]);

  return {
    phase, level, questions, question, current, score, selected, feedback,
    showConfetti, total, suggestedLevel, wrongAttempts, revealAnswer,
    startGame, answer, skip, next: skip, openPicker, statusFor, setPhase,
  };
}
