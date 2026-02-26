// Accessibility utilities and helpers

// Focus management
export const focusManagement = {
  // Trap focus within an element
  trapFocus: (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener("keydown", handleTabKey);
    firstElement?.focus();

    return () => element.removeEventListener("keydown", handleTabKey);
  },

  // Restore focus to previous element
  restoreFocus: (element) => {
    if (element) {
      element.focus();
    }
  },

  // Get next focusable element
  getNextFocusable: (currentElement) => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const currentIndex = Array.from(focusableElements).indexOf(currentElement);
    return focusableElements[currentIndex + 1] || focusableElements[0];
  },

  // Get previous focusable element
  getPreviousFocusable: (currentElement) => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const currentIndex = Array.from(focusableElements).indexOf(currentElement);
    return (
      focusableElements[currentIndex - 1] ||
      focusableElements[focusableElements.length - 1]
    );
  },
};

// ARIA utilities
export const ariaUtils = {
  // Announce message to screen readers
  announce: (message, priority = "polite") => {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Set ARIA attributes
  setAriaAttributes: (element, attributes) => {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  },

  // Update ARIA live region
  updateLiveRegion: (element, message) => {
    element.textContent = message;
  },

  // Toggle ARIA expanded
  toggleExpanded: (element) => {
    const isExpanded = element.getAttribute("aria-expanded") === "true";
    element.setAttribute("aria-expanded", !isExpanded);
    return !isExpanded;
  },
};

// Keyboard navigation
export const keyboardNavigation = {
  // Handle arrow key navigation
  handleArrowKeys: (event, items, currentIndex, onSelect) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        onSelect(nextIndex);
        break;
      case "ArrowUp":
        event.preventDefault();
        const prevIndex =
          currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        onSelect(prevIndex);
        break;
      case "Home":
        event.preventDefault();
        onSelect(0);
        break;
      case "End":
        event.preventDefault();
        onSelect(items.length - 1);
        break;
    }
  },

  // Handle escape key
  handleEscape: (event, onEscape) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onEscape();
    }
  },

  // Handle enter and space keys
  handleActivation: (event, onActivate) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate();
    }
  },
};

