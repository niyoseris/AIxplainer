// DOM elements
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const settingsButton = document.getElementById('settingsButton');
const assistantTitle = document.getElementById('assistantTitle');

// Translations for popup UI
const popupTranslations = {
  en: {
    title: {
      gemini: "Gemini AI Text Assistant",
      perplexity: "Perplexity AI Text Assistant",
      together: "Together AI Text Assistant",
      anthropic: "Claude AI Text Assistant",
      default: "AI Text Assistant"
    },
    statusChecking: "Checking API configuration...",
    statusConfigured: "{model} API is configured",
    statusNotConfigured: "{provider} API key not configured",
    howToUse: "How to use:",
    instructions: [
      "Select text on any webpage",
      "Right-click on the selected text",
      "Choose \"Ask AI about selected text\"",
      "Chat with the AI assistant in the popup window"
    ],
    continueConversation: "You can continue the conversation with follow-up questions and prompts directly in the chat window.",
    openSettings: "Open Settings"
  },
  tr: {
    title: {
      gemini: "Gemini AI Metin Asistanı",
      perplexity: "Perplexity AI Metin Asistanı",
      together: "Together AI Metin Asistanı",
      anthropic: "Claude AI Metin Asistanı",
      default: "AI Metin Asistanı"
    },
    statusChecking: "API yapılandırması kontrol ediliyor...",
    statusConfigured: "{model} API yapılandırıldı",
    statusNotConfigured: "{provider} API anahtarı yapılandırılmadı",
    howToUse: "Nasıl kullanılır:",
    instructions: [
      "Herhangi bir web sayfasında metin seçin",
      "Seçili metin üzerine sağ tıklayın",
      "\"Seçili metin hakkında AI'a sor\" seçeneğini seçin",
      "Açılan pencerede AI asistanı ile sohbet edin"
    ],
    continueConversation: "Sohbet penceresinde doğrudan takip soruları ve komutlarla konuşmaya devam edebilirsiniz.",
    openSettings: "Ayarları Aç"
  }
};

// Default language and provider
let currentLanguage = "en";
let currentProvider = "gemini";

// Open settings page when the settings button is clicked
settingsButton.addEventListener('click', function() {
  chrome.runtime.openOptionsPage();
});

// Update UI based on selected language and provider
function updateUILanguage(language, provider) {
  if (!popupTranslations[language]) {
    language = 'en'; // Default to English if translation not available
  }
  
  // Set page title based on provider
  const titleKey = provider && popupTranslations[language].title[provider] 
    ? provider 
    : 'default';
  assistantTitle.textContent = popupTranslations[language].title[titleKey];
  
  // Set how to use section
  document.querySelector('.instructions p strong').textContent = popupTranslations[language].howToUse;
  
  // Set instructions list
  const instructionsList = document.querySelector('.instructions ol');
  instructionsList.innerHTML = '';
  popupTranslations[language].instructions.forEach(instruction => {
    const li = document.createElement('li');
    li.textContent = instruction;
    instructionsList.appendChild(li);
  });
  
  // Set continuation text
  document.querySelector('p:not(.instructions p)').textContent = popupTranslations[language].continueConversation;
  
  // Set settings button text
  settingsButton.textContent = popupTranslations[language].openSettings;
  
  // Update status text based on current status
  if (statusText.dataset.status === 'checking') {
    statusText.textContent = popupTranslations[language].statusChecking;
  } else if (statusText.dataset.status === 'configured') {
    const modelName = statusText.dataset.model || 'AI';
    statusText.textContent = popupTranslations[language].statusConfigured.replace('{model}', modelName);
  } else if (statusText.dataset.status === 'not-configured') {
    const providerName = getProviderDisplayName(provider);
    statusText.textContent = popupTranslations[language].statusNotConfigured.replace('{provider}', providerName);
  }
}

// Get display name for provider
function getProviderDisplayName(provider) {
  switch(provider) {
    case 'gemini': return 'Google Gemini';
    case 'perplexity': return 'Perplexity';
    case 'together': return 'Together';
    case 'anthropic': return 'Anthropic Claude';
    default: return 'AI';
  }
}

// Get model display name
function getModelDisplayName(provider, modelVersion) {
  if (provider === 'gemini') {
    if (modelVersion === 'gemini-2.0-flash-thinking-exp-01-21') {
      return 'Gemini 2.0 Flash';
    } else if (modelVersion === 'gemini-pro-vision') {
      return 'Gemini Pro Vision';
    } else {
      return 'Gemini Pro';
    }
  } else if (provider === 'perplexity') {
    if (modelVersion) {
      return `Perplexity ${modelVersion}`;
    }
    return 'Perplexity AI';
  } else if (provider === 'together') {
    if (modelVersion) {
      return modelVersion;
    }
    return 'Together AI';
  } else if (provider === 'anthropic') {
    if (modelVersion) {
      // Extract model name from the full version string
      if (modelVersion.includes('claude-3-haiku')) {
        return 'Claude 3 Haiku';
      } else if (modelVersion.includes('claude-3-sonnet')) {
        return 'Claude 3 Sonnet';
      } else if (modelVersion.includes('claude-3-opus')) {
        return 'Claude 3 Opus';
      } else if (modelVersion.includes('claude-3-5-sonnet')) {
        return 'Claude 3.5 Sonnet';
      }
      return modelVersion;
    }
    return 'Claude AI';
  }
  
  return 'AI Assistant';
}

// Check if the API key is configured
function checkApiConfiguration() {
  // Set initial status
  statusText.dataset.status = 'checking';
  statusText.textContent = popupTranslations[currentLanguage].statusChecking;
  
  chrome.storage.sync.get(['geminiApiKey', 'perplexityApiKey', 'togetherApiKey', 'anthropicApiKey', 'provider', 'modelVersion', 'language'], function(result) {
    // Update language if set
    if (result.language) {
      currentLanguage = result.language;
    }
    
    // Update provider if set
    if (result.provider) {
      currentProvider = result.provider;
    }
    
    // Update UI with current language and provider
    updateUILanguage(currentLanguage, currentProvider);
    
    // Check if the API key for the current provider is configured
    const apiKeyField = `${currentProvider}ApiKey`;
    if (result[apiKeyField]) {
      // API key is configured
      statusIndicator.classList.remove('status-not-configured');
      statusIndicator.classList.add('status-configured');
      
      // Get model name for display
      const modelDisplay = getModelDisplayName(currentProvider, result.modelVersion);
      
      // Store status and model info for translation
      statusText.dataset.status = 'configured';
      statusText.dataset.model = modelDisplay;
      
      // Update the text with proper translation
      statusText.textContent = popupTranslations[currentLanguage].statusConfigured.replace('{model}', modelDisplay);
    } else {
      // API key is not configured
      statusIndicator.classList.remove('status-configured');
      statusIndicator.classList.add('status-not-configured');
      
      // Store status for translation
      statusText.dataset.status = 'not-configured';
      
      // Update text with proper translation
      const providerName = getProviderDisplayName(currentProvider);
      statusText.textContent = popupTranslations[currentLanguage].statusNotConfigured.replace('{provider}', providerName);
    }
  });
}

// Check API configuration when the popup is opened
document.addEventListener('DOMContentLoaded', checkApiConfiguration); 