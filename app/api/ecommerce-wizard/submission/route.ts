import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get("groupId")

    if (!groupId) {
      return NextResponse.json({ error: "Group ID required" }, { status: 400 })
    }

    // Get submission
    const submissions = await sql`
      SELECT * FROM ecommerce_wizard_submissions
      WHERE group_id = ${Number.parseInt(groupId)}
      ORDER BY created_at DESC
      LIMIT 1
    `

    // Get group info
    const groups = await sql`
      SELECT id, name, project_name FROM groups WHERE id = ${Number.parseInt(groupId)}
    `

    return NextResponse.json({
      submission: submissions[0] || null,
      group: groups[0] || null,
    })
  } catch (error) {
    console.error("Error fetching submission:", error)
    return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const groupId = data.group_id

    if (!groupId) {
      return NextResponse.json({ error: "Group ID required" }, { status: 400 })
    }

    // Check if submission already exists
    const existing = await sql`
      SELECT id FROM ecommerce_wizard_submissions
      WHERE group_id = ${Number.parseInt(groupId)}
      LIMIT 1
    `

    if (existing.length > 0) {
      // Update existing submission
      await sql`
        UPDATE ecommerce_wizard_submissions
        SET
          business_name = ${data.business_name || null},
          business_goal_short = ${data.business_goal_short || null},
          business_goal_long = ${data.business_goal_long || null},
          revenue_target = ${data.revenue_target ? Number.parseFloat(data.revenue_target) : null},
          kpis = ${data.kpis || null},
          success_looks_like = ${data.success_looks_like || null},
          business_type = ${data.business_type || null},
          target_market = ${data.target_market || null},
          competitors = ${data.competitors || null},
          market_position = ${data.market_position || null},
          value_proposition = ${data.value_proposition || null},
          platform_selected = ${data.platform_selected || null},
          account_created = ${data.account_created || false},
          branding_ready = ${data.branding_ready || false},
          payment_setup = ${data.payment_setup || false},
          shipping_setup = ${data.shipping_setup || false},
          product_name = ${data.product_name || null},
          supplier_name = ${data.supplier_name || null},
          moq = ${data.moq ? Number.parseInt(data.moq) : null},
          unit_price = ${data.unit_price ? Number.parseFloat(data.unit_price) : null},
          shipping_method = ${data.shipping_method || null},
          sample_ordered = ${data.sample_ordered || false},
          implementation_steps = ${JSON.stringify(data.implementation_steps || [])},
          start_date = ${data.start_date || null},
          end_date = ${data.end_date || null},
          milestones = ${JSON.stringify(data.milestones || [])},
          marketing_channels = ${JSON.stringify(data.marketing_channels || [])},
          content_plan = ${data.content_plan || null},
          funnel_description = ${data.funnel_description || null},
          current_step = ${data.current_step || 1},
          status = ${data.status || "draft"},
          leader_id = ${data.leader_id || null},
          updated_at = NOW()
        WHERE group_id = ${Number.parseInt(groupId)}
      `
    } else {
      // Insert new submission
      await sql`
        INSERT INTO ecommerce_wizard_submissions (
          group_id, business_name, business_goal_short, business_goal_long,
          revenue_target, kpis, success_looks_like, business_type,
          target_market, competitors, market_position, value_proposition,
          platform_selected, account_created, branding_ready, payment_setup,
          shipping_setup, product_name, supplier_name, moq, unit_price,
          shipping_method, sample_ordered, implementation_steps, start_date,
          end_date, milestones, marketing_channels, content_plan,
          funnel_description, current_step, status, leader_id, created_at, updated_at
        ) VALUES (
          ${Number.parseInt(groupId)},
          ${data.business_name || null},
          ${data.business_goal_short || null},
          ${data.business_goal_long || null},
          ${data.revenue_target ? Number.parseFloat(data.revenue_target) : null},
          ${data.kpis || null},
          ${data.success_looks_like || null},
          ${data.business_type || null},
          ${data.target_market || null},
          ${data.competitors || null},
          ${data.market_position || null},
          ${data.value_proposition || null},
          ${data.platform_selected || null},
          ${data.account_created || false},
          ${data.branding_ready || false},
          ${data.payment_setup || false},
          ${data.shipping_setup || false},
          ${data.product_name || null},
          ${data.supplier_name || null},
          ${data.moq ? Number.parseInt(data.moq) : null},
          ${data.unit_price ? Number.parseFloat(data.unit_price) : null},
          ${data.shipping_method || null},
          ${data.sample_ordered || false},
          ${JSON.stringify(data.implementation_steps || [])},
          ${data.start_date || null},
          ${data.end_date || null},
          ${JSON.stringify(data.milestones || [])},
          ${JSON.stringify(data.marketing_channels || [])},
          ${data.content_plan || null},
          ${data.funnel_description || null},
          ${data.current_step || 1},
          ${data.status || "draft"},
          ${data.leader_id || null},
          NOW(),
          NOW()
        )
      `
    }

    return NextResponse.json({ success: true, message: "Submission saved successfully" })
  } catch (error) {
    console.error("Error saving submission:", error)
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 })
  }
}
