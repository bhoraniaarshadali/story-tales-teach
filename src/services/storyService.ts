
import { supabase } from "@/integrations/supabase/client";

interface StoryResponse {
  title: string;
  content: string;
  takeaway: string;
  character?: {
    name: string;
    emoji: string;
    traits?: string;
  };
  emotions?: string[];
  keyPoints?: string[];
  topic?: string; // Make sure topic is included
}

export const generateStory = async (topic: string): Promise<StoryResponse> => {
  try {
    // Better input validation using Gemini
    if (!topic || topic.trim().length < 2) {
      return createErrorStory("Please provide a valid topic with at least 2 characters");
    }
    
    console.log(`Sending topic to generate-story function: "${topic}"`);
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('generate-story', {
      body: { topic: topic.trim() }
    });
    
    if (error) {
      console.error('Error calling generate-story function:', error);
      throw new Error(error.message || 'Failed to generate story');
    }
    
    // Make sure we have valid data before returning
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response from generate-story function');
    }
    
    // Validate that data has the required fields
    if (!data.title || !data.content || !data.takeaway) {
      console.error('Missing required fields in response:', data);
      throw new Error('Story generation response is missing required fields');
    }
    
    // Ensure the topic is correctly included in the response
    if (!data.topic) {
      data.topic = topic;
    }
    
    return data as StoryResponse;
  } catch (error) {
    console.error('Error generating story:', error);
    
    // Fallback to local story generation if the API call fails
    return generateFallbackStory(topic);
  }
};

// Creates a friendly error message as a story
const createErrorStory = (message: string): StoryResponse => {
  return {
    title: "Thoda Confusion Hai",
    content: `${message}\n\nYeh thoda ajeeb sa topic lag raha hai, kya aap thoda aur clear karke bata sakte hain? Ya ek example de sakte hain?`,
    takeaway: "Kripya ek specific topic dein jiske baare mein aap jaanna chahte hain.",
    emotions: ["confused", "curious"]
  };
};

// Simple validation to check if topic is valid - this will be improved by Gemini validation
const isValidTopic = (topic: string): boolean => {
  if (!topic || topic.trim().length < 2) return false;
  
  // Check for gibberish or random characters
  const gibberishPattern = /^[a-z]{1,4}$/i;
  if (gibberishPattern.test(topic)) return false;
  
  // Add more validation rules as needed
  return true;
};

