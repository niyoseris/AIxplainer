// Global variable to keep track of the chat container
let aiChatContainer = null;
let isMinimized = false;
let chatHistory = []; // Store chat messages for reopening
let currentProvider = 'gemini'; // Default provider
let currentResponseType = 'balanced'; // Default response type

// Language translations
const translations = {
  en: {
    chatTitle: {
      gemini: "Gemini AI Assistant",
      perplexity: "Perplexity AI Assistant",
      together: "Together AI Assistant",
      anthropic: "Claude AI Assistant"
    },
    thinking: "Thinking",
    sendButton: "Send",
    inputPlaceholder: "Type your message...",
    clearConfirm: "Are you sure you want to clear the conversation history?",
    openSettings: "Open Settings",
    apiKeyError: "API key not set. Please set your API key in the extension settings.",
    minimize: "Minimize",
    close: "Close",
    resize: "Resize",
    responseTypes: {
      label: "Response type:",
      balanced: "Balanced",
      concise: "Short answer",
      detailed: "Detailed answer",
      technical: "Technical",
      academic: "Academic"
    }
  },
  tr: {
    chatTitle: {
      gemini: "Gemini AI Asistan",
      perplexity: "Perplexity AI Asistan",
      together: "Together AI Asistan",
      anthropic: "Claude AI Asistan"
    },
    thinking: "Düşünüyor",
    sendButton: "Gönder",
    inputPlaceholder: "Mesajınızı yazın...",
    clearConfirm: "Konuşma geçmişini temizlemek istediğinize emin misiniz?",
    openSettings: "Ayarları Aç",
    apiKeyError: "API anahtarı ayarlanmadı. Lütfen API anahtarınızı eklenti ayarlarında belirleyin.",
    minimize: "Küçült",
    close: "Kapat",
    resize: "Boyutlandır",
    responseTypes: {
      label: "Cevap türü:",
      balanced: "Dengeli",
      concise: "Kısa cevap",
      detailed: "Detaylı cevap",
      technical: "Teknik",
      academic: "Akademik"
    }
  }
};

// Default language - Changed to English by default
let currentLanguage = "en";

// Load language preference and provider
function loadPreferences() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['language', 'provider', 'responseType'], function(result) {
      if (result.language) {
        currentLanguage = result.language;
      }
      if (result.provider) {
        currentProvider = result.provider;
      }
      if (result.responseType) {
        currentResponseType = result.responseType;
      }
      resolve();
    });
  });
}

// Get translation for key
function getTranslation(key) {
  // Handle nested objects like chatTitle or responseTypes
  if (key === "chatTitle") {
    return translations[currentLanguage][key][currentProvider] || translations.en[key][currentProvider];
  } else if (key.startsWith("responseTypes.")) {
    const responseTypeKey = key.split(".")[1];
    return translations[currentLanguage].responseTypes[responseTypeKey] || translations.en.responseTypes[responseTypeKey];
  }
  return translations[currentLanguage][key] || translations.en[key];
}

