/**
 * @format
 */

import lessons from '../src/data/lessons.json';
import quizzes from '../src/data/quizzes.json';
import subjects from '../src/data/subjects.json';
import { themes } from '../src/theme/themes';

test('mobile sample content is populated', () => {
  expect(subjects.length).toBeGreaterThanOrEqual(4);
  expect(lessons.length).toBeGreaterThanOrEqual(10);
  expect(quizzes.length).toBeGreaterThanOrEqual(20);
});

test('mobile app exposes three theme variants', () => {
  expect(Object.keys(themes).sort()).toEqual(['candy', 'ocean', 'sunset']);
});
