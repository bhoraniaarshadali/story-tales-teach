/**
 * Utility functions for sharing stories across platforms
 */

/**
 * Creates a shareable URL with the story ID
 * @param storyId The unique ID of the story
 * @returns A full URL string for sharing
 */
export const createShareableUrl = (storyId: string): string => {
  // Create a URL with the story ID as a query parameter
  const baseUrl = window.location.origin;

  // Make sure we don't append extra query parameters if they exist
  const path = window.location.pathname.split('?')[0];
  const cleanPath = path.endsWith('/') ? path : path + '/';

  // Format: https://domain.com/?story=abc123
  return `${baseUrl}${cleanPath}?story=${storyId}`;
};

/**
 * Extracts a story ID from the current URL if present
 * @returns The story ID from the URL or null if not found
 */
export const getStoryIdFromUrl = (): string | null => {
  // Check URL parameters for story ID
  const urlParams = new URLSearchParams(window.location.search);
  const storyId = urlParams.get('story');

  if (storyId) {
    return storyId;
  }

  // Also check for URL pattern like /share/[storyId]
  const pathMatch = window.location.pathname.match(/\/share\/([a-zA-Z0-9-]+)/);
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1];
  }

  return null;
};

/**
 * Attempts to share content using the Web Share API with fallback to clipboard
 * @param title Title for the share
 * @param text Text content to share
 * @param url URL to share
 * @returns Promise that resolves to true if sharing was successful
 */
export const shareContent = async (
  title: string,
  text: string,
  url: string
): Promise<boolean> => {
  try {
    // Try to use the native Web Share API if available
    if (navigator.share) {
      await navigator.share({
        title,
        text,
        url
      });
      return true;
    }

    // Fallback to clipboard copy
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Error sharing content:', error);

    // Try one more fallback for older browsers
    try {
      // Create a temporary input element
      const tempInput = document.createElement('input');
      tempInput.style.position = 'absolute';
      tempInput.style.left = '-1000px';
      tempInput.value = url;
      document.body.appendChild(tempInput);

      // Select and copy
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);

      return true;
    } catch (err) {
      console.error('Clipboard fallback failed:', err);
      return false;
    }
  }
};

/**
 * Generates a shareable image and triggers download or native sharing
 * @param elementId ID of the HTML element to capture as image
 * @param fileName Name for the downloaded file
 * @returns Promise that resolves when sharing is complete
 */
export const shareAsImage = async (
  elementId: string,
  fileName: string = 'shared-story.png'
): Promise<boolean> => {
  try {
    // This function would use html2canvas
    // Implementation would go here when html2canvas is available

    // For now, return false to indicate this isn't implemented
    // Actual implementation would be similar to what's in StoryDisplay.tsx
    return false;
  } catch (error) {
    console.error('Error generating shareable image:', error);
    return false;
  }
};

/**
 * Format social sharing text based on the story content
 * @param story The story object
 * @returns Formatted text for social sharing
 */
export const formatSocialShareText = (
  title: string,
  topic?: string
): string => {
  return topic
    ? `Check out this amazing story about ${topic}: "${title}"`
    : `Check out this amazing story: "${title}"`;
};