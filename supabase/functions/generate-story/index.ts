
// This is the edge function that generates a story using Gemini API

// Import the necessary packages
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper for validating topics with Gemini
async function validateTopic(topic: string) {
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiApiKey) {
    console.error("GEMINI_API_KEY not found in environment");
    return { isValid: true, reason: "Skipping validation, API key not found" }; // Default to valid if API key is missing
  }

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + geminiApiKey, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are validating user input for a learning story generator app.
            
            Analyze this topic: "${topic}"
            
            Check if it's:
            1. A real concept that can be explained
            2. Not offensive or harmful
            3. Not complete gibberish
            4. Not purely random characters
            
            Output ONLY JSON in this exact format:
            {
              "isValid": boolean,
              "reason": "short explanation if invalid or 'valid topic' if valid"
            }`
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 200,
        }
      })
    });

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error("No candidates in Gemini validation response", data);
      return { isValid: true, reason: "Validation error, defaulting to valid" };
    }
    
    const text = data.candidates[0].content.parts[0].text;
    
    try {
      // Extract JSON from response (handling cases where there might be markdown formatting)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        return { isValid: true, reason: "JSON parsing failed, defaulting to valid" };
      }
    } catch (e) {
      console.error("Error parsing validation JSON", e);
      return { isValid: true, reason: "JSON parse error, defaulting to valid" };
    }
  } catch (error) {
    console.error("Error calling Gemini validation API", error);
    return { isValid: true, reason: "API error, defaulting to valid" };
  }
}

// Function to generate a character and details
function generateCharacter(topic: string) {
  // Generate character based on topic
  const characters = [
    { name: "Rohit", emoji: "👨‍🎓", traits: "curious and analytical" },
    { name: "Priya", emoji: "👩‍🔬", traits: "detail-oriented and methodical" },
    { name: "Vikram", emoji: "👨‍💻", traits: "tech-savvy and logical" },
    { name: "Meera", emoji: "👩‍🏫", traits: "patient and articulate" },
    { name: "Ajay", emoji: "👨‍🚀", traits: "adventurous and creative" },
    { name: "Neha", emoji: "👩‍⚕️", traits: "empathetic and precise" },
    { name: "Raju", emoji: "👨‍🍳", traits: "practical and experimental" }
  ];
  
  return characters[Math.floor(Math.random() * characters.length)];
}

// Function to generate a story using Gemini API
async function generateStoryWithGemini(topic: string) {
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY not found in environment");
  }
  
  // Generate a random character
  const character = generateCharacter(topic);

  // Create a conversational, engaging prompt for Gemini
  const prompt = `
  Kisi ek character ke through ek interesting aur relatable kahani banao jisme wo "${topic}" ko samajhne ki koshish kar raha ho.
  
  Character ka naam "${character.name}" hai, aur woh ${character.traits} hai.
  
  Us topic ko step-by-step explain karo real-life examples, analogies aur daily life situations ke through. Kahani engaging ho, funny ho sakti hai, lekin concept clear hona chahiye.
  
  Language simple Hindi-English mix (Hinglish) ho, jisme thoda casual touch ho jaise doston ke beech baat hoti hai.
  
  JSON format me output do:
  {
    "title": "Catchy title in Hinglish related to the story and topic",
    "content": "The full story with proper paragraph breaks (use \\n\\n for paragraphs)",
    "takeaway": "A summary of what was learned in 3-4 lines"
  }`;

  try {
    // Call the Gemini API to generate content
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + geminiApiKey, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    // Parse the response
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }

    const text = data.candidates[0].content.parts[0].text;
    
    try {
      // Extract JSON from the response (handle cases with markdown formatting)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const story = JSON.parse(jsonMatch[0]);
        return {
          ...story,
          character: {
            name: character.name,
            emoji: character.emoji
          }
        };
      } else {
        throw new Error("Could not extract JSON from Gemini response");
      }
    } catch (jsonError) {
      console.error("JSON parsing error", jsonError);
      throw new Error("Failed to parse story from Gemini API");
    }
  } catch (error) {
    console.error("Error generating story with Gemini:", error);
    throw error;
  }
}

// Generate a fallback story if the API fails
function generateFallbackStory(topic: string) {
  const character = generateCharacter(topic);
  
  return {
    title: `${character.name} ka ${topic} se Dosti`,
    content: `Yaar, ${character.name} ke saath ek mast kahani hui thi! ${character.name} hamesha se hi curious type ka banda/bandi tha. Ek din uske dimaag mein ${topic} ke baare mein sawal aaya aur sochnе laga "Yeh ${topic} kya cheez hai? Sab log iske baare mein itna baat kyun karte hain?"\n\n${character.name} ke dost Sameer ne dekha ki woh pareshan hai. "Kya hua bhai? Tu itna tension mein kyun hai?" Sameer ne pucha.\n\n"Yaar, mujhe ${topic} samajh nahi aa raha. College mein sab log iske baare mein baat kar rahe hain, but mujhe kuch samajh nahi aa raha," ${character.name} ne frustration mein kaha.\n\n"Arey tension mat le! Main tujhe simple tarike se samjhata hoon," Sameer ne kaha. "Dekh, ${topic} ko aise samajh. Jaise tere phone mein battery hai na, woh khatam hoti hai toh phone band ho jata hai. Bilkul waise hi ${topic} ka concept bhi hai."\n\n${character.name} thoda confused: "Haan, but battery aur ${topic} mein kya connection hai?"\n\n"Main example de raha hoon, poora sun! ${topic} exactly aise kaam karta hai ki pehle ek foundation hota hai, phir uske upar layer by layer knowledge badhti jaati hai. Jaise ghar banate time pehle neev daaltе hain, phir deewarein khadі karte hain, phir chat daalte hain. Agar neev hi solid na ho, toh poora structure weak ho jayega."\n\n${character.name} ke dimaag mein bulb jalna shuru hua. "Oh! Matlab ${topic} mein bhi step by step process follow karna padta hai?"\n\n"Bilkul sahi! Aur ek real-life example se samajh. Jaise tu subah uthke ready hota hai na - brush karta hai, nahata hai, kapde pehenta hai, breakfast karta hai - yeh sab ek process hai. Agar tu directly breakfast kar le bina brush kiye, toh weird hoga na? ${topic} mein bhi proper sequence important hai."\n\n${character.name} ne haste hue kaha, "Ab lag raha hai kuch samajh mein aa raha hai! Matlab ${topic} mein organization aur process dono zaroori hain."\n\n"Haan! Aur ek baat - jaise tu cricket mein practice karta hai, dheere-dheere better hota jaata hai, waise hi ${topic} mein bhi practice se hi perfection aati hai. Theory samajhna alag baat hai, use implement karna alag baat."\n\nDin bhar Sameer ne ${character.name} ko examples, analogies aur daily life situations ke through ${topic} samjhaya. Jo pehle rocket science lag raha tha, ab simple lagne laga.\n\nShaam ko dono chai pe baithe. ${character.name} ne muskurate hue kaha, "Yaar, tune toh aaj mera dimaag hi khol diya! Ab ${topic} itna complicated nahi lag raha."`,
    takeaway: `${character.name} ne aaj seekha ki ${topic} ko samajhne ke liye zaruri hai usey real-life examples se connect karna. Complicated cheezein aksar simple analogies se samajh mein aati hain. Aur sabse important baat - learning ka process dheere dheere hota hai, ek dum se nahi. Jaise jaise concepts clear hote jate hain, confidence bhi badhta jata hai. Koi bhi naya concept sikhne ke liye patience aur practice dono zaruri hain.`,
    character: {
      name: character.name,
      emoji: character.emoji
    }
  };
}

// Main handler function for the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body to get the topic
    const { topic } = await req.json();
    
    // Basic validation
    if (!topic || typeof topic !== "string") {
      throw new Error("Invalid or missing topic");
    }
    
    // Validate the topic using Gemini
    const validationResult = await validateTopic(topic);
    
    if (!validationResult.isValid) {
      return new Response(
        JSON.stringify({
          title: "Thoda Confusion Hai",
          content: `Yeh topic thoda ajeeb lag raha hai: ${validationResult.reason}\n\nKya aap koi aur topic try karna chahenge? Ya ise thoda aur clearly explain kar sakte hain?`,
          takeaway: "Kripya ek specific aur clear topic dein jiske baare mein aap jaanna chahte hain."
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Generate the story using Gemini API
    const story = await generateStoryWithGemini(topic);

    // Return the generated story
    return new Response(JSON.stringify(story), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in generate-story function:", error);
    
    // Generate a fallback story if there's an error
    const fallbackStory = generateFallbackStory(req.json().then(data => data.topic).catch(() => "learning"));
    
    return new Response(JSON.stringify(fallbackStory), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
