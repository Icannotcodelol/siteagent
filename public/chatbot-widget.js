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
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Chatbot';
    launcherBtn.appendChild(img);
    launcherBtn.style.backgroundColor = 'transparent';
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

  // fetch proactive message always; decide based on dismissal with current content
  {
    fetch(`${baseOrigin}/api/chatbots/${chatbotId}/public/proactive-message`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.content && !proactiveDismissed) {
          const delayMs = (data.delay || 5) * 1000
          setTimeout(() => {
            tryShowProactiveBubble(data.content, data.color)
          }, delayMs)
        }
      })
      .catch(() => {/* ignore */})
  }

  function tryShowProactiveBubble(message, bubbleColor) {
    // If user already opened the chat, do not show
    if (iframeContainer.style.display === 'flex') return

    // Check again if dismissed
    if (proactiveDismissed) return

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
           // Adjust close button color for light backgrounds
          const closeButton = bubble.querySelector('.siteagent-proactive-close');
          if (closeButton) {
            closeButton.style.color = '#374151'; // gray-700
          }
        } else {
          bubble.style.color = '#FFFFFF'; // Light text for dark backgrounds
           // Keep default close button color for dark backgrounds (or explicitly set)
           const closeButton = bubble.querySelector('.siteagent-proactive-close');
          if (closeButton) {
            closeButton.style.color = '#d1d5db'; // Default gray-300
          }
        }
      }
    }
    bubble.innerHTML = `<span class="siteagent-proactive-text">${message}</span><button class="siteagent-proactive-close" aria-label="Close proactive message">&times;</button>`

    document.body.appendChild(bubble)
    proactiveBubble = bubble; // store reference

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
    })
  }

  // Listen for messages from the iframe (e.g., to dismiss proactive bubble)
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
      console.log('[SiteAgent Widget] Received siteagent-user-interaction from iframe');
      if (proactiveBubble) {
        proactiveBubble.remove();
        proactiveBubble = null;
        proactiveDismissed = true; // Ensure it doesn't try to show again in this session
        console.log('[SiteAgent Widget] Proactive bubble removed due to iframe interaction.');
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