// Save response type preference
function saveResponseType(type) {
  currentResponseType = type;
  chrome.storage.sync.set({ 'responseType': type });
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle ping message to check if content script is loaded
  if (request.action === "ping") {
    sendResponse({ status: "ok" });
    return true;
  }

  if (request.action === "open_ai_chat") {
    let selectedText = request.text;
    const errorMessage = request.error || null;
    
    // Special handling for Twitter/X
    if (window.location.hostname.includes('twitter.com') || window.location.hostname.includes('x.com')) {
      // If no text is selected, try to get text from the clicked tweet
      if (!selectedText) {
        // Try multiple possible selectors for tweet content
        const possibleSelectors = [
          '[data-testid="tweetText"]',
          '[data-testid="tweet"]',
          'article[role="article"] div[lang]',
          'div[data-tweet-text-content-part]',
          'div[class*="tweet-text"]'
        ];
        
        for (const selector of possibleSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            // Get the most recently interacted with or visible tweet
            const element = Array.from(elements).find(el => {
              const rect = el.getBoundingClientRect();
              return rect.top >= 0 && rect.bottom <= window.innerHeight;
            }) || elements[0];
            
            if (element) {
              selectedText = element.textContent;
              break;
            }
          }
        }
      }
      
      // Clean up Twitter's special characters and formatting
      if (selectedText) {
        selectedText = selectedText
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .replace(/[""]/g, '"') // Replace smart quotes
          .replace(/https?:\/\/\S+/g, '') // Remove URLs
          .replace(/\s+/g, ' ') // Clean up any double spaces created by URL removal
          .trim();
      }
    }
    
    // Load language preference first, then open chat
    loadPreferences().then(() => {
      openAIChatInterface(selectedText, errorMessage);
      sendResponse({ success: true }); // Send response after chat is opened
    }).catch(error => {
      console.error('Error loading preferences:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true; // Will respond asynchronously
  }
  
  // Handle reopening chat from extension icon
  if (request.action === "reopen_chat") {
    loadPreferences().then(() => {
      if (aiChatContainer) {
        // If minimized, restore
        if (isMinimized) {
          restoreChat();
        }
        // If visible but covered by something else, bring to front
        aiChatContainer.style.zIndex = 9999;
      } else {
        // If closed, reopen with empty initial text
        openAIChatInterface("");
      }
      sendResponse({ success: true }); // Send response after chat is handled
    }).catch(error => {
      console.error('Error reopening chat:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true; // Will respond asynchronously
  }
});

// Function to minimize chat
function minimizeChat() {
  if (!aiChatContainer) return;
  
  // Save current position
  const currentLeft = aiChatContainer.style.left;
  const currentBottom = aiChatContainer.offsetBottom;
  
  // Add minimized class
  aiChatContainer.classList.add('ai-chat-minimized');
  isMinimized = true;
  
  // Store position info as data attributes
  aiChatContainer.dataset.left = currentLeft;
  aiChatContainer.dataset.bottom = currentBottom;
  
  // Move to bottom right
  aiChatContainer.style.left = '';
  aiChatContainer.style.right = '20px';
  aiChatContainer.style.bottom = '20px';
}

// Function to restore chat
function restoreChat() {
  if (!aiChatContainer) return;
  
  // Remove minimized class
  aiChatContainer.classList.remove('ai-chat-minimized');
  isMinimized = false;
  
  // Restore previous position if available
  if (aiChatContainer.dataset.left) {
    aiChatContainer.style.left = aiChatContainer.dataset.left;
  }
}

// Function to resize chat window
function resizeChat(size) {
  if (!aiChatContainer) return;
  
  // Remove existing size classes
  aiChatContainer.classList.remove('ai-chat-size-small');
  aiChatContainer.classList.remove('ai-chat-size-medium');
  aiChatContainer.classList.remove('ai-chat-size-large');
  
  // Add selected size class
  aiChatContainer.classList.add(`ai-chat-size-${size}`);
  
  // Store user's preference
  aiChatContainer.dataset.size = size;
}

// Function to create and open the AI chat interface
function openAIChatInterface(initialText, errorMessage = null) {
  // Remove existing chat if it exists
  if (aiChatContainer) {
    document.body.removeChild(aiChatContainer);
  }

  // Create container
  aiChatContainer = document.createElement("div");
  aiChatContainer.className = "ai-chat-container ai-chat-size-medium"; // Default size
  aiChatContainer.dataset.provider = currentProvider;
  
  // Create header with buttons
  const header = document.createElement("div");
  header.className = "ai-chat-header";
  
  const title = document.createElement("div");
  title.className = "ai-chat-title";
  title.textContent = getTranslation("chatTitle");
  
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "ai-chat-header-buttons";
  
  // Create resize buttons dropdown
  const resizeDropdown = document.createElement("div");
  resizeDropdown.className = "ai-chat-resize-dropdown";
  
  const resizeButton = document.createElement("button");
  resizeButton.className = "ai-chat-resize";
  resizeButton.textContent = "⛶";
  resizeButton.title = getTranslation("resize");
  
  const dropdownContent = document.createElement("div");
  dropdownContent.className = "ai-chat-resize-dropdown-content";
  dropdownContent.style.display = "none"; // Hide by default
  
  // Add size options
  const sizeOptions = [
    { size: "small", label: "Small", icon: "🔽" },
    { size: "medium", label: "Medium", icon: "⏺" },
    { size: "large", label: "Large", icon: "🔼" }
  ];
  
  sizeOptions.forEach(option => {
    const sizeOption = document.createElement("div");
    sizeOption.className = "ai-chat-resize-option";
    sizeOption.innerHTML = `${option.icon} ${option.label}`;
    sizeOption.addEventListener("click", () => {
      resizeChat(option.size);
      dropdownContent.style.display = "none"; // Hide dropdown after selection
    });
    dropdownContent.appendChild(sizeOption);
  });
  
  // Toggle dropdown on resize button click
  resizeButton.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent click from immediately bubbling to document
    if (dropdownContent.style.display === "none") {
      dropdownContent.style.display = "block";
    } else {
      dropdownContent.style.display = "none";
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener("click", () => {
    if (dropdownContent && dropdownContent.style.display === "block") {
      dropdownContent.style.display = "none";
    }
  });
  
  // Prevent dropdown from closing when clicking inside it
  dropdownContent.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  
  resizeDropdown.appendChild(resizeButton);
  resizeDropdown.appendChild(dropdownContent);
  
  // Create minimize button
  const minimizeButton = document.createElement("button");
  minimizeButton.className = "ai-chat-minimize";
  minimizeButton.textContent = "−";
  minimizeButton.title = getTranslation("minimize");
  minimizeButton.addEventListener("click", minimizeChat);
  
  // Create close button
  const closeButton = document.createElement("button");
  closeButton.className = "ai-chat-close";
  closeButton.textContent = "×";
  closeButton.title = getTranslation("close");
  closeButton.addEventListener("click", () => {
    document.body.removeChild(aiChatContainer);
    aiChatContainer = null;
  });
  
  buttonContainer.appendChild(resizeDropdown);
  buttonContainer.appendChild(minimizeButton);
  buttonContainer.appendChild(closeButton);
  
  header.appendChild(title);
  header.appendChild(buttonContainer);
  
  // Create messages area
  const messagesArea = document.createElement("div");
  messagesArea.className = "ai-chat-messages";
  
  // Restore chat history if available
  if (chatHistory.length > 0) {
    chatHistory.forEach(message => {
      messagesArea.appendChild(message.cloneNode(true));
    });
  }
  
  // If there's an error message, display it
  if (errorMessage) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "ai-chat-message ai-message error-message";
    errorDiv.textContent = errorMessage;
    messagesArea.appendChild(errorDiv);
    
    // Add a link to open settings
    const settingsLink = document.createElement("button");
    settingsLink.className = "ai-settings-link";
    settingsLink.textContent = getTranslation("openSettings");
    settingsLink.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "open_options" });
    });
    
    const settingsContainer = document.createElement("div");
    settingsContainer.className = "ai-settings-container";
    settingsContainer.appendChild(settingsLink);
    messagesArea.appendChild(settingsContainer);
  }
  
  // Create input area
  const inputArea = document.createElement("div");
  inputArea.className = "ai-chat-input-area";
  
  const input = document.createElement("textarea");
  input.className = "ai-chat-input";
  input.placeholder = getTranslation("inputPlaceholder");
  input.rows = 2;
  
  // If there's initial text, populate the input field with it
  if (initialText && !errorMessage) {
    input.value = initialText;
  }
  
  // Create button container for bottom controls
  const bottomButtonContainer = document.createElement("div");
  bottomButtonContainer.className = "ai-chat-bottom-controls";
  
  // Create settings button
  const settingsButton = document.createElement("button");
  settingsButton.className = "ai-chat-settings";
  settingsButton.textContent = "⚙️";
  settingsButton.title = "Open Extension Settings";
  settingsButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "open_options" });
  });
  
  // Create clear conversation button
  const clearButton = document.createElement("button");
  clearButton.className = "ai-chat-clear";
  clearButton.textContent = "🗑️";
  clearButton.title = "Clear Conversation";
  clearButton.addEventListener("click", () => {
    // Confirm with the user before clearing
    if (confirm(getTranslation("clearConfirm"))) {
      // Clear the UI
      messagesArea.innerHTML = '';
      
      // Clear the chat history
      chatHistory = [];
      
      // Clear the conversation history in background.js
      chrome.runtime.sendMessage({ action: "clear_conversation" });
    }
  });
  
  const sendButton = document.createElement("button");
  sendButton.className = "ai-chat-send";
  sendButton.textContent = getTranslation("sendButton");
  
  // Add buttons to bottom controls
  bottomButtonContainer.appendChild(settingsButton);
  bottomButtonContainer.appendChild(clearButton);
  bottomButtonContainer.appendChild(sendButton);
  
  // Handle send button click
  const sendMessage = () => {
    const messageText = input.value.trim();
    if (!messageText) return;
    
    // Add user message
    const userMessage = document.createElement("div");
    userMessage.className = "ai-chat-message user-message";
    userMessage.textContent = messageText;
    messagesArea.appendChild(userMessage);
    
    // Add to chat history
    chatHistory.push(userMessage.cloneNode(true));
    
    // Clear input
    input.value = "";
    
    // Add loading message for AI response
    const loadingMessage = document.createElement("div");
    loadingMessage.className = "ai-chat-message ai-message loading";
    loadingMessage.textContent = getTranslation("thinking");
    messagesArea.appendChild(loadingMessage);
    
    // Scroll to the bottom
    messagesArea.scrollTop = messagesArea.scrollHeight;
    
    // Get AI response
    chrome.runtime.sendMessage(
      { 
        action: "get_ai_response", 
        prompt: messageText,
        responseType: currentResponseType 
      },
      (response) => {
        // Check if there was an error
        if (response.error) {
          loadingMessage.textContent = response.error;
          loadingMessage.classList.remove("loading");
          loadingMessage.classList.add("error-message");
          
          // Add settings link if it's an API key error
          if (response.error.includes("API key")) {
            const settingsLink = document.createElement("button");
            settingsLink.className = "ai-settings-link";
            settingsLink.textContent = getTranslation("openSettings");
            settingsLink.addEventListener("click", () => {
              chrome.runtime.sendMessage({ action: "open_options" });
            });
            
            const settingsContainer = document.createElement("div");
            settingsContainer.className = "ai-settings-container";
            settingsContainer.appendChild(settingsLink);
            messagesArea.appendChild(settingsContainer);
          }
        } else {
          // Replace loading message with actual response
          // Parse markdown in the response
          loadingMessage.innerHTML = markdownParser.parse(response.response);
          loadingMessage.classList.remove("loading");
          
          // Add to chat history
          chatHistory.push(loadingMessage.cloneNode(true));
        }
        
        // Scroll to the bottom
        messagesArea.scrollTop = messagesArea.scrollHeight;
      }
    );
  };
  
  sendButton.addEventListener("click", sendMessage);
  
  // Also send message on Enter key (but allow Shift+Enter for new lines)
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  inputArea.appendChild(input);
  inputArea.appendChild(bottomButtonContainer);
  
  // Assemble the chat interface
  aiChatContainer.appendChild(header);
  aiChatContainer.appendChild(messagesArea);
  aiChatContainer.appendChild(inputArea);
  
  // Add to page
  document.body.appendChild(aiChatContainer);
  
  // Focus the input only if there's no error
  if (!errorMessage) {
    input.focus();
  }
  
  // Make the chat container draggable
  makeElementDraggable(aiChatContainer, header);
  
  // Make the chat container resizable
  makeElementResizable(aiChatContainer);
}

