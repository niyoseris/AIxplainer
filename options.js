// DOM elements
document.addEventListener('DOMContentLoaded', function() {
  // Ensure UTF-8 encoding is properly set for the document
  if (document.characterSet !== 'UTF-8') {
    console.warn('Character encoding is not UTF-8: ' + document.characterSet);
  }
  
  // Provider selection elements
  const providerSelect = document.getElementById('provider');
  const geminiSettings = document.getElementById('gemini-settings');
  const perplexitySettings = document.getElementById('perplexity-settings');
  const togetherSettings = document.getElementById('together-settings');
  const anthropicSettings = document.getElementById('anthropic-settings');
  
  // Gemini elements
  const geminiApiKeyInput = document.getElementById('geminiApiKey');
  const geminiModelVersionSelect = document.getElementById('geminiModelVersion');
  const geminiCustomModelContainer = document.getElementById('gemini-custom-model-container');
  const geminiCustomModelInput = document.getElementById('geminiCustomModel');
  
  // Perplexity elements
  const perplexityApiKeyInput = document.getElementById('perplexityApiKey');
  const perplexityModelVersionSelect = document.getElementById('perplexityModelVersion');
  const perplexityCustomModelContainer = document.getElementById('perplexity-custom-model-container');
  const perplexityCustomModelInput = document.getElementById('perplexityCustomModel');
  
  // Together elements
  const togetherApiKeyInput = document.getElementById('togetherApiKey');
  const togetherModelVersionSelect = document.getElementById('togetherModelVersion');
  const togetherCustomModelContainer = document.getElementById('together-custom-model-container');
  const togetherCustomModelInput = document.getElementById('togetherCustomModel');
  
  // Anthropic elements
  const anthropicApiKeyInput = document.getElementById('anthropicApiKey');
  const anthropicModelVersionSelect = document.getElementById('anthropicModelVersion');
  const anthropicCustomModelContainer = document.getElementById('anthropic-custom-model-container');
  const anthropicCustomModelInput = document.getElementById('anthropicCustomModel');
  
  // Common elements
  const temperatureInput = document.getElementById('temperature');
  const temperatureValueSpan = document.getElementById('temperatureValue');
  const languageSelect = document.getElementById('language');
  const responseTypeSelect = document.getElementById('responseType');
  const saveButton = document.getElementById('saveButton');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');

  // Update UI text based on selected language
  const uiTranslations = {
    en: {
      saveButton: "Save Settings",
      successMessage: "Settings saved successfully!",
      errorMessage: "Error saving settings. Please try again.",
      apiKeyTooShort: "API key seems too short. Please check your key."
    },
    tr: {
      saveButton: "Ayarları Kaydet",
      successMessage: "Ayarlar başarıyla kaydedildi!",
      errorMessage: "Ayarlar kaydedilirken hata oluştu. Lütfen tekrar deneyin.",
      apiKeyTooShort: "API anahtarı çok kısa görünüyor. Lütfen anahtarınızı kontrol edin."
    }
  };
  
  // Function to show the relevant provider settings
  function showProviderSettings(provider) {
    // Hide all provider settings first
    geminiSettings.style.display = 'none';
    perplexitySettings.style.display = 'none';
    togetherSettings.style.display = 'none';
    anthropicSettings.style.display = 'none';
    
    // Show the selected provider settings
    switch (provider) {
      case 'gemini':
        geminiSettings.style.display = 'block';
        break;
      case 'perplexity':
        perplexitySettings.style.display = 'block';
        break;
      case 'together':
        togetherSettings.style.display = 'block';
        break;
      case 'anthropic':
        anthropicSettings.style.display = 'block';
        break;
    }
  }
  
  // Function to toggle custom model input containers
  function toggleCustomModelField(select, container) {
    if (select.value === 'custom') {
      container.style.display = 'block';
    } else {
      container.style.display = 'none';
    }
  }
  
  // Set up event listeners for model selection dropdowns
  geminiModelVersionSelect.addEventListener('change', function() {
    toggleCustomModelField(geminiModelVersionSelect, geminiCustomModelContainer);
  });
  
  perplexityModelVersionSelect.addEventListener('change', function() {
    toggleCustomModelField(perplexityModelVersionSelect, perplexityCustomModelContainer);
  });
  
  togetherModelVersionSelect.addEventListener('change', function() {
    toggleCustomModelField(togetherModelVersionSelect, togetherCustomModelContainer);
  });
  
  anthropicModelVersionSelect.addEventListener('change', function() {
    toggleCustomModelField(anthropicModelVersionSelect, anthropicCustomModelContainer);
  });
  
  // Initialize provider settings visibility
  showProviderSettings(providerSelect.value);
  
  // Handle provider change
  providerSelect.addEventListener('change', function() {
    showProviderSettings(this.value);
  });
  
  // Load saved settings
  loadSettings();

  // Update temperature value display when slider changes
  temperatureInput.addEventListener('input', function() {
    temperatureValueSpan.textContent = this.value;
  });

  // Save settings when the save button is clicked
  saveButton.addEventListener('click', saveSettings);
  
  // Handle API key input focus to clear the masked values
  geminiApiKeyInput.addEventListener('focus', function() {
    if (this.dataset.masked === 'true') {
      this.value = '';
      this.dataset.masked = 'false';
    }
  });
  
  perplexityApiKeyInput.addEventListener('focus', function() {
    if (this.dataset.masked === 'true') {
      this.value = '';
      this.dataset.masked = 'false';
    }
  });
  
  togetherApiKeyInput.addEventListener('focus', function() {
    if (this.dataset.masked === 'true') {
      this.value = '';
      this.dataset.masked = 'false';
    }
  });
  
  anthropicApiKeyInput.addEventListener('focus', function() {
    if (this.dataset.masked === 'true') {
      this.value = '';
      this.dataset.masked = 'false';
    }
  });
  
  // Handle language change
  languageSelect.addEventListener('change', function() {
    updateUILanguage(this.value);
  });
  
  // Update UI text based on selected language
  function updateUILanguage(lang) {
    if (!uiTranslations[lang]) {
      lang = 'en'; // Default to English if translation not available
    }
    
    // Update button text and other UI elements
    saveButton.textContent = uiTranslations[lang].saveButton;
    successMessage.textContent = uiTranslations[lang].successMessage;
    errorMessage.textContent = uiTranslations[lang].errorMessage;
  }

  // Function to load saved settings from storage
  function loadSettings() {
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
      'language',
      'responseType'
    ], function(result) {
      // Set provider if saved
      if (result.provider) {
        providerSelect.value = result.provider;
        showProviderSettings(result.provider);
      } else {
        // Default to Gemini
        providerSelect.value = 'gemini';
        showProviderSettings('gemini');
      }
      
      // Load Gemini settings
      if (result.geminiApiKey) {
        // Mask the API key for display (show only last 4 characters)
        const masked = '•'.repeat(10) + result.geminiApiKey.slice(-4);
        geminiApiKeyInput.value = masked;
        geminiApiKeyInput.dataset.masked = 'true';
        geminiApiKeyInput.dataset.lastFour = result.geminiApiKey.slice(-4);
      }
      
      if (result.geminiModelVersion) {
        // If it's a custom model stored value
        if (result.geminiCustomModel && result.geminiModelVersion === 'custom') {
          geminiModelVersionSelect.value = 'custom';
          geminiCustomModelInput.value = result.geminiCustomModel;
          geminiCustomModelContainer.style.display = 'block';
        } else {
          geminiModelVersionSelect.value = result.geminiModelVersion;
          // Make sure to check if the value exists in the dropdown
          if (geminiModelVersionSelect.value !== result.geminiModelVersion) {
            geminiModelVersionSelect.value = 'custom';
            geminiCustomModelInput.value = result.geminiModelVersion;
            geminiCustomModelContainer.style.display = 'block';
          }
        }
      }
      
      // Load Perplexity settings
      if (result.perplexityApiKey) {
        // Mask the API key for display (show only last 4 characters)
        const masked = '•'.repeat(10) + result.perplexityApiKey.slice(-4);
        perplexityApiKeyInput.value = masked;
        perplexityApiKeyInput.dataset.masked = 'true';
        perplexityApiKeyInput.dataset.lastFour = result.perplexityApiKey.slice(-4);
      }
      
      if (result.perplexityModelVersion) {
        // If it's a custom model stored value
        if (result.perplexityCustomModel && result.perplexityModelVersion === 'custom') {
          perplexityModelVersionSelect.value = 'custom';
          perplexityCustomModelInput.value = result.perplexityCustomModel;
          perplexityCustomModelContainer.style.display = 'block';
        } else {
          perplexityModelVersionSelect.value = result.perplexityModelVersion;
          // Make sure to check if the value exists in the dropdown
          if (perplexityModelVersionSelect.value !== result.perplexityModelVersion) {
            perplexityModelVersionSelect.value = 'custom';
            perplexityCustomModelInput.value = result.perplexityModelVersion;
            perplexityCustomModelContainer.style.display = 'block';
          }
        }
      }
      
      // Load Together settings
      if (result.togetherApiKey) {
        // Mask the API key for display (show only last 4 characters)
        const masked = '•'.repeat(10) + result.togetherApiKey.slice(-4);
        togetherApiKeyInput.value = masked;
        togetherApiKeyInput.dataset.masked = 'true';
        togetherApiKeyInput.dataset.lastFour = result.togetherApiKey.slice(-4);
      }
      
      if (result.togetherModelVersion) {
        // If it's a custom model stored value
        if (result.togetherCustomModel && result.togetherModelVersion === 'custom') {
          togetherModelVersionSelect.value = 'custom';
          togetherCustomModelInput.value = result.togetherCustomModel;
          togetherCustomModelContainer.style.display = 'block';
        } else {
          togetherModelVersionSelect.value = result.togetherModelVersion;
          // Make sure to check if the value exists in the dropdown
          if (togetherModelVersionSelect.value !== result.togetherModelVersion) {
            togetherModelVersionSelect.value = 'custom';
            togetherCustomModelInput.value = result.togetherModelVersion;
            togetherCustomModelContainer.style.display = 'block';
          }
        }
      }
      
      // Load Anthropic settings
      if (result.anthropicApiKey) {
        // Mask the API key for display (show only last 4 characters)
        const masked = '•'.repeat(10) + result.anthropicApiKey.slice(-4);
        anthropicApiKeyInput.value = masked;
        anthropicApiKeyInput.dataset.masked = 'true';
        anthropicApiKeyInput.dataset.lastFour = result.anthropicApiKey.slice(-4);
      }
      
      if (result.anthropicModelVersion) {
        // If it's a custom model stored value
        if (result.anthropicCustomModel && result.anthropicModelVersion === 'custom') {
          anthropicModelVersionSelect.value = 'custom';
          anthropicCustomModelInput.value = result.anthropicCustomModel;
          anthropicCustomModelContainer.style.display = 'block';
        } else {
          anthropicModelVersionSelect.value = result.anthropicModelVersion;
          // Make sure to check if the value exists in the dropdown
          if (anthropicModelVersionSelect.value !== result.anthropicModelVersion) {
            anthropicModelVersionSelect.value = 'custom';
            anthropicCustomModelInput.value = result.anthropicModelVersion;
            anthropicCustomModelContainer.style.display = 'block';
          }
        }
      }
      
      // Load common settings
      if (result.temperature) {
        temperatureInput.value = result.temperature;
        temperatureValueSpan.textContent = result.temperature;
      }
      
      // Set response type, default to balanced if not set
      if (result.responseType && responseTypeSelect) {
        responseTypeSelect.value = result.responseType;
      } else if (responseTypeSelect) {
        responseTypeSelect.value = 'balanced'; // Default to balanced
      }
      
      // Set language, default to English if not set
      if (result.language) {
        languageSelect.value = result.language;
      } else {
        languageSelect.value = 'en'; // Default to English
      }
      
      // Apply language to UI
      updateUILanguage(languageSelect.value);
    });
  }

  // Function to save settings to storage
  function saveSettings() {
    // Hide any previous messages
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    
    const provider = providerSelect.value;
    const temperature = temperatureInput.value;
    const language = languageSelect.value;
    const responseType = responseTypeSelect ? responseTypeSelect.value : 'balanced';
    
    // Get the current API keys and model versions
    let geminiApiKey = geminiApiKeyInput.value.trim();
    let perplexityApiKey = perplexityApiKeyInput.value.trim();
    let togetherApiKey = togetherApiKeyInput.value.trim();
    let anthropicApiKey = anthropicApiKeyInput.value.trim();
    
    // Handle model versions and custom models
    let geminiModelVersion = geminiModelVersionSelect.value;
    let geminiCustomModel = '';
    if (geminiModelVersion === 'custom') {
      geminiCustomModel = geminiCustomModelInput.value.trim();
    }
    
    let perplexityModelVersion = perplexityModelVersionSelect.value;
    let perplexityCustomModel = '';
    if (perplexityModelVersion === 'custom') {
      perplexityCustomModel = perplexityCustomModelInput.value.trim();
    }
    
    let togetherModelVersion = togetherModelVersionSelect.value;
    let togetherCustomModel = '';
    if (togetherModelVersion === 'custom') {
      togetherCustomModel = togetherCustomModelInput.value.trim();
    }
    
    let anthropicModelVersion = anthropicModelVersionSelect.value;
    let anthropicCustomModel = '';
    if (anthropicModelVersion === 'custom') {
      anthropicCustomModel = anthropicCustomModelInput.value.trim();
    }
    
    // Handle masked API keys
    function processMaskedKey(input, storageKey) {
      return new Promise((resolve) => {
        // If API key input is empty and was previously masked, keep the old value
        if (input.value === '' && input.dataset.masked === 'true') {
          chrome.storage.sync.get([storageKey], function(result) {
            resolve(result[storageKey] || '');
          });
        }
        // If API key starts with dots followed by the last 4 chars, it's still masked
        else if (input.value.startsWith('•') && input.value.endsWith(input.dataset.lastFour || '')) {
          chrome.storage.sync.get([storageKey], function(result) {
            resolve(result[storageKey] || '');
          });
        } else {
          // Otherwise use the value as is
          resolve(input.value.trim());
        }
      });
    }
    
    // Process all API keys
    Promise.all([
      processMaskedKey(geminiApiKeyInput, 'geminiApiKey'),
      processMaskedKey(perplexityApiKeyInput, 'perplexityApiKey'),
      processMaskedKey(togetherApiKeyInput, 'togetherApiKey'),
      processMaskedKey(anthropicApiKeyInput, 'anthropicApiKey')
    ]).then(([finalGeminiApiKey, finalPerplexityApiKey, finalTogetherApiKey, finalAnthropicApiKey]) => {
      // Now save all settings
      saveAllSettings(
        provider,
        finalGeminiApiKey, 
        geminiModelVersion,
        geminiCustomModel,
        finalPerplexityApiKey,
        perplexityModelVersion,
        perplexityCustomModel,
        finalTogetherApiKey,
        togetherModelVersion,
        togetherCustomModel,
        finalAnthropicApiKey,
        anthropicModelVersion,
        anthropicCustomModel,
        temperature,
        language,
        responseType
      );
    });
  }

  // Helper function to save all settings
  function saveAllSettings(
    provider,
    geminiApiKey, 
    geminiModelVersion,
    geminiCustomModel,
    perplexityApiKey,
    perplexityModelVersion,
    perplexityCustomModel,
    togetherApiKey,
    togetherModelVersion,
    togetherCustomModel,
    anthropicApiKey,
    anthropicModelVersion,
    anthropicCustomModel,
    temperature,
    language,
    responseType
  ) {
    // Get current language for error messages
    const lang = language || 'en';
    
    // Validate the active provider's API key format
    let activeApiKey = '';
    switch (provider) {
      case 'gemini':
        activeApiKey = geminiApiKey;
        break;
      case 'perplexity':
        activeApiKey = perplexityApiKey;
        break;
      case 'together':
        activeApiKey = togetherApiKey;
        break;
      case 'anthropic':
        activeApiKey = anthropicApiKey;
        break;
    }
    
    // If the active provider key is provided but too short, show error
    if (activeApiKey && activeApiKey.length < 20) {
      errorMessage.textContent = uiTranslations[lang].apiKeyTooShort;
      errorMessage.style.display = 'block';
      return;
    }
    
    // Save to Chrome storage
    chrome.storage.sync.set({
      provider: provider,
      geminiApiKey: geminiApiKey,
      geminiModelVersion: geminiModelVersion,
      geminiCustomModel: geminiCustomModel,
      perplexityApiKey: perplexityApiKey,
      perplexityModelVersion: perplexityModelVersion,
      perplexityCustomModel: perplexityCustomModel,
      togetherApiKey: togetherApiKey,
      togetherModelVersion: togetherModelVersion,
      togetherCustomModel: togetherCustomModel,
      anthropicApiKey: anthropicApiKey,
      anthropicModelVersion: anthropicModelVersion,
      anthropicCustomModel: anthropicCustomModel,
      temperature: temperature,
      language: language,
      responseType: responseType
    }, function() {
      // Check for any errors
      if (chrome.runtime.lastError) {
        errorMessage.textContent = uiTranslations[lang].errorMessage + ': ' + chrome.runtime.lastError.message;
        errorMessage.style.display = 'block';
      } else {
        // Show success message
        successMessage.style.display = 'block';
        
        // Mask the API keys for display
        if (geminiApiKey) {
          const masked = '•'.repeat(10) + geminiApiKey.slice(-4);
          geminiApiKeyInput.value = masked;
          geminiApiKeyInput.dataset.masked = 'true';
          geminiApiKeyInput.dataset.lastFour = geminiApiKey.slice(-4);
        }
        
        if (perplexityApiKey) {
          const masked = '•'.repeat(10) + perplexityApiKey.slice(-4);
          perplexityApiKeyInput.value = masked;
          perplexityApiKeyInput.dataset.masked = 'true';
          perplexityApiKeyInput.dataset.lastFour = perplexityApiKey.slice(-4);
        }
        
        if (togetherApiKey) {
          const masked = '•'.repeat(10) + togetherApiKey.slice(-4);
          togetherApiKeyInput.value = masked;
          togetherApiKeyInput.dataset.masked = 'true';
          togetherApiKeyInput.dataset.lastFour = togetherApiKey.slice(-4);
        }
        
        if (anthropicApiKey) {
          const masked = '•'.repeat(10) + anthropicApiKey.slice(-4);
          anthropicApiKeyInput.value = masked;
          anthropicApiKeyInput.dataset.masked = 'true';
          anthropicApiKeyInput.dataset.lastFour = anthropicApiKey.slice(-4);
        }
        
        // Update UI language
        updateUILanguage(language);
        
        // Hide success message after 3 seconds
        setTimeout(function() {
          successMessage.style.display = 'none';
        }, 3000);
      }
    });
  }
}); 