/**
 * WhatsApp API utility functions
 * Sends messages via WhatsApp API
 */

import { neon } from "@neondatabase/serverless"

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "http://168.231.85.21:3000"
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || "f12a05a88b6243349220b03951b0fb5c"
const sql = neon(process.env.DATABASE_URL!)

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
  studentName: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch available active tracks
    const tracks = await sql`
      SELECT name, id
      FROM gold_tracks
      WHERE is_active = true
      ORDER BY order_index ASC
    `

    // Format track list
    let tracksList = ""
    if (tracks.length > 0) {
      tracksList = tracks
        .map((track: { name: string }, index: number) => `${index + 1}. *${track.name}*`)
        .join("\n")
    } else {
      tracksList = "Wali ma jiro tracks available ah"
    }

    // Build the message
    const message = `Assalaamu Calaykum ${studentName}! 🌟

*Hambalyo!* 🎉
Waxaad si guul leh iskaga diiwaangelisay *Markano Gold*! 🚀

Farxad ayee noo tahay in aad nugu soo biirto waxaana ku dadaali doonnaa in aad noqoto xirfadle isku filan insha allaah

Ku dhaqaaq tilaabada xigta oo ah in aad dalbato *Tracka Available-ka ah*

${tracksList}

*markano.app/gold*

*Email:* ${email}
*Password:* ${password}

mahadsanid`

    return await sendWhatsAppMessage(phoneNumber, message)
  } catch (error) {
    console.error("❌ Error fetching tracks for welcome message:", error)
    // Send message without tracks if there's an error
    const fallbackMessage = `Assalaamu Calaykum ${studentName}! 🌟

*Hambalyo!* 🎉
Waxaad si guul leh iskaga diiwaangelisay *Markano Gold*! 🚀

Farxad ayee noo tahay in aad nugu soo biirto waxaana ku dadaali doonnaa in aad noqoto xirfadle isku filan insha allaah

*markano.app/gold*

*Email:* ${email}
*Password:* ${password}

mahadsanid`

    return await sendWhatsAppMessage(phoneNumber, fallbackMessage)
  }
}

/**
 * Send track request confirmation message to student
 */
export async function sendTrackRequestMessage(
  phoneNumber: string,
  studentName: string,
  trackName: string
): Promise<{ success: boolean; error?: string }> {
  const message = `*Hambalyo* ${studentName}! 🎉

Waxaad dalbatay track-ka *${trackName}*.

Mudo *4 saacadood* gudahood ayaa kula soo wadaagi doonnaa fariin kuu sheegeysa in laguu ansixiyay trackii aad dalbatay.

Si professional aya wax kuu bari doonnaa adigana ku dadaal si ad isku hormarin leheed.

Booqo: *markano.app/gold*

Mahadsanid! 🙏`

  return await sendWhatsAppMessage(phoneNumber, message)
}

/**
 * Send track approval message to student
 */
export async function sendTrackApprovalMessage(
  phoneNumber: string,
  studentName: string,
  trackName: string
): Promise<{ success: boolean; error?: string }> {
  const message = `*Hambalyo* ${studentName}! 🎉✨

*Track-kaagu waa la ansixiyay!* 🚀

Waxaad hadda si toos ah ugu biirtay *${trackName} Track*.

Maanta wixii ka dhambeeya waxaad dawan kartaa cashirada track-ka *${trackName}*.

Ku dhaqaaq barashadaada oo booqo:
*markano.app/gold*

Waxaan ku rajaynaynaa inaad ka faa'iidaysan doonto cashirada track-ka! 💪

Mahadsanid! 🙏`

  return await sendWhatsAppMessage(phoneNumber, message)
}
