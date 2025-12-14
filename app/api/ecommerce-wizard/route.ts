import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leaderId = searchParams.get("leaderId")

    if (leaderId) {
      // Get specific submission
      const submissions = await sql`
        SELECT * FROM ecommerce_wizard_submissions 
        WHERE leader_id = ${leaderId}
      `
      return NextResponse.json(submissions[0] || null)
    } else {
      // Get all submissions with leader info
      const submissions = await sql`
        SELECT 
          e.*,
          us.full_name as leader_name,
          us.student_id as leader_student_id,
          c.class_name,
          u.university_name
        FROM ecommerce_wizard_submissions e
        LEFT JOIN university_students us ON e.leader_id = us.student_id
        LEFT JOIN classes c ON us.class_id = c.id
        LEFT JOIN universities u ON c.university_id = u.id
        ORDER BY e.updated_at DESC
      `
      return NextResponse.json(submissions)
    }
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { leader_id, ...formData } = data

    // Upsert submission
    const result = await sql`
      INSERT INTO ecommerce_wizard_submissions (
        leader_id,
        business_name, business_goal_short, business_goal_long, revenue_target, kpis, success_looks_like,
        business_type, target_market, competitors, market_position, value_proposition,
        platform_selected, account_created, branding_ready, payment_setup, shipping_setup,
        product_name, supplier_name, moq, unit_price, shipping_method, sample_ordered,
        implementation_steps,
        start_date, end_date, milestones,
        marketing_channels, content_plan, funnel_description,
        status, current_step, submitted_at, updated_at
      ) VALUES (
        ${leader_id},
        ${formData.business_name || null}, ${formData.business_goal_short || null}, ${formData.business_goal_long || null},
        ${formData.revenue_target || null}, ${formData.kpis || null}, ${formData.success_looks_like || null},
        ${formData.business_type || null}, ${formData.target_market || null}, ${formData.competitors || null},
        ${formData.market_position || null}, ${formData.value_proposition || null},
        ${formData.platform_selected || null}, ${formData.account_created || false}, ${formData.branding_ready || false},
        ${formData.payment_setup || false}, ${formData.shipping_setup || false},
        ${formData.product_name || null}, ${formData.supplier_name || null}, ${formData.moq || null},
        ${formData.unit_price || null}, ${formData.shipping_method || null}, ${formData.sample_ordered || false},
        ${JSON.stringify(formData.implementation_steps || [])},
        ${formData.start_date || null}, ${formData.end_date || null}, ${JSON.stringify(formData.milestones || [])},
        ${JSON.stringify(formData.marketing_channels || [])}, ${formData.content_plan || null}, ${formData.funnel_description || null},
        ${formData.status || "in_progress"}, ${formData.current_step || 1}, ${formData.submitted_at || null}, CURRENT_TIMESTAMP
      )
      ON CONFLICT (leader_id) 
      DO UPDATE SET
        business_name = EXCLUDED.business_name,
        business_goal_short = EXCLUDED.business_goal_short,
        business_goal_long = EXCLUDED.business_goal_long,
        revenue_target = EXCLUDED.revenue_target,
        kpis = EXCLUDED.kpis,
        success_looks_like = EXCLUDED.success_looks_like,
        business_type = EXCLUDED.business_type,
        target_market = EXCLUDED.target_market,
        competitors = EXCLUDED.competitors,
        market_position = EXCLUDED.market_position,
        value_proposition = EXCLUDED.value_proposition,
        platform_selected = EXCLUDED.platform_selected,
        account_created = EXCLUDED.account_created,
        branding_ready = EXCLUDED.branding_ready,
        payment_setup = EXCLUDED.payment_setup,
        shipping_setup = EXCLUDED.shipping_setup,
        product_name = EXCLUDED.product_name,
        supplier_name = EXCLUDED.supplier_name,
        moq = EXCLUDED.moq,
        unit_price = EXCLUDED.unit_price,
        shipping_method = EXCLUDED.shipping_method,
        sample_ordered = EXCLUDED.sample_ordered,
        implementation_steps = EXCLUDED.implementation_steps,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        milestones = EXCLUDED.milestones,
        marketing_channels = EXCLUDED.marketing_channels,
        content_plan = EXCLUDED.content_plan,
        funnel_description = EXCLUDED.funnel_description,
        status = EXCLUDED.status,
        current_step = EXCLUDED.current_step,
        submitted_at = EXCLUDED.submitted_at,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error saving submission:", error)
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 })
  }
}
