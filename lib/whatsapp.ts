/**
 * WhatsApp API utility functions
 * Sends messages via WhatsApp API
 */

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "http://178.18.245.131:3001"
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || "9f4a1d7c8e2b6f0d3a5c9e1b7f4d2a8c6e0f9b3a1d5c7e8b2f6a4d0"

/**
 * Format phone number for WhatsApp API
 * Converts +252 61 1234567 to 252611234567@c.us
 */
export function formatWhatsAppNumber(phoneNumber: string): string {
  // Remove all non-digit characters (spaces, dashes, etc.)
  let cleaned = phoneNumber.replace(/\D/g, "")
  
  // Add @c.us suffix
  return `${cleaned}@c.us`
}

/**
 * Send WhatsApp message
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string,
  options?: {
    reply_to?: string | null
    linkPreview?: boolean
    linkPreviewHighQuality?: boolean
    session?: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const chatId = formatWhatsAppNumber(phoneNumber)
    console.log(`📱 Sending WhatsApp message to ${chatId} (original: ${phoneNumber})`)
    
    const requestBody = {
      chatId,
      reply_to: options?.reply_to || null,
      text: message,
      linkPreview: options?.linkPreview ?? true,
      linkPreviewHighQuality: options?.linkPreviewHighQuality ?? false,
      session: options?.session || "default",
    }
    
    console.log(`📤 WhatsApp API Request:`, {
      url: `${WHATSAPP_API_URL}/api/sendText`,
      chatId,
      messageLength: message.length,
    })
    
    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(`${WHATSAPP_API_URL}/api/sendText`, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "X-Api-Key": WHATSAPP_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })

    let responseText = ""
    try {
      responseText = await response.text()
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === "AbortError") {
        console.error("❌ WhatsApp API request timeout after 10 seconds")
        return {
          success: false,
          error: "Request timeout - WhatsApp API did not respond in time",
        }
      }
      throw fetchError
    }
    
    clearTimeout(timeoutId)
    console.log(`📥 WhatsApp API Response:`, {
      status: response.status,
      statusText: response.statusText,
      body: responseText.substring(0, 200), // First 200 chars
    })

    if (!response.ok) {
      let errorData = {}
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { raw: responseText }
      }
      console.error("❌ WhatsApp API error:", response.status, errorData)
      return {
        success: false,
        error: `WhatsApp API error: ${response.status} - ${JSON.stringify(errorData)}`,
      }
    }

    let data = {}
    try {
      data = JSON.parse(responseText)
    } catch {
      data = { raw: responseText }
    }
    
    console.log(`✅ WhatsApp message sent successfully`)
    return { success: true }
  } catch (error) {
    console.error("❌ Error sending WhatsApp message:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Send welcome message to new student
 */
export async function sendWelcomeMessage(
  phoneNumber: string,
  studentName: string
): Promise<{ success: boolean; error?: string }> {
  const message = `Assalaamu Calaykum ${studentName}! 🎉

Waxaan ku soo dhaweynaynaa Markano Gold! 🚀

Diiwaangalintaada ayaa la helay. Maanta ayaa admin-ka aad u ansixiyeynaa si aad u hesho gelitaanka aadka ah.

Waxaan ku soo diri doonaa fariin marka account-kaagu ansixiyo.

Mahadsanid! 🙏`

  return await sendWhatsAppMessage(phoneNumber, message)
}
