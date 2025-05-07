
/**
 * Story Sharing Utilities
 * Handles URL generation, sharing, and extraction of story IDs
 */

/**
 * Creates a shareable URL for a story
 * @param storyId The unique ID of the story to share
 * @returns A properly formatted shareable URL
 */
export const createShareableUrl = (storyId: string): string => {
  if (!storyId) {
    console.error("Cannot create shareable URL: Missing story ID");
    return window.location.origin;
  }

  const baseUrl = window.location.origin;
  // Use a cleaner URL structure with path segment
  return `${baseUrl}/share/${encodeURIComponent(storyId)}`;
};

/**
 * Extracts story ID from URL if present
 * Supports both path-based URLs (/share/{id}) and legacy query param URLs (?story={id})
 * @returns The story ID from the URL, or null if not found
 */
export const getStoryIdFromUrl = (): string | null => {
  try {
    // Check for new URL format with path segment
    const pathMatch = window.location.pathname.match(/\/share\/([^\/]+)/);
    if (pathMatch && pathMatch[1]) {
      const decodedId = decodeURIComponent(pathMatch[1]);
      console.log("Found story ID in path:", decodedId);
      return decodedId;
    }
    
    // Fallback to legacy query parameter format
    const urlParams = new URLSearchParams(window.location.search);
    const storyId = urlParams.get('story');
    if (storyId) {
      console.log("Found story ID in query parameter:", storyId);
      return storyId;
    }
    
    return null;
  } catch (error) {
    console.error("Error parsing story ID from URL:", error);
    return null;
  }
};

/**
 * Shares content using the Web Share API if available,
 * falls back to copying to clipboard
 * @param title The title for the share dialog
 * @param text The descriptive text for the share dialog
 * @param url The URL to share
 * @returns Promise that resolves to boolean indicating success
 */
export const shareContent = async (
  title: string, 
  text: string, 
  url: string
): Promise<boolean> => {
  if (!url) {
    console.error("Cannot share: Missing URL");
    return false;
  }

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
        if ((error as Error).name !== "AbortError") {
          console.error("Error using Web Share API:", error);
        } else {
          console.log("User cancelled sharing");
        }
        // Fall through to clipboard method if not AbortError
        if ((error as Error).name === "AbortError") {
          return false;
        }
      }
    }
    
    // Fall back to copying the link to clipboard
    try {
      await navigator.clipboard.writeText(url);
      console.log("URL copied to clipboard successfully:", url);
      return true;
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      
      // Ultimate fallback: create a temporary input element to copy from
      try {
        const tempInput = document.createElement("input");
        tempInput.style.position = "absolute";
        tempInput.style.left = "-1000px";
        tempInput.value = url;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        console.log("URL copied using fallback method");
        return true;
      } catch (fallbackError) {
        console.error("All copy methods failed:", fallbackError);
        return false;
      }
    }
  } catch (error) {
    console.error("Unexpected error during sharing:", error);
    return false;
  }
};
