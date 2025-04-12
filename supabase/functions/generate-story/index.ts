
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StoryResponse {
  title: string;
  content: string;
  takeaway: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic } = await req.json();
    
    if (!topic || topic.trim().length < 2) {
      return new Response(
        JSON.stringify({
          title: "Thoda Confusion Hai",
          content: "Yeh thoda ajeeb sa topic lag raha hai, kya aap thoda aur clear karke bata sakte hain? Ya ek example de sakte hain?",
          takeaway: "Kripya ek specific topic dein jiske baare mein aap jaanna chahte hain."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prompt for Gemini API
    const prompt = `
    Kisi ek character ke through ek interesting aur relatable kahani banao jisme wo kisi topic ko samajhne ki koshish kar raha ho. Topic hai: "${topic}".
    
    Us topic ko step-by-step explain karo real-life examples, analogies aur daily life situations ke through. Kahani engaging ho, funny ho sakti hai, lekin concept clear hona chahiye.
    
    Language simple Hinglish ho (Hindi-English mix), jaise doston ke beech baat hoti hai, casual style mein.
    
    Response format must be a valid JSON with these fields: 
    {
      "title": "Story title in Hinglish",
      "content": "The full story in Hinglish with proper formatting and paragraphs",
      "takeaway": "A summary of what the character learned at the end in 1-2 sentences"
    }
    
    Make sure the JSON is properly formatted and valid.
    `;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error('Failed to generate story with Gemini API');
    }

    let storyResponse: StoryResponse;
    
    try {
      const generatedText = data.candidates[0].content.parts[0].text;
      // Extract the JSON from the text (might be surrounded by markdown code blocks)
      const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                         generatedText.match(/```\n([\s\S]*?)\n```/) ||
                         [null, generatedText];
      
      const jsonContent = jsonMatch[1] || generatedText;
      storyResponse = JSON.parse(jsonContent);
      
      // Validate response structure
      if (!storyResponse.title || !storyResponse.content || !storyResponse.takeaway) {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      
      // Fallback response
      storyResponse = {
        title: `${topic} ki Kahani`,
        content: data.candidates[0].content.parts[0].text,
        takeaway: "Gemini se story generate hui lekin format thoda unexpected tha."
      };
    }

    return new Response(JSON.stringify(storyResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Error in generate-story function:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      title: "Oops! Kuch problem hai",
      content: "Story generate karne mein problem aayi. Technical team se connect kar rahe hain.",
      takeaway: "Thodi der baad try kijiye."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
