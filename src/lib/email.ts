import { Resend } from 'resend'

// TODO: Sign up at resend.com, get an API key, and add it here + to Vercel environment variables
const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'LughaPro <onboarding@resend.dev>'

export async function sendPurchaseConfirmationEmail(
  to: string,
  data: { contentTitle: string; creatorName: string; amount: string; txHash: string },
) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] Resend not configured — skipping purchase confirmation email')
    return
  }
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `You unlocked "${data.contentTitle}" on LughaPro`,
      html: `
        <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#1a4731;">Purchase Confirmed ✓</h2>
          <p>You now have full access to <strong>${data.contentTitle}</strong> by ${data.creatorName}.</p>
          <p style="color:#666;font-size:14px;">Amount: ${data.amount}</p>
          <a href="https://celoscan.io/tx/${data.txHash}" style="color:#FFBF00;">View transaction on Celoscan →</a>
          <p style="margin-top:24px;color:#999;font-size:12px;">LughaPro — Learn. Discover. Preserve.</p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[email] Purchase confirmation failed:', err)
  }
}

export async function sendNewSaleEmail(
  to: string,
  data: { contentTitle: string; amount: string; buyerName: string },
) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] Resend not configured — skipping new sale email')
    return
  }
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `🎉 New sale: "${data.contentTitle}"`,
      html: `
        <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#1a4731;">You made a sale!</h2>
          <p><strong>${data.buyerName}</strong> just purchased "${data.contentTitle}" for ${data.amount}.</p>
          <a href="https://lugha-pro.vercel.app/earnings" style="color:#FFBF00;">View your earnings →</a>
          <p style="margin-top:24px;color:#999;font-size:12px;">LughaPro — Learn. Discover. Preserve.</p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[email] New sale email failed:', err)
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] Resend not configured — skipping welcome email')
    return
  }
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to LughaPro 🌍',
      html: `
        <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#1a4731;">Welcome, ${name}!</h2>
          <p>You've joined LughaPro — where Africa's languages, arts, music, and wisdom are alive.</p>
          <p>Start exploring content or publish your own to start earning.</p>
          <a href="https://lugha-pro.vercel.app/explore" style="color:#FFBF00;">Explore now →</a>
          <p style="margin-top:24px;color:#999;font-size:12px;">LughaPro — Learn. Discover. Preserve.</p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[email] Welcome email failed:', err)
  }
}
