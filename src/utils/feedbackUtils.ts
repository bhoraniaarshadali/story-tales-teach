import { supabase } from "@/integrations/supabase/client";
import { type Story } from "@/hooks/useStoryManager";

type FeedbackType = "like" | "dislike";
type FeedbackAction = "add" | "remove";

interface FeedbackStats {
  likes: number;
  dislikes: number;
  userInteraction?: FeedbackType | null;
}

interface FeedbackResult {
  stats: FeedbackStats | null;
  error?: string;
}

/**
 * Validates if a string is a valid UUID
 * @param id The string to validate
 * @returns True if the string is a valid UUID, false otherwise
 */
const isValidUUID = (id: string): boolean => { // Line 22: Add UUID validation function
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Updates the feedback for a story (like/dislike)
 * 
 * @param storyId The ID of the story
 * @param feedbackType The type of feedback (like or dislike)
 * @param action Whether to add or remove the feedback
 * @returns The updated feedback stats and any error message
 */
export const updateStoryFeedback = async (
  storyId: string,
  feedbackType: FeedbackType,
  action: FeedbackAction
): Promise<FeedbackResult> => {
  try {
    // Validate storyId format
    if (!isValidUUID(storyId)) { // Line 43: Add UUID validation
      return { stats: null, error: "Invalid story ID format. Story ID must be a valid UUID." };
    }

    // Get current user ID or generate a session ID for anonymous users
    const userId = localStorage.getItem("feedback_session_id") ||
      `anon-${Math.random().toString(36).substring(2, 15)}`;

    // Store the session ID for anonymous users
    if (!localStorage.getItem("feedback_session_id")) {
      localStorage.setItem("feedback_session_id", userId);
    }

    // Update the local feedback state
    const storageKey = `story_feedback_${storyId}`;
    const previousFeedback = localStorage.getItem(storageKey);

    // Handle removal of previous feedback if changing opinion
    if (previousFeedback && previousFeedback !== feedbackType && action === "add") {
      // User is changing from like to dislike or vice versa
      // We need to remove the previous feedback first
      const result = await updateStoryFeedback(storyId, previousFeedback as FeedbackType, "remove");
      if (result.error) {
        return { stats: null, error: result.error };
      }
    }

    // Update local storage with the new feedback
    if (action === "add") {
      localStorage.setItem(storageKey, feedbackType);
    } else {
      localStorage.removeItem(storageKey);
    }

    // Get the current feedback stats from the story
    const { data: story, error: fetchError } = await supabase
      .from("stories")
      .select("likes, dislikes")
      .eq("id", storyId)
      .single();

    if (fetchError) {
      console.error("Error fetching story for feedback:", fetchError);
      if (fetchError.code === "22P02") { // Line 99: Check for UUID error
        return { stats: null, error: "Invalid story ID format. Story ID must be a valid UUID." };
      }
      return { stats: null, error: "Failed to fetch story feedback. Please try again." };
    }

    // Calculate the new feedback counts
    let likes = story?.likes ?? 0;
    let dislikes = story?.dislikes ?? 0;

    if (feedbackType === "like") {
      likes = action === "add" ? likes + 1 : Math.max(0, likes - 1);
    } else {
      dislikes = action === "add" ? dislikes + 1 : Math.max(0, dislikes - 1);
    }

    // Update the database
    const { error: updateError } = await supabase
      .from("stories")
      .update({
        likes,
        dislikes,
        updated_at: new Date().toISOString()
      })
      .eq("id", storyId);

    if (updateError) {
      console.error("Error updating story feedback:", updateError);
      // Revert local storage if there was an error
      if (previousFeedback) {
        localStorage.setItem(storageKey, previousFeedback);
      } else {
        localStorage.removeItem(storageKey);
      }
      if (updateError.code === "22P02") { // Line 132: Check for UUID error
        return { stats: null, error: "Invalid story ID format. Story ID must be a valid UUID." };
      }
      return { stats: null, error: "Failed to update feedback. Please try again." };
    }

    return {
      stats: {
        likes,
        dislikes,
        userInteraction: action === "add" ? feedbackType : null
      }
    };
  } catch (error) {
    console.error("Error in updateStoryFeedback:", error);
    return { stats: null, error: "An unexpected error occurred while updating feedback." };
  }
};

/**
 * Gets the current feedback stats for a story
 * 
 * @param storyId The ID of the story
 * @returns The current feedback stats and any error message
 */
export const getStoryFeedback = async (storyId: string): Promise<FeedbackResult> => {
  try {
    // Validate storyId format
    if (!isValidUUID(storyId)) { // Line 159: Add UUID validation
      return { stats: null, error: "Invalid story ID format. Story ID must be a valid UUID." };
    }

    // Get the current feedback stats from the story
    const { data: story, error } = await supabase
      .from("stories")
      .select("likes, dislikes")
      .eq("id", storyId)
      .single();

    if (error) {
      console.error("Error fetching story feedback:", error);
      if (error.code === "22P02") { // Line 171: Check for UUID error
        return { stats: null, error: "Invalid story ID format. Story ID must be a valid UUID." };
      }
      return { stats: null, error: "Failed to fetch story feedback. Please try again." };
    }

    const storageKey = `story_feedback_${storyId}`;
    const userInteraction = localStorage.getItem(storageKey) as FeedbackType | null;

    return {
      stats: {
        likes: story?.likes ?? 0,
        dislikes: story?.dislikes ?? 0,
        userInteraction
      }
    };
  } catch (error) {
    console.error("Error in getStoryFeedback:", error);
    return { stats: null, error: "An unexpected error occurred while fetching feedback." };
  }
};

/**
 * Check if a story is in the user's favorites
 * 
 * @param storyId The ID of the story
 * @returns boolean indicating whether the story is favorited
 */
export const isStoryFavorited = (storyId: string): boolean => {
  const storyHistory = JSON.parse(localStorage.getItem("storyHistory") || "[]");
  const story = storyHistory.find((s: Story) => s.id === storyId);
  return story?.isFavorite || false;
};

/**
 * Toggles the favorite state of a story in localStorage
 * 
 * @param story The story object to toggle favorite state for
 * @returns The new favorite state
 */
export const toggleStoryFavorite = (story: Story): boolean => {
  try {
    let storyHistory: Story[] = JSON.parse(localStorage.getItem("storyHistory") || "[]");

    const storyIndex = storyHistory.findIndex((s: Story) => s.id === story.id);
    const newFavoriteState = storyIndex !== -1 ? !storyHistory[storyIndex].isFavorite : true;

    if (storyIndex !== -1) {
      // Update existing story
      storyHistory[storyIndex] = { ...storyHistory[storyIndex], isFavorite: newFavoriteState };
    } else {
      // Add new story with favorite state
      storyHistory.push({ ...story, isFavorite: newFavoriteState });
    }

    localStorage.setItem("storyHistory", JSON.stringify(storyHistory));
    return newFavoriteState;
  } catch (error) {
    console.error("Error toggling story favorite state:", error);
    return false;
  }
};

/**
 * Handle optimistic UI updates for feedback actions
 * 
 * @param storyId The ID of the story
 * @param action The feedback action (like or dislike)
 * @param currentState The current feedback state (liked, disliked, or neither)
 * @returns The new feedback state
 */
export const handleFeedbackOptimistic = (
  storyId: string,
  action: FeedbackType,
  currentState: FeedbackType | null
): FeedbackType | null => {
  // If the user clicks the same button they previously clicked, remove their feedback
  if (currentState === action) {
    return null;
  }
  // Otherwise, set their feedback to the new action
  return action;
};