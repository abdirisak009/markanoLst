/**
 * WhatsApp API utility functions
 * Sends messages via WhatsApp API
 */

import postgres from "postgres"

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "http://168.231.85.21:3001"
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || "22be2f43c50646609c064aecfc1a4bff"
const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

/** Domain ardayga u arka fariimaha (WhatsApp, diiwaangal) – domaka badaly: markano.tech */
export const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || "markano.tech"

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
Waxaad si guul leh iskaga diiwaangelisay *Markano*! 🚀

Farxad ayee noo tahay in aad nugu soo biirto waxaana ku dadaali doonnaa in aad noqoto xirfadle isku filan insha allaah

Ku dhaqaaq tilaabada xigta oo ah in aad dalbato *Tracka Available-ka ah*

${tracksList}

*${APP_DOMAIN}/profile*

*Email:* ${email}
*Password:* ${password}

mahadsanid`

    return await sendWhatsAppMessage(phoneNumber, message)
  } catch (error) {
    console.error("❌ Error fetching tracks for welcome message:", error)
    // Send message without tracks if there's an error
    const fallbackMessage = `Assalaamu Calaykum ${studentName}! 🌟

*Hambalyo!* 🎉
Waxaad si guul leh iskaga diiwaangelisay *Markano*! 🚀

Farxad ayee noo tahay in aad nugu soo biirto waxaana ku dadaali doonnaa in aad noqoto xirfadle isku filan insha allaah

*${APP_DOMAIN}/profile*

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

Booqo: *${APP_DOMAIN}/profile*

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
*${APP_DOMAIN}/profile*

Waxaan ku rajaynaynaa inaad ka faa'iidaysan doonto cashirada track-ka! 💪

Mahadsanid! 🙏`

  return await sendWhatsAppMessage(phoneNumber, message)
}

/**
 * Send project marks congratulatory message to student
 */
export async function sendProjectMarksMessage(
  phoneNumber: string,
  studentName: string,
  activityMarks: string
): Promise<{ success: boolean; error?: string }> {
  const message = `*Hambalyo* ${studentName}! 🎉

Anigoo ah *Abdirisaq Mohamed Yusuf* ahna macalinka madada HTML & CSS, waxan qirayaa in aad tahay arday dadaal badan waxana rajenaya in aad sii wadi doonto safarkaaga *web development*-ga.

Inta ay socotay madada HTML & CSS Markano adinka iyo macalinkaba waxa uu idinka caawiyay maamulada assignment, daawashada muqaalada.

Madama aad kamid tahay Markano Community wali Markano waxa uu ku sinayaa fursad aad ku horamrin karto xirfadada adigoo sii wadayaa safarkaaga isla markaana qadanayaa koorsoyinka hoos kaga muqdo:

1. *Tailwind CSS*
2. *JavaScript*
3. *React.js*
4. *Version control system* (Git and Github)
5. *Node.js*
6. *Express.js*
7. *MongoDB*

${APP_DOMAIN} fadhigiisa waa United state waxaana maalgaliyay ganacsato iskugu jirta somali iyo ajaanib.

Hada booqo:
*${APP_DOMAIN}*

Mahadsanid 🙏`

  return await sendWhatsAppMessage(phoneNumber, message)
}

/**
 * Send project marks message for low marks (below 30)
 */
export async function sendLowMarksMessage(
  phoneNumber: string,
  studentName: string,
  activityMarks: string
): Promise<{ success: boolean; error?: string }> {
  const message = `Assalaamu Calaykum ${studentName}! 

Anigoo ah *Abdirisaq Mohamed Yusuf* ahna macalinka madada HTML & CSS, waxan qirayaa in aad tahay arday dadaal badan.

Waxaan ka xumahay in aan ku sheego in aadan maqnaan project activity-ga. Laakiin tani ma aha dhamaadka, waa bilow cusub.

Waxaan kugu boorinayaa in aad dadaasho xirfadaada aad dhiso. Markano waxa uu ku sinayaa fursad aad ku hormarin karto xirfadaada adigoo sii wadayaa safarkaaga isla markaana qadanayaa koorsoyinka hoos kaga muqdo:

1. *Tailwind CSS*
2. *JavaScript*
3. *React.js*
4. *Version control system* (Git and Github)
5. *Node.js*
6. *Express.js*
7. *MongoDB*

${APP_DOMAIN} fadhigiisa waa United state waxaana maalgaliyay ganacsato iskugu jirta somali iyo ajaanib.

Hada booqo:
*${APP_DOMAIN}*

Waxaan ku rajaynaynaa in aad sii wadato barashadaada! 💪

