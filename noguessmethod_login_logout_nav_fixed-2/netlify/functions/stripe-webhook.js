const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return { statusCode: 400, body: `Webhook signature error: ${err.message}` };
  }

  const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    const userId = session.metadata?.userId;
    if (userId) {
      await sb.from('profiles').update({
        subscription: 'premium',
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
      }).eq('id', userId);
    }
  }

  if (
    stripeEvent.type === 'customer.subscription.deleted' ||
    stripeEvent.type === 'customer.subscription.paused'
  ) {
    const sub = stripeEvent.data.object;
    const userId = sub.metadata?.userId;
    if (userId) {
      await sb.from('profiles').update({ subscription: 'free' }).eq('id', userId);
    }
  }

  if (stripeEvent.type === 'customer.subscription.updated') {
    const sub = stripeEvent.data.object;
    const userId = sub.metadata?.userId;
    if (userId && sub.status === 'active') {
      await sb.from('profiles').update({ subscription: 'premium' }).eq('id', userId);
    }
    if (userId && (sub.status === 'canceled' || sub.status === 'unpaid')) {
      await sb.from('profiles').update({ subscription: 'free' }).eq('id', userId);
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ received: true }),
  };
};
