// Список простых и понятных эмодзи
const EMOJIS = [
  '🐱', '🐶', '🐼', '🐨', '🦊', '🦁', '🐯', '🐮',
  '🐷', '🐸', '🐙', '🐬', '🦄', '🦋', '🐢', '🐳'
];

export const getRandomEmoji = () => {
  const randomIndex = Math.floor(Math.random() * EMOJIS.length);
  return EMOJIS[randomIndex];
}; 