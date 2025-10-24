import { config } from '../config/env';

// Google Analytics 4 service
class AnalyticsService {
  private measurementId: string;
  private isInitialized: boolean = false;

  constructor() {
    this.measurementId = config.analytics.measurementId;
  }

  // Initialize Google Analytics
  init(): void {
    if (this.isInitialized || !this.measurementId) return;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', this.measurementId, {
      page_title: document.title,
      page_location: window.location.href,
    });

    this.isInitialized = true;
  }

  // Track page view
  trackPageView(pagePath: string, pageTitle?: string): void {
    if (!this.isInitialized) return;

    window.gtag('config', this.measurementId, {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }

  // Track custom event
  trackEvent(eventName: string, parameters?: Record<string, any>): void {
    if (!this.isInitialized) return;

    window.gtag('event', eventName, {
      ...parameters,
      event_category: parameters?.category || 'engagement',
      event_label: parameters?.label,
      value: parameters?.value,
    });
  }

  // Track user registration
  trackRegistration(method: string = 'email'): void {
    this.trackEvent('sign_up', {
      method,
      category: 'user',
    });
  }

  // Track user login
  trackLogin(method: string = 'email'): void {
    this.trackEvent('login', {
      method,
      category: 'user',
    });
  }

  // Track service request creation
  trackServiceRequestCreated(requestType: 'instant' | 'scheduled', category: string, price: number): void {
    this.trackEvent('service_request_created', {
      request_type: requestType,
      service_category: category,
      price,
      category: 'service',
    });
  }

  // Track service request accepted
  trackServiceRequestAccepted(requestId: string, sellerId: string): void {
    this.trackEvent('service_request_accepted', {
      request_id: requestId,
      seller_id: sellerId,
      category: 'service',
    });
  }

  // Track service request completed
  trackServiceRequestCompleted(requestId: string, price: number): void {
    this.trackEvent('service_request_completed', {
      request_id: requestId,
      price,
      category: 'service',
    });
  }

  // Track seller profile creation
  trackSellerProfileCreated(categories: string[]): void {
    this.trackEvent('seller_profile_created', {
      service_categories: categories.join(','),
      category: 'seller',
    });
  }

  // Track search
  trackSearch(searchTerm: string, resultsCount: number): void {
    this.trackEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount,
      category: 'engagement',
    });
  }

  // Track file upload
  trackFileUpload(fileType: 'avatar' | 'portfolio', fileSize: number): void {
    this.trackEvent('file_upload', {
      file_type: fileType,
      file_size: fileSize,
      category: 'engagement',
    });
  }

  // Track error
  trackError(errorMessage: string, errorCode?: string): void {
    this.trackEvent('error', {
      error_message: errorMessage,
      error_code: errorCode,
      category: 'error',
    });
  }

  // Track conversion (purchase)
  trackConversion(transactionId: string, value: number, currency: string = 'USD'): void {
    this.trackEvent('purchase', {
      transaction_id: transactionId,
      value,
      currency,
      category: 'ecommerce',
    });
  }

  // Set user properties
  setUserProperties(properties: Record<string, any>): void {
    if (!this.isInitialized) return;

    window.gtag('config', this.measurementId, {
      user_properties: properties,
    });
  }

  // Set user ID
  setUserId(userId: string): void {
    if (!this.isInitialized) return;

    window.gtag('config', this.measurementId, {
      user_id: userId,
    });
  }

  // Track timing
  trackTiming(name: string, value: number, category: string = 'performance'): void {
    this.trackEvent('timing_complete', {
      name,
      value,
      category,
    });
  }

  // Track social interaction
  trackSocialInteraction(network: string, action: string, target?: string): void {
    this.trackEvent('social_interaction', {
      social_network: network,
      social_action: action,
      social_target: target,
      category: 'social',
    });
  }

  // Track outbound link click
  trackOutboundLink(url: string): void {
    this.trackEvent('click', {
      event_category: 'outbound',
      event_label: url,
      transport_type: 'beacon',
    });
  }

  // Track form submission
  trackFormSubmission(formName: string, formType: string): void {
    this.trackEvent('form_submit', {
      form_name: formName,
      form_type: formType,
      category: 'engagement',
    });
  }

  // Track video interaction
  trackVideoInteraction(action: string, videoTitle: string, progress?: number): void {
    this.trackEvent('video_interaction', {
      video_action: action,
      video_title: videoTitle,
      video_progress: progress,
      category: 'video',
    });
  }

  // Track scroll depth
  trackScrollDepth(depth: number): void {
    this.trackEvent('scroll', {
      scroll_depth: depth,
      category: 'engagement',
    });
  }

  // Track time on page
  trackTimeOnPage(timeInSeconds: number): void {
    this.trackEvent('timing', {
      name: 'time_on_page',
      value: timeInSeconds,
      category: 'engagement',
    });
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

// Initialize analytics on app start
if (typeof window !== 'undefined') {
  analyticsService.init();
}

// Export the service
export default analyticsService;

// Export individual functions for convenience
export const {
  trackPageView,
  trackEvent,
  trackRegistration,
  trackLogin,
  trackServiceRequestCreated,
  trackServiceRequestAccepted,
  trackServiceRequestCompleted,
  trackSellerProfileCreated,
  trackSearch,
  trackFileUpload,
  trackError,
  trackConversion,
  setUserProperties,
  setUserId,
  trackTiming,
  trackSocialInteraction,
  trackOutboundLink,
  trackFormSubmission,
  trackVideoInteraction,
  trackScrollDepth,
  trackTimeOnPage,
} = analyticsService;
