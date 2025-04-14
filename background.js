// Create context menu item when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  createContextMenuItem('Ask AI about selected text');
  
  // Listen for provider changes to update context menu
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.provider) {
      updateContextMenuTitle(changes.provider.newValue);
    }
  });
});

// Function to update the context menu title based on provider
function updateContextMenuTitle(provider) {
  let title = 'Ask AI about selected text';
  
  switch (provider) {
    case 'gemini':
      title = 'Ask Gemini about selected text';
      break;
    case 'perplexity':
      title = 'Ask Perplexity about selected text';
      break;
    case 'together':
      title = 'Ask Together AI about selected text';
      break;
    case 'anthropic':
      title = 'Ask Claude about selected text';
      break;
  }
  
  chrome.contextMenus.update('askAI', { title: title }, () => {
    if (chrome.runtime.lastError) {
      // If update fails (menu doesn't exist), create it
      createContextMenuItem(title);
    }
  });
}

// Helper function to create context menu item
function createContextMenuItem(title) {
  chrome.contextMenus.create({
    id: 'askAI',
    title: title,
    contexts: ['selection']
  }, () => {
    if (chrome.runtime.lastError) {
      console.log('Context menu creation error:', chrome.runtime.lastError);
    }
  });
}

// Store conversation histories for each tab
const tabConversations = {};

// Response type instructions
const responseTypeInstructions = {
  balanced: "Provide a balanced response that offers good detail while remaining concise.",
  concise: "Provide a brief and concise response that gets straight to the point with minimal explanation.",
  detailed: "Provide a comprehensive and detailed response that thoroughly explores the topic.",
  technical: "Provide a technical response with precise terminology and in-depth explanations of processes or systems.",
  academic: "Provide a formal academic response with citations where applicable, structured arguments, and scholarly analysis."
};

// Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  // Ensure content script is loaded before sending message
  chrome.tabs.sendMessage(tab.id, { action: "ping" }, response => {
    if (chrome.runtime.lastError) {
      // Content script not loaded, inject it
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['markdown.js', 'content.js']
      }).then(() => {
        // Now send the reopen message
        chrome.tabs.sendMessage(tab.id, {
          action: "reopen_chat"
        });
      }).catch(err => {
        console.error('Failed to inject content script:', err);
      });
    } else {
      // Content script is already loaded, send message directly
      chrome.tabs.sendMessage(tab.id, {
        action: "reopen_chat"
      });
    }
  });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "askAI") {
    // Check if API key is set for the selected provider
    chrome.storage.sync.get([
      'provider',
      'geminiApiKey', 
      'perplexityApiKey', 
      'togetherApiKey',
      'anthropicApiKey'
    ], function(result) {
      const provider = result.provider || 'gemini';
      let apiKey = '';
      
      // Get the API key for the selected provider
      switch (provider) {
        case 'gemini':
          apiKey = result.geminiApiKey;
          break;
        case 'perplexity':
          apiKey = result.perplexityApiKey;
          break;
        case 'together':
          apiKey = result.togetherApiKey;
          break;
        case 'anthropic':
          apiKey = result.anthropicApiKey;
          break;
      }
      
      // Ensure content script is loaded before sending message
      chrome.tabs.sendMessage(tab.id, { action: "ping" }, response => {
        if (chrome.runtime.lastError) {
          // Content script not loaded, inject it
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['markdown.js', 'content.js']
          }).then(() => {
            // Now send the actual message
            sendMessageToTab(tab.id, apiKey, provider, info.selectionText);
          }).catch(err => {
            console.error('Failed to inject content script:', err);
          });
        } else {
          // Content script is already loaded, send message directly
          sendMessageToTab(tab.id, apiKey, provider, info.selectionText);
        }
      });
    });
  }
});

