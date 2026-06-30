# KidsLearningApp (React Native Android)

Eye-catching React Native app with vibrant gradients, glassmorphism cards, playful animations, and gamified learning flows.

## Setup

```bash
cd mobile
npm install
npm run android
```

## Included Structure

- `src/screens`: Home, Subject, Lesson, Quiz, Progress, ParentZone
- `src/components`: KidCard, KidButton, ProgressBar, StarRating, Badge, Header, LoadingSkeleton
- `src/theme`: tokens, themes (Candy/Sunset/Ocean), animation configs
- `src/data`: sample subjects, lessons, quizzes (20 questions)
- `src/navigation`: stack + bottom tabs
- `src/utils`: animation + haptic helpers

## Notes

- Designed for Android-first usage with colorful kid-friendly UI.
- Uses FlashList for performant subject rendering.
- Uses press-scale interactions and vibration feedback helpers.
