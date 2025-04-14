# AI Text Assistant Chrome Extension

## Project Purpose
This Chrome extension allows users to select text on any webpage, right-click, and open an AI chat interface directly within the page. The extension uses Google Gemini AI to provide intelligent responses, offering a seamless way to interact with AI without leaving the current webpage.

## Key Features
- Text selection and right-click context menu integration
- In-page AI chat interface with Google Gemini integration
- Send selected text as context to the AI
- Get AI responses within the same interface
- Conversation memory (previous messages are included for context)
- Markdown rendering for AI responses
- Minimal and non-intrusive UI
- User-configurable API settings
- Multiple language interface (English, Turkish)
- Support for different Gemini models (including Gemini 2.0 Flash)
- Minimize and restore chat window functionality
- Persistent chat window across extension icon clicks
- API key storage in browser
- Clear conversation option

## Technical Components
- Manifest V3 Chrome extension
- Context menu API for right-click functionality
- Content scripts for in-page UI manipulation
- Background scripts for extension logic and conversation management
- Chrome storage API for saving settings
- Communication with Google Gemini API
- Options page for API configuration
- Markdown parser for formatting responses
- Language translations system

## User Flow
1. User selects text on any webpage
2. User right-clicks to activate context menu
3. User clicks on "Ask Gemini about selected text" option
4. Chat interface appears on the page with selected text in the input field
5. User can edit or submit the text as a prompt to Gemini
6. If API key is not configured, user is prompted to set it up
7. User receives AI responses from Google Gemini with proper markdown formatting
8. User can type follow-up prompts and continue the conversation
9. User can minimize the chat window to keep it accessible but less intrusive
10. Conversation history is maintained for context
11. User can clear the conversation history if needed
12. User can reopen the chat window by clicking the extension icon

## API Configuration
- Extension includes a settings page for API configuration
- Users need to provide their own Google Gemini API key
- Documentation included on how to obtain a key
- Settings are stored securely in Chrome's sync storage
- Users can configure model version (Gemini Pro, Gemini 2.0 Flash, or Gemini Pro Vision) and temperature
- Interface language preference can be selected (English, Turkish)

## Supported Models
- **Gemini Pro** - Default model for text generation
- **Gemini 2.0 Flash** - Experimental fast-responding model
- **Gemini Pro Vision** - Model with support for image understanding

## Conversation Memory
- Chat history is maintained per browser tab
- Previous messages are sent to the API for context
- AI responses include awareness of previous exchanges
- Users can clear conversation history with the clear button
- Visual chat history is preserved when reopening via extension icon

## Chat Window Controls
- Minimize button: Collapses the chat to a compact header
- Close button: Closes the current chat interface
- Drag to move: Header can be used to drag and reposition the chat
- Extension icon: Reopens or restores chat window 

## Response Formatting
- AI responses are rendered with full markdown support
- Formatting includes:
  - Headers
  - Bold and italic text
  - Code blocks and inline code
  - Lists (ordered and unordered)
  - Links
  - Blockquotes
  - Images (if URLs are provided)
  - Horizontal rules

## Future Enhancements
- Chat history persistence between sessions
- Theme customization
- Support for other AI models
- Prompt templates
- Image recognition capabilities with Gemini Pro Vision 