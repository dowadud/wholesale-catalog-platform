// Supabase Edge Function for sending order confirmation emails
// This is an alternative to using Resend directly in the API route

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface OrderEmailRequest {
  order: {
    id: string
    customer_name: string
    email: string
    phone: string
    business_name: string
    items: Array<{
      reference_number: string
      quantity: number
      notes?: string
    }>
    created_at: string
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { order }: OrderEmailRequest = await req.json()

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500 }
      )
    }

    // Format items for email
    const itemsList = order.items
      .map((item, index) => 
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
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'orders@yourdomain.com', // Update with your verified domain
        to: 'admin@yourdomain.com', // Update with your admin email
        subject: `New Order from ${order.customer_name}`,
        text: emailBody,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Resend API error: ${error}`)
    }

    const result = await response.json()

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})

