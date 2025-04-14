// DOM elements
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const settingsButton = document.getElementById('settingsButton');
const assistantTitle = document.getElementById('assistantTitle');

// Translations for popup UI
const popupTranslations = {
  en: {
    title: {
      gemini: "AIXplainer - Gemini",
      perplexity: "AIXplainer - Perplexity",
      together: "AIXplainer - Together",
      anthropic: "AIXplainer - Claude",
      default: "AIXplainer"
    },
    statusChecking: "Checking API configuration...",
    statusConfigured: "Ready to use",
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
      gemini: "AIXplainer - Gemini",
      perplexity: "AIXplainer - Perplexity",
      together: "AIXplainer - Together",
      anthropic: "AIXplainer - Claude",
      default: "AIXplainer"
    },
    statusChecking: "API yapılandırması kontrol ediliyor...",
    statusConfigured: "Kullanıma hazır",
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
  switch(provider) {
    case 'gemini': return 'Google Gemini';
    case 'perplexity': return 'Perplexity AI';
    case 'together': return 'Together AI';
    case 'anthropic': return 'Claude AI';
    default: return 'AI Assistant';
  }
}

// Check if the API key is configured
function checkApiConfiguration() {
  // Set initial status
  statusText.dataset.status = 'checking';
  statusText.textContent = popupTranslations[currentLanguage].statusChecking;
  
  chrome.storage.sync.get(['geminiApiKey', 'perplexityApiKey', 'togetherApiKey', 'anthropicApiKey', 'provider', 'modelVersion', 'language'], function(result) {
    // Debug logs
    console.log('Current Provider:', result.provider);
    console.log('Model Version:', result.modelVersion);
    
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
      
      // Get model name for display - ensure we pass both provider and modelVersion
      const modelDisplay = getModelDisplayName(currentProvider, result.modelVersion || '');
      
      // Store status and model info for translation
      statusText.dataset.status = 'configured';
      statusText.dataset.model = modelDisplay;
      statusText.dataset.provider = currentProvider;
      
      // Update the text with proper translation
      statusText.textContent = popupTranslations[currentLanguage].statusConfigured.replace('{model}', modelDisplay);
    } else {
      // API key is not configured
      statusIndicator.classList.remove('status-configured');
      statusIndicator.classList.add('status-not-configured');
      
      // Store status and provider for translation
      statusText.dataset.status = 'not-configured';
      statusText.dataset.provider = currentProvider;
      
      // Update text with proper translation
      const providerName = getProviderDisplayName(currentProvider);
      statusText.textContent = popupTranslations[currentLanguage].statusNotConfigured.replace('{provider}', providerName);
    }
  });
}

// Check API configuration when the popup is opened
document.addEventListener('DOMContentLoaded', checkApiConfiguration); 