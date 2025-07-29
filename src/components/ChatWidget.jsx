import { useEffect } from 'react';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';

const ChatWidget = () => {
  useEffect(() => {
    // Note: There's a CORS issue when running locally. The chat will work properly when deployed to https://demo.shiftgears.ai
    try {
      createChat({
        webhookUrl: 'https://dealmx.app.n8n.cloud/webhook/852922ca-1f2d-4c85-a02b-863ca4d3c7eb/chat',
        target: '.chat-widget',
        mode: 'window',
        showWelcomeScreen: true,
        chatInputKey: 'chatInput',
        chatSessionKey: 'sessionId',
        webhookConfig: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      });
    } catch (error) {
      console.warn('N8N Chat initialization error (expected in localhost):', error);
    }

    // Debug function to inspect n8n chat elements
    window.debugN8nChat = () => {
      console.log('=== N8N Chat Debug ===');
      
      // Find all elements with n8n in class
      const n8nElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.className && el.className.toString().toLowerCase().includes('n8n')
      );
      
      console.log('Found n8n elements:', n8nElements);
      
      // Check for iframes
      const iframes = document.querySelectorAll('iframe');
      console.log('Found iframes:', iframes);
      
      // Check specific selectors
      const selectors = [
        '.n8n-chat-window',
        '.n8n-chat-button',
        '.n8n-chat-input',
        '.n8n-chat-input textarea',
        '.n8n-chat-input button',
        '[class*="n8n-chat"]',
        '.chat-widget'
      ];
      
      selectors.forEach(selector => {
        const el = document.querySelector(selector);
        console.log(`${selector}:`, el);
      });
    };
    
    // Expose method to open chat with message
    window.openChatWithMessage = (message) => {
      console.log('openChatWithMessage called with:', message);
      
      // First, let's find what elements exist
      window.debugN8nChat();
      
      // Try to open the chat using only the proper button click
      const openChat = () => {
        // Only use button clicking to maintain proper Vue state
        const triggerSelectors = [
          '.chat-window-toggle button',
          '.chat-button',
          '.chat-window-toggle'
        ];
        
        for (const selector of triggerSelectors) {
          const button = document.querySelector(selector);
          if (button) {
            console.log('Found chat toggle button:', selector, button);
            
            // Check if chat is already open
            const chatWindow = document.querySelector('.chat-window');
            const isOpen = chatWindow && chatWindow.style.display !== 'none';
            
            if (isOpen) {
              console.log('Chat is already open');
              return true;
            }
            
            // Try multiple approaches to ensure the chat opens visually
            const attemptOpen = () => {
              try {
                // Try different event types that Vue might be listening for
                const events = ['click', 'mousedown', 'mouseup'];
                
                events.forEach(eventType => {
                  const event = new MouseEvent(eventType, {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    detail: 1
                  });
                  button.dispatchEvent(event);
                });
                
                console.log('Dispatched multiple mouse events');
                
                // Also try the direct click
                button.click();
                console.log('Clicked chat button directly');
                
              } catch (error) {
                console.log('Error with button interaction:', error);
              }
            };
            
            // First attempt
            attemptOpen();
            
            // Check if window opened, if not try again with focus
            setTimeout(() => {
              const chatWindow = document.querySelector('.chat-window');
              if (chatWindow && chatWindow.style.display === 'none') {
                console.log('Chat window still hidden, trying focused approach');
                
                // Try focusing the button first, then clicking
                button.focus();
                setTimeout(() => {
                  button.click();
                  
                  // Last resort: force the window to show
                  setTimeout(() => {
                    const chatWindow2 = document.querySelector('.chat-window');
                    if (chatWindow2 && chatWindow2.style.display === 'none') {
                      console.log('Forcing chat window to show');
                      chatWindow2.style.display = 'block';
                      chatWindow2.style.visibility = 'visible';
                    }
                  }, 200);
                }, 100);
              }
            }, 300);
            
            return true;
          }
        }
        
        console.log('No chat toggle button found');
        return false;
      };
      
      // Open the chat
      openChat();
      
      // Wait longer for chat to properly open and Vue components to initialize
      setTimeout(() => {
        console.log('Looking for chat input field...');
        
        // Run debug again to see current state
        window.debugN8nChat();
        
        // Find the input field with multiple attempts
        let chatInput = null;
        const inputSelectors = [
          'textarea[data-test-id="chat-input"]',
          '.chat-input textarea',
          '.chat-inputs textarea', 
          '[class*="n8n-chat"] textarea',
          '.n8n-chat textarea'
        ];
        
        for (const selector of inputSelectors) {
          chatInput = document.querySelector(selector);
          if (chatInput) {
            console.log('Found chat input with selector:', selector, chatInput);
            break;
          }
        }
        
        if (!chatInput) {
          console.log('No chat input found, searching all textareas...');
          const allTextareas = document.querySelectorAll('textarea');
          console.log('All textareas found:', allTextareas);
          
          // Try to find textarea with chat-related placeholder
          for (const textarea of allTextareas) {
            if (textarea.placeholder && 
                (textarea.placeholder.toLowerCase().includes('question') || 
                 textarea.placeholder.toLowerCase().includes('message') ||
                 textarea.placeholder.toLowerCase().includes('type'))) {
              chatInput = textarea;
              console.log('Found chat input by placeholder:', chatInput);
              break;
            }
          }
        }
        
        if (chatInput) {
          console.log('Setting message in input:', message);
          
          // Focus first to ensure the field is active
          chatInput.focus();
          
          // Clear existing content
          chatInput.value = '';
          
          // Set the new message
          chatInput.value = message;
          
          // Trigger multiple events to ensure Vue/React components detect the change
          chatInput.dispatchEvent(new Event('input', { bubbles: true }));
          chatInput.dispatchEvent(new Event('change', { bubbles: true }));
          chatInput.dispatchEvent(new Event('keyup', { bubbles: true }));
          
          console.log('Message set, current value:', chatInput.value);
          
          // Try to submit the message after a longer delay
          setTimeout(() => {
            console.log('Looking for send button...');
            
            // Look for send button with more selectors
            const sendSelectors = [
              '.chat-inputs-controls button',
              '.chat-input button',
              '.chat-footer button',
              'button[type="submit"]',
              'button[aria-label*="send" i]',
              'button[title*="send" i]'
            ];
            
            let sendButton = null;
            for (const selector of sendSelectors) {
              sendButton = document.querySelector(selector);
              if (sendButton) {
                console.log('Found send button with selector:', selector, sendButton);
                break;
              }
            }
            
            if (sendButton && !sendButton.disabled) {
              console.log('Clicking send button');
              sendButton.click();
            } else {
              console.log('Send button not found or disabled, trying Enter key');
              
              // Try pressing Enter
              const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true
              });
              
              chatInput.dispatchEvent(enterEvent);
              console.log('Dispatched Enter key event');
            }
          }, 500);
        } else {
          console.log('Could not find chat input field');
        }
      }, 2500); // Increased delay to ensure Vue components are fully initialized
    };

    return () => {
      window.openChatWithMessage = undefined;
    };
  }, []);

  return <div className="chat-widget"></div>;
};

export default ChatWidget;

