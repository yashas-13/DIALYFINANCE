/**
 * iOS Web Push Notification Service
 * Supports iOS 16.4+ Web Push, APNs over VAPID, Service Worker background push,
 * scheduled lockscreen testing, and iOS Tri-tone audio synthesis.
 */

export interface PushNotificationPayload {
  id?: string;
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  badge?: string;
  targetTab?: string;
  delaySeconds?: number;
  playSound?: boolean;
  category?: 'overdue' | 'collection' | 'payment' | 'loan' | 'risk' | 'system' | 'custom';
}

export interface PushDiagnostics {
  isIOS: boolean;
  isStandalone: boolean;
  hasNotificationAPI: boolean;
  hasServiceWorker: boolean;
  hasPushManager: boolean;
  permission: NotificationPermission | 'unsupported';
  serviceWorkerRegistered: boolean;
  isSubscribed: boolean;
  subscriptionEndpoint: string | null;
  serverSubscribersCount: number;
}

export interface PushHistoryItem {
  id: string;
  title: string;
  body: string;
  category: string;
  targetTab: string;
  timestamp: string;
  scheduledDelay: number;
  deliveredLocally: boolean;
  deliveredViaAPNs: boolean;
}

const STORAGE_KEYS = {
  PUSH_HISTORY: 'dca_push_history_v1',
  LOCAL_SUBSCRIPTION: 'dca_push_sub_v1',
};

