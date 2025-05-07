
/**
 * Creates a shareable URL for a story
 */
export const createShareableUrl = (storyId: string) => {
  // Use the custom domain if it's the production environment, otherwise use the current origin
  const baseUrl = window.location.hostname === "story-tales-teach.me" 
    ? "https://story-tales-teach.me"
    : window.location.origin;
    
  // Use a cleaner URL structure with path segment
  return `${baseUrl}/share/${storyId}`;
};

/**
 * Extracts story ID from URL if present
 * Supports both path-based URLs (/share/{id}) and legacy query param URLs (?story={id})
 */
export const getStoryIdFromUrl = (): string | null => {
  // Check for path segment format: /share/{id}
  const pathMatch = window.location.pathname.match(/\/share\/([^\/]+)/);
  if (pathMatch && pathMatch[1]) {
    console.log("Found story ID in path:", pathMatch[1]);
    return pathMatch[1];
  }
  
  // Fallback to legacy query parameter format: ?story={id}
  const urlParams = new URLSearchParams(window.location.search);
  const storyId = urlParams.get('story');
  if (storyId) {
    console.log("Found story ID in query parameter:", storyId);
  }
  
  return storyId;
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
  try {
    console.log(`Attempting to share: ${title} | URL: ${url}`);
    
    // Try using the Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
        console.log("Content shared successfully via Web Share API");
        return true;
      } catch (error) {
        console.error("Error using Web Share API:", error);
        // This could be a user cancellation, so it's not necessarily an error
        // Fall through to clipboard method
      }
    }
    
    // Fall back to copying the link to clipboard
    try {
      await navigator.clipboard.writeText(url);
      console.log("URL copied to clipboard successfully:", url);
      return true;
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      
      // Final fallback - if even clipboard fails, create a temporary input element
      // and use the old-school select and copy approach
      try {
        const tempInput = document.createElement("input");
        document.body.appendChild(tempInput);
        tempInput.value = url;
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        console.log("URL copied using fallback method:", url);
        return true;
      } catch (fallbackError) {
        console.error("All sharing methods failed:", fallbackError);
        return false;
      }
    }
  } catch (error) {
    console.error("Unexpected error during sharing:", error);
    return false;
  }
};
