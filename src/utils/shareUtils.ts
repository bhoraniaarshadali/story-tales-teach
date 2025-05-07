
/**
 * Creates a shareable URL for a story
 */
export const createShareableUrl = (storyId: string) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}?story=${storyId}`;
};

/**
 * Extracts story ID from URL if present
 */
export const getStoryIdFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('story');
};

/**
 * Shares content using the Web Share API if available,
 * falls back to copying to clipboard
 */
export const shareContent = async (
  title: string, 
  text: string, 
  url: string
): Promise<boolean> => {
  // Try using the Web Share API if available
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url
      });
      return true;
    } catch (error) {
      console.error("Error sharing content:", error);
    }
  }
  
  // Fall back to copying the link to clipboard
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
};
