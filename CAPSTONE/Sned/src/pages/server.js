const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(bodyParser.json());

// VAPID keys (replace with your actual keys, keep private key secure)
const publicVapidKey = 'BHzjogneXsDyCkUn1gSdKd_7Ymp9odKOC6YXd4yhWHfBMrIubhsArhpNQUgLzD-Kg8aXz74JiWCD2qPWAcc94n8';
const privateVapidKey = 'IiiWnI5gru3-DuplFmHoCWfA-d9nORo9eqtzEP4Azl0';

webpush.setVapidDetails(
  'mailto:admin@sned-link.edu',
  publicVapidKey,
  privateVapidKey
);

// In-memory store for subscriptions (for demonstration purposes)
// In a real application, this would be a database.
const subscriptions = new Map();
const notificationsFeed = new Map(); // Stores history per email (email -> alert[])

// Endpoint to fetch alerts for a specific user (Admin, Teacher, or Parent)
app.get('/api/notifications/feed', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'User email is required.' });
  const feed = notificationsFeed.get(email) || [];
  res.status(200).json(feed);
});

app.post('/api/notifications/subscribe', (req, res) => {
  const { subscription, email } = req.body;
  if (!subscription || !email) {
    return res.status(400).json({ message: 'Subscription object and email are required.' });
  }

  // Store the subscription linked to the user's email
  subscriptions.set(email, subscription);
  console.log(`User ${email} subscribed for push notifications.`);
  res.status(201).json({ message: 'Subscription successful.' });
});

// Endpoint to trigger a notification for a specific user
app.post('/api/notifications/trigger', async (req, res) => {
  try {
    const { email, title, body, url, targetEmail, senderRole } = req.body;

    // Mapping logic:
    // 1. Admin receives from Parent/Teacher (defaults to admin if targetEmail is null)
    // 2. Teacher receives from Parent/Admin (via explicit targetEmail)
    // 3. Parent receives from Teacher/Admin (via explicit targetEmail)
    const recipient = targetEmail || 'admin@sned-link.edu';

    if (email === recipient) return res.status(400).json({ message: 'Self-notification is disabled.' });

    const eventAlert = {
      id: crypto.randomUUID ? crypto.randomUUID() : `alert-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      from: email,
      title,
      body,
      url,
      timestamp: new Date()
    };

    if (!notificationsFeed.has(recipient)) {
      notificationsFeed.set(recipient, []);
    }
    const feed = notificationsFeed.get(recipient);
    feed.unshift(eventAlert);
    if (feed.length > 50) feed.pop();

    const subscription = subscriptions.get(recipient);
    if (subscription) {
      const senderLabel = senderRole ? `[${senderRole.toUpperCase()}]` : `[SYSTEM]`;
      const payload = JSON.stringify({ 
        title: `${senderLabel} ${title}`, 
        body: `${body}`,
        url 
      });
      await webpush.sendNotification(subscription, payload);
    }

    res.status(200).json({ message: 'Notification sent and logged.' });
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 410) {
      console.log(`Subscription for ${req.body.email} has expired or is no longer valid.`);
      subscriptions.delete(req.body.email);
    }
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Error sending notification', error: error.message });
  }
});

app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));