
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
  topic?: string;
}

export const generateStory = async (topic: string): Promise<StoryResponse> => {
  try {
    // Input validation
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
    
    // Enhanced validation - check if the content actually explains the topic
    if (!contentExplainsTopic(data, topic)) {
      console.error('Generated story does not properly explain the requested topic:', data);
      throw new Error(`Story doesn't properly explain ${topic}`);
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

// Enhanced check if the topic is actually explained in the content
function contentExplainsTopic(story: any, topic: string): boolean {
  const topicLowerCase = topic.toLowerCase();
  
  // 1. Check that the topic is mentioned enough times in the content (at least 3 times)
  const contentMentionsCount = (story.content?.toLowerCase().match(new RegExp(topicLowerCase, 'g')) || []).length;
  
  // 2. Check that key sections contain the topic
  const titleHasTopic = story.title?.toLowerCase().includes(topicLowerCase);
  const contentHasTopic = story.content?.toLowerCase().includes(topicLowerCase);
  const takeawayHasTopic = story.takeaway?.toLowerCase().includes(topicLowerCase);
  const keyPointsHaveTopic = story.keyPoints?.some((point: string) => 
    point.toLowerCase().includes(topicLowerCase)
  );
  
  const sectionsWithTopic = [
    titleHasTopic, 
    contentHasTopic, 
    takeawayHasTopic,
    keyPointsHaveTopic
  ].filter(Boolean).length;
  
  // Story should mention the topic at least 3 times and in at least 3 different sections
  return contentMentionsCount >= 3 && sectionsWithTopic >= 3;
}

// Creates a friendly error message as a story
const createErrorStory = (message: string): StoryResponse => {
  return {
    title: "Thoda Confusion Hai",
    content: `${message}\n\nYeh thoda ajeeb sa topic lag raha hai, kya aap thoda aur clear karke bata sakte hain? Ya ek example de sakte hain?`,
    takeaway: "Kripya ek specific topic dein jiske baare mein aap jaanna chahte hain.",
    emotions: ["confused", "curious"]
  };
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
    { name: "Raju", emoji: "👨‍🍳", traits: "practical and experimental" },
    { name: "Divya", emoji: "👩‍💼", traits: "organized and resourceful" },
    { name: "Arjun", emoji: "👨‍🔧", traits: "hands-on and problem-solver" },
    { name: "Pooja", emoji: "👩‍🎨", traits: "creative and intuitive" }
  ];
  
  const character = characters[Math.floor(Math.random() * characters.length)];
  
  // Determine emotions based on topic
  const emotions = determineEmotionsForTopic(topic);
  
  // Create topic-specific content based on common topics
  const topicLower = topic.toLowerCase();
  let storyContent = "";
  let takeaway = "";
  let keyPoints = [];
  
  if (topicLower.includes("blockchain")) {
    storyContent = `${character.name} college ke tech fest mein gaya tha jahan usne "Blockchain" word bahut baar suna. "Yeh blockchain kya hai? Har koi iske baare mein itna excited kyun hai?" usne socha.\n\nApne dost Rahul se puchne par, Rahul ne muskuraya. "Arey yaar, blockchain ek revolutionary technology hai jo financial transactions ko secure aur transparent banati hai."\n\n${character.name} confused tha. "Par yeh kaam kaise karta hai?"\n\n"Samajhne ke liye, imagine karo ki ek digital notebook hai jisme financial transactions record hote hain," Rahul ne explain kiya. "Traditional banking mein, bank ke paas central ledger hota hai. Lekin blockchain mein, yeh ledger thousands of computers par distributed hota hai - isse 'decentralized ledger' kehte hain."\n\n"Matlab koi ek authority control nahi karta?" ${character.name} ne pucha.\n\n"Exactly! Aur best part ye hai ki jab transaction hota hai, toh uska record 'block' mein save hota hai, aur yeh block previous transactions ke blocks se mathematically linked hota hai - creating a 'chain of blocks' ya blockchain," Rahul ne whiteboard par diagram banate hue bataya.\n\n"Lekin agar koi data manipulate karna chahe toh?" ${character.name} ne doubtfully pucha.\n\n"Almost impossible! Kyunki har block mein cryptographic hash hota hai jo previous block se connected hota hai. Agar koi ek block ka data change kare, toh uska hash change ho jayega, jisse chain toot jayegi. Aur kyunki yeh system distributed hai, manipulation ke liye majority of computers ko hack karna padega - jo ki practically impossible hai."\n\n${character.name} impressed tha. "Wah! Toh isliye Bitcoin aur cryptocurrencies itne secure hain!"\n\n"Haan, but blockchain sirf crypto ke liye nahi hai," Rahul added. "Iska use smart contracts, supply chain tracking, even voting systems mein ho sakta hai - basically jahan bhi trust aur transparency important ho."\n\nPure din, Rahul ne ${character.name} ko blockchain ke baare mein bataya - mining process, consensus algorithms, public vs private blockchains. By evening, ${character.name} blockchain technology ke potential se amazed tha.\n\n"Mind-blowing hai yaar! Centralized systems se decentralized future tak ka safar," ${character.name} ne excited hokar kaha. "Ab samajh aaya ki log kyun kehte hain ki blockchain internet ke baad next big technological revolution hai!"`;
    takeaway = `${character.name} ne seekha ki blockchain ek distributed ledger technology hai jo transactions ko secure, transparent, aur immutable way mein record karti hai. Blockchain ka power decentralization mein hai - koi single authority data control nahi karti. Yeh technology cryptocurrencies se lekar supply chain tracking aur even digital identity verification tak, kayi industries mein revolutionary change la sakti hai.`;
    keyPoints = [
      "Blockchain ek distributed, immutable ledger hai jisme transactions securely store hote hain",
      "Har block mein data, previous block ka hash, aur timestamp hota hai, jisse tampering impossible ho jati hai",
      "Blockchain consensus mechanisms jaise Proof of Work ya Proof of Stake use karta hai transactions validate karne ke liye",
      "Cryptocurrency ke alawa, blockchain ke applications supply chain, healthcare, aur voting systems mein bhi hain"
    ];
  } else if (topicLower.includes("artificial intelligence") || topicLower.includes("ai")) {
    storyContent = `${character.name} newspaper padh raha tha jab usne "AI Revolution" headline dekhi. "Yeh AI har jagah kyun discussed ho raha hai?" usne socha.\n\nLibrary mein AI section browse karte hue, uski mulaqat Professor Sharma se hui. "AI mein interest hai?" Professor ne pucha.\n\n"Haan, but mujhe samajh nahi aata ki exactly yeh hai kya," ${character.name} ne admit kiya.\n\n"Artificial Intelligence basically machines ko human-like intelligence dene ka concept hai," Professor ne explain kiya. "Jaise humans observe karke seekhte hain, decisions lete hain, aur adapt karte hain, AI systems bhi waise hi designed hote hain."\n\n"Par machines ko intelligence kaise di ja sakti hai?" ${character.name} ne confused hokar pucha.\n\n"Good question! Main simple example se explain karta hoon," Professor ne laptop nikala. "Dekho, traditional programming mein hum machines ko explicit instructions dete hain - 'if X, then do Y'. Lekin AI mein, hum machines ko data dete hain aur algorithms ke through unhe patterns recognize karna sikhate hain."\n\nProfessor ne image recognition software dikhaya. "Yeh system millions of images dekh kar 'seekha' hai ki cat kya hota hai. Ab jab new image aati hai, toh system identify kar leta hai - without being explicitly programmed for each case."\n\n${character.name} interested ho gaya. "Matlab AI khud se seekh sakti hai?"\n\n"Exactly! Ise Machine Learning kehte hain - AI ka subset. ML systems data se patterns extract karke predictions banati hain aur continuously improve hoti hain," Professor ne algorithms ke examples dikhaye.\n\n"Deep learning kya hai fir?" ${character.name} ne pucha.\n\n"Deep learning ML ka advanced form hai jo neural networks use karta hai - jo human brain jaise layered structure mein organized hote hain," Professor ne drawing banai. "Iske through complex patterns recognize ho sakte hain images, speech, text mein - isliye aajkal voice assistants, self-driving cars, aur recommendation systems itne powerful hain."\n\nPure afternoon, Professor Sharma ne ${character.name} ko AI ke different aspects explain kiye - supervised learning, reinforcement learning, NLP, computer vision, ethical concerns.\n\n"Mind-blowing hai," ${character.name} ne kaha. "AI toh sirf sci-fi movie concept nahi, balki hamari daily life already impact kar rahi hai. Future mein toh aur bhi amazing applications honge!"`;
    takeaway = `${character.name} ne seekha ki AI ek field hai jo machines ko human-like intelligence demonstrate karna enable karti hai. Machine Learning AI ka crucial part hai jahan systems data se patterns extract karke improve hote hain. Neural networks aur deep learning complex pattern recognition ke liye powerful tools hain. AI sirf theoretical concept nahi hai - yeh hamari daily lives mein already present hai aur future mein aur bhi revolutionary changes layegi.`;
    keyPoints = [
      "Artificial Intelligence machines ko human intelligence simulate karne aur independent decisions lene enable karti hai",
      "Machine Learning AI ka subset hai jahan algorithms data se seekhte hain aur performance improve karte hain",
      "Neural networks human brain ki tarah structured hote hain complex patterns process karne ke liye",
      "AI ka use virtual assistants se lekar autonomous vehicles tak wide range applications mein hota hai"
    ];
  } else {
    // Default fallback content for any other topic
    storyContent = `Yaar, ${character.name} ke saath ek mast kahani hui thi! ${character.name} hamesha se hi ${character.traits} type ka banda/bandi tha. Ek din uske dimaag mein ${topic} ke baare mein sawal aaya aur sochnе laga "Yeh ${topic} kya cheez hai? Sab log iske baare mein itna baat kyun karte hain?"\n\n${character.name} ke dost Sameer ne dekha ki woh pareshan hai. "Kya hua bhai? Tu itna tension mein kyun hai?" Sameer ne pucha.\n\n"Yaar, mujhe ${topic} samajh nahi aa raha. College mein sab log iske baare mein baat kar rahe hain, but mujhe kuch samajh nahi aa raha," ${character.name} ne frustration mein kaha.\n\n"Arey tension mat le! Main tujhe simple tarike se samjhata hoon," Sameer ne kaha. "Dekh, ${topic} ko aise samajh. Jaise tere phone mein battery hai na, woh khatam hoti hai toh phone band ho jata hai. Bilkul waise hi ${topic} ka concept bhi hai."\n\n${character.name} thoda confused: "Haan, but battery aur ${topic} mein kya connection hai?"\n\n"Main example de raha hoon, poora sun! ${topic} exactly aise kaam karta hai ki pehle ek foundation hota hai, phir uske upar layer by layer knowledge badhti jaati hai. Jaise ghar banate time pehle neev daaltе hain, phir deewarein khadі karte hain, phir chat daalte hain. Agar neev hi solid na ho, toh poora structure weak ho jayega."\n\n${character.name} ke dimaag mein bulb jalna shuru hua. "Oh! Matlab ${topic} mein bhi step by step process follow karna padta hai?"\n\n"Bilkul sahi! Aur ek real-life example se samajh. Jaise tu subah uthke ready hota hai na - brush karta hai, nahata hai, kapde pehenta hai, breakfast karta hai - yeh sab ek process hai. Agar tu directly breakfast kar le bina brush kiye, toh weird hoga na? ${topic} mein bhi proper sequence important hai."\n\n${character.name} ne haste hue kaha, "Ab lag raha hai kuch samajh mein aa raha hai! Matlab ${topic} mein organization aur process dono zaroori hain."\n\n"Haan! Aur ek baat - jaise tu cricket mein practice karta hai, dheere-dheere better hota jaata hai, waise hi ${topic} mein bhi practice se hi perfection aati hai. Theory samajhna alag baat hai, use implement karna alag baat."\n\nDin bhar Sameer ne ${character.name} ko examples, analogies aur daily life situations ke through ${topic} samjhaya. Jo pehle rocket science lag raha tha, ab simple lagne laga.\n\nShaam ko dono chai pe baithe. ${character.name} ne muskurate hue kaha, "Yaar, tune toh aaj mera dimaag hi khol diya! Ab ${topic} itna complicated nahi lag raha."`;
    takeaway = `${character.name} ne aaj seekha ki ${topic} ko samajhne ke liye zaruri hai usey real-life examples se connect karna. Complicated cheezein aksar simple analogies se samajh mein aati hain. Aur sabse important baat - ${topic} ka process dheere dheere hota hai, ek dum se nahi. Jaise jaise concepts clear hote jate hain, confidence bhi badhta jata hai. Koi bhi naya concept sikhne ke liye patience aur practice dono zaruri hain.`;
    keyPoints = generateKeyPointsForTopic(topic);
  }
  
  return {
    title: `${topic}: ${character.name} ka Learning Adventure`,
    content: storyContent,
    takeaway: takeaway,
    character: character,
    emotions: emotions,
    keyPoints: keyPoints,
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
      topicLower.includes("programming") ||
      topicLower.includes("blockchain")) {
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
  const topicLower = topic.toLowerCase();
  
  // Customize key points based on topic categories
  if (topicLower.includes("technology") || topicLower.includes("tech")) {
    return [
      `${topic} is rapidly evolving with new innovations every day`,
      `Understanding ${topic} requires both theoretical knowledge and practical application`,
      `${topic} has transformed how we interact with the world around us`,
      `Learning ${topic} opens up numerous career opportunities in the digital age`
    ];
  } else if (topicLower.includes("science") || topicLower.includes("physics") || topicLower.includes("chemistry")) {
    return [
      `${topic} helps us understand the fundamental principles of our universe`,
      `${topic} relies on the scientific method and empirical evidence`,
      `${topic} has practical applications that solve real-world problems`,
      `Advances in ${topic} continue to push the boundaries of human knowledge`
    ];
  } else {
    // Default key points
    return [
      `${topic} requires step-by-step learning`,
      `Real-world examples make ${topic} easier to understand`,
      `Practice is essential for mastering ${topic}`,
      `Breaking ${topic} down into smaller parts makes it manageable`
    ];
  }
};

