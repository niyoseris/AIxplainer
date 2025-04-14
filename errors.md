# Extension Development Error Log

This file tracks errors encountered during the development of the AI Text Assistant Chrome Extension.

## Error List
- UTF-8 encoding issues with Turkish characters in settings page and popup
- Anthropic Claude API integration issues
- Response type selector not persisting user choice
- Custom model names not being recognized by API providers
- Resize dropdown menu showing on hover instead of click

## Common Solutions
- Check manifest.json for correct permissions
- Verify content script injection
- Confirm background script registration
- Test API endpoints separately
- Check console for JavaScript errors 

# Common Errors and Solutions

## UTF-8 Encoding Issues

### Problem
Turkish characters (and potentially other non-ASCII characters) not displaying correctly in the settings page and UI elements.

### Solution
1. Ensure HTML files have proper UTF-8 encoding declarations:
   - Add `<meta charset="UTF-8">` in the `<head>` section
   - Add proper Content-Type meta tag: `<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">`
   - Add language attribute to HTML tag: `<html lang="en">`

2. Make sure all JavaScript strings containing non-ASCII characters use proper UTF-8 encoding:
   - Verify all translation strings are properly encoded
   - Use `getTranslation()` function consistently throughout the codebase
   - Store translations in well-structured objects

3. For file saving/loading with non-ASCII characters:
   - Chrome storage API handles UTF-8 correctly by default
   - Ensure proper encoding when displaying stored values in UI elements
   - Load the language preference before rendering any UI

4. Applied fixes:
   - Added proper meta tags to all HTML files (options.html, popup.html)
   - Enhanced options.js with proper character encoding handling
   - Added UTF-8 encoding check on page load
   - Expanded popup.js with comprehensive language support
   - Fixed content.js to correctly handle UTF-8 characters in all UI elements

### Prevention
- Always use UTF-8 encoding for all HTML, CSS, and JavaScript files
- Test the application with non-ASCII characters regularly
- Use translation management functions consistently
- Add UTF-8 encoding verification in JavaScript code
- Store language preference in Chrome storage and apply consistently

## Anthropic Claude API Integration Issues

### Problem
Errors when attempting to communicate with the Anthropic Claude API, such as 400/401/403 responses, rate limiting, or unexpected response formats.

### Solution
1. Authentication issues (401 errors):
   - Ensure the API key is correctly formatted and valid
   - Verify the API key is being sent in the correct header format (`x-api-key: {api_key}`)
   - Check that the API key has the proper permissions in the Anthropic Console

2. Request formatting issues (400 errors):
   - Verify the API version header is correct (`anthropic-version: 2023-06-01`)
   - Ensure the model name is valid and available to your account (check Anthropic console)
   - Confirm the message format follows Claude's requirements:
     - Messages array with proper user/assistant roles
     - System prompt is properly set
     - Temperature is within the valid range (0.0 to 1.0)

3. Response parsing issues:
   - Claude API returns data with content in an array format
   - Each content item has a type field (e.g., "text")
   - Ensure proper error handling if the response format changes

4. Rate limiting (429 errors):
   - Implement backoff strategy for retry logic
   - Check rate limits on your Anthropic account tier
   - Consider adding request throttling for heavy usage scenarios

### Prevention
- Test API calls with sample requests before integrating
- Keep Anthropic API documentation handy for reference: https://docs.anthropic.com/claude/reference/
- Monitor API usage in Anthropic Console
- Implement proper error handling with user-friendly error messages
- Consider adding a fallback mechanism to switch to another provider if Claude is unavailable

## Response Type Selector Issues

### Problem
Settings for response type (balanced, concise, detailed, etc.) not being properly saved or applied to API requests. Users may experience:
- Default response type not persisting after browser restart
- Selected response type in chat interface not being applied to responses
- Inconsistent response formats from different AI providers

### Solution
1. Storage issues:
   - Ensure the response type is properly saved to Chrome storage
   - Verify the loadSettings function properly reads the stored response type
   - Check that the saved value is properly applied to the selector on load

2. API request issues:
   - Confirm response type is being included in API requests to all providers
   - Verify proper formatting of response type instructions for each API
   - Check that the response type is passed correctly from content script to background script

3. UI issues:
   - Ensure response type selector in chat interface is properly initialized with saved default
   - Verify event listeners are correctly attached to the selector
   - Check for proper translation of response type options based on language setting

### Prevention
- Test response type persistence by restarting browser
- Verify consistent response formats across all AI providers
- Add proper console logging for debugging response type issues
- Include response type in all relevant storage operations and API requests

## Custom Model Name Issues

### Problem
Custom model names entered by users may not be properly recognized by AI providers, causing API errors or unexpected behavior. Users may experience:
- 404 errors for non-existent models
- Permission errors for models they don't have access to
- Inconsistent behavior when switching between standard and custom models

### Solution
1. Validation issues:
   - Add client-side validation for custom model name format
   - Provide feedback when a model name is likely incorrect 
   - Consider adding a test API call to verify model access before saving

2. Storage issues:
   - Ensure custom model names are properly saved to Chrome storage
   - Verify the loadSettings function properly restores custom model settings
   - Add clear error handling if a saved custom model is no longer available

3. API request issues:
   - Properly format model names according to each provider's requirements
   - Add additional error handling specifically for model-related API errors
   - Consider fallback to a default model if a custom model fails

### Prevention
- Document the exact format required for each provider's model names
- Provide examples of correct model names in the UI
- Add warning about account permissions when using custom models
- Test multiple model variants for each provider

## UI Interaction Issues

### Problem
Inconsistent behavior in UI elements, particularly the resize dropdown menu showing on hover instead of click which is not intuitive for some users.

### Solution
1. Fixed resize dropdown menu:
   - Removed CSS hover-based display behavior
   - Implemented click-based toggle functionality
   - Added event listener to handle clicks outside the dropdown
   - Added proper event propagation stopping
   - Ensured dropdown menu closes after selecting an option

2. UI button layout:
   - Reorganized buttons to be in a horizontal layout
   - Improved spacing and styling for better visual hierarchy
   - Removed redundant controls and simplified the interface

3. Visual improvements:
   - Added multiple size presets (small, medium, large)
   - Implemented manual resize handle
   - Fixed styling inconsistencies across different parts of the UI

### Prevention
- Test UI interactions across different browsers
- Consider different input methods (mouse, touch)
- Implement consistent interaction patterns
- Use clear visual indicators for interactive elements 