import { NextResponse } from 'next/server';
import Stripe from 'stripe';
export async function POST(req){
  const body = await req.json();
  const plan = body.plan || 'PLUS';
  const origin = body.origin || (typeof req.headers.get === 'function' ? req.headers.get('origin') : null) || 'https://example.com';
  const priceMap = {
    ESSENTIALS: process.env.PRICE_ESSENTIALS || '',
    PLUS: process.env.PRICE_PLUS || '',
    VIP: process.env.PRICE_VIP || ''
  };
  const price = priceMap[plan];
  if (!process.env.STRIPE_SECRET_KEY || !price){
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  const session = await stripe.checkout.sessions.create({
    mode: plan === 'VIP' ? 'payment' : 'subscription',
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/pricing?success=1`,
    cancel_url: `${origin}/pricing?canceled=1`,
    automatic_tax: { enabled: true }
  });
  return NextResponse.json({ url: session.url });
}