// Function to make an element draggable
function makeElementDraggable(element, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  handle.style.cursor = "move";
  handle.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    // Skip if clicking on the buttons
    if (e.target.tagName === 'BUTTON') return;
    
    e.preventDefault();
    // Get the mouse cursor position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // Call a function whenever the cursor moves
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e.preventDefault();
    // Calculate the new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // Set the element's new position
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }
  
  function closeDragElement() {
    // Stop moving when mouse button is released
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Function to make the element resizable
function makeElementResizable(element) {
  const resizer = document.createElement('div');
  resizer.className = 'ai-chat-resizer';
  element.appendChild(resizer);
  
  let original_width = 0;
  let original_height = 0;
  let original_x = 0;
  let original_y = 0;
  let original_mouse_x = 0;
  let original_mouse_y = 0;
  
  resizer.addEventListener('mousedown', function(e) {
    e.preventDefault();
    original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
    original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
    original_x = element.getBoundingClientRect().left;
    original_y = element.getBoundingClientRect().top;
    original_mouse_x = e.pageX;
    original_mouse_y = e.pageY;
    
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResize);
  });
  
  function resize(e) {
    const width = original_width + (e.pageX - original_mouse_x);
    const height = original_height + (e.pageY - original_mouse_y);
    
    if (width > 300) {
      element.style.width = width + 'px';
    }
    if (height > 200) {
      element.style.height = height + 'px';
    }
  }
  
  function stopResize() {
    window.removeEventListener('mousemove', resize);
  }
}

