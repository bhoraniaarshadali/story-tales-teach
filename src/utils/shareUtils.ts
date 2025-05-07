
/**
 * Creates a shareable URL for a story
 */
export const createShareableUrl = (storyId: string) => {
  const baseUrl = window.location.origin;
  // Use a proper URL structure with a route segment for better SEO and clarity
  return `${baseUrl}/share/${storyId}`;
};

/**
 * Extracts story ID from URL if present
 */
export const getStoryIdFromUrl = (): string | null => {
  const path = window.location.pathname;
  
  // Check for share route format
  const shareMatch = path.match(/\/share\/([^\/]+)/);
  if (shareMatch && shareMatch[1]) {
    return shareMatch[1];
  }
  
  // Fallback to query parameter for backward compatibility
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
