import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type Story } from "@/hooks/useStoryManager";

type FeedbackType = "like" | "dislike";
type FeedbackAction = "add" | "remove";

interface FeedbackStats {
  likes: number;
  dislikes: number;
  userInteraction?: FeedbackType | null;
}

/**
 * Updates the feedback for a story (like/dislike)
 * 
 * @param storyId The ID of the story
 * @param feedbackType The type of feedback (like or dislike)
 * @param action Whether to add or remove the feedback
 * @returns The updated feedback stats
 */
export const updateStoryFeedback = async (
  storyId: string,
  feedbackType: FeedbackType,
  action: FeedbackAction
): Promise<FeedbackStats | null> => {
  try {
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
      await updateStoryFeedback(storyId, previousFeedback as FeedbackType, "remove");
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
      return null;
    }

    // Calculate the new feedback counts
    let likes = story?.likes || 0;
    let dislikes = story?.dislikes || 0;

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
      return null;
    }

    return {
      likes,
      dislikes,
      userInteraction: action === "add" ? feedbackType : null
    };
  } catch (error) {
    console.error("Error in updateStoryFeedback:", error);
    return null;
  }
};

/**
 * Gets the current feedback stats for a story
 * 
 * @param storyId The ID of the story
 * @returns The current feedback stats
 */
export const getStoryFeedback = async (storyId: string): Promise<FeedbackStats | null> => {
  try {
    // Get the current feedback stats from the story
    const { data: story, error } = await supabase
      .from("stories")
      .select("likes, dislikes")
      .eq("id", storyId)
      .single();

    if (error) {
      console.error("Error fetching story feedback:", error);
      return null;
    }

    const storageKey = `story_feedback_${storyId}`;
    const userInteraction = localStorage.getItem(storageKey) as FeedbackType | null;

    return {
      likes: story?.likes || 0,
      dislikes: story?.dislikes || 0,
      userInteraction
    };
  } catch (error) {
    console.error("Error in getStoryFeedback:", error);
    return null;
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
 * Handle optimistic UI updates for feedback actions
 * 
 * @param storyId The ID of the story
 * @param action The feedback action (like or dislike)
 * @param currentState The current feedback state (liked, disliked, or neither)
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
