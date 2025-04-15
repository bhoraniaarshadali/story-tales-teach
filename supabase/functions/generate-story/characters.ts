
// Function to generate a character and details
export function generateCharacter(topic: string, category: string = "general") {
  // Generate character based on topic category
  const characters = [
    { name: "Rohit", emoji: "👨‍🎓", traits: "curious and analytical" },
    { name: "Priya", emoji: "👩‍🔬", traits: "detail-oriented and methodical" },
    { name: "Vikram", emoji: "👨‍💻", traits: "tech-savvy and logical" },
    { name: "Meera", emoji: "👩‍🏫", traits: "patient and articulate" },
    { name: "Ajay", emoji: "👨‍🚀", traits: "adventurous and creative" },
    { name: "Neha", emoji: "👩‍⚕️", traits: "empathetic and precise" },
    { name: "Raju", emoji: "👨‍🍳", traits: "practical and experimental" },
    { name: "Anjali", emoji: "👩‍🎨", traits: "creative and perceptive" },
    { name: "Rajiv", emoji: "👨‍🔧", traits: "hands-on and resourceful" },
    { name: "Divya", emoji: "👩‍⚖️", traits: "analytical and fair-minded" },
    { name: "Karan", emoji: "👨‍🌾", traits: "grounded and persistent" },
    { name: "Shreya", emoji: "👩‍🎓", traits: "inquisitive and thoughtful" },
    { name: "Arjun", emoji: "👨‍🔬", traits: "innovative and focused" },
    { name: "Kavita", emoji: "👩‍💻", traits: "systematic and detail-oriented" },
    { name: "Suresh", emoji: "👨‍🏫", traits: "inspiring and clear-minded" },
    { name: "Ananya", emoji: "👩‍🚀", traits: "curious and ambitious" },
    { name: "Mohan", emoji: "👨‍⚕️", traits: "careful and observant" },
    { name: "Tanya", emoji: "👩‍🍳", traits: "creative and adaptable" },
    { name: "Dinesh", emoji: "👨‍🎨", traits: "visionary and expressive" },
    { name: "Pooja", emoji: "👩‍🔧", traits: "practical and solution-oriented" }
  ];
  
  // Match character to topic category if possible
  let filteredCharacters = characters;
  
  if (category === "technology" || category === "computer_science") {
    filteredCharacters = characters.filter(char => 
      char.traits.includes("tech-savvy") || char.traits.includes("logical") || char.traits.includes("analytical") || char.traits.includes("innovative") || char.traits.includes("systematic"));
  } else if (category === "science" || category === "medicine") {
    filteredCharacters = characters.filter(char => 
      char.traits.includes("methodical") || char.traits.includes("analytical") || char.traits.includes("precise") || char.traits.includes("observant") || char.traits.includes("detail-oriented"));
  } else if (category === "arts" || category === "humanities") {
    filteredCharacters = characters.filter(char => 
      char.traits.includes("creative") || char.traits.includes("articulate") || char.traits.includes("perceptive") || char.traits.includes("expressive") || char.traits.includes("visionary"));
  } else if (category === "business" || category === "economics") {
    filteredCharacters = characters.filter(char => 
      char.traits.includes("practical") || char.traits.includes("methodical") || char.traits.includes("resourceful") || char.traits.includes("solution-oriented") || char.traits.includes("focused"));
  }
  
  // If no matching characters, use all characters
  if (filteredCharacters.length === 0) {
    filteredCharacters = characters;
  }
  
  // Always get a different character - use timestamp to help with randomness
  const timestamp = new Date().getTime();
  const randomIndex = Math.floor((Math.random() * timestamp) % filteredCharacters.length);
  return filteredCharacters[randomIndex];
}