Mahadsanid 🙏`

  return await sendWhatsAppMessage(phoneNumber, message)
}

/**
 * Send lesson completion congratulatory message
 */
export async function sendLessonCompletionMessage(
  phoneNumber: string,
  studentName: string,
  lessonTitle: string,
  courseTitle: string
): Promise<{ success: boolean; error?: string }> {
  const message = `*Hambalyo* ${studentName}! 🎉✨

Waxaad si buuxa u dhameesay:
*${lessonTitle}* ee koorsada *${courseTitle}*

*Waxaad tahay arday dadaal badan!* 💪
Sii wad barashadaada, dadaaalkaga mirihiisa waad guran doontaa dhawaan 🚀

ku laabo profilekaaga si aad ugu xijiso cashirka xiga:
*${APP_DOMAIN}/profile*

waxaan ahay markano waa ku cawin doonnaa oo ku dhiiragalin doonnaa inta ad ku guda jirtid safarkaga barashada xirfad cusub 🌟

Mahadsanid! 🙏`

  return await sendWhatsAppMessage(phoneNumber, message)
}

/**
 * Send module completion congratulatory message
 */
export async function sendModuleCompletionMessage(
  phoneNumber: string,
  studentName: string,
  moduleTitle: string,
  courseTitle: string
): Promise<{ success: boolean; error?: string }> {
  const message = `*Hambalyo weyn* ${studentName}! 🎊🎉

*Run ahaantii waxaad gaartay guul weyn waxaad dhameesay 1 module oo kamid ah koorsada * *${courseTitle}*

*${moduleTitle}*

Waxaad ku jirtaa koorsada: *${courseTitle}*

Module-ka xigta ayaa ku sugaya, sii wad barashadaada! 📚

Booqo si aad u sii wadato profilekaaga:
*${APP_DOMAIN}/profile*

Waxaan ku rajaynaynaa in aad sii wadato dadaalkaaga! 🌟

Mahadsanid! 🙏`

  return await sendWhatsAppMessage(phoneNumber, message)
}

/**
 * Send course completion congratulatory message
 */
export async function sendCourseCompletionMessage(
  phoneNumber: string,
  studentName: string,
  courseTitle: string
): Promise<{ success: boolean; error?: string }> {
  const message = `*HAMBALYO WEYN* ${studentName}! 🎊🎉🏆

*WAXAAD SI GUUL LEH U DHAMMEYSEY KOORSADA:*
*${courseTitle}*

*WAXAAD TAHay QOF DADAAL BADAN OO DADAAL BADAN!* 💪🔥✨

Waxaad xaqiijisay mid kamid riyadadii eheed in aad master gareeso xirfadaan 🌟

intaa kuma eka waxaa jira koorsoyin badan oo aad ku xijin karo booqo 

Booqo si aad u eegto koorsoyin kale:
*${APP_DOMAIN}* oo raadi xirfado kale

*Waxaan ku rajaynaynaa in aad sii wado dadaalkaaga!* 🌟
*Waxaad tahay qof dadaal badan!* 💪

Mahadsanid! 🙏`

  return await sendWhatsAppMessage(phoneNumber, message)
}

/**
 * Send inactivity reminder message (first message)
 */
export async function sendInactivityReminder1(
  phoneNumber: string,
  studentName: string
): Promise<{ success: boolean; error?: string }> {
  const message = `Assalaamu Calaykum ${studentName}! 👋

Waxaan ku soo dhaweynaynaa in aad sii wadato barashadaada! 💪

Waxaan ku soo xasuusinaynaa in aad maanta joojiso barashadaada. Laakiin tani ma aha dhamaadka, waa bilow cusub! 🌟

*Sii wad dadaalkaaga!* 🚀
Barashadu waa safar, maanta waa maalin cusub oo aad ku sii wadato safarkaaga! 📚

Booqo si aad u sii wadato:
*${APP_DOMAIN}/profile*

*Waxaan ku rajaynaynaa in aad sii wadato barashadaada!* 💪

Mahadsanid! 🙏`

  return await sendWhatsAppMessage(phoneNumber, message)
}

/**
 * Send inactivity reminder message (second message)
 */
export async function sendInactivityReminder2(
  phoneNumber: string,
  studentName: string,
  courseTitle?: string,
  lastAccessedAt?: string | Date
): Promise<{ success: boolean; error?: string }> {
  const courseText = courseTitle ? `kooriska *${courseTitle}*` : "barashadaada"
  
  // Format date and time
  let dateTimeText = ""
  let dayText = ""
  
  if (lastAccessedAt) {
    const date = new Date(lastAccessedAt)
    const now = new Date()
    
    // Format: Date and time
    const dateTime = date.toLocaleString("so-SO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    
    // Format: Day name
    const dayNames = ["Axad", "Isniin", "Talaado", "Arbaco", "Khamiis", "Jimco", "Sabti"]
    const dayName = dayNames[date.getDay()]
    
    dateTimeText = dateTime
    dayText = dayName
  } else {
    const now = new Date()
    const dateTime = now.toLocaleString("so-SO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    const dayNames = ["Axad", "Isniin", "Talaado", "Arbaco", "Khamiis", "Jimco", "Sabti"]
    dayText = dayNames[now.getDay()]
    dateTimeText = dateTime
  }
  
  const message = `${studentName}! 💪

