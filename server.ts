import express from 'express';
import webpush from 'web-push';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Persistent or generated VAPID keys
const VAPID_KEYS_FILE = path.join(__dirname, '.vapid-keys.json');
let vapidKeys: { publicKey: string; privateKey: string };

if (fs.existsSync(VAPID_KEYS_FILE)) {
  try {
    vapidKeys = JSON.parse(fs.readFileSync(VAPID_KEYS_FILE, 'utf-8'));
  } catch {
    vapidKeys = webpush.generateVAPIDKeys();
    fs.writeFileSync(VAPID_KEYS_FILE, JSON.stringify(vapidKeys, null, 2));
  }
} else {
  vapidKeys = webpush.generateVAPIDKeys();
  try {
    fs.writeFileSync(VAPID_KEYS_FILE, JSON.stringify(vapidKeys, null, 2));
  } catch (err) {
    console.warn('Could not write .vapid-keys.json', err);
  }
}

webpush.setVapidDetails(
  'mailto:admin@dailycollection.local',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// In-memory subscription store
interface PushSubscriptionRecord {
  id: string;
  subscription: webpush.PushSubscription;
  device: string;
  createdAt: string;
  lastNotified?: string;
}

const subscriptions: PushSubscriptionRecord[] = [];

// API: Get VAPID Public Key for client-side PushManager.subscribe()
app.get('/api/push/vapid-key', (_req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// API: Register Push Subscription (from iOS Safari or other browsers)
app.post('/api/push/subscribe', (req, res) => {
  const { subscription, device } = req.body;
  if (!subscription || !subscription.endpoint) {
    res.status(400).json({ error: 'Valid subscription object required' });
    return;
  }

  // Check if existing
  const existingIdx = subscriptions.findIndex((s) => s.subscription.endpoint === subscription.endpoint);
  if (existingIdx !== -1) {
    subscriptions[existingIdx].subscription = subscription;
    subscriptions[existingIdx].device = device || subscriptions[existingIdx].device;
  } else {
    subscriptions.push({
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      subscription,
      device: device || 'iOS Device / Web Browser',
      createdAt: new Date().toISOString(),
    });
  }

  console.log(`[Push Server] Subscription registered. Total active: ${subscriptions.length}`);
  res.status(201).json({
    success: true,
    totalSubscriptions: subscriptions.length,
    message: 'Push subscription successfully registered on server'
  });
});

// API: Get active subscriptions info
app.get('/api/push/subscriptions', (_req, res) => {
  res.json({
    count: subscriptions.length,
    subscriptions: subscriptions.map((s) => ({
      id: s.id,
      device: s.device,
      createdAt: s.createdAt,
      lastNotified: s.lastNotified,
      endpointPreview: s.subscription.endpoint.slice(0, 45) + '...'
    }))
  });
});

// API: Trigger Web Push notification to all active devices
app.post('/api/push/send', async (req, res) => {
  const { title, body, icon, badge, data, tag, delaySeconds } = req.body;

  const payload = JSON.stringify({
    title: title || 'Daily Collection Alert',
    body: body || 'You have an important update in your collection account.',
    icon: icon || '/pwa-192x192.png',
    badge: badge || '/badge.png',
    tag: tag || `daily-collection-${Date.now()}`,
    data: data || { url: '/' },
    timestamp: Date.now()
  });

  const sendDirect = async () => {
    let successCount = 0;
    let failureCount = 0;
    const deadSubscriptions: string[] = [];

    await Promise.all(
      subscriptions.map(async (record) => {
        try {
          await webpush.sendNotification(record.subscription, payload);
          record.lastNotified = new Date().toISOString();
          successCount++;
        } catch (error: any) {
          console.error('[Push Server] Delivery error for endpoint:', record.subscription.endpoint, error.statusCode);
          failureCount++;
          // Remove 404 or 410 (Gone) subscriptions
          if (error.statusCode === 404 || error.statusCode === 410) {
            deadSubscriptions.push(record.subscription.endpoint);
          }
        }
      })
    );

    // Clean dead subscriptions
    if (deadSubscriptions.length > 0) {
      for (let i = subscriptions.length - 1; i >= 0; i--) {
        if (deadSubscriptions.includes(subscriptions[i].subscription.endpoint)) {
          subscriptions.splice(i, 1);
        }
      }
    }

    return { successCount, failureCount, activeCount: subscriptions.length };
  };

  if (delaySeconds && delaySeconds > 0) {
    // Schedule delivery
    setTimeout(() => {
      sendDirect().catch((err) => console.error('[Push Server] Delayed push error:', err));
    }, delaySeconds * 1000);

    res.json({
      success: true,
      scheduled: true,
      delaySeconds,
      targetSubscribers: subscriptions.length,
      message: `Push notification scheduled to deliver to ${subscriptions.length} device(s) in ${delaySeconds} seconds.`
    });
    return;
  }

  const results = await sendDirect();
  res.json({
    success: true,
    scheduled: false,
    results,
    message: `Push notification dispatched. Success: ${results.successCount}, Failed/Expired: ${results.failureCount}, Active Subscribers: ${results.activeCount}.`
  });
});

// Configure Vite middleware in development or static in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Push & App Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
