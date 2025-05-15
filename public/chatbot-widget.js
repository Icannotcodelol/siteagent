(function () {
  // Identify the current script tag
  const currentScript = document.currentScript;
  if (!currentScript) {
    console.error('[Redario Widget] Unable to identify current <script> tag.');
    return;
  }

  // Extract required attributes
  const chatbotId = currentScript.getAttribute('data-chatbot-id');
  if (!chatbotId) {
    console.error('[Redario Widget] Missing required attribute: data-chatbot-id');
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
    .redario-chatbot-launcher-btn {
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
    .redario-chatbot-launcher-btn img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
    @keyframes redario-bounce {
      0% { transform: scale(1); }
      50% { transform: scale(0.88); }
      100% { transform: scale(1); }
    }
    .redario-chatbot-launcher-btn.redario-bouncing {
      animation: redario-bounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .redario-chatbot-iframe-container {
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
    .redario-chatbot-close-btn {
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
  launcherBtn.className = 'redario-chatbot-launcher-btn';

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
  iframeContainer.className = 'redario-chatbot-iframe-container';

  const iframe = document.createElement('iframe');
  iframe.src = embedUrl;
  iframe.style.border = 'none';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.setAttribute('allow', 'microphone');
  iframeContainer.appendChild(iframe);

  // Close button
  const closeBtn = document.createElement('div');
  closeBtn.className = 'redario-chatbot-close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => {
    iframeContainer.style.display = 'none';
  });
  iframeContainer.appendChild(closeBtn);

  document.body.appendChild(iframeContainer);

  // ----- Toggle behaviour -----
  launcherBtn.addEventListener('click', () => {
    // Click animation
    launcherBtn.classList.add('redario-bouncing');
    setTimeout(() => launcherBtn.classList.remove('redario-bouncing'), 300);
    if (iframeContainer.style.display === 'none' || iframeContainer.style.display === '') {
      iframeContainer.style.display = 'flex';
    } else {
      iframeContainer.style.display = 'none';
    }
  });

  // If no launcherIcon provided, fetch public meta to get avatar
  if (!launcherIcon) {
    fetch(`${baseOrigin}/api/chatbots/${chatbotId}/public-meta`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && data.bot_avatar_url) {
          launcherIcon = data.bot_avatar_url;
          // Remove default icon (svg) and replace
          launcherBtn.innerHTML = '';
          applyIcon(launcherIcon);
        }
      })
      .catch(() => {/* ignore */});
  }
})(); 