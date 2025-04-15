
import { analyzeTopicEmotions } from "./utils/analyzer.ts";
import { generateCharacter } from "./characters.ts";
import { corsHeaders } from "./utils/cors.ts";

// Function to generate a story using Gemini API
export async function generateStoryWithGemini(topic: string) {
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY not found in environment");
  }
  
  // First analyze the topic to get emotions and category
  const topicAnalysis = await analyzeTopicEmotions(topic);
  console.log("Topic analysis:", JSON.stringify(topicAnalysis));
  
  // Generate a character that fits the topic
  const character = generateCharacter(topic, topicAnalysis.category);

  // Create a more focused and specific prompt for Gemini that forces explaining the actual topic
  const prompt = `
  CRITICAL INSTRUCTION: You MUST create an educational story SPECIFICALLY about "${topic}". 
  The entire story MUST be explaining the ACTUAL CONCEPT of "${topic}" in detail, not just mentioning the word.
  
  IMPORTANT: DO NOT create a generic story about learning. Create a story that explains what ${topic} actually is, 
  its key concepts, how it works, and real applications.
  
  Kisi ek character ke through ek interesting aur relatable kahani banao jisme wo "${topic}" ko samajhne ki koshish kar raha ho.
  
  Character ka naam "${character.name}" hai, aur woh ${character.traits} hai.
  
  Character ke emotions mein ye shamil hain: ${topicAnalysis.emotions.join(", ")}
  
  Topic "${topic}" ke core concepts ko step-by-step explain karo real-life examples, technical details, aur daily life 
  situations ke through. Kahani engaging ho, funny ho sakti hai, lekin topic "${topic}" ka actual meaning, working mechanism, 
  aur applications zaroor clear karna hai.
  
  For example, if the topic is blockchain, explain how blocks are linked, what cryptography is used, how consensus works, 
  what a distributed ledger is, etc.
  
  Language simple Hindi-English mix (Hinglish) ho, jisme thoda casual touch ho jaise doston ke beech baat hoti hai.
  
  JSON format me output do:
  {
    "title": "Catchy title in Hinglish related directly to ${topic}",
    "content": "The full story with proper paragraph breaks (use \\n\\n for paragraphs) explaining what ${topic} actually is",
    "takeaway": "A summary of what was learned about ${topic} in 3-4 lines",
    "emotions": ${JSON.stringify(topicAnalysis.emotions)},
    "keyPoints": ["key technical point 1 about ${topic}", "key technical point 2 about ${topic}", "key technical point 3 about ${topic}"]
  }`;

  try {
    console.log(`Sending prompt to Gemini for topic: ${topic}`);
    
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
      console.error("No response from Gemini API");
      throw new Error("No response from Gemini API");
    }

    const text = data.candidates[0].content.parts[0].text;
    console.log("Received response from Gemini, extracting JSON");
    
    try {
      // Extract JSON from the response (handle cases with markdown formatting)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const storyJson = jsonMatch[0];
        // Validate the story to make sure it's about the requested topic
        const story = JSON.parse(storyJson);
        
        // Enhanced validation to catch mismatched stories
        if (!storyContainsTopic(story, topic)) {
          console.error("Generated story doesn't properly explain the requested topic");
          throw new Error(`Generated story doesn't properly explain ${topic}`);
        }
        
        return {
          ...story,
          character: {
            name: character.name,
            emoji: character.emoji,
            traits: character.traits
          },
          topic: topic // Explicitly include the topic in the response
        };
      } else {
        console.error("Could not extract JSON from Gemini response");
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

// Enhanced validation that the story actually explains the requested topic
function storyContainsTopic(story: any, topic: string): boolean {
  const topicLowerCase = topic.toLowerCase();
  
  // Check various aspects of the story
  const titleContainsTopic = story.title?.toLowerCase().includes(topicLowerCase);
  const contentContainsTopic = story.content?.toLowerCase().includes(topicLowerCase);
  const takeawayContainsTopic = story.takeaway?.toLowerCase().includes(topicLowerCase);
  const keyPointsContainTopic = story.keyPoints?.some((point: string) => 
    point.toLowerCase().includes(topicLowerCase)
  );
  
  // Count how many sections contain the topic
  const countSectionsWithTopic = [
    titleContainsTopic,
    contentContainsTopic,
    takeawayContainsTopic,
    keyPointsContainTopic
  ].filter(Boolean).length;
  
  // The story must mention the topic in at least 3 sections 
  // AND must have at least 200 characters to be considered valid
  return countSectionsWithTopic >= 3 && story.content.length >= 200;
}

// Generate a fallback story if the API fails
export function generateFallbackStory(topic: string) {
  const character = generateCharacter(topic);
  const emotions = ["curious", "confused", "determined", "excited"];
  
  // Create topic-specific key points
  let keyPoints = [];
  
  // Generate different key points based on common topics
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes("blockchain")) {
    keyPoints = [
      `Blockchain is a distributed, immutable ledger that stores transactions across many computers`,
      `Each block contains data, the previous block's hash, and a timestamp, making it tamper-proof`,
      `Blockchain uses consensus mechanisms like Proof of Work or Proof of Stake to validate transactions`,
      `Beyond cryptocurrency, blockchain has applications in supply chain, healthcare, and voting systems`
    ];
  } else if (topicLower.includes("artificial intelligence") || topicLower.includes("ai")) {
    keyPoints = [
      `Artificial Intelligence enables machines to simulate human intelligence and make decisions`,
      `Machine Learning is a subset of AI where algorithms learn from data to improve their performance`,
      `Neural networks are structured like the human brain to process complex patterns in data`,
      `AI is used in applications ranging from virtual assistants to autonomous vehicles`
    ];
  } else if (topicLower.includes("quantum")) {
    keyPoints = [
      `Quantum computing uses qubits which can exist in multiple states simultaneously`,
      `Quantum superposition and entanglement allow for massive parallel processing`,
      `Quantum computers can solve certain problems exponentially faster than classical computers`,
      `Quantum physics describes the behavior of matter and energy at the smallest scales`
    ];
  } else {
    keyPoints = [
      `Understanding ${topic} requires breaking it down into fundamental concepts`,
      `${topic} has real-world applications that affect our daily lives`,
      `Continuous learning and practice are essential to master ${topic}`,
      `${topic} continues to evolve with new research and technologies`
    ];
  }
  
  // Create a more specific story about the topic
  let storyContent = `Yaar, ${character.name} ke saath ek mast kahani hui thi! ${character.name} hamesha se hi curious type ka banda/bandi tha. Ek din uske dimaag mein ${topic} ke baare mein sawal aaya aur sochnе laga "Yeh ${topic} kya cheez hai? Sab log iske baare mein itna baat kyun karte hain?"\n\n`;
  
  // Add topic-specific content to fallback stories
  if (topicLower.includes("blockchain")) {
    storyContent += `${character.name} ke dost Sameer ne dekha ki woh pareshan hai. "Kya hua bhai? Tu itna tension mein kyun hai?" Sameer ne pucha.\n\n"Yaar, mujhe Blockchain samajh nahi aa raha. College mein sab log iske baare mein baat kar rahe hain, but mujhe kuch samajh nahi aa raha," ${character.name} ne frustration mein kaha.\n\n"Arey tension mat le! Main tujhe simple tarike se samjhata hoon," Sameer ne kaha. "Dekh, Blockchain ko aise samajh - imagine kar ki ek register hai jisme transactions ka record rakha jata hai, lekin yeh register sirf ek jagah nahi, balki thousands of computers par simultaneously mojud hai. Aur har entry permanent hoti hai, koi bhi change nahi kar sakta."\n\n${character.name} thoda confused: "Matlab jaise distributed database?"\n\n"Haan, but with a twist! Normal database mein toh ek central authority control karta hai data ko. Blockchain mein koi central authority nahi hai. Har transaction ko 'blocks' mein organize kiya jata hai, aur ye blocks ek 'chain' mein connected hote hain cryptographic techniques se."\n\n${character.name} ke dimaag mein ek bulb jala. "Oh! Isliye iska naam 'Blockchain' hai! But ye secure kaise hai?"\n\n"Excellent question!" Sameer excited ho gaya. "Dekh, har block mein 3 cheezein hoti hain - data, timestamp, aur previous block ka fingerprint ya 'hash'. Agar koi purane block ke data mein change karna chahe, toh uska hash change ho jayega, aur uske baad ke saare blocks invalid ho jayenge. Aisa karne ke liye, hackers ko majority of computers par control chahiye, jo ki practically impossible hai."\n\n${character.name} dhyaan se sun raha tha. "Aur ye blocks create kaun karta hai?"\n\n"Miners! Ye log powerful computers use karke complex mathematical problems solve karte hain - ise 'Proof of Work' kehte hain. Jab problem solve ho jata hai, toh ek naya block create hota hai aur miner ko reward milta hai cryptocurrency ke form mein."\n\nDin bhar Sameer ne ${character.name} ko Blockchain ke concepts samjhaye - consensus mechanisms, private vs public blockchains, smart contracts, aur decentralized applications (DApps). Jo pehle rocket science lag raha tha, ab interesting lagne laga.\n\nShaam ko dono chai pe baithe. ${character.name} ne muskurate hue kaha, "Yaar, tune toh aaj mera dimaag hi khol diya! Ab samajh mein aaya ki Blockchain sirf cryptocurrency nahi hai, balki ek revolutionary technology hai jo supply chain, healthcare, voting jaise fields mein bhi use ho sakti hai. Ab mujhe aur explore karna hai!"`;
  } else if (topicLower.includes("artificial intelligence") || topicLower.includes("ai")) {
    storyContent += `${character.name} ke dost Priya ne dekha ki woh pareshan hai. "Kya hua? Tu itna tension mein kyun hai?" Priya ne pucha.\n\n"Yaar, mujhe Artificial Intelligence samajh nahi aa raha. News mein, movies mein, har jagah AI AI hota rehta hai, but actual mein ye hai kya?" ${character.name} ne frustration mein kaha.\n\n"Oh! Main tujhe explain karti hoon," Priya ne kaha. "AI basically machines ko human-like intelligence dene ka concept hai. Jaise humans sochte hain, seekhte hain, aur decision lete hain, waise hi machines ko train kiya jata hai."\n\n${character.name} thoda confused: "But machines toh sirf instructions follow kar sakti hain na? Unhe khud se kaise pata chalega kya karna hai?"\n\n"Good question! AI mein machines ko algorithms ke through train kiya jata hai large amounts of data par. Jaise ek baby observe karke seekhta hai, waise hi AI systems data se patterns recognize karte hain aur predictions banate hain. Ise Machine Learning kehte hain - AI ka ek subset."\n\n${character.name} interested ho gaya. "Accha! Toh kya sari AI same hoti hai?"\n\n"Nahi yaar! AI ke different types hain. Narrow AI specific tasks ke liye hoti hai - jaise voice assistants, recommendation systems, face recognition. General AI wo hai jo humans ki tarah multiple tasks kar sake, but abhi tak wo sirf concept hai, reality nahi."\n\n${character.name} ne socha, "To neural networks, deep learning, ye sab kya hai?"\n\n"Neural networks AI ka ek important part hain. Ye human brain jaise structured hote hain with interconnected nodes or 'neurons'. Deep learning neural networks ka hi advanced version hai with multiple layers. Ye especially complex patterns detect karne mein good hai - jaise images, natural language."\n\nDin bhar Priya ne ${character.name} ko practical examples se AI ke concepts samjhaye - supervised learning, reinforcement learning, computer vision, NLP, aur AI ethics. ${character.name} ne realize kiya ki AI revolution sirf sci-fi movies wala future nahi, balki hamari daily lives ka already part hai.\n\nShaam ko dono ice cream kha rahe the. ${character.name} ne excited hokar kaha, "AI kitni fascinating hai yaar! Ab mujhe samajh aaya ki ye sirf robots nahi hai, balki ek technology hai jo hamare data use karke intelligent decisions leti hai. Sochta hoon is field mein career banana chahiye!"`;
  } else {
    storyContent += `${character.name} ke dost Sameer ne dekha ki woh pareshan hai. "Kya hua bhai? Tu itna tension mein kyun hai?" Sameer ne pucha.\n\n"Yaar, mujhe ${topic} samajh nahi aa raha. College mein sab log iske baare mein baat kar rahe hain, but mujhe kuch samajh nahi aa raha," ${character.name} ne frustration mein kaha.\n\n"Arey tension mat le! Main tujhe simple tarike se samjhata hoon," Sameer ne kaha. "Dekh, ${topic} ko aise samajh. Jaise tere phone mein battery hai na, woh khatam hoti hai toh phone band ho jata hai. Bilkul waise hi ${topic} ka concept bhi hai."\n\n${character.name} thoda confused: "Haan, but battery aur ${topic} mein kya connection hai?"\n\n"Main example de raha hoon, poora sun! ${topic} exactly aise kaam karta hai ki pehle ek foundation hota hai, phir uske upar layer by layer knowledge badhti jaati hai. Jaise ghar banate time pehle neev daaltе hain, phir deewarein khadі karte hain, phir chat daalte hain. Agar neev hi solid na ho, toh poora structure weak ho jayega."\n\n${character.name} ke dimaag mein bulb jalna shuru hua. "Oh! Matlab ${topic} mein bhi step by step process follow karna padta hai?"\n\n"Bilkul sahi! Aur ek real-life example se samajh. Jaise tu subah uthke ready hota hai na - brush karta hai, nahata hai, kapde pehenta hai, breakfast karta hai - yeh sab ek process hai. Agar tu directly breakfast kar le bina brush kiye, toh weird hoga na? ${topic} mein bhi proper sequence important hai."\n\n${character.name} ne haste hue kaha, "Ab lag raha hai kuch samajh mein aa raha hai! Matlab ${topic} mein organization aur process dono zaroori hain."\n\n"Haan! Aur ek baat - jaise tu cricket mein practice karta hai, dheere-dheere better hota jaata hai, waise hi ${topic} mein bhi practice se hi perfection aati hai. Theory samajhna alag baat hai, use implement karna alag baat."\n\nDin bhar Sameer ne ${character.name} ko examples, analogies aur daily life situations ke through ${topic} samjhaya. Jo pehle rocket science lag raha tha, ab simple lagne laga.\n\nShaam ko dono chai pe baithe. ${character.name} ne muskurate hue kaha, "Yaar, tune toh aaj mera dimaag hi khol diya! Ab ${topic} itna complicated nahi lag raha."`;
  }
  
  // Create topic-specific takeaway
  let takeaway = "";
  if (topicLower.includes("blockchain")) {
    takeaway = `${character.name} ne aaj seekha ki Blockchain ek distributed ledger technology hai jo transactions ko secure, transparent aur immutable way mein record karti hai. Isme har transaction blocks mein store hoti hai jo cryptography se connect hote hain. Blockchain sirf cryptocurrency ke liye nahi hai - ye supply chain management, voting systems aur healthcare records jaise areas mein bhi revolutionary changes la sakti hai.`;
  } else if (topicLower.includes("artificial intelligence") || topicLower.includes("ai")) {
    takeaway = `${character.name} ne aaj seekha ki Artificial Intelligence machines ko human-like intelligence dene ka tarika hai. AI systems data se patterns learn karke decisions leti hai. Machine Learning, Neural Networks aur Deep Learning AI ke important components hain. AI sirf sci-fi concept nahi, balki hamari daily lives mein already mojud hai - virtual assistants, recommendation systems aur automated processes ke roop mein.`;
  } else {
    takeaway = `${character.name} ne aaj seekha ki ${topic} ko samajhne ke liye zaruri hai usey real-life examples se connect karna. Complicated cheezein aksar simple analogies se samajh mein aati hain. Aur sabse important baat - ${topic} ka process dheere dheere hota hai, ek dum se nahi. Jaise jaise concepts clear hote jate hain, confidence bhi badhta jata hai. Koi bhi naya concept sikhne ke liye patience aur practice dono zaruri hain.`;
  }
  
  return {
    title: `${topic}: ${character.name} ka Digital Duniya mein Safar`,
    content: storyContent,
    takeaway: takeaway,
    character: {
      name: character.name,
      emoji: character.emoji,
      traits: character.traits
    },
    emotions: emotions,
    keyPoints: keyPoints,
    topic: topic // Ensure the topic is included
  };
}

