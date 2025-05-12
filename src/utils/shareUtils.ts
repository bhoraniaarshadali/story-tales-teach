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

  // Format: https://domain.com/share/story-id
  return `${baseUrl}/share/${storyId}`;
};

/**
 * Creates a shareable URL with the domain included for tracking purposes
 * @param storyId The unique ID of the story
 * @param includeSource Whether to include the source domain for analytics
 * @returns A full URL string for sharing
 */
export const createTrackableShareUrl = (storyId: string, includeSource: boolean = true): string => {
  // Base URL with story ID
  const baseUrl = createShareableUrl(storyId);

  if (!includeSource) return baseUrl;

  // Extract current domain for tracking
  const currentDomain = window.location.hostname;

  // Add source parameter for analytics
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}source=${encodeURIComponent(currentDomain)}`;
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
    // Log domain information for analytics
    const sourceDomain = urlParams.get('source');
    if (sourceDomain) {
      console.log(`Story shared from domain: ${sourceDomain}`);
    }
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
 * Extracts source domain information from URL if present
 * @returns The source domain or null if not found
 */
export const getSourceDomain = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const source = urlParams.get('source');

  if (source) {
    // Log for analytics
    console.log(`Traffic source detected: ${source}`);
    return source;
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
  // Log share attempt for analytics
  console.log(`Share attempt - Title: "${title}", URL: ${url}`);

  try {
    // Try to use the native Web Share API if available
    if (navigator.share) {
      await navigator.share({
        title,
        text,
        url
      });
      console.log('Content shared via Web Share API');
      return true;
    }

    // Fallback to clipboard copy
    await navigator.clipboard.writeText(url);
    console.log('URL copied to clipboard');
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

      console.log('URL copied to clipboard via execCommand fallback');
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

/**
 * Generate social sharing meta tags for a story
 * This function returns the meta tags for Open Graph and Twitter cards
 * 
 * @param story The story object
 * @returns HTML string with meta tags
 */
export const generateSocialMetaTags = (story: {
  title: string;
  content: string;
  takeaway?: string;
  id?: string;
}): string => {
  const description = story.takeaway || story.content.substring(0, 150) + '...';
  const imageUrl = `https://source.unsplash.com/random/1200x630/?story,${encodeURIComponent(story.title.split(' ')[0])}`;

  return `
    <!-- Open Graph meta tags -->
    <meta property="og:title" content="${story.title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${story.id ? createShareableUrl(story.id) : window.location.href}" />
    <meta property="og:type" content="article" />

    <!-- Twitter Card meta tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${story.title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
  `;
};

/**
 * Strips Markdown formatting from content to create plain text
 * @param content The Markdown content to strip
 * @returns Plain text without Markdown formatting
 */
export function stripMarkdown(content: string): string {
  // Remove Markdown headings (##)
  let plainText = content.replace(/^##\s*(.+)$/gm, '$1');

  // Remove bold (**text**) and italics (_text_)
  plainText = plainText.replace(/\*\*(.+?)\*\*/g, '$1');
  plainText = plainText.replace(/_(.+?)_/g, '$1');

  // Remove centered quotes (<div class='centered-quote'>...</div>)
  plainText = plainText.replace(/<div class='centered-quote'>(.+?)<\/div>/g, '"$1"');

  // Remove suggestion boxes (already removed, but ensure for safety)
  plainText = plainText.replace(/<div class='suggestion-box'>[\s\S]*?<\/div>/g, '');

  // Convert bullet points (- ) to numbered list
  let bulletCounter = 1;
  plainText = plainText.replace(/^- (.+)$/gm, () => `${bulletCounter++}. $1`);
  // Reset counter for each new list
  plainText = plainText.replace(/(\n\d+\..+)+/g, (match) => {
    bulletCounter = 1;
    return match.replace(/\d+\./g, () => `${bulletCounter++}.`);
  });

  // Remove emojis (e.g., 💡)
  plainText = plainText.replace(/💡/g, '');

  // Normalize newlines and spacing
  plainText = plainText.replace(/\n{2,}/g, '\n\n').trim();

  return plainText;
}

/**
 * Formats a story object into a plain-text string for sharing
 * @param story The story object containing title, content, takeaway, and key points
 * @returns A plain-text string suitable for sharing
 */
export function formatStoryForSharing(story: { title: string; content: string; takeaway: string; keyPoints: string[] }): string {
  const plainContent = stripMarkdown(story.content);
  const plainKeyPoints = story.keyPoints.map((point, index) => `${index + 1}. ${stripMarkdown(point)}`).join('\n');

  return `${story.title}\n\n${plainContent}\n\nKey Takeaway:\n${stripMarkdown(story.takeaway)}\n\nKey Points:\n${plainKeyPoints}`;
}