*Waxaan ku xasuusinaynaa in aadan joojin ${courseText}!* 🚀

waa nasiib daro in aad joojiso kooris aad ka bixisay lacag barina kaa dhigi kara xirfadle isku filan ha joojin fadlan  📚

profile-kaga waxaa kuugu dambesay
${dateTimeText}
${dayText}
${courseTitle ? `*${courseTitle}*` : "koorsadaada"}

*Sii wad dadaalkaaga oo ha joojin safarkaan quruxda badan!* 💪

hada ku laabo profilekaaga dib ha u dhigan:
*${APP_DOMAIN}/profile*

Mahadsanid! 🙏`

  return await sendWhatsAppMessage(phoneNumber, message)
}

/**
 * Send 15-day inactivity warning – account will be suspended if no lesson activity.
 * Fariin degdeg ah, professional: akoonka waa la xirmi doonaa haduu sii wadan waayo waxbarashada.
 */
export async function sendInactivity15DayWarning(
  phoneNumber: string,
  studentName: string
): Promise<{ success: boolean; error?: string }> {
  const message = `Assalaamu Calaykum ${studentName},

*Fariin Muhiim ah – Markano* 📋

Waxaan ku ogeysiinaynaa in akoonkaaga *15 maalmood* ah wax cashir ah kama daawinin koorsaska aad iska diiwaangalisay.

*Haddii aad sii wadan waayo waxbarashada*, akoonkaaga waa *la xirmi doonaa* (suspended) si loo bixiyo ardayda faa'iidaysanaya fursadaha barashada.

*Tallaabada la qaado:*
• Ku soo noqo *${APP_DOMAIN}/profile* oo gudbi akoonkaaga
• Daawashada cashirada koorsaskaada si aad u sii wadato barashadaada

Waxaan rajaynaynaa inaad dib ugu noqoto. Haddii aad wax la xiriiraan kala soo xiriir.

Mahadsanid,
*Markano Team*`

  return await sendWhatsAppMessage(phoneNumber, message)
}

/**
 * Send WhatsApp to instructor after they apply (any country number).
 * Fariin qurxoon oo Somali: hambalyo, review kadibna si toos ah ugu xaris koorsaska, akoon loo firfircoon-gelin.
 */
export async function sendInstructorApplicationReceivedMessage(
  phoneNumber: string,
  fullName: string
): Promise<{ success: boolean; error?: string }> {
  const cleaned = phoneNumber.replace(/\D/g, "")
  if (cleaned.length < 8) {
    return { success: false, error: "Phone number too short" }
  }
  const message = `Assalaamu Calaykum ${fullName}! 🌟

*Hambalyo!* 🎉

Waxaad si guul leh *is-diiwaangelisay* Macalinka Markano! Farxad ayaan ka qabnaa inaad nagu soo biirtay. 🙏

*Waxaan helnay codsigaaga.* Waxaan dib-u-eegayn doonaa xogtaaga, kadibna waxaan kugula socodsiin doonnaa natiijada.

*Tallaabooyinka xiga:*
• Hagaaji oo dhamaystir xogtaaga profile-ka (haddii aad weli ku dhamaysan wayday).
• Kadib review-kayaga: *akoonkaaga waa la firfircoon-gelin doonaa*, waxaana *si toos ah* ugu heli kartaa koorsaska aad ka bari doonto.

Booqo: *${APP_DOMAIN}/instructor/login*

Mahadsanid! Markano waa kuu furan. 💪✨`

  return await sendWhatsAppMessage(phoneNumber, message)
}

/**
 * Send streak motivation message to student (admin can send anytime)
 * Ardayga wuxuu arag dashboard-ka markii loo diray.
 */
export async function sendStreakMessage(
  phoneNumber: string,
  studentName: string
): Promise<{ success: boolean; error?: string }> {
  const message = `Assalaamu Calaykum ${studentName}! 🔥

*Fariin Streak* 🚀

Markano waxaa kuu diray fariin streak si aad ugu dadaasho barashadaada! 💪

*Sii wad dadaalkaaga* – maanta waa maalin cusub oo aad ku hormarin karto xirfadaada.

Booqo si aad u sii wadato:
*${APP_DOMAIN}/profile*

Waxaan ku rajaynaynaa inaad sii wadato! 🌟

Mahadsanid! 🙏`

  return await sendWhatsAppMessage(phoneNumber, message)
}