// Helper function to send message to tab
function sendMessageToTab(tabId, apiKey, provider, selectionText) {
  if (!apiKey) {
    // If API key is not set, send a message to open settings
    chrome.tabs.sendMessage(tabId, {
      action: "open_ai_chat",
      text: selectionText,
      error: `API key not set for ${provider}. Please set your API key in the extension settings.`
    });
  } else {
    // Initialize conversation history for this tab if it doesn't exist
    if (!tabConversations[tabId]) {
      tabConversations[tabId] = [];
    }
    
    // If API key is set, send the selected text to the content script
    chrome.tabs.sendMessage(tabId, {
      action: "open_ai_chat",
      text: selectionText
    });
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "get_ai_response") {
    // Get API settings from storage
    chrome.storage.sync.get([
      'provider',
      'geminiApiKey', 
      'geminiModelVersion',
      'geminiCustomModel', 
      'perplexityApiKey',
      'perplexityModelVersion',
      'perplexityCustomModel',
      'togetherApiKey',
      'togetherModelVersion',
      'togetherCustomModel',
      'anthropicApiKey',
      'anthropicModelVersion',
      'anthropicCustomModel',
      'temperature', 
      'language'
    ], function(result) {
      const provider = result.provider || 'gemini';
      let apiKey = '';
      let modelVersion = '';
      
      // Get the API key and model for the selected provider
      switch (provider) {
        case 'gemini':
          apiKey = result.geminiApiKey;
          modelVersion = result.geminiModelVersion || 'gemini-pro';
          // Handle custom model
          if (modelVersion === 'custom' && result.geminiCustomModel) {
            modelVersion = result.geminiCustomModel;
          }
          break;
        case 'perplexity':
          apiKey = result.perplexityApiKey;
          modelVersion = result.perplexityModelVersion || 'sonar-small-online';
          // Handle custom model
          if (modelVersion === 'custom' && result.perplexityCustomModel) {
            modelVersion = result.perplexityCustomModel;
          }
          break;
        case 'together':
          apiKey = result.togetherApiKey;
          modelVersion = result.togetherModelVersion || 'togethercomputer/llama-3-8b-instruct';
          // Handle custom model
          if (modelVersion === 'custom' && result.togetherCustomModel) {
            modelVersion = result.togetherCustomModel;
          }
          break;
        case 'anthropic':
          apiKey = result.anthropicApiKey;
          modelVersion = result.anthropicModelVersion || 'claude-3-haiku-20240307';
          // Handle custom model
          if (modelVersion === 'custom' && result.anthropicCustomModel) {
            modelVersion = result.anthropicCustomModel;
          }
          break;
      }
      
      const temperature = parseFloat(result.temperature || 0.7);
      
      if (!apiKey) {
        sendResponse({ 
          error: `API key not set for ${provider}. Please set your API key in the extension settings.`
        });
        return;
      }
      
      // Get tab ID from sender
      const tabId = sender.tab.id;
      
      // Initialize conversation history for this tab if it doesn't exist
      if (!tabConversations[tabId]) {
        tabConversations[tabId] = [];
      }
      
      // Get response type from request or use default
      const responseType = request.responseType || 'balanced';
      const message = request.message || request.prompt; // Support both message and prompt fields
      const conversationHistory = request.conversationHistory || tabConversations[tabId];
      const selectedText = request.selectedText || '';
      
      // If we're using the conversation history from the request, update our stored history
      if (request.conversationHistory) {
        tabConversations[tabId] = [...request.conversationHistory];
      } else {
        // Add the current user message to the conversation history
        tabConversations[tabId].push({
          role: "user",
          content: message
        });
      }
      
      // Prepare the message with context if selected text is provided
      let contextualMessage = message;
      if (selectedText && selectedText.trim() !== '') {
        contextualMessage = `Context: "${selectedText}"\n\nUser message: ${message}`;
      }
      
      // Call the appropriate API based on provider
      let apiPromise;
      
      switch (provider) {
        case 'gemini':
          apiPromise = getGeminiResponse(apiKey, modelVersion, tabConversations[tabId], temperature, responseType);
          break;
        case 'perplexity':
          apiPromise = getPerplexityResponse(apiKey, modelVersion, tabConversations[tabId], temperature, responseType);
          break;
        case 'together':
          apiPromise = getTogetherResponse(apiKey, modelVersion, tabConversations[tabId], temperature, responseType);
          break;
        case 'anthropic':
          apiPromise = getAnthropicResponse(apiKey, modelVersion, tabConversations[tabId], temperature, responseType);
          break;
        default:
          apiPromise = Promise.reject(new Error("Unknown provider"));
      }
      
      apiPromise
        .then(response => {
          // Add the AI response to the conversation history
          tabConversations[tabId].push({
            role: "model",
            content: response
          });
          
          // Response format compatible with both old and new content.js
          sendResponse({ 
            response: response,
            content: response // Support new content.js format
          });
        })
        .catch(error => {
          sendResponse({ 
            error: `Error from ${provider} API: ${error.message}`
          });
        });
    });
    
    return true; // Required to use sendResponse asynchronously
  }
  
  if (request.action === "clear_conversation") {
    const tabId = sender.tab.id;
    if (tabConversations[tabId]) {
      tabConversations[tabId] = [];
    }
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === "open_options") {
    chrome.runtime.openOptionsPage();
    return true;
  }
});

