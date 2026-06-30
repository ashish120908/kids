import { gradients } from './tokens';

export const themes = {
  candy: {
    name: 'Candy Pop',
    background: gradients.background,
    card: gradients.primary,
  },
  sunset: {
    name: 'Sunset Fun',
    background: ['#FF9A9E', '#FAD0C4', '#FECFEF'],
    card: gradients.secondary,
  },
  ocean: {
    name: 'Ocean Spark',
    background: ['#00C9FF', '#92FE9D', '#4FACFE'],
    card: gradients.accent,
  },
};

export const defaultTheme = themes.candy;
