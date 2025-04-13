
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
    { name: "Raju", emoji: "👨‍🍳", traits: "practical and experimental" }
  ];
  
  // Match character to topic category if possible
  let filteredCharacters = characters;
  
  if (category === "technology" || category === "computer_science") {
    filteredCharacters = characters.filter(char => 
      char.traits.includes("tech-savvy") || char.traits.includes("logical") || char.traits.includes("analytical"));
  } else if (category === "science" || category === "medicine") {
    filteredCharacters = characters.filter(char => 
      char.traits.includes("methodical") || char.traits.includes("analytical") || char.traits.includes("precise"));
  } else if (category === "arts" || category === "humanities") {
    filteredCharacters = characters.filter(char => 
      char.traits.includes("creative") || char.traits.includes("articulate"));
  } else if (category === "business" || category === "economics") {
    filteredCharacters = characters.filter(char => 
      char.traits.includes("practical") || char.traits.includes("methodical"));
  }
  
  // If no matching characters, use all characters
  if (filteredCharacters.length === 0) {
    filteredCharacters = characters;
  }
  
  return filteredCharacters[Math.floor(Math.random() * filteredCharacters.length)];
}
