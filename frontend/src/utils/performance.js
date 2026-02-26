// Performance optimization utilities

// Lazy loading for images
export const lazyLoadImage = (img, src) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = src;
          image.classList.remove("lazy");
          observer.unobserve(image);
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(img);
};

// Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Virtual scrolling for large lists
export const createVirtualScroll = (
  container,
  items,
  itemHeight,
  renderItem
) => {
  const containerHeight = container.clientHeight;
  const visibleItems = Math.ceil(containerHeight / itemHeight);
  const buffer = 5; // Extra items to render for smooth scrolling

  let startIndex = 0;
  let endIndex = Math.min(startIndex + visibleItems + buffer, items.length);

  const updateVisibleItems = () => {
    const scrollTop = container.scrollTop;
    startIndex = Math.floor(scrollTop / itemHeight);
    endIndex = Math.min(startIndex + visibleItems + buffer, items.length);

    // Clear container
    container.innerHTML = "";

    // Add spacer for items before visible range
    if (startIndex > 0) {
      const spacer = document.createElement("div");
      spacer.style.height = `${startIndex * itemHeight}px`;
      container.appendChild(spacer);
    }

    // Render visible items
    for (let i = startIndex; i < endIndex; i++) {
      const item = renderItem(items[i], i);
      container.appendChild(item);
    }

    // Add spacer for items after visible range
    if (endIndex < items.length) {
      const spacer = document.createElement("div");
      spacer.style.height = `${(items.length - endIndex) * itemHeight}px`;
      container.appendChild(spacer);
    }
  };

  container.addEventListener("scroll", throttle(updateVisibleItems, 16));
  updateVisibleItems();
};

// Memory management
export const cleanupEventListeners = (element, events) => {
  events.forEach((event) => {
    element.removeEventListener(event.type, event.handler);
  });
};

// Image optimization
export const optimizeImage = (src, width, height, quality = 80) => {
  // This would typically use a service like Cloudinary or ImageKit
  // For now, return the original src
  return src;
};

// Bundle splitting helper
export const loadComponent = async (componentPath) => {
  try {
    const module = await import(/* @vite-ignore */ componentPath);
    return module.default;
  } catch (error) {
    console.error(`Failed to load component: ${componentPath}`, error);
    return null;
  }
};

// Performance monitoring
export const performanceMonitor = {
  start: (name) => {
    performance.mark(`${name}-start`);
  },

  end: (name) => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const measure = performance.getEntriesByName(name)[0];
    console.log(`${name} took ${measure.duration}ms`);

    return measure.duration;
  },

  getMetrics: () => {
    const navigation = performance.getEntriesByType("navigation")[0];
    const paint = performance.getEntriesByType("paint");

    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded:
        navigation.domContentLoadedEventEnd -
        navigation.domContentLoadedEventStart,
      firstPaint: paint.find((entry) => entry.name === "first-paint")
        ?.startTime,
      firstContentfulPaint: paint.find(
        (entry) => entry.name === "first-contentful-paint"
      )?.startTime,
    };
  },
};

// Service Worker registration
export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Only preload resources that are used immediately on page load
  // Skip background images that are only used on specific pages

  // Example: Preload fonts (uncomment if you have custom fonts)
  // const fontLink = document.createElement('link');
  // fontLink.href = '/fonts/Inter-roman.var.woff2';
  // fontLink.rel = 'preload';
  // fontLink.as = 'font';
  // fontLink.type = 'font/woff2';
  // fontLink.crossOrigin = 'anonymous';
  // document.head.appendChild(fontLink);

  console.log("Critical resources preloaded.");
};

// Intersection Observer for animations
export const createAnimationObserver = (callback, options = {}) => {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};

// Web Vitals monitoring
export const measureWebVitals = () => {
  // Largest Contentful Paint
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      console.log("LCP:", entry.startTime);
    }
  }).observe({ entryTypes: ["largest-contentful-paint"] });

  // First Input Delay
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      console.log("FID:", entry.processingStart - entry.startTime);
    }
  }).observe({ entryTypes: ["first-input"] });

  // Cumulative Layout Shift
  let clsValue = 0;
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    }
    console.log("CLS:", clsValue);
  }).observe({ entryTypes: ["layout-shift"] });
};

// Resource hints
export const addResourceHints = () => {
  const hints = [
    { rel: "dns-prefetch", href: "//fonts.googleapis.com" },
    { rel: "preconnect", href: "//fonts.gstatic.com", crossorigin: true },
    { rel: "preconnect", href: "//images.unsplash.com" },
  ];

  hints.forEach((hint) => {
    const link = document.createElement("link");
    Object.assign(link, hint);
    document.head.appendChild(link);
  });
};

export default {
  lazyLoadImage,
  debounce,
  throttle,
  createVirtualScroll,
  cleanupEventListeners,
  optimizeImage,
  loadComponent,
  performanceMonitor,
  registerServiceWorker,
  preloadCriticalResources,
  createAnimationObserver,
  measureWebVitals,
  addResourceHints,
};