// Color contrast utilities
export const colorContrast = {
  // Calculate relative luminance
  getLuminance: (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio
  getContrastRatio: (color1, color2) => {
    const lum1 = colorContrast.getLuminance(...color1);
    const lum2 = colorContrast.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Check if contrast meets WCAG standards
  meetsWCAG: (color1, color2, level = "AA") => {
    const ratio = colorContrast.getContrastRatio(color1, color2);
    const requirements = {
      AA: 4.5,
      AAA: 7,
    };
    return ratio >= requirements[level];
  },
};

// Screen reader utilities
export const screenReader = {
  // Hide element from screen readers
  hideFromScreenReader: (element) => {
    element.setAttribute("aria-hidden", "true");
  },

  // Show element to screen readers
  showToScreenReader: (element) => {
    element.removeAttribute("aria-hidden");
  },

  // Create screen reader only text
  createScreenReaderText: (text) => {
    const element = document.createElement("span");
    element.className = "sr-only";
    element.textContent = text;
    return element;
  },
};

// Form accessibility
export const formAccessibility = {
  // Validate form field
  validateField: (field, rules) => {
    const value = field.value;
    const errors = [];

    rules.forEach((rule) => {
      if (rule.required && !value.trim()) {
        errors.push(rule.message || "This field is required");
      } else if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(rule.message || "Invalid format");
      } else if (rule.minLength && value.length < rule.minLength) {
        errors.push(
          rule.message || `Minimum ${rule.minLength} characters required`
        );
      } else if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(
          rule.message || `Maximum ${rule.maxLength} characters allowed`
        );
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Set field error state
  setFieldError: (field, errors) => {
    const hasErrors = errors.length > 0;
    field.setAttribute("aria-invalid", hasErrors);
    field.setAttribute(
      "aria-describedby",
      hasErrors ? `${field.id}-error` : ""
    );

    // Update or create error message
    let errorElement = document.getElementById(`${field.id}-error`);
    if (hasErrors) {
      if (!errorElement) {
        errorElement = document.createElement("div");
        errorElement.id = `${field.id}-error`;
        errorElement.className = "text-red-600 text-sm mt-1";
        errorElement.setAttribute("role", "alert");
        field.parentNode.appendChild(errorElement);
      }
      errorElement.textContent = errors[0];
    } else if (errorElement) {
      errorElement.remove();
    }
  },
};

// Animation accessibility
export const animationAccessibility = {
  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },

  // Apply reduced motion styles
  applyReducedMotion: (element) => {
    if (animationAccessibility.prefersReducedMotion()) {
      element.style.animation = "none";
      element.style.transition = "none";
    }
  },

  // Pause animations on hover
  pauseOnHover: (element) => {
    element.addEventListener("mouseenter", () => {
      element.style.animationPlayState = "paused";
    });

    element.addEventListener("mouseleave", () => {
      element.style.animationPlayState = "running";
    });
  },
};

// Touch accessibility
export const touchAccessibility = {
  // Ensure minimum touch target size
  ensureTouchTarget: (element, minSize = 44) => {
    const rect = element.getBoundingClientRect();
    if (rect.width < minSize || rect.height < minSize) {
      element.style.minWidth = `${minSize}px`;
      element.style.minHeight = `${minSize}px`;
    }
  },

  // Add touch feedback
  addTouchFeedback: (element) => {
    element.addEventListener("touchstart", () => {
      element.classList.add("touch-active");
    });

    element.addEventListener("touchend", () => {
      setTimeout(() => {
        element.classList.remove("touch-active");
      }, 150);
    });
  },
};

// High contrast mode
export const highContrast = {
  // Check if high contrast mode is enabled
  isEnabled: () => {
    return window.matchMedia("(prefers-contrast: high)").matches;
  },

  // Apply high contrast styles
  applyHighContrast: (element) => {
    if (highContrast.isEnabled()) {
      element.classList.add("high-contrast");
    }
  },
};

// Dark mode utilities
export const darkMode = {
  // Check if dark mode is preferred
  isPreferred: () => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  },

  // Apply dark mode styles
  applyDarkMode: (element) => {
    if (darkMode.isPreferred()) {
      element.classList.add("dark-mode");
    }
  },
};

// Accessibility testing helpers
export const accessibilityTesting = {
  // Check for missing alt text
  checkAltText: () => {
    const images = document.querySelectorAll("img");
    const missingAlt = Array.from(images).filter((img) => !img.alt);
    return missingAlt;
  },

  // Check for missing form labels
  checkFormLabels: () => {
    const inputs = document.querySelectorAll("input, select, textarea");
    const missingLabels = Array.from(inputs).filter((input) => {
      const id = input.id;
      const label = document.querySelector(`label[for="${id}"]`);
      const ariaLabel = input.getAttribute("aria-label");
      const ariaLabelledBy = input.getAttribute("aria-labelledby");
      return !label && !ariaLabel && !ariaLabelledBy;
    });
    return missingLabels;
  },

  // Check for proper heading hierarchy
  checkHeadingHierarchy: () => {
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const levels = Array.from(headings).map((h) => parseInt(h.tagName[1]));
    const issues = [];

    for (let i = 1; i < levels.length; i++) {
      if (levels[i] - levels[i - 1] > 1) {
        issues.push(
          `Heading level jump from h${levels[i - 1]} to h${levels[i]}`
        );
      }
    }

    return issues;
  },
};

export default {
  focusManagement,
  ariaUtils,
  keyboardNavigation,
  colorContrast,
  screenReader,
  formAccessibility,
  animationAccessibility,
  touchAccessibility,
  highContrast,
  darkMode,
  accessibilityTesting,
};