// Fallback story generation (only used if the API call fails)
const generateFallbackStory = (topic: string): StoryResponse => {
  // Generate a character name and create an engaging story
  const characters = [
    { name: "Rohit", emoji: "👨‍🎓", traits: "curious and analytical" },
    { name: "Priya", emoji: "👩‍🔬", traits: "detail-oriented and methodical" },
    { name: "Vikram", emoji: "👨‍💻", traits: "tech-savvy and logical" },
    { name: "Meera", emoji: "👩‍🏫", traits: "patient and articulate" },
    { name: "Ajay", emoji: "👨‍🚀", traits: "adventurous and creative" },
    { name: "Neha", emoji: "👩‍⚕️", traits: "empathetic and precise" },
    { name: "Raju", emoji: "👨‍🍳", traits: "practical and experimental" }
  ];
  
  const character = characters[Math.floor(Math.random() * characters.length)];
  
  // Determine emotions based on topic
  const emotions = determineEmotionsForTopic(topic);
  
  return {
    title: `${character.name} ka ${topic} se Dosti`,
    content: `Yaar, ${character.name} ke saath ek mast kahani hui thi! ${character.name} hamesha se hi ${character.traits} type ka banda/bandi tha. Ek din uske dimaag mein ${topic} ke baare mein sawal aaya aur sochnе laga "Yeh ${topic} kya cheez hai? Sab log iske baare mein itna baat kyun karte hain?"\n\n${character.name} ke dost Sameer ne dekha ki woh pareshan hai. "Kya hua bhai? Tu itna tension mein kyun hai?" Sameer ne pucha.\n\n"Yaar, mujhe ${topic} samajh nahi aa raha. College mein sab log iske baare mein baat kar rahe hain, but mujhe kuch samajh nahi aa raha," ${character.name} ne frustration mein kaha.\n\n"Arey tension mat le! Main tujhe simple tarike se samjhata hoon," Sameer ne kaha. "Dekh, ${topic} ko aise samajh. Jaise tere phone mein battery hai na, woh khatam hoti hai toh phone band ho jata hai. Bilkul waise hi ${topic} ka concept bhi hai."\n\n${character.name} thoda confused: "Haan, but battery aur ${topic} mein kya connection hai?"\n\n"Main example de raha hoon, poora sun! ${topic} exactly aise kaam karta hai ki pehle ek foundation hota hai, phir uske upar layer by layer knowledge badhti jaati hai. Jaise ghar banate time pehle neev daaltе hain, phir deewarein khadі karte hain, phir chat daalte hain. Agar neev hi solid na ho, toh poora structure weak ho jayega."\n\n${character.name} ke dimaag mein bulb jalna shuru hua. "Oh! Matlab ${topic} mein bhi step by step process follow karna padta hai?"\n\n"Bilkul sahi! Aur ek real-life example se samajh. Jaise tu subah uthke ready hota hai na - brush karta hai, nahata hai, kapde pehenta hai, breakfast karta hai - yeh sab ek process hai. Agar tu directly breakfast kar le bina brush kiye, toh weird hoga na? ${topic} mein bhi proper sequence important hai."\n\n${character.name} ne haste hue kaha, "Ab lag raha hai kuch samajh mein aa raha hai! Matlab ${topic} mein organization aur process dono zaroori hain."\n\n"Haan! Aur ek baat - jaise tu cricket mein practice karta hai, dheere-dheere better hota jaata hai, waise hi ${topic} mein bhi practice se hi perfection aati hai. Theory samajhna alag baat hai, use implement karna alag baat."\n\nDin bhar Sameer ne ${character.name} ko examples, analogies aur daily life situations ke through ${topic} samjhaya. Jo pehle rocket science lag raha tha, ab simple lagne laga.\n\nShaam ko dono chai pe baithe. ${character.name} ne muskurate hue kaha, "Yaar, tune toh aaj mera dimaag hi khol diya! Ab ${topic} itna complicated nahi lag raha."`,
    takeaway: `${character.name} ne aaj seekha ki ${topic} ko samajhne ke liye zaruri hai usey real-life examples se connect karna. Complicated cheezein aksar simple analogies se samajh mein aati hain. Aur sabse important baat - learning ka process dheere dheere hota hai, ek dum se nahi. Jaise jaise concepts clear hote jate hain, confidence bhi badhta jata hai. Koi bhi naya concept sikhne ke liye patience aur practice dono zaruri hain.`,
    character: character,
    emotions: emotions,
    keyPoints: generateKeyPointsForTopic(topic),
    topic: topic // Ensure the topic is included
  };
};

// Helper function to determine emotions based on topic
const determineEmotionsForTopic = (topic: string): string[] => {
  const topicLower = topic.toLowerCase();
  const baseEmotions = ["curious", "interested"];
  
  // Add topic-specific emotions
  if (topicLower.includes("ai") || 
      topicLower.includes("tech") || 
      topicLower.includes("computer") || 
      topicLower.includes("programming")) {
    return [...baseEmotions, "excited", "fascinated", "inspired"];
  }
  
  if (topicLower.includes("art") || 
      topicLower.includes("music") || 
      topicLower.includes("creative") || 
      topicLower.includes("design")) {
    return [...baseEmotions, "passionate", "inspired", "creative"];
  }
  
  if (topicLower.includes("science") || 
      topicLower.includes("physics") || 
      topicLower.includes("chemistry") || 
      topicLower.includes("biology")) {
    return [...baseEmotions, "analytical", "thoughtful", "amazed"];
  }
  
  if (topicLower.includes("health") || 
      topicLower.includes("wellness") || 
      topicLower.includes("fitness") || 
      topicLower.includes("meditation")) {
    return [...baseEmotions, "calm", "determined", "hopeful"];
  }
  
  return [...baseEmotions, "thoughtful", "engaged"];
};

// Generate key learning points based on topic
const generateKeyPointsForTopic = (topic: string): string[] => {
  return [
    `${topic} requires step-by-step learning`,
    `Real-world examples make ${topic} easier to understand`,
    `Practice is essential for mastering ${topic}`,
    `Breaking ${topic} down into smaller parts makes it manageable`
  ];
};
