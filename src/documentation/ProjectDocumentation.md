
# Story Tales Teach - Project Documentation

## Overview
Story Tales Teach is an educational web application that makes learning enjoyable by generating Hinglish stories to explain complex topics. The platform uses AI to create personalized, culturally relevant narratives, making it easier for users to understand and remember new concepts.

### Core Value Proposition
- Converts complex topics into simple, engaging Hinglish stories
- Makes learning interactive and accessible
- Offers audio narration for better accessibility
- Maintains a history of user-generated stories

### Target Audience
- Students seeking alternative learning methods
- Educators looking for engaging teaching materials
- Learners of all ages interested in simplified explanations
- Hindi/English bilingual users

## Project Structure
The project is organized into frontend and backend components:
- **Frontend:** Built with React and TypeScript, featuring a responsive UI, accessibility controls, and dark/light mode support.
- **Backend:** Uses Supabase Edge Functions for serverless APIs, handling story generation and audio narration.
- **Integrations:** Connects with AI services for story generation and text-to-speech.

## Key Features
- AI-powered story generation based on user topics
- Interactive and accessible user interface
- Audio narration with character-specific voices
- Local storage and management of story history
- Real-time feedback and session analytics

## Application Architecture

### Frontend Components
- **StoryForm:** Handles user input for topic submission
- **StoryDisplay:** Renders generated stories with proper formatting
- **AudioNarration:** Provides text-to-speech functionality
- **StoryHistory:** Manages previously generated stories
- **AccessibilityControls:** Provides options for font size, contrast, and other accessibility features
- **ThemeToggle:** Allows switching between dark and light modes
- **SessionTimer:** Tracks user session duration

### Backend Services
- **Story Generation:** Uses Mixtral AI model via Supabase Edge Functions
- **Topic Analysis:** Leverages Gemini API to validate topics and analyze emotional content
- **Text-to-Speech:** Utilizes ElevenLabs API to convert story text to audio
- **Local Storage:** Manages story history and user preferences

### Data Flow
1. User submits a topic through the StoryForm component
2. The topic is validated using the Gemini API
3. If valid, the topic is analyzed for emotional content
4. The Mixtral AI model generates a story based on the topic and analysis
5. The generated story is displayed and saved to local history
6. User can listen to the story through audio narration

## Technology Stack
- **Frontend:**
  - React 18.3.1
  - TypeScript
  - Tailwind CSS
  - Shadcn UI components
  - React Router for navigation
  - Local storage for data persistence

- **Backend:**
  - Supabase Edge Functions (TypeScript/Deno)
  - Serverless architecture for scalability

- **AI Services:**
  - Gemini API for topic analysis and validation
  - ElevenLabs API for text-to-speech
  - Mixtral AI model for story generation

## Best Practices Implemented
- Component-based architecture for reusability
- Responsive design for all device sizes
- Accessibility features for inclusive user experience
- Error handling and fallback content
- Performance optimization for quick loading
- Dark/light mode support

## How It Works
1. Users enter a topic they want to learn about.
2. The system analyzes the topic and generates a Hinglish story with a unique character and educational content.
3. Users can listen to the story via audio narration.
4. Generated stories are saved locally for future reference and can be marked as favorites.

## Future Enhancements
- User authentication and cloud storage
- Support for multiple languages and interactive story elements
- Educational features like quizzes and progress tracking
- Social sharing and collaborative learning tools
- Personalized learning paths based on user preferences
- Enhanced analytics for tracking learning progress
- Advanced AI model integration for more nuanced storytelling

## Credits
Created by Arshad Ali Bhorania

---
_Last updated: May 2, 2025_
