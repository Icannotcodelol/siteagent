(function () {
  // Identify the current script tag
  const currentScript = document.currentScript;
  if (!currentScript) {
    console.error('[SiteAgent Widget] Unable to identify current <script> tag.');
    return;
  }

  // Extract required attributes
  const chatbotId = currentScript.getAttribute('data-chatbot-id');
  if (!chatbotId) {
    console.error('[SiteAgent Widget] Missing required attribute: data-chatbot-id');
    return;
  }

  let launcherIcon = currentScript.getAttribute('data-launcher-icon');
  const primaryColor = currentScript.getAttribute('data-primary-color') || '#2563eb'; // default Tailwind blue-600

  // Compute base URL (origin where script is served)
  const baseOrigin = new URL(currentScript.src, window.location.href).origin;
  const embedUrl = `${baseOrigin}/embed/chatbot/${chatbotId}`;

  // ----- Create styles -----
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    .siteagent-chatbot-launcher-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      background-color: ${primaryColor};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2147483647; /* At the very top */
      /* Safari fix: Ensure widget doesn't get trapped in transform stacking context */
      transform: translateZ(0);
      will-change: transform;
    }
    .siteagent-agent-indicator {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 16px;
      height: 16px;
      background: white;
      border-radius: 50%;
      font-size: 10px;
      line-height: 16px;
      text-align: center;
    }
    .siteagent-chatbot-launcher-btn img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
    @keyframes siteagent-bounce {
      0% { transform: scale(1); }
      50% { transform: scale(0.88); }
      100% { transform: scale(1); }
    }
    .siteagent-chatbot-launcher-btn.siteagent-bouncing {
      animation: siteagent-bounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .siteagent-chatbot-iframe-container {
      position: fixed;
      bottom: 90px;
      right: 24px;
      width: 380px;
      height: 520px;
      max-width: calc(100vw - 48px);
      max-height: calc(100vh - 48px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      border-radius: 12px;
      overflow: hidden;
      z-index: 2147483646;
      display: none;
      flex-direction: column;
      /* Safari fix: Ensure widget doesn't get trapped in transform stacking context */
      transform: translateZ(0);
      will-change: transform;
    }
    .siteagent-chatbot-close-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0,0,0,0.6);
      color: #fff;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-size: 16px;
      line-height: 24px;
      text-align: center;
      cursor: pointer;
    }
  `;
  document.head.appendChild(styleTag);

  // ----- Create launcher button -----
  const launcherBtn = document.createElement('div');
  launcherBtn.className = 'siteagent-chatbot-launcher-btn';

  function applyIcon(url) {
    if (!url) return;
    // Clear previous content (SVG or old img)
    launcherBtn.innerHTML = ''; 
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Chatbot';
    // Style the image to fit the circular button
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.borderRadius = '50%'; // Ensure the image itself is circular if not already
    img.style.objectFit = 'cover';    // Cover the area, might crop

    launcherBtn.appendChild(img);
    launcherBtn.style.backgroundColor = 'transparent'; // Ensure background is transparent for the image
    launcherBtn.style.padding = '0'; // Remove padding if any was set for SVG
  }

  if (launcherIcon) {
    applyIcon(launcherIcon);
  } else {
    // Default SVG icon (simple chat bubble)
    launcherBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="24" height="24" style="color: white;">
        <path d="M12 3C6.48 3 2 6.91 2 11.5C2 13.72 3.02 15.73 4.7 17.19V21L9.11 18.28C10.03 18.59 11 18.75 12 18.75C17.52 18.75 22 14.84 22 10.25C22 5.66 17.52 1.75 12 1.75Z"></path>
      </svg>
    `;
  }
  document.body.appendChild(launcherBtn);

  // ----- Create iframe container -----
  const iframeContainer = document.createElement('div');
  iframeContainer.className = 'siteagent-chatbot-iframe-container';

  const iframe = document.createElement('iframe');
  iframe.src = embedUrl;
  iframe.style.border = 'none';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.setAttribute('allow', 'microphone');
  iframeContainer.appendChild(iframe);

  // Close button
  const closeBtn = document.createElement('div');
  closeBtn.className = 'siteagent-chatbot-close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => {
    iframeContainer.style.display = 'none';
  });
  iframeContainer.appendChild(closeBtn);

  document.body.appendChild(iframeContainer);

  // ----- Toggle behaviour -----
  launcherBtn.addEventListener('click', () => {
    // Click animation
    launcherBtn.classList.add('siteagent-bouncing');
    setTimeout(() => launcherBtn.classList.remove('siteagent-bouncing'), 300);
    const willOpen = (iframeContainer.style.display === 'none' || iframeContainer.style.display === '');
    if (willOpen) {
      iframeContainer.style.display = 'flex';
      // If proactive bubble exists, remove it and persist dismissal
      if (proactiveBubble) {
        proactiveBubble.remove();
        proactiveBubble = null;
        proactiveDismissed = true;
      }
      // Send a message to the iframe to focus the input
      setTimeout(() => {
        iframe.contentWindow?.postMessage({ type: 'siteagent-focus-input' }, baseOrigin);
      }, 100);
    } else {
      iframeContainer.style.display = 'none';
    }
  });

  // If no launcherIcon provided, fetch public meta to get avatar and other settings
  let chatFontFamily = 'sans-serif'; // Default font

  if (!launcherIcon) { // Assuming we fetch public-meta anyway for font, even if icon is provided.
    // Let's adjust this logic to always fetch public-meta if we need font_family
    fetch(`${baseOrigin}/api/chatbots/${chatbotId}/public-meta`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) {
          if (data.bot_avatar_url && !launcherIcon) {
            launcherIcon = data.bot_avatar_url;
            launcherBtn.innerHTML = '';
            applyIcon(launcherIcon);
          }
          if (data.font_family) {
            chatFontFamily = data.font_family;
          }
        }
      })
      .catch(() => {/* ignore */});
  } else {
    // Still fetch for font_family if launcher icon was provided via attribute
    fetch(`${baseOrigin}/api/chatbots/${chatbotId}/public-meta`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && data.font_family) {
          chatFontFamily = data.font_family;
        }
      })
      .catch(() => {/* ignore */});
  }

  // ----- Proactive Message Logic -----
  let proactiveBubble = null;
  let proactiveDismissed = false;
  
  console.log('[SiteAgent Widget] Initializing proactive message logic with:', {
    chatbotId,
    baseOrigin,
    embedUrl
  });

  // fetch proactive message always; decide based on dismissal with current content
  // Wait for DOM to be ready before fetching
  function initProactiveMessage() {
    console.log('[SiteAgent Widget] Fetching proactive message for chatbotId:', chatbotId, 'from:', `${baseOrigin}/api/chatbots/${chatbotId}/public/proactive-message`);
    fetch(`${baseOrigin}/api/chatbots/${chatbotId}/public/proactive-message`)
      .then((res) => {
        console.log('[SiteAgent Widget] Proactive message fetch response status:', res.status, res.ok);
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        console.log('[SiteAgent Widget] Proactive message data received:', data);
        if (data && data.content && !proactiveDismissed) {
          const delayMs = (data.delay || 5) * 1000;
          console.log('[SiteAgent Widget] Scheduling proactive message to show in', delayMs, 'ms');
          setTimeout(() => {
            console.log('[SiteAgent Widget] Attempting to show proactive bubble');
            tryShowProactiveBubble(data.content, data.color);
          }, delayMs);
        } else {
          console.log('[SiteAgent Widget] Not showing proactive message. Data:', !!data, 'Content:', data?.content, 'Dismissed:', proactiveDismissed);
        }
      })
      .catch((err) => {
        console.error('[SiteAgent Widget] Error fetching proactive message:', err);
      })
  }
  
  // Start proactive message logic after a small delay to ensure everything is loaded
  setTimeout(initProactiveMessage, 1000);

  function tryShowProactiveBubble(message, bubbleColor) {
    console.log('[SiteAgent Widget] tryShowProactiveBubble called with message:', message, 'color:', bubbleColor);
    console.log('[SiteAgent Widget] Current state - iframeContainer display:', iframeContainer.style.display, 'proactiveDismissed:', proactiveDismissed);
    
    // If user already opened the chat, do not show
    if (iframeContainer.style.display === 'flex') {
      console.log('[SiteAgent Widget] Not showing proactive bubble - chat is already open');
      return;
    }

    // Check again if dismissed
    if (proactiveDismissed) {
      console.log('[SiteAgent Widget] Not showing proactive bubble - already dismissed');
      return;
    }

    const bubble = document.createElement('div')
    bubble.className = 'siteagent-proactive-bubble'
    bubble.style.fontFamily = chatFontFamily; // Apply the fetched font family

    // Apply custom color if provided, otherwise CSS will use its default
    if (bubbleColor) {
      bubble.style.backgroundColor = bubbleColor;
      bubble.style.borderColor = `${bubbleColor} transparent transparent transparent`; // Ensure top border matches bubble color

      // Potentially adjust text color based on bubbleColor for contrast here
      // For simplicity, we'll assume light text on dark backgrounds or dark text on light backgrounds.
      // A more robust solution would calculate luminance and choose black/white text.
      // Also update the ::after pseudo-element for the speech bubble tail
      const existingStyleSheet = document.getElementById('siteagent-proactive-dynamic-styles');
      if (existingStyleSheet) {
        existingStyleSheet.remove();
      }
      const dynamicStyle = document.createElement('style');
      dynamicStyle.id = 'siteagent-proactive-dynamic-styles';
      dynamicStyle.textContent = `
        .siteagent-proactive-bubble[style*="background-color: ${bubbleColor}"]::after {
          border-top-color: ${bubbleColor};
        }
      `;
      document.head.appendChild(dynamicStyle);

      // Determine if the background color is light or dark to set text color
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      };

      const rgbColor = hexToRgb(bubbleColor);
      if (rgbColor) {
        // Formula for luminance
        const luminance = (0.299 * rgbColor.r + 0.587 * rgbColor.g + 0.114 * rgbColor.b) / 255;
        if (luminance > 0.5) {
          bubble.style.color = '#000000'; // Dark text for light backgrounds
        } else {
          bubble.style.color = '#FFFFFF'; // Light text for dark backgrounds
        }
      }
    }
    bubble.innerHTML = `<span class="siteagent-proactive-text">${message}</span><button class="siteagent-proactive-close" aria-label="Close proactive message">&times;</button>`

    // Apply close button color after innerHTML is set
    if (bubbleColor) {
      // Define hexToRgb function here too
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      };
      
      const rgbColor = hexToRgb(bubbleColor);
      if (rgbColor) {
        const luminance = (0.299 * rgbColor.r + 0.587 * rgbColor.g + 0.114 * rgbColor.b) / 255;
        const closeButton = bubble.querySelector('.siteagent-proactive-close');
        if (closeButton) {
          if (luminance > 0.5) {
            closeButton.style.color = '#374151'; // gray-700 for light backgrounds
          } else {
            closeButton.style.color = '#d1d5db'; // gray-300 for dark backgrounds
          }
        }
      }
    }

    document.body.appendChild(bubble)
    proactiveBubble = bubble; // store reference
    console.log('[SiteAgent Widget] Proactive bubble created and added to DOM');

    const closeBtn = bubble.querySelector('.siteagent-proactive-close')
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      bubble.remove()
      proactiveDismissed = true;
    })

    bubble.addEventListener('click', () => {
      bubble.remove()
      proactiveDismissed = true;
      // Open chat
      launcherBtn.click()
      // Focus input after opening
      setTimeout(() => {
        iframe.contentWindow?.postMessage({ type: 'siteagent-focus-input' }, baseOrigin);
      }, 200);
    })
  }

  // Listen for messages from the iframe (e.g., to dismiss proactive bubble or handle handoff)
  window.addEventListener('message', (event) => {
    // IMPORTANT: Always verify the origin of the message for security.
    // baseOrigin should be the origin where your iframe content is served from.
    if (event.origin !== baseOrigin) { 
      // If baseOrigin is not yet defined or doesn't match, you might need to queue or ignore.
      // For this specific use case, if baseOrigin isn't set, the iframe isn't loaded from expected origin.
      // console.warn('[SiteAgent Widget] Message received from unexpected origin:', event.origin, 'Expected:', baseOrigin);
      return;
    }

    if (event.data && event.data.type === 'siteagent-user-interaction') {
      if (proactiveBubble) {
        proactiveBubble.remove();
        proactiveBubble = null;
        proactiveDismissed = true; // Ensure it doesn't try to show again in this session
      }
    }
    
    // Handle hybrid mode notifications
    if (event.data && event.data.type === 'siteagent-agent-status') {
      if (event.data.agentActive) {
        // Show indicator that agent is active
        const indicator = document.createElement('div');
        indicator.className = 'siteagent-agent-indicator';
        indicator.innerHTML = '🟢';
        launcherBtn.appendChild(indicator);
      }
    }
  });

  // ----- Add event listener for messages from iframe (e.g., avatar updates) -----
  window.addEventListener('message', function(event) {
    // Optional: Check event.origin for security if you know the iframe's origin
    // For example: if (event.origin !== new URL(embedUrl).origin) return;

    if (event.data && event.data.type === 'siteagent-avatar-update') {
      if (event.data.avatarUrl) {
        launcherIcon = event.data.avatarUrl; // Update our launcherIcon variable
        applyIcon(event.data.avatarUrl);
      }
    }
  });

  // Add styles for proactive bubble
  const proactiveStyle = document.createElement('style')
  proactiveStyle.textContent = `
    .siteagent-proactive-bubble {
      position: fixed;
      bottom: 100px;
      right: 24px;
      max-width: 260px;
      /* Default background color, will be overridden by JS if custom color is set */
      background: #111827; /* gray-900 */
      color: #fff; /* Default text color */
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      padding: 12px 16px 12px 16px;
      font-size: 14px;
      line-height: 1.4;
      z-index: 2147483647;
      cursor: pointer;
      transition: transform 0.3s ease, opacity 0.3s ease;
      opacity: 0;
      transform: translateY(20px);
      animation: siteagent-proactive-fade-in 0.3s forwards;
      position:fixed;
      border-style: solid;
      /* Default border color for the tail, will be overridden by dynamic styles if custom color set */
      border-color: #111827 transparent transparent transparent;
      /* Safari fix: Ensure proactive bubble doesn't get trapped in transform stacking context */
      will-change: transform;
    }
    .siteagent-proactive-bubble .siteagent-proactive-close {
      position: absolute;
      top: 4px;
      right: 6px;
      background: transparent;
      border: none;
      color: #d1d5db;
      font-size: 14px;
      cursor: pointer;
    }
    .siteagent-proactive-bubble::after {
      content: '';
      position: absolute;
      right: 22px;
      bottom: -6px;
      border-width: 6px 6px 0 6px;
      border-style: solid;
      border-color: #111827 transparent transparent transparent;
    }
    @keyframes siteagent-proactive-fade-in {
      to { opacity: 1; transform: translateY(0); }
    }
  `
  document.head.appendChild(proactiveStyle)
})(); 