// Create chat UI
function createChatUI() {
  const chatContainer = document.createElement('div');
  chatContainer.className = 'ai-chat-container';
  chatContainer.id = 'ai-chat-container';

  chatContainer.innerHTML = `
    <div class="ai-chat-header">
      <div class="ai-chat-title">AI Text Assistant</div>
      <div class="ai-chat-header-buttons">
        <button class="ai-chat-minimize">−</button>
        <button class="ai-chat-close">×</button>
      </div>
    </div>
    <div class="ai-chat-messages" id="ai-chat-messages"></div>
    <div class="ai-chat-input-area">
      <div class="ai-chat-input-row">
        <textarea class="ai-chat-input" id="ai-chat-input" placeholder="Ask something..." rows="1"></textarea>
        <div class="ai-chat-bottom-controls">
          <button class="ai-chat-clear" title="Clear conversation">🗑️</button>
          <button class="ai-chat-settings" title="Settings">⚙️</button>
          <button class="ai-chat-send" id="ai-chat-send">Send</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(chatContainer);

  // Add event listeners
  const minimizeButton = chatContainer.querySelector('.ai-chat-minimize');
  const closeButton = chatContainer.querySelector('.ai-chat-close');
  const settingsButton = chatContainer.querySelector('.ai-chat-settings');
  const clearButton = chatContainer.querySelector('.ai-chat-clear');
  const sendButton = document.getElementById('ai-chat-send');
  const inputField = document.getElementById('ai-chat-input');

  minimizeButton.addEventListener('click', toggleMinimize);
  closeButton.addEventListener('click', closeChatUI);
  settingsButton.addEventListener('click', openOptionsPage);
  clearButton.addEventListener('click', clearConversation);
  sendButton.addEventListener('click', () => sendMessage(inputField.value));
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputField.value);
    }
    autoResizeTextarea(inputField);
  });
  inputField.addEventListener('input', () => autoResizeTextarea(inputField));

  // Auto-focus the input field
  inputField.focus();
}

// Send message to AI
function sendMessage(text) {
  const inputField = document.getElementById('ai-chat-input');
  const messagesContainer = document.getElementById('ai-chat-messages');
  const responseTypeSelect = document.getElementById('ai-response-type-select');
  const responseType = responseTypeSelect ? responseTypeSelect.value : 'balanced';
  
  if (!text || text.trim() === '') return;
  
  // Add user message to UI
  const userMessageElement = document.createElement('div');
  userMessageElement.className = 'ai-chat-message user-message';
  userMessageElement.textContent = text;
  messagesContainer.appendChild(userMessageElement);
  
  // Clear input field
  inputField.value = '';
  autoResizeTextarea(inputField);
  
  // Add AI typing indicator
  const aiMessageElement = document.createElement('div');
  aiMessageElement.className = 'ai-chat-message ai-message loading';
  aiMessageElement.textContent = getTranslation('thinking');
  messagesContainer.appendChild(aiMessageElement);
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Get selected text if any
  const selectedText = window.getSelection().toString();
  
  // Create a promise for the message response
  const messagePromise = new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      action: 'get_ai_response',
      message: text,
      selectedText: selectedText,
      responseType: currentResponseType
    }, response => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(response);
    });
  });
  
  // Handle the response
  messagePromise
    .then(response => {
      if (response.error) {
        aiMessageElement.classList.remove('loading');
        aiMessageElement.classList.add('error-message');
        
        if (response.error.includes('API key')) {
          const settingsLink = document.createElement('button');
          settingsLink.className = 'ai-settings-link';
          settingsLink.textContent = getTranslation('openSettings');
          settingsLink.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'open_options' });
          });
          
          const settingsContainer = document.createElement('div');
          settingsContainer.className = 'ai-settings-container';
          settingsContainer.appendChild(settingsLink);
          
          aiMessageElement.textContent = getTranslation('apiKeyError');
          messagesContainer.appendChild(settingsContainer);
        } else {
          aiMessageElement.textContent = response.error;
        }
      } else {
        // Replace loading message with actual response
        aiMessageElement.innerHTML = markdownParser.parse(response.response || response.content);
        aiMessageElement.classList.remove('loading');
        
        // Add to chat history
        chatHistory.push(aiMessageElement.cloneNode(true));
      }
      
      // Scroll to the bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    })
    .catch(error => {
      console.error('Error sending message:', error);
      aiMessageElement.classList.remove('loading');
      aiMessageElement.classList.add('error-message');
      aiMessageElement.textContent = 'An error occurred while sending the message. Please try again.';
    });
} 