// DOM elements
document.addEventListener('DOMContentLoaded', function() {
  // Ensure UTF-8 encoding is properly set for the document
  if (document.characterSet !== 'UTF-8') {
    console.warn('Character encoding is not UTF-8: ' + document.characterSet);
  }
  
  // Provider selection elements
  const providerSelect = document.getElementById('provider');
  const geminiSettings = document.getElementById('gemini-settings');
  const togetherSettings = document.getElementById('together-settings');
  const anthropicSettings = document.getElementById('anthropic-settings');
  
  // Gemini elements
  const geminiApiKeyInput = document.getElementById('geminiApiKey');
  const geminiModelVersionSelect = document.getElementById('geminiModelVersion');
  const geminiCustomModelContainer = document.getElementById('gemini-custom-model-container');
  const geminiCustomModelInput = document.getElementById('geminiCustomModel');
  
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
  const chatLanguageSelect = document.getElementById('chatLanguage');
  const responseTypeSelect = document.getElementById('responseType');
  const saveButton = document.getElementById('saveButton');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');

  // Function to show the relevant provider settings
  function showProviderSettings(provider) {
    // Hide all provider settings first
    geminiSettings.style.display = 'none';
    togetherSettings.style.display = 'none';
    anthropicSettings.style.display = 'none';
    
    // Show the selected provider settings
    switch (provider) {
      case 'gemini':
        geminiSettings.style.display = 'block';
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
  
  // Handle chat language change
  chatLanguageSelect.addEventListener('change', function() {
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
      'togetherApiKey',
      'togetherModelVersion',
      'togetherCustomModel',
      'anthropicApiKey',
      'anthropicModelVersion',
      'anthropicCustomModel',
      'temperature',
      'chatLanguage',
      'responseType'
    ], function(result) {
      // Set provider if saved
      if (result.provider) {
        providerSelect.value = result.provider;
        showProviderSettings(result.provider);
      }
      
      // Set API keys if saved (masked)
      if (result.geminiApiKey) {
        geminiApiKeyInput.value = '••••••••';
        geminiApiKeyInput.dataset.masked = 'true';
      }
      
      if (result.togetherApiKey) {
        togetherApiKeyInput.value = '••••••••';
        togetherApiKeyInput.dataset.masked = 'true';
      }
      
      if (result.anthropicApiKey) {
        anthropicApiKeyInput.value = '••••••••';
        anthropicApiKeyInput.dataset.masked = 'true';
      }
      
      // Set model versions if saved
      if (result.geminiModelVersion) {
        geminiModelVersionSelect.value = result.geminiModelVersion;
        toggleCustomModelField(geminiModelVersionSelect, geminiCustomModelContainer);
      }
      
      if (result.togetherModelVersion) {
        togetherModelVersionSelect.value = result.togetherModelVersion;
        toggleCustomModelField(togetherModelVersionSelect, togetherCustomModelContainer);
      }
      
      if (result.anthropicModelVersion) {
        anthropicModelVersionSelect.value = result.anthropicModelVersion;
        toggleCustomModelField(anthropicModelVersionSelect, anthropicCustomModelContainer);
      }
      
      // Set custom models if saved
      if (result.geminiCustomModel) {
        geminiCustomModelInput.value = result.geminiCustomModel;
      }
      
      if (result.togetherCustomModel) {
        togetherCustomModelInput.value = result.togetherCustomModel;
      }
      
      if (result.anthropicCustomModel) {
        anthropicCustomModelInput.value = result.anthropicCustomModel;
      }
      
      // Set temperature if saved
      if (result.temperature) {
        temperatureInput.value = result.temperature;
        temperatureValueSpan.textContent = result.temperature;
      }
      
      // Set chat language if saved
      if (result.chatLanguage) {
        chatLanguageSelect.value = result.chatLanguage;
      }
      
      // Set response type if saved
      if (result.responseType) {
        responseTypeSelect.value = result.responseType;
      }
    });
  }

  // Function to save settings
  async function saveSettings() {
    const provider = providerSelect.value;
    
    try {
      // Process API keys (keep existing if masked)
      const geminiApiKey = await processMaskedKey(geminiApiKeyInput, 'geminiApiKey');
      const togetherApiKey = await processMaskedKey(togetherApiKeyInput, 'togetherApiKey');
      const anthropicApiKey = await processMaskedKey(anthropicApiKeyInput, 'anthropicApiKey');
      
      // Get model versions
      const geminiModelVersion = geminiModelVersionSelect.value;
      const togetherModelVersion = togetherModelVersionSelect.value;
      const anthropicModelVersion = anthropicModelVersionSelect.value;
      
      // Get custom models
      const geminiCustomModel = geminiCustomModelInput.value;
      const togetherCustomModel = togetherCustomModelInput.value;
      const anthropicCustomModel = anthropicCustomModelInput.value;
      
      // Get other settings
      const temperature = temperatureInput.value;
      const chatLanguage = chatLanguageSelect.value;
      const responseType = responseTypeSelect.value;
      
      // Validate API key lengths
      if (geminiApiKey && !geminiApiKey.startsWith('••••') && geminiApiKey.length < 20) {
        errorMessage.textContent = 'Gemini API key seems too short. Please check your key.';
        errorMessage.style.display = 'block';
        return;
      }
      
      if (togetherApiKey && !togetherApiKey.startsWith('••••') && togetherApiKey.length < 20) {
        errorMessage.textContent = 'Together AI API key seems too short. Please check your key.';
        errorMessage.style.display = 'block';
        return;
      }
      
      if (anthropicApiKey && !anthropicApiKey.startsWith('••••') && anthropicApiKey.length < 20) {
        errorMessage.textContent = 'Anthropic API key seems too short. Please check your key.';
        errorMessage.style.display = 'block';
        return;
      }
      
      // Save all settings
      saveAllSettings(
        provider,
        geminiApiKey,
        geminiModelVersion,
        geminiCustomModel,
        togetherApiKey,
        togetherModelVersion,
        togetherCustomModel,
        anthropicApiKey,
        anthropicModelVersion,
        anthropicCustomModel,
        temperature,
        chatLanguage,
        responseType
      );
    } catch (error) {
      console.error('Error saving settings:', error);
      errorMessage.textContent = 'Error saving settings. Please try again.';
      errorMessage.style.display = 'block';
    }
  }

  // Function to process masked API keys
  function processMaskedKey(input, storageKey) {
    if (input.dataset.masked === 'true') {
      return new Promise((resolve) => {
        chrome.storage.sync.get([storageKey], function(result) {
          resolve(result[storageKey] || '');
        });
      });
    }
    return input.value || '';
  }

  // Function to save all settings to storage
  function saveAllSettings(
    provider,
    geminiApiKey,
    geminiModelVersion,
    geminiCustomModel,
    togetherApiKey,
    togetherModelVersion,
    togetherCustomModel,
    anthropicApiKey,
    anthropicModelVersion,
    anthropicCustomModel,
    temperature,
    chatLanguage,
    responseType
  ) {
    chrome.storage.sync.set({
      provider: provider,
      geminiApiKey: geminiApiKey,
      geminiModelVersion: geminiModelVersion,
      geminiCustomModel: geminiCustomModel,
      togetherApiKey: togetherApiKey,
      togetherModelVersion: togetherModelVersion,
      togetherCustomModel: togetherCustomModel,
      anthropicApiKey: anthropicApiKey,
      anthropicModelVersion: anthropicModelVersion,
      anthropicCustomModel: anthropicCustomModel,
      temperature: temperature,
      chatLanguage: chatLanguage,
      responseType: responseType
    }, function() {
      if (chrome.runtime.lastError) {
        errorMessage.textContent = 'Error saving settings. Please try again.';
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
      } else {
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
      }
    });
  }
}); 