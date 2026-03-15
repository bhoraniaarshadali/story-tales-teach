/**
 * Collection of engaging loading messages for story generation
 */

// English loading messages
export const englishLoadingMessages = [
  "Weaving magical words into your story tapestry...",
  "Brewing a concoction of creativity just for you...",
  "Awakening characters and worlds in your imagination...",
  "Sprinkling pixie dust over your narrative journey...",
  "Crafting emotional landscapes for your adventure...",
  "Whisking you away on a cloud of storytelling magic...",
  "Igniting the spark of wonder in your personalized tale...",
  "Painting vivid scenes with words and emotions...",
  "Unlocking the treasure chest of imagination for you...",
  "Spinning golden threads of knowledge into your story...",
  "Stirring the cauldron of creativity with your topic...",
  "Channeling the wisdom of a thousand storytellers...",
  "Dancing with ideas to choreograph your perfect story...",
  "Harvesting fresh insights for your learning journey...",
  "Blending facts and fantasy into a delightful mixture...",
  "Crafting a bridge between curiosity and understanding...",
  "Sailing the seas of inspiration for your unique tale...",
  "Building character arcs that will touch your heart...",
  "Infusing your story with sparkles of wisdom and joy...",
  "Sculpting moments of discovery especially for you...",
  // Adding unique messages from original version
  "Putting pen to paper for your story...",
  "Crafting the perfect narrative, just a moment...",
  "Finding the perfect beginning for your tale...",
  "Juggling words and ideas for your perfect story...",
  "Connecting dots for your perfect learning adventure..."
];

// Hindi loading messages
export const hindiLoadingMessages = [
  "आपकी कहानी के लिए जादुई शब्दों को बुन रहे हैं...",
  "आपके लिए रचनात्मकता का एक विशेष मिश्रण तैयार कर रहे हैं...",
  "आपकी कल्पना में पात्रों और दुनियाओं को जगा रहे हैं...",
  "आपकी कहानी यात्रा पर जादुई चमक बिखेर रहे हैं...",
  "आपके साहसिक कार्य के लिए भावनात्मक परिदृश्य तैयार कर रहे हैं...",
  "कहानी सुनाने के जादू के बादल पर आपको ले जा रहे हैं...",
  "आपकी व्यक्तिगत कहानी में अद्भुत चिंगारी जला रहे हैं...",
  "शब्दों और भावनाओं से जीवंत दृश्य चित्रित कर रहे हैं...",
  "आपके लिए कल्पना का खजाना खोल रहे हैं...",
  "आपकी कहानी में ज्ञान के सुनहरे धागे पिरो रहे हैं...",
  "आपके विषय के साथ रचनात्मकता के कढ़ाई को हिला रहे हैं...",
  "हज़ारों कहानीकारों की बुद्धि को आकर्षित कर रहे हैं...",
  "आपकी सही कहानी के लिए विचारों के साथ नृत्य कर रहे हैं...",
  "आपकी सीखने की यात्रा के लिए ताज़ी अंतर्दृष्टि इकट्ठा कर रहे हैं...",
  "तथ्य और कल्पना को एक सुखद मिश्रण में मिला रहे हैं...",
  "जिज्ञासा और समझ के बीच एक पुल बना रहे हैं...",
  "आपकी अनूठी कहानी के लिए प्रेरणा के समुद्र में नौका चला रहे हैं...",
  "ऐसे चरित्र बना रहे हैं जो आपके दिल को छू लेंगे...",
  "आपकी कहानी में ज्ञान और खुशी की चमक भर रहे हैं...",
  "विशेष रूप से आपके लिए खोज के क्षण गढ़ रहे हैं..."
];

// Hinglish loading messages
export const hinglishLoadingMessages = [
  "Aapki kahani ke magical words bun rahe hain...",
  "Aapke liye creativity ka special mixture taiyar kar rahe hain...",
  "Aapki imagination mein characters ko jaga rahe hain...",
  "Aapki story journey par magic dust biker rahe hain...",
  "Aapke adventure ke liye emotional scenes craft kar rahe hain...",
  "Storytelling ke magic cloud par aapko le ja rahe hain...",
  "Aapki personal tale mein wonder ki spark jala rahe hain...",
  "Words aur emotions se vivid scenes paint kar rahe hain...",
  "Aapke liye imagination ka treasure khol rahe hain...",
  "Aapki story mein knowledge ke golden threads piro rahe hain...",
  "Aapke topic ke saath creativity ka cauldron hila rahe hain...",
  "Thousand storytellers ki wisdom channel kar rahe hain...",
  "Aapki perfect story ke liye ideas ke saath dance kar rahe hain...",
  "Aapki learning journey ke liye fresh insights collect kar rahe hain...",
  "Facts aur fantasy ko ek delightful mixture mein blend kar rahe hain...",
  "Curiosity aur understanding ke beech ek bridge bana rahe hain...",
  "Aapki unique tale ke liye inspiration ke seas par sail kar rahe hain...",
  "Aise character arcs bana rahe hain jo aapke heart ko touch karenge...",
  "Aapki story mein wisdom aur joy ke sparkles add kar rahe hain...",
  "Especially aapke liye discovery ke moments sculpt kar rahe hain..."
];

