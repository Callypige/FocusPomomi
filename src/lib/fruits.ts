export const FRUITS = [
  "🍎",
  "🍊",
  "🍋",
  "🍇",
  "🍓",
  "🫐",
  "🍑",
  "🍒",
  "🥝",
  "🍍",
  "🥭",
  "🍌",
  "🍐",
  "🍈",
  "🍉",
  "🫒",
];

export function getRandomFruit(): string {
  return FRUITS[Math.floor(Math.random() * FRUITS.length)];
}
