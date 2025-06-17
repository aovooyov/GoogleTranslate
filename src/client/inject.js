// eslint-disable-next-line no-undef
iframeDOM = {
  clearTextArea: () => {
    try {
      const clearButton =
        document.querySelector('[aria-label="Clear source text"]') ||
        document.querySelector('[data-testid="clear-button"]') ||
        document.querySelector('button[aria-label*="Clear"]');
      if (clearButton) {
        clearButton.click();
      } else {
        // Fallback method
        const buttons = document.getElementsByTagName('button');
        for (let i = 0; i < buttons.length; i++) {
          const ariaLabel = buttons[i].getAttribute('aria-label');
          if (ariaLabel && (ariaLabel.includes('Clear') || ariaLabel.includes('clear'))) {
            buttons[i].click();
            break;
          }
        }
      }
    } catch (error) {
      console.log('Error clearing text:', error);
    }
  },
  getURL: () => window.location.hash,
  setURL: arg => {
    window.location.hash = arg;
  },
};

window.addEventListener('DOMContentLoaded', () => {
  function hideElementsByHeight() {
    const heightsToHide = ['48px', '56px', '64px', '68px'];

    heightsToHide.forEach(height => {
      // Find elements with inline styles
      const elementsWithHeight = document.querySelectorAll(`[style*="height: ${height}"], [style*="height:${height}"]`);

      elementsWithHeight.forEach(el => {
        el.style.height = '0';
        el.style.display = 'none';
        console.log('deletePageContents: Hidden element with height:', height, el);
      });
    });

    // Hide elements with specific padding: 8px 12px 28px
    const elementsWithPadding = document.querySelectorAll(
      `[style*="padding: 8px 12px 28px"], [style*="padding:8px 12px 28px"]`
    );
    elementsWithPadding.forEach(el => {
      el.style.display = 'none';
      el.style.height = '0';
      el.style.padding = '0';
      console.log('deletePageContents: Hidden element with padding 8px 12px 28px:', el);
    });

    // Also check computed styles
    const allDivs = document.querySelectorAll('div');
    allDivs.forEach(div => {
      const computedHeight = window.getComputedStyle(div).height;
      const computedPadding = window.getComputedStyle(div).padding;

      // Check height
      if (['56px', '64px'].includes(computedHeight)) {
        div.style.height = '0';
        div.style.display = 'none';
        console.log('deletePageContents: Hidden div with computed height:', computedHeight, div);
      }

      // Check padding
      if (computedPadding === '8px 12px 28px') {
        div.style.display = 'none';
        div.style.height = '0';
        div.style.padding = '0';
        console.log('deletePageContents: Hidden div with computed padding 8px 12px 28px:', div);
      }
    });
  }

  function hideElementsSoySkip() {
    // Find all <div soy-skip> elements
    // data-language-code
    const languageCodeElements = Array.from(document.querySelectorAll('div[data-language-code]')).filter(div =>
      div.querySelector('svg')
    );
    if (languageCodeElements.length > 0) {
      languageCodeElements.forEach(div => {
        div.style.display = 'none';
        div.style.height = '0';
        div.style.padding = '0';
      });

      const parent = languageCodeElements[0].parentElement;
      if (!parent) return;

      // Hide two last children of the parent element
      const children = Array.from(parent.children);
      if (children.length > 1) {
        const secondLastChild = children[children.length - 2];
        const lastChild = children[children.length - 1];

        secondLastChild.style.display = 'none';
        secondLastChild.style.height = '0';
        secondLastChild.style.padding = '0';

        lastChild.style.display = 'none';
        lastChild.style.height = '0';
        lastChild.style.padding = '0';
      }
    }

    const soySkipElements = Array.from(document.querySelectorAll('div[soy-skip]')).filter(div =>
      div.querySelector('svg')
    );
    if (soySkipElements.length > 0) {
      const parent = soySkipElements[0].parentElement;
      if (!parent) return;

      // Hide the parent element
      parent.style.display = 'none';
      parent.style.height = '0';
    }

    // Get all child elements of this parent
    // const children = Array.from(parent.children);
    // if (children.length === 0) return;

    // // Hide the first child
    // const firstChild = children[0];
    // firstChild.style.display = 'none';
    // firstChild.style.height = '0';
    // firstChild.style.width = '0';

    // const secondChild = children[1];
    // if (secondChild) {
    //   secondChild.style.display = 'none';
    //   secondChild.style.height = '0';
    //   secondChild.style.paddingRight = '10px';
    // }

    // // Hide the last child (if different from the first)
    // const lastChild = children[children.length - 1];
    // if (lastChild && lastChild !== firstChild) {
    //   lastChild.style.display = 'none';
    //   lastChild.style.height = '0';
    //   lastChild.style.paddingRight = '10px';
    // }
  }

  hideElementsByHeight();
  hideElementsSoySkip();

  const observer = new MutationObserver(() => {
    hideElementsSoySkip();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['soy-skip', 'data-language-code'],
  });
});
