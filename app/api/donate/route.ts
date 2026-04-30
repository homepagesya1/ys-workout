import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_CURRENCIES = ['chf', 'eur', 'usd'] as const
type Currency = typeof ALLOWED_CURRENCIES[number]

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const { amount, currency } = await req.json()

  // Validierung
  if (!ALLOWED_CURRENCIES.includes(currency)) {
    return NextResponse.json({ error: 'Invalid currency' }, { status: 400 })
  }
  if (!Number.isInteger(amount) || amount < 100) {
    return NextResponse.json({ error: 'Mindestbetrag: 1.00' }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: amount,
          product_data: {
            name: 'Spende',
            description: 'Unterstütze YS.Workout ❤️',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'https://workout.yannicksalm.ch/spenden/success',
    cancel_url: 'https://workout.yannicksalm.ch/spenden',
  })

  return NextResponse.json({ url: session.url })
}