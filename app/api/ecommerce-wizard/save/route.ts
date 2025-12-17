import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { groupId, currentStep, ...formData } = body

    if (!groupId) {
      return NextResponse.json({ error: "Group ID required" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Check if submission exists
    const existing = await sql`
      SELECT id FROM ecommerce_wizard_submissions
      WHERE group_id = ${Number.parseInt(groupId)}
    `

    if (existing.length > 0) {
      // Update existing
      await sql`
        UPDATE ecommerce_wizard_submissions
        SET
          current_step = ${currentStep},
          business_name = ${formData.business_name || null},
          business_goal_short = ${formData.business_goal_short || null},
          business_goal_long = ${formData.business_goal_long || null},
          revenue_target = ${formData.revenue_target ? Number.parseFloat(formData.revenue_target) : null},
          kpis = ${formData.kpis || null},
          success_looks_like = ${formData.success_looks_like || null},
          business_type = ${formData.business_type || null},
          target_market = ${formData.target_market || null},
          competitors = ${formData.competitors || null},
          market_position = ${formData.market_position || null},
          value_proposition = ${formData.value_proposition || null},
          platform_selected = ${formData.platform_selected || null},
          account_created = ${formData.account_created || false},
          branding_ready = ${formData.branding_ready || false},
          payment_setup = ${formData.payment_setup || false},
          shipping_setup = ${formData.shipping_setup || false},
          product_name = ${formData.product_name || null},
          supplier_name = ${formData.supplier_name || null},
          moq = ${formData.moq ? Number.parseInt(formData.moq) : null},
          unit_price = ${formData.unit_price ? Number.parseFloat(formData.unit_price) : null},
          shipping_method = ${formData.shipping_method || null},
          sample_ordered = ${formData.sample_ordered || false},
          implementation_steps = ${JSON.stringify(formData.implementation_steps || [])},
          start_date = ${formData.start_date || null},
          end_date = ${formData.end_date || null},
          milestones = ${JSON.stringify(formData.milestones || [])},
          marketing_channels = ${JSON.stringify(formData.marketing_channels || [])},
          content_plan = ${formData.content_plan || null},
          funnel_description = ${formData.funnel_description || null},
          status = 'in_progress',
          updated_at = NOW()
        WHERE group_id = ${Number.parseInt(groupId)}
      `
    } else {
      // Insert new
      await sql`
        INSERT INTO ecommerce_wizard_submissions (
          group_id, current_step, business_name, business_goal_short, business_goal_long,
          revenue_target, kpis, success_looks_like, business_type, target_market,
          competitors, market_position, value_proposition, platform_selected,
          account_created, branding_ready, payment_setup, shipping_setup,
          product_name, supplier_name, moq, unit_price, shipping_method, sample_ordered,
          implementation_steps, start_date, end_date, milestones,
          marketing_channels, content_plan, funnel_description, status
        ) VALUES (
          ${Number.parseInt(groupId)}, ${currentStep}, ${formData.business_name || null},
          ${formData.business_goal_short || null}, ${formData.business_goal_long || null},
          ${formData.revenue_target ? Number.parseFloat(formData.revenue_target) : null},
          ${formData.kpis || null}, ${formData.success_looks_like || null},
          ${formData.business_type || null}, ${formData.target_market || null},
          ${formData.competitors || null}, ${formData.market_position || null},
          ${formData.value_proposition || null}, ${formData.platform_selected || null},
          ${formData.account_created || false}, ${formData.branding_ready || false},
          ${formData.payment_setup || false}, ${formData.shipping_setup || false},
          ${formData.product_name || null}, ${formData.supplier_name || null},
          ${formData.moq ? Number.parseInt(formData.moq) : null},
          ${formData.unit_price ? Number.parseFloat(formData.unit_price) : null},
          ${formData.shipping_method || null}, ${formData.sample_ordered || false},
          ${JSON.stringify(formData.implementation_steps || [])},
          ${formData.start_date || null}, ${formData.end_date || null},
          ${JSON.stringify(formData.milestones || [])},
          ${JSON.stringify(formData.marketing_channels || [])},
          ${formData.content_plan || null}, ${formData.funnel_description || null},
          'in_progress'
        )
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving submission:", error)
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 })
  }
}
