import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { priceId, userId } = await request.json()

    if (!priceId || !userId) {
      return NextResponse.json({ error: 'Missing priceId or userId' }, { status: 400 })
    }

    // In production, create a Stripe Checkout Session:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const session = await stripe.checkout.sessions.create({
    //   mode: 'subscription',
    //   line_items: [{ price: priceId, quantity: 1 }],
    //   client_reference_id: userId,
    //   success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    // })
    // return NextResponse.json({ url: session.url })

    console.log('[Checkout]', { priceId, userId })

    return NextResponse.json({
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://couple-goals-omega.vercel.app'}/dashboard`,
      message: 'Stripe checkout would be created here. Set STRIPE_SECRET_KEY in env.',
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
