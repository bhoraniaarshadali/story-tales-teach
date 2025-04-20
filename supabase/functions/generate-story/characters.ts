// utils/characterGenerator.ts
// Function to generate a character and details based on topic category
export function generateCharacter(topic, category = "general") {
  const characters = [
    {
      name: "Ali",
      emoji: "👨‍🎓",
      traits: "curious and analytical"
    },
    {
      name: "Dhruv",
      emoji: "👩‍🔬",
      traits: "detail-oriented and methodical"
    },
    {
      name: "Arshad",
      emoji: "👨‍💻",
      traits: "tech-savvy and logical"
    },
    {
      name: "Ayaan",
      emoji: "👩‍🏫",
      traits: "patient and articulate"
    },
    {
      name: "Dev",
      emoji: "👨‍🚀",
      traits: "adventurous and creative"
    },
    {
      name: "Patel",
      emoji: "👩‍⚕️",
      traits: "empathetic and precise"
    },
    {
      name: "Ashfak",
      emoji: "👨‍🍳",
      traits: "practical and experimental"
    },
    {
      name: "Anjali",
      emoji: "👩‍🎨",
      traits: "creative and perceptive"
    },
    {
      name: "Akhilesh",
      emoji: "👨‍🔧",
      traits: "hands-on and resourceful"
    },
    {
      name: "Divya",
      emoji: "👩‍⚖️",
      traits: "analytical and fair-minded"
    },
    {
      name: "Arvind",
      emoji: "👨‍🌾",
      traits: "grounded and persistent"
    },
    {
      name: "Hardik",
      emoji: "👩‍🎓",
      traits: "inquisitive and thoughtful"
    },
    {
      name: "Himanshu",
      emoji: "👨‍🔬",
      traits: "innovative and focused"
    },
    {
      name: "Yasir",
      emoji: "👩‍💻",
      traits: "systematic and detail-oriented"
    },
    {
      name: "Maruf",
      emoji: "👨‍🏫",
      traits: "inspiring and clear-minded"
    },
    {
      name: "Manish",
      emoji: "👩‍🚀",
      traits: "curious and ambitious"
    },
    {
      name: "Kuldeep",
      emoji: "👨‍⚕️",
      traits: "careful and observant"
    },
    {
      name: "Atik",
      emoji: "👩‍🍳",
      traits: "creative and adaptable"
    },
    {
      name: "Saad",
      emoji: "👨‍🎨",
      traits: "visionary and expressive"
    },
    {
      name: "Gautam",
      emoji: "👩‍🔧",
      traits: "practical and solution-oriented"
    }
  ];
  // Filter characters based on the category
  let filteredCharacters = characters;
  switch(category.toLowerCase()){
    case "technology":
    case "computer_science":
      filteredCharacters = characters.filter((c)=>/tech-savvy|logical|analytical|innovative|systematic/.test(c.traits));
      break;
    case "science":
    case "medicine":
      filteredCharacters = characters.filter((c)=>/methodical|analytical|precise|observant|detail-oriented/.test(c.traits));
      break;
    case "arts":
    case "humanities":
      filteredCharacters = characters.filter((c)=>/creative|articulate|perceptive|expressive|visionary/.test(c.traits));
      break;
    case "business":
    case "economics":
      filteredCharacters = characters.filter((c)=>/practical|methodical|resourceful|solution-oriented|focused/.test(c.traits));
      break;
    default:
      // Use all characters if no category match
      filteredCharacters = characters;
  }
  // Fallback to all characters if no match
  if (filteredCharacters.length === 0) {
    filteredCharacters = characters;
  }
  // Generate random index using current timestamp
  const timestamp = Date.now();
  const randomIndex = Math.floor(Math.random() * timestamp % filteredCharacters.length);
  return filteredCharacters[randomIndex];
}
