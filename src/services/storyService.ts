
import { supabase } from "@/integrations/supabase/client";

interface StoryResponse {
  title: string;
  content: string;
  takeaway: string;
}

export const generateStory = async (topic: string): Promise<StoryResponse> => {
  try {
    // Input validation
    if (!isValidTopic(topic)) {
      return {
        title: "Thoda Confusion Hai",
        content: "Yeh thoda ajeeb sa topic lag raha hai, kya aap thoda aur clear karke bata sakte hain? Ya ek example de sakte hain?",
        takeaway: "Kripya ek specific topic dein jiske baare mein aap jaanna chahte hain."
      };
    }
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('generate-story', {
      body: { topic }
    });
    
    if (error) {
      console.error('Error calling generate-story function:', error);
      throw new Error(error.message || 'Failed to generate story');
    }
    
    return data as StoryResponse;
  } catch (error) {
    console.error('Error generating story:', error);
    
    // Fallback to local story generation if the API call fails
    return generateFallbackStory(topic);
  }
};

// Simple validation to check if topic is valid
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
  // Simulating API latency
  
  // Generate a character name and create an engaging story
  const characters = ["Rohit", "Priya", "Vikram", "Meera", "Ajay", "Neha", "Raju"];
  const character = characters[Math.floor(Math.random() * characters.length)];
  
  return {
    title: `${character} ka ${topic} se Dosti`,
    content: `Yaar, ${character} ke saath ek mast kahani hui thi! ${character} hamesha se hi curious type ka banda/bandi tha. Ek din uske dimaag mein ${topic} ke baare mein sawal aaya aur sochnе laga "Yeh ${topic} kya cheez hai? Sab log iske baare mein itna baat kyun karte hain?"\n\n${character} ke dost Sameer ne dekha ki woh pareshan hai. "Kya hua bhai? Tu itna tension mein kyun hai?" Sameer ne pucha.\n\n"Yaar, mujhe ${topic} samajh nahi aa raha. College mein sab log iske baare mein baat kar rahe hain, but mujhe kuch samajh nahi aa raha," ${character} ne frustration mein kaha.\n\n"Arey tension mat le! Main tujhe simple tarike se samjhata hoon," Sameer ne kaha. "Dekh, ${topic} ko aise samajh. Jaise tere phone mein battery hai na, woh khatam hoti hai toh phone band ho jata hai. Bilkul waise hi ${topic} ka concept bhi hai."\n\n${character} thoda confused: "Haan, but battery aur ${topic} mein kya connection hai?"\n\n"Main example de raha hoon, poora sun! ${topic} exactly aise kaam karta hai ki pehle ek foundation hota hai, phir uske upar layer by layer knowledge badhti jaati hai. Jaise ghar banate time pehle neev daaltе hain, phir deewarein khadі karte hain, phir chat daalte hain. Agar neev hi solid na ho, toh poora structure weak ho jayega."\n\n${character} ke dimaag mein bulb jalna shuru hua. "Oh! Matlab ${topic} mein bhi step by step process follow karna padta hai?"\n\n"Bilkul sahi! Aur ek real-life example se samajh. Jaise tu subah uthke ready hota hai na - brush karta hai, nahata hai, kapde pehenta hai, breakfast karta hai - yeh sab ek process hai. Agar tu directly breakfast kar le bina brush kiye, toh weird hoga na? ${topic} mein bhi proper sequence important hai."\n\n${character} ne haste hue kaha, "Ab lag raha hai kuch samajh mein aa raha hai! Matlab ${topic} mein organization aur process dono zaroori hain."\n\n"Haan! Aur ek baat - jaise tu cricket mein practice karta hai, dheere-dheere better hota jaata hai, waise hi ${topic} mein bhi practice se hi perfection aati hai. Theory samajhna alag baat hai, use implement karna alag baat."\n\nDin bhar Sameer ne ${character} ko examples, analogies aur daily life situations ke through ${topic} samjhaya. Jo pehle rocket science lag raha tha, ab simple lagne laga.\n\nShaam ko dono chai pe baithe. ${character} ne muskurate hue kaha, "Yaar, tune toh aaj mera dimaag hi khol diya! Ab ${topic} itna complicated nahi lag raha."`,
    takeaway: `${character} ne aaj seekha ki ${topic} ko samajhne ke liye zaruri hai usey real-life examples se connect karna. Complicated cheezein aksar simple analogies se samajh mein aati hain. Aur sabse important baat - learning ka process dheere dheere hota hai, ek dum se nahi. Jaise jaise concepts clear hote jate hain, confidence bhi badhta jata hai. Koi bhi naya concept sikhne ke liye patience aur practice dono zaruri hain.`
  };
};
