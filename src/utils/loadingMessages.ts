
/**
 * Collection of engaging loading messages for story generation
 */
export const loadingMessages = [
  "Putting pen to paper for your story...",
  "Brewing a special story just for you...",
  "Crafting the perfect narrative, just a moment...",
  "Assembling characters and plots for your story...",
  "Weaving words into magic, almost ready...",
  "Finding the perfect beginning for your tale...",
  "Stirring up creative ideas for your story...",
  "Building a world of imagination for you...",
  "Sprinkling some creativity into your story...",
  "Juggling words and ideas for your perfect story...",
  "Shaping your story with care, hang tight...",
  "Exploring fascinating concepts for your journey...",
  "Connecting dots for your perfect learning adventure...",
  "Mixing facts and fun for your story...",
  "Hunting for the perfect words for your story..."
];

/**
 * Returns a random loading message from the collection
 */
export const getRandomLoadingMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * loadingMessages.length);
  return loadingMessages[randomIndex];
};