// Function to get response from Google Gemini API
async function getGeminiResponse(apiKey, modelVersion, conversationHistory, temperature, responseType) {
  // Check if we're using the experimental model
  const isExperimentalModel = modelVersion === "gemini-2.0-flash-thinking-exp-01-21";
  
  // Construct the API URL based on the model
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${apiKey}`;
  
  // Clone the conversation history to avoid modifying the original
  const historyWithInstructions = [...conversationHistory];
  
  // If there's only one message (the current one), insert response type instruction at the beginning
  if (historyWithInstructions.length === 1) {
    historyWithInstructions.unshift({
      role: "user",
      content: `${responseTypeInstructions[responseType]}`
    });
    historyWithInstructions.unshift({
      role: "model",
      content: "I'll follow those instructions."
    });
  }
  
  // Format the conversation history for the API request
  const formattedHistory = historyWithInstructions.map(message => {
    return {
      role: message.role,
      parts: [{ text: message.content }]
    };
  });
  
  // Construct the request body
  let requestBody;
  if (isExperimentalModel) {
    // Experimental model might require different payload structure
    requestBody = {
      contents: formattedHistory.length > 0 ? formattedHistory : [
        {
          parts: [{ text: "Hello" }]
        }
      ],
      generationConfig: {
        temperature: temperature,
        // Add any additional parameters specific to this experimental model
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    };
  } else {
    // Standard model payload
    requestBody = {
      contents: formattedHistory.length > 0 ? formattedHistory : [
        {
          parts: [{ text: "Hello" }]
        }
      ],
      generationConfig: {
        temperature: temperature
      }
    };
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract the text from the response
    if (data.candidates && data.candidates[0]?.content?.parts && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Unexpected response format from Gemini API");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

// Function to get response from Perplexity API
async function getPerplexityResponse(apiKey, modelVersion, conversationHistory, temperature, responseType) {
  // Construct the API URL
  const url = 'https://api.perplexity.ai/chat/completions';
  
  // Clone the conversation history to avoid modifying the original
  const historyWithInstructions = [...conversationHistory];
  
  // If there's only one message (the current one), insert response type instruction at the beginning
  if (historyWithInstructions.length === 1) {
    historyWithInstructions.unshift({
      role: "user",
      content: `${responseTypeInstructions[responseType]}`
    });
    historyWithInstructions.unshift({
      role: "model",
      content: "I'll follow those instructions."
    });
  }
  
  // Format the conversation history for Perplexity API
  const formattedMessages = historyWithInstructions.map(message => {
    // Map our role format to Perplexity's format
    const role = message.role === "user" ? "user" : "assistant";
    return {
      role: role,
      content: message.content
    };
  });
  
  // Construct the request body
  const requestBody = {
    model: modelVersion,
    messages: formattedMessages,
    temperature: temperature
  };
  
  try {
    console.log('Sending request to Perplexity API:', {
      url,
      model: modelVersion,
      messageCount: formattedMessages.length
    });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey // Remove 'Bearer ' prefix as Perplexity doesn't require it
      },
      body: JSON.stringify(requestBody)
    });
    
    // First try to get the response as text
    const responseText = await response.text();
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Perplexity API response:', responseText);
      if (responseText.includes('401 Authorization Required')) {
        throw new Error('Invalid Perplexity API key. Please check your API key in the settings.');
      }
      throw new Error(`Invalid response from Perplexity API: ${responseText.substring(0, 100)}...`);
    }
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid Perplexity API key. Please check your API key in the settings.');
      }
      throw new Error(data.error?.message || `Perplexity API error: ${response.status} - ${JSON.stringify(data)}`);
    }
    
    // Extract the text from the response
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    } else {
      console.error('Unexpected Perplexity API response format:', data);
      throw new Error("Unexpected response format from Perplexity API");
    }
  } catch (error) {
    console.error("Error calling Perplexity API:", error);
    
    // Provide a more user-friendly error message
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Could not connect to Perplexity API. Please check your internet connection.');
    } else if (error.message.includes('401') || error.message.includes('Authorization Required')) {
      throw new Error('Invalid Perplexity API key. Please check your API key in the settings.');
    } else if (error.message.includes('429')) {
      throw new Error('Perplexity API rate limit exceeded. Please try again later.');
    } else {
      throw new Error(`Error from Perplexity API: ${error.message}`);
    }
  }
}

// Function to get response from Together AI API
async function getTogetherResponse(apiKey, modelVersion, conversationHistory, temperature, responseType) {
  // Construct the API URL
  const url = 'https://api.together.xyz/v1/chat/completions';
  
  // Clone the conversation history to avoid modifying the original
  const historyWithInstructions = [...conversationHistory];
  
  // If there's only one message (the current one), insert response type instruction at the beginning
  if (historyWithInstructions.length === 1) {
    historyWithInstructions.unshift({
      role: "user",
      content: `${responseTypeInstructions[responseType]}`
    });
    historyWithInstructions.unshift({
      role: "model",
      content: "I'll follow those instructions."
    });
  }
  
  // Format the conversation history for Together AI API
  const formattedMessages = historyWithInstructions.map(message => {
    // Map our role format to Together's format
    const role = message.role === "user" ? "user" : "assistant";
    return {
      role: role,
      content: message.content
    };
  });
  
  // Construct the request body
  const requestBody = {
    model: modelVersion,
    messages: formattedMessages,
    temperature: temperature,
    max_tokens: 2048
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract the text from the response
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    } else {
      throw new Error("Unexpected response format from Together AI API");
    }
  } catch (error) {
    console.error("Error calling Together AI API:", error);
    throw error;
  }
}

// Function to get response from Anthropic Claude API
async function getAnthropicResponse(apiKey, modelVersion, conversationHistory, temperature, responseType) {
  // Construct the API URL
  const url = 'https://api.anthropic.com/v1/messages';
  
  // Clone the conversation history to avoid modifying the original
  const historyWithInstructions = [...conversationHistory];
  
  // If there's only one message (the current one), insert response type instruction at the beginning
  if (historyWithInstructions.length === 1) {
    historyWithInstructions.unshift({
      role: "user",
      content: `${responseTypeInstructions[responseType]}`
    });
    historyWithInstructions.unshift({
      role: "model",
      content: "I'll follow those instructions."
    });
  }
  
  // Format the conversation history for Anthropic API
  const formattedMessages = historyWithInstructions.map(message => {
    return {
      role: message.role === "user" ? "user" : "assistant",
      content: message.content
    };
  });
  
  // Claude API expects a different format than chat completions APIs
  // Create system prompt that includes response type instructions
  const systemPrompt = `You are Claude, a helpful AI assistant. Your goal is to provide accurate, helpful, and thoughtful responses to the user's queries. ${responseTypeInstructions[responseType]}`;
  
  // Construct the request body
  const requestBody = {
    model: modelVersion,
    messages: formattedMessages,
    system: systemPrompt,
    temperature: temperature,
    max_tokens: 2048
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract the text from the response
    if (data.content && data.content.length > 0 && data.content[0].type === 'text') {
      return data.content[0].text;
    } else {
      throw new Error("Unexpected response format from Anthropic API");
    }
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    throw error;
  }
} 