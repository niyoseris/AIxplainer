# AI Text Assistant Chrome Extension

A Chrome extension that allows you to select text on any webpage, right-click, and chat with Google Gemini AI directly on the page.

## Features

- Select text and right-click to open Gemini AI chat
- Chat interface appears directly on the webpage
- Draggable chat window that can be positioned anywhere
- Minimize option to keep chat accessible but unobtrusive
- Reopen chat with extension icon click
- Multiple language interface (English, Turkish)
- Send follow-up questions in the same chat window
- Conversation memory for contextual responses
- Full markdown rendering for formatted AI responses
- Clean and modern UI
- Google Gemini API integration with multiple models:
  - Gemini Pro
  - Gemini 2.0 Flash (experimental, faster responses)
  - Gemini Pro Vision
- User-configurable settings
- API key storage in browser
- Clear conversation option

## Installation

### From source:

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the extension directory
5. The extension should now be installed and visible in your extensions toolbar

## API Setup

Before using the extension, you'll need to:

1. Get a Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click on the extension icon and then "Open Settings"
3. Enter your API key and adjust any other settings
4. Click "Save Settings"

## Usage

1. Select text on any webpage
2. Right-click on the selected text
3. Choose "Ask Gemini about selected text" from the context menu
4. A chat window will appear with your selected text in the input field
5. Edit the text if desired, then press Enter or click "Send"
6. Gemini AI will respond in the chat window with properly formatted markdown
7. You can continue the conversation by typing in the input field and clicking "Send" or pressing Enter
8. The AI will maintain context of your previous messages
9. Use the minimize button (−) to collapse the chat to just the header
10. Use the clear button (🗑️) to reset the conversation if needed
11. Click the extension icon to restore or reopen the chat window

## Settings

You can configure the following settings:

- Google Gemini API Key
- Model Version:
  - Gemini Pro (default): Standard model for general text responses
  - Gemini 2.0 Flash: Experimental model for faster responses
  - Gemini Pro Vision: Model with image understanding capabilities
- Temperature (controls response randomness)
- Interface Language (English, Turkish)

Access settings by:
- Clicking the extension icon and then "Open Settings"
- Clicking the gear icon (⚙️) in the chat window
- Clicking "Open Settings" when prompted about a missing API key

## Chat Window Controls

- Minimize (−): Collapses the chat window to just the header
- Close (×): Closes the chat window completely
- Drag header: Move the chat window to any position
- Extension icon: Reopens or restores a minimized chat window
- Settings (⚙️): Opens extension settings page
- Clear (🗑️): Clears conversation history

## Markdown Support

The extension renders AI responses with full markdown formatting, including:

- Headers (# Header 1, ## Header 2, etc.)
- Emphasis (**bold**, *italic*)
- Code blocks (```code```) and inline code (`code`)
- Lists (ordered and unordered)
- Links ([text](url))
- Blockquotes (> quote)
- Images (![alt](url))
- Horizontal rules (---)

## Customization

You can customize the UI by editing the `styles.css` file:
- Change colors by modifying the color values
- Adjust dimensions by changing width, height, padding, etc.
- Modify fonts by changing the font-family properties

## Technical Details

This extension uses:
- Chrome Extension Manifest V3
- Context Menu API for right-click functionality
- Content scripts for in-page UI manipulation
- Message passing between background and content scripts
- Chrome Storage API for saving settings
- Google Gemini API for AI responses
- Tab-specific conversation history
- Custom markdown parser
- Multi-language support

## Security

- Your API key is stored locally in your browser's secure storage
- The key is only sent directly to Google's Gemini API
- No data is collected by the extension developer

## License

MIT License 