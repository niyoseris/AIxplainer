/**
 * A simple markdown parser for Gemini AI responses
 */
class MarkdownParser {
  constructor() {
    // Regular expressions for parsing markdown
    this.rules = [
      // Headers: # Header 1, ## Header 2, etc.
      { pattern: /^(#{1,6})\s+(.+)$/gm, replacement: (match, p1, p2) => `<h${p1.length}>${p2}</h${p1.length}>` },
      
      // Bold: **text** or __text__
      { pattern: /\*\*(.+?)\*\*|__(.+?)__/g, replacement: (match, p1, p2) => `<strong>${p1 || p2}</strong>` },
      
      // Italic: *text* or _text_
      { pattern: /\*(.+?)\*|_(.+?)_/g, replacement: (match, p1, p2) => `<em>${p1 || p2}</em>` },
      
      // Code blocks: ```code```
      { pattern: /```([\s\S]+?)```/g, replacement: (match, p1) => `<pre><code>${this.escapeHtml(p1)}</code></pre>` },
      
      // Inline code: `code`
      { pattern: /`([^`]+)`/g, replacement: (match, p1) => `<code>${this.escapeHtml(p1)}</code>` },
      
      // Lists: - item or * item or 1. item
      { pattern: /^(\s*)([-*+]|\d+\.)\s+(.+)$/gm, replacement: (match, p1, p2, p3) => {
        const isOrdered = /\d+\./.test(p2);
        return `${p1}<li>${p3}</li>`;
      }},
      
      // Paragraphs: Split by empty lines and wrap in p tags
      { pattern: /^(?!\s*$)(?!<h\d|<li|<pre)(.+)$/gm, replacement: (match, p1) => `<p>${p1}</p>` },
      
      // Links: [text](url)
      { pattern: /\[(.+?)\]\((.+?)\)/g, replacement: (match, p1, p2) => `<a href="${p2}" target="_blank">${p1}</a>` },
      
      // Images: ![alt](url)
      { pattern: /!\[(.+?)\]\((.+?)\)/g, replacement: (match, p1, p2) => `<img src="${p2}" alt="${p1}">` },
      
      // Blockquotes: > text
      { pattern: /^>\s+(.+)$/gm, replacement: (match, p1) => `<blockquote>${p1}</blockquote>` },
      
      // Horizontal rule: --- or *** or ___
      { pattern: /^(\*{3,}|_{3,}|-{3,})$/gm, replacement: () => `<hr>` }
    ];
  }
  
  // Escape HTML special characters
  escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  
  // Process lists to properly wrap them in ul/ol tags
  processList(html) {
    // Process unordered lists
    html = html.replace(/<li>(.+?)<\/li>/g, (match, p1) => {
      // Check if it's already wrapped in a list
      if (match.match(/<ul>|<ol>/)) return match;
      return `<ul><li>${p1}</li></ul>`;
    });
    
    // Combine consecutive list items
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    
    return html;
  }
  
  // Parse markdown to HTML
  parse(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Apply all rules
    for (const rule of this.rules) {
      html = html.replace(rule.pattern, rule.replacement);
    }
    
    // Process lists after all other rules
    html = this.processList(html);
    
    return html;
  }
}

// Export the parser
const markdownParser = new MarkdownParser(); 