// Base64 helper for VAPID conversion
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export class PushService {
  private static swRegistration: ServiceWorkerRegistration | null = null;
  private static audioCtx: AudioContext | null = null;

  /**
   * Detect whether device is running iOS / iPadOS
   */
  public static isIOS(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent.toLowerCase();
    const isStandardIOS = /iphone|ipad|ipod/.test(ua);
    // iPadOS 13+ reports as Macintosh but has touch points
    const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return isStandardIOS || isIPadOS;
  }

  /**
   * Detect whether app is running in Standalone (Home Screen installed) mode
   */
  public static isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isNavStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    return isDisplayStandalone || isNavStandalone;
  }

  /**
   * Register the Service Worker for push handling
   */
  public static async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      this.swRegistration = registration;
      console.log('[PushService] Service worker active at scope:', registration.scope);

      // Listen for notification click postMessage from SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
          const customEvt = new CustomEvent('daily_collect_notification_nav', {
            detail: event.data.data
          });
          window.dispatchEvent(customEvt);
        }
      });

      return registration;
    } catch (err) {
      console.warn('[PushService] Service worker registration error:', err);
      return null;
    }
  }

  /**
   * Retrieve full diagnostic state for iOS push notification system
   */
  public static async getDiagnostics(): Promise<PushDiagnostics> {
    const isIOSDevice = this.isIOS();
    const isStandaloneMode = this.isStandalone();
    const hasNotificationAPI = typeof window !== 'undefined' && 'Notification' in window;
    const hasServiceWorker = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
    const hasPushManager = typeof window !== 'undefined' && 'PushManager' in window;

    let permission: NotificationPermission | 'unsupported' = 'unsupported';
    if (hasNotificationAPI) {
      permission = Notification.permission;
    }

    let isSubscribed = false;
    let subscriptionEndpoint: string | null = null;
    let serviceWorkerRegistered = !!this.swRegistration;

    if (hasServiceWorker) {
      try {
        const reg = this.swRegistration || (await navigator.serviceWorker.getRegistration('/'));
        if (reg) {
          serviceWorkerRegistered = true;
          this.swRegistration = reg;
          if (hasPushManager && reg.pushManager) {
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
              isSubscribed = true;
              subscriptionEndpoint = sub.endpoint;
            }
          }
        }
      } catch (e) {
        console.warn('[PushService] Could not inspect subscription', e);
      }
    }

    // Query server for subscriber count
    let serverSubscribersCount = 0;
    try {
      const res = await fetch('/api/push/subscriptions');
      if (res.ok) {
        const data = await res.json();
        serverSubscribersCount = data.count || 0;
      }
    } catch {
      // offline or dev fallback
    }

    return {
      isIOS: isIOSDevice,
      isStandalone: isStandaloneMode,
      hasNotificationAPI,
      hasServiceWorker,
      hasPushManager,
      permission,
      serviceWorkerRegistered,
      isSubscribed,
      subscriptionEndpoint,
      serverSubscribersCount,
    };
  }

  /**
   * Request Notification Permission and Subscribe to Web Push
   */
  public static async requestPermissionAndSubscribe(): Promise<{
    success: boolean;
    error?: string;
    permission: NotificationPermission;
    subscription?: PushSubscription;
  }> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return {
        success: false,
        error: 'Notifications API not supported in this browser. On iOS, you must first Add to Home Screen (iOS 16.4+).',
        permission: 'denied',
      };
    }

    try {
      // 1. Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return {
          success: false,
          error: permission === 'denied'
            ? 'Notification permission was denied. Please enable notifications in iOS Settings > Safari / DailyCollect.'
            : 'Notification permission dismissed.',
          permission,
        };
      }

      // 2. Ensure Service Worker is registered and ready
      const registration = this.swRegistration || (await this.registerServiceWorker());
      if (!registration) {
        return {
          success: false,
          error: 'Service Worker could not be registered.',
          permission,
        };
      }

      // Wait until active
      await navigator.serviceWorker.ready;

      // 3. Obtain VAPID public key from backend
      let vapidPublicKey = '';
      try {
        const keyRes = await fetch('/api/push/vapid-key');
        if (keyRes.ok) {
          const keyData = await keyRes.json();
          vapidPublicKey = keyData.publicKey;
        }
      } catch (err) {
        console.warn('[PushService] Could not fetch server VAPID key', err);
      }

      // 4. Subscribe with PushManager if supported
      let pushSub: PushSubscription | null = null;
      if ('PushManager' in window && registration.pushManager && vapidPublicKey) {
        try {
          const existingSub = await registration.pushManager.getSubscription();
          if (existingSub) {
            pushSub = existingSub;
          } else {
            const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
            pushSub = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedKey as unknown as BufferSource,
            });
          }

          // 5. Send subscription to backend
          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscription: pushSub,
              device: this.isIOS() ? 'Apple iOS (Web Push / APNs)' : 'Desktop / Android Web App',
            }),
          });

          localStorage.setItem(STORAGE_KEYS.LOCAL_SUBSCRIPTION, JSON.stringify(pushSub));
        } catch (subErr) {
          console.warn('[PushService] PushManager subscription warning:', subErr);
        }
      }

      return {
        success: true,
        permission: 'granted',
        subscription: pushSub || undefined,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to request notification permission.',
        permission: 'denied',
      };
    }
  }

  /**
   * Synthesize iOS Apple Tri-Tone Notification Chime using Web Audio API
   */
  public static playAppleChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Apple Tri-Tone Note sequence: High F# (740Hz) -> D (587Hz) -> A (440Hz)
      const notes = [
        { freq: 740, start: 0, duration: 0.12 },
        { freq: 587, start: 0.12, duration: 0.12 },
        { freq: 440, start: 0.24, duration: 0.28 },
      ];

      notes.forEach(({ freq, start, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + start);

        // Envelope
        gain.gain.setValueAtTime(0.001, now + start);
        gain.gain.exponentialRampToValueAtTime(0.3, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + duration + 0.05);
      });
    } catch (e) {
      console.warn('Could not play audio chime', e);
    }
  }

  /**
   * Trigger a Push Notification
   * Works immediately or with delayed countdown (for testing phone lockscreen)
   */
  public static async triggerNotification(payload: PushNotificationPayload): Promise<{
    success: boolean;
    scheduled: boolean;
    message: string;
  }> {
    const delay = payload.delaySeconds || 0;
    const notificationId = payload.id || `push_${Date.now()}`;

    // Play chime if requested
    if (payload.playSound !== false && delay === 0) {
      this.playAppleChime();
    }

    // Visual in-app event for simulator banner
    const emitVisualAlert = () => {
      const visualEvt = new CustomEvent('daily_collect_push_received', {
        detail: {
          id: notificationId,
          title: payload.title,
          body: payload.body,
          targetTab: payload.targetTab || 'collections',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      });
      window.dispatchEvent(visualEvt);
    };

    // Record in history log
    const saveToHistory = (viaAPNs = false) => {
      const history = this.getHistory();
      const newItem: PushHistoryItem = {
        id: notificationId,
        title: payload.title,
        body: payload.body,
        category: payload.category || 'custom',
        targetTab: payload.targetTab || 'collections',
        timestamp: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        scheduledDelay: delay,
        deliveredLocally: true,
        deliveredViaAPNs: viaAPNs,
      };
      history.unshift(newItem);
      localStorage.setItem(STORAGE_KEYS.PUSH_HISTORY, JSON.stringify(history.slice(0, 50)));
    };

    // If scheduled with a delay (e.g. 5s, 10s so user can lock their phone)
    if (delay > 0) {
      // 1. Post to Service Worker to schedule via timeout
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SCHEDULE_NOTIFICATION',
          title: payload.title,
          options: {
            body: payload.body,
            icon: payload.icon || '/pwa-192x192.png',
            badge: payload.badge || '/badge.png',
            tag: payload.tag || notificationId,
            data: { url: `/#${payload.targetTab || 'collections'}` },
          },
          delayMs: delay * 1000,
        });
      }

      // 2. Also trigger backend scheduled push
      fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: payload.title,
          body: payload.body,
          delaySeconds: delay,
          data: { url: `/#${payload.targetTab || 'collections'}` },
        }),
      }).catch((e) => console.warn('Scheduled server push error', e));

      // 3. Client timer for visual banner if user stays in app
      setTimeout(() => {
        if (payload.playSound !== false) this.playAppleChime();
        emitVisualAlert();
        saveToHistory(true);
      }, delay * 1000);

      return {
        success: true,
        scheduled: true,
        message: `Push notification scheduled! Lock your screen or switch apps now — alert arrives in ${delay} seconds.`,
      };
    }

    // Immediate Delivery Flow:
    emitVisualAlert();
    let apnsDelivered = false;

    // Send to server to notify all subscribed Apple APNs endpoints
    try {
      const serverRes = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: payload.title,
          body: payload.body,
          data: { url: `/#${payload.targetTab || 'collections'}` },
        }),
      });
      if (serverRes.ok) {
        apnsDelivered = true;
      }
    } catch {
      // Offline fallback
    }

    // Trigger via Service Worker showNotification if granted
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        const reg = this.swRegistration || (await navigator.serviceWorker.getRegistration('/'));
        if (reg) {
          await reg.showNotification(payload.title, {
            body: payload.body,
            icon: payload.icon || '/pwa-192x192.png',
            badge: payload.badge || '/badge.png',
            tag: payload.tag || notificationId,
            data: { url: `/#${payload.targetTab || 'collections'}` },
          });
        } else {
          new Notification(payload.title, {
            body: payload.body,
            icon: payload.icon || '/pwa-192x192.png',
          });
        }
      } catch (err) {
        console.warn('[PushService] Direct Notification trigger note:', err);
      }
    }

    saveToHistory(apnsDelivered);

    return {
      success: true,
      scheduled: false,
      message: 'Push notification triggered successfully!',
    };
  }

  /**
   * Get push notification trigger history
   */
  public static getHistory(): PushHistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PUSH_HISTORY);
      if (!data) return [];
      return JSON.parse(data) as PushHistoryItem[];
    } catch {
      return [];
    }
  }

  /**
   * Clear push history
   */
  public static clearHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.PUSH_HISTORY);
  }

  /**
   * Built-in Microfinance Push Alert Presets
   */
  public static getPresets(): PushNotificationPayload[] {
    return [
      {
        id: 'preset_overdue',
        category: 'overdue',
        title: '⚠️ Overdue Account Alert',
        body: 'Anitha Roy (BR-1006) has missed 5 installments. ₹4,500 overdue balance requires immediate recovery visit.',
        targetTab: 'collections',
        delaySeconds: 0,
        playSound: true,
      },
      {
        id: 'preset_collection',
        category: 'collection',
        title: '🌅 Morning Collection Round',
        body: '5 borrower repayments scheduled for today totaling ₹24,000. Priority route: KR Market & Yeshwanthpur.',
        targetTab: 'collections',
        delaySeconds: 0,
        playSound: true,
      },
      {
        id: 'preset_payment',
        category: 'payment',
        title: '✅ Payment Received',
        body: '₹5,000 cash collection verified for Ramesh Kumar Verma (LN-2026-001). Receipt RCP-26-0091 issued.',
        targetTab: 'receipts',
        delaySeconds: 0,
        playSound: true,
      },
      {
        id: 'preset_loan',
        category: 'loan',
        title: '💼 New Upfront Deduction Loan',
        body: 'LN-2026-007 approved: ₹10,000 sanctioned, ₹8,000 net cash handed over. 10 weekly collections of ₹1,000 active.',
        targetTab: 'loans',
        delaySeconds: 0,
        playSound: true,
      },
      {
        id: 'preset_risk',
        category: 'risk',
        title: '🚨 High Portfolio Risk Alert',
        body: 'Overdue recovery rate is at 76%. ₹7,500 remaining uncollected past due-date across 2 borrower accounts.',
        targetTab: 'reports',
        delaySeconds: 0,
        playSound: true,
      },
    ];
  }
}
