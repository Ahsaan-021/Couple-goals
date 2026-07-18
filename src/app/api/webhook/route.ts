import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    // In production, verify the webhook signature:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    // switch (event.type) {
    //   case 'checkout.session.completed':
    //     // Update user's subscription status in database
    //     break
    //   case 'customer.subscription.deleted':
    //     // Downgrade user to free
    //     break
    // }

    console.log('[Webhook Received]', { signature: signature.substring(0, 20) + '...' })

    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
