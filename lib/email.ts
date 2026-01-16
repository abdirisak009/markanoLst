/**
 * Email utility functions
 * Sends emails via email service
 */

/**
 * Send email with credentials to new student
 */
export async function sendRegistrationEmail(
  email: string,
  studentName: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // For now, we'll use a simple approach
    // In production, you can integrate with Resend, SendGrid, or another email service
    
    const subject = "Markano Gold - Diiwaangalintaada"
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #DC2626;">Assalaamu Calaykum ${studentName}!</h2>
        <p>Waxaad isdiiwaangalisay Markano Gold. Mahadsanid!</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 10px 0 0 0;"><strong>Password:</strong> ${password}</p>
        </div>
        <p style="color: #666; font-size: 14px;">Fadlan hubi inaad kayd gareyso password-kaaga si aad ugu soo galto account-kaaga.</p>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">Mahadsanid,<br>Markano Gold Team</p>
      </div>
    `
    
    const textBody = `
Assalaamu Calaykum ${studentName}!

Waxaad isdiiwaangalisay Markano Gold. Mahadsanid!

Email: ${email}
Password: ${password}

Fadlan hubi inaad kayd gareyso password-kaaga si aad ugu soo galto account-kaaga.

Mahadsanid,
Markano Gold Team
    `

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // For now, we'll log it and return success
    // In production, replace this with actual email sending
    console.log(`📧 Email would be sent to ${email}:`, {
      subject,
      body: textBody,
    })

    // Placeholder: In production, implement actual email sending here
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'noreply@markano.com',
    //   to: email,
    //   subject: subject,
    //   html: htmlBody,
    //   text: textBody,
    // })

    return { success: true }
  } catch (error) {
    console.error("❌ Error sending registration email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
