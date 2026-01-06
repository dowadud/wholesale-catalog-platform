import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer_name, email, phone, business_name, items } = body

    // Validate required fields
    if (!customer_name || !email || !phone || !business_name || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert order into database
    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert({
        customer_name,
        email,
        phone,
        business_name,
        items,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Send email notification
    try {
      await sendOrderEmail(order)
    } catch (emailError) {
      console.error('Email error:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Order submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function sendOrderEmail(order: any) {
  const resendApiKey = process.env.RESEND_API_KEY
  
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured, skipping email')
    return
  }

  // Format items for email
  const itemsList = order.items
    .map((item: any, index: number) => 
      `${index + 1}. Reference: ${item.reference_number} | Quantity: ${item.quantity}${item.notes ? ` | Notes: ${item.notes}` : ''}`
    )
    .join('\n')

  const emailBody = `
New Order Received!

Customer Information:
- Name: ${order.customer_name}
- Email: ${order.email}
- Phone: ${order.phone}
- Business: ${order.business_name}

Order Items:
${itemsList}

Order Date: ${new Date(order.created_at).toLocaleString()}
Order ID: ${order.id}
`

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'orders@yourdomain.com', // Update this with your verified domain
      to: 'admin@yourdomain.com', // Update this with your admin email
      subject: `New Order from ${order.customer_name}`,
      text: emailBody,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Resend API error: ${error}`)
  }
}

