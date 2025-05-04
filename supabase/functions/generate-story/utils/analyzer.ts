
// Default fallback values in case API doesn't respond or parse correctly
const defaultAnalysis = {
  emotions: [
    "curious",
    "interested"
  ],
  category: "general",
  characteristics: [
    "informative",
    "educational",
    "engaging"
  ],
  readingLevel: "intermediate",
  recommendedAge: "all-ages"
};

// Function to analyze topic and extract potential emotions and educational metrics
export async function analyzeTopicEmotions(topic) {
  const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!openRouterApiKey) {
    console.warn("OPENROUTER_API_KEY not found, returning default analysis");
    return defaultAnalysis;
  }
  try {
    // Use a more advanced prompt with BERT-like classification principles
    const prompt = `
    Perform a comprehensive educational analysis of this topic: "${topic}"

    Identify:
    1. The specific category it belongs to (e.g., "technology", "science", "history", "mathematics", "arts", "business")
    2. 3-5 emotions that someone might feel when learning about this topic
    3. 3-5 key characteristics of this topic that make it educational
    4. Appropriate reading level (beginner, intermediate, advanced)
    5. Recommended age group (children, teenagers, adults, all-ages)

    Output ONLY JSON in this exact format:
    {
      "category": "specific category name",
      "emotions": ["emotion1", "emotion2", "emotion3"],
      "characteristics": ["characteristic1", "characteristic2", "characteristic3", "characteristic4"],
      "readingLevel": "reading level",
      "recommendedAge": "age group"
    }
    `;
    
    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout
    
    try {
      // Using Gemini Pro for enhanced educational analysis
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://www.story-tales-teach.me/",
          "X-Title": "Story Tales Teach"
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free", // Using the latest available model for better analysis
          messages: [
            {
              role: "system",
              content: "You are an advanced educational content analyzer that performs BERT-like topic classification and emotional analysis for educational content."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: {
            type: "json_object"
          },
          temperature: 0.3,
          max_tokens: 500
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      if (!data.choices || data.choices.length === 0) {
        console.warn("OpenRouter API returned no choices, using default");
        return defaultAnalysis;
      }
      const text = data.choices[0].message.content;
      
      // Enhanced robust JSON parsing with multiple fallbacks
      try {
        // Try direct parsing first
        const parsed = JSON.parse(text);
        console.log("✅ Successfully parsed JSON response");
        
        // Validate the response has all required fields
        const validatedResponse = {
          category: parsed.category || defaultAnalysis.category,
          emotions: Array.isArray(parsed.emotions) ? parsed.emotions : defaultAnalysis.emotions,
          characteristics: Array.isArray(parsed.characteristics) ? parsed.characteristics : defaultAnalysis.characteristics,
          readingLevel: parsed.readingLevel || defaultAnalysis.readingLevel,
          recommendedAge: parsed.recommendedAge || defaultAnalysis.recommendedAge
        };
        
        return validatedResponse;
      } catch (err) {
        // If direct parsing fails, try to extract JSON with regex
        console.error("JSON parsing failed, attempting regex extraction", err);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log("✅ Successfully extracted JSON with regex");
            
            // Validate the response has all required fields
            const validatedResponse = {
              category: parsed.category || defaultAnalysis.category,
              emotions: Array.isArray(parsed.emotions) ? parsed.emotions : defaultAnalysis.emotions,
              characteristics: Array.isArray(parsed.characteristics) ? parsed.characteristics : defaultAnalysis.characteristics,
              readingLevel: parsed.readingLevel || defaultAnalysis.readingLevel,
              recommendedAge: parsed.recommendedAge || defaultAnalysis.recommendedAge
            };
            
            return validatedResponse;
          } catch (parseErr) {
            console.error("JSON extraction failed, falling back to default", parseErr);
            return defaultAnalysis;
          }
        } else {
          console.warn("No JSON structure found in response, using default");
          return defaultAnalysis;
        }
      }
    } catch (fetchError) {
      if (fetchError.name === "AbortError") {
        console.warn("OpenRouter API call timed out, using default");
        return defaultAnalysis;
      }
      console.error("OpenRouter API call failed, using default", fetchError);
      return defaultAnalysis;
    }
  } catch (err) {
    console.error("OpenRouter API call failed, using default", err);
    return defaultAnalysis;
  }
}

// New function to analyze user preferences and adapt content accordingly
export async function personalizeContentForUser(topic, userPreferences, topicAnalysis) {
  // If no user preferences are provided, return the topic analysis as is
  if (!userPreferences) {
    return topicAnalysis;
  }

  try {
    // Create a personalized version of the analysis based on user preferences
    const personalizedAnalysis = { ...topicAnalysis };
    
    // Adjust reading level based on user preference
    if (userPreferences.readingLevel) {
      personalizedAnalysis.readingLevel = userPreferences.readingLevel;
    }
    
    // If user has preferred emotions/characteristics, prioritize those that match their preferences
    if (userPreferences.preferredEmotions && Array.isArray(userPreferences.preferredEmotions)) {
      const matchingEmotions = topicAnalysis.emotions.filter(emotion => 
        userPreferences.preferredEmotions.includes(emotion)
      );
      
      if (matchingEmotions.length > 0) {
        // Add matching emotions first, then fill in with original emotions
        personalizedAnalysis.emotions = [
          ...matchingEmotions,
          ...topicAnalysis.emotions.filter(e => !matchingEmotions.includes(e))
        ].slice(0, 5); // Keep at most 5 emotions
      }
    }
    
    // Add user's favorite topics if related to current topic
    if (userPreferences.favoriteTopics && Array.isArray(userPreferences.favoriteTopics)) {
      personalizedAnalysis.relatedFavoriteTopics = userPreferences.favoriteTopics.filter(favTopic => 
        // Simple relevance check - can be enhanced with embedding comparison
        topic.toLowerCase().includes(favTopic.toLowerCase()) || 
        favTopic.toLowerCase().includes(topic.toLowerCase())
      );
    }
    
    return personalizedAnalysis;
  } catch (err) {
    console.error("Error personalizing content:", err);
    return topicAnalysis; // Fallback to original analysis
  }
}
