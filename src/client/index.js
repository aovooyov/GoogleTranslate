// eslint-disable-next-line import/no-extraneous-dependencies
const { ipcRenderer } = require('electron');

const webview = document.querySelector('#webview');

console.log('Webview element found:', webview);

// For webview use dom-ready
webview.addEventListener('dom-ready', () => {
  // webview.openDevTools();
  try {
    webview.focus();

    // Inject CSS to hide unnecessary elements and add transparency
    webview.insertCSS(`
      /* Hide unnecessary Google Translate elements */
      header { display: none !important; height: 0 !important; border: none !important; }
      nav { display: none !important; height: 0 !important; }
      nav:last-of-type { display: none !important; height: 0 !important; }
      .gp-footer { display: none !important; height: 0 !important; }
      .feedback-link { display: none !important; height: 0 !important; }
      [aria-haspopup] { display: none !important; }
      // body { transform: translateY(-112px) !important; }
      .frame { height: 100vh !important; }
      
      *, *::before, *::after {
        background-color: transparent !important;
        background-image: none !important;
      }
      
      div, span, section, article, main {
        background-color: transparent !important;
        background: transparent !important;
        color: white !important;
        border: none !important;
      }
      
      c-wiz, c-wiz[data-p] {
        background: transparent !important;
        background-color: transparent !important;
      }
      
      /* Remove white backgrounds */
      *[style*="background-color: white"],
      *[style*="background-color: #fff"],
      *[style*="background-color: rgb(255, 255, 255)"] {
        background-color: transparent !important;
      }

      textarea, input {
        color: white !important;
        font-size: 16px !important;
      }
    `);
  } catch (error) {
    console.log('Error injecting CSS:', error);
  }
});

// Handle messages for text clearing
ipcRenderer.on('CLEAR_TEXT_AREA', () => {
  try {
    webview.executeJavaScript(`
      const clearBtn = document.querySelector('[aria-label*="Clear"]') || 
                      document.querySelector('[data-testid="clear-button"]');
      if (clearBtn) clearBtn.click();
    `);
  } catch (error) {
    console.log('Cannot clear text area:', error);
  }
});

window.addEventListener('online', () => {
  webview.classList.remove('hide');
});

window.addEventListener('offline', () => {
  webview.classList.add('hide');
});