/**
 * Returns a random loading message from the collection based on the language preference
 */
export const getRandomLoadingMessage = (language = 'english'): string => {
  let messageArray;
  switch (language.toLowerCase()) {
    case 'hindi':
      messageArray = hindiLoadingMessages;
      break;
    case 'hinglish':
      messageArray = hinglishLoadingMessages;
      break;
    case 'english':
    default:
      messageArray = englishLoadingMessages;
      break;
  }

  const randomIndex = Math.floor(Math.random() * messageArray.length);
  return messageArray[randomIndex];
};

/**
 * Returns a personalized loading message based on the topic and preferences
 */
export const getPersonalizedLoadingMessage = (topic: string, preferences?: any): string => {
  const language = preferences?.languagePreference || 'english';

  // English personalized messages
  const englishMessages = [
    `Creating a ${preferences?.readingLevel || 'special'} story about ${topic} just for you...`,
    `Weaving ${topic} into a tale that matches your unique interests...`,
    `Crafting a ${preferences?.ageGroup || 'perfect'}-friendly adventure about ${topic}...`,
    `Personalizing a ${topic} story with your favorite themes...`
  ];

  // Hindi personalized messages
  const hindiMessages = [
    `आपके लिए ${topic} के बारे में एक ${preferences?.readingLevel || 'विशेष'} कहानी बना रहे हैं...`,
    `${topic} को आपकी रुचियों के अनुसार एक कहानी में बुन रहे हैं...`,
    `${topic} के बारे में ${preferences?.ageGroup || 'उपयुक्त'} उम्र के लिए एक साहसिक कहानी तैयार कर रहे हैं...`,
    `${topic} की कहानी को आपके पसंदीदा विषयों के साथ व्यक्तिगत बना रहे हैं...`
  ];

  // Hinglish personalized messages
  const hinglishMessages = [
    `Aapke liye ${topic} ke baare mein ek ${preferences?.readingLevel || 'special'} story create kar rahe hain...`,
    `${topic} ko aapki interests ke according ek tale mein weave kar rahe hain...`,
    `${topic} ke baare mein ${preferences?.ageGroup || 'perfect'}-friendly adventure craft kar rahe hain...`,
    `${topic} ki story ko aapke favorite themes ke saath personalize kar rahe hain...`
  ];

  let messageArray;
  switch (language.toLowerCase()) {
    case 'hindi':
      messageArray = hindiMessages;
      break;
    case 'hinglish':
      messageArray = hinglishMessages;
      break;
    case 'english':
    default:
      messageArray = englishMessages;
      break;
  }

  const randomIndex = Math.floor(Math.random() * messageArray.length);
  return messageArray[randomIndex];
};

/**
 * Returns a retry-specific loading message based on language preference
 */
export const getRetryLoadingMessage = (retryCount: number, language = 'english'): string => {
  // English retry messages
  const englishRetryMessages = [
    "Taking another creative approach to your story...",
    "Reimagining your story with fresh perspective...",
    "Finding a better angle for your narrative...",
    "Polishing your story to perfection, almost there..."
  ];

  // Hindi retry messages
  const hindiRetryMessages = [
    "आपकी कहानी के लिए एक और रचनात्मक दृष्टिकोण अपना रहे हैं...",
    "आपकी कहानी को एक नए नजरिए से फिर से कल्पना कर रहे हैं...",
    "आपकी कहानी के लिए एक बेहतर कोण खोज रहे हैं...",
    "आपकी कहानी को पूर्णता तक पॉलिश कर रहे हैं, बस थोड़ी देर और..."
  ];

  // Hinglish retry messages
  const hinglishRetryMessages = [
    "Aapki story ke liye ek aur creative approach le rahe hain...",
    "Aapki story ko fresh perspective se reimagine kar rahe hain...",
    "Aapki narrative ke liye ek better angle dhundh rahe hain...",
    "Aapki story ko perfection tak polish kar rahe hain, almost there..."
  ];

  let messageArray;
  switch (language.toLowerCase()) {
    case 'hindi':
      messageArray = hindiRetryMessages;
      break;
    case 'hinglish':
      messageArray = hinglishRetryMessages;
      break;
    case 'english':
    default:
      messageArray = englishRetryMessages;
      break;
  }

  const index = Math.min(retryCount - 1, messageArray.length - 1);
  return messageArray[index];
};