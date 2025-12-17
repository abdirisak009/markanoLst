import { neon } from "@neondatabase/serverless"
import { type NextRequest, NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params

    // Get group info
    const groupResult = await sql`
      SELECT g.name, c.name as class_name 
      FROM groups g 
      LEFT JOIN classes c ON g.class_id = c.id 
      WHERE g.id = ${groupId}
    `

    // Get existing submission
    const result = await sql`
      SELECT * FROM ecommerce_wizard_submissions 
      WHERE group_id = ${groupId}
    `

    // Get implementation steps
    let implementationSteps: string[] = []
    let milestones: { title: string; date: string }[] = []

    if (result.length > 0) {
      const stepsResult = await sql`
        SELECT step_description FROM ecommerce_implementation_steps 
        WHERE submission_id = ${result[0].id} 
        ORDER BY step_number
      `
      implementationSteps = stepsResult.map((s: any) => s.step_description)

      const milestonesResult = await sql`
        SELECT milestone_title, milestone_date FROM ecommerce_milestones 
        WHERE submission_id = ${result[0].id}
      `
      milestones = milestonesResult.map((m: any) => ({
        title: m.milestone_title,
        date: m.milestone_date ? m.milestone_date.toISOString().split("T")[0] : "",
      }))
    }

    return NextResponse.json({
      data:
        result.length > 0
          ? {
              ...result[0],
              implementation_steps: implementationSteps.length > 0 ? implementationSteps : ["", "", "", "", ""],
              milestones: milestones.length > 0 ? milestones : [{ title: "", date: "" }],
              start_date: result[0].start_date ? result[0].start_date.toISOString().split("T")[0] : "",
              end_date: result[0].end_date ? result[0].end_date.toISOString().split("T")[0] : "",
            }
          : null,
      group_name: groupResult[0]?.name || `Group ${groupId}`,
    })
  } catch (error) {
    console.error("Error fetching wizard data:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params
    const data = await request.json()

    // Check if submission exists
    const existing = await sql`
      SELECT id FROM ecommerce_wizard_submissions WHERE group_id = ${groupId}
    `

    let submissionId: number

    if (existing.length > 0) {
      // Update existing
      submissionId = existing[0].id
      await sql`
        UPDATE ecommerce_wizard_submissions SET
          current_step = ${data.current_step || 1},
          business_name = ${data.business_name || null},
          business_goal_short = ${data.business_goal_short || null},
          business_goal_long = ${data.business_goal_long || null},
          revenue_target = ${data.revenue_target || null},
          kpis = ${data.kpis || null},
          success_definition = ${data.success_definition || null},
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
          moq = ${data.moq || null},
          unit_price = ${data.unit_price ? Number.parseFloat(data.unit_price.replace(/[^0-9.]/g, "")) : null},
          shipping_method = ${data.shipping_method || null},
          sample_ordered = ${data.sample_ordered || false},
          start_date = ${data.start_date || null},
          end_date = ${data.end_date || null},
          marketing_channels = ${data.marketing_channels || []},
          content_plan = ${data.content_plan || null},
          funnel_description = ${data.funnel_description || null},
          updated_at = NOW()
        WHERE group_id = ${groupId}
      `
    } else {
      // Create new
      const result = await sql`
        INSERT INTO ecommerce_wizard_submissions (
          group_id, current_step, business_name, business_goal_short, business_goal_long,
          revenue_target, kpis, success_definition, business_type, target_market,
          competitors, market_position, value_proposition, platform_selected,
          account_created, branding_ready, payment_setup, shipping_setup,
          product_name, supplier_name, moq, unit_price, shipping_method, sample_ordered,
          start_date, end_date, marketing_channels, content_plan, funnel_description
        ) VALUES (
          ${groupId}, ${data.current_step || 1}, ${data.business_name || null},
          ${data.business_goal_short || null}, ${data.business_goal_long || null},
          ${data.revenue_target || null}, ${data.kpis || null}, ${data.success_definition || null},
          ${data.business_type || null}, ${data.target_market || null},
          ${data.competitors || null}, ${data.market_position || null}, ${data.value_proposition || null},
          ${data.platform_selected || null}, ${data.account_created || false}, ${data.branding_ready || false},
          ${data.payment_setup || false}, ${data.shipping_setup || false},
          ${data.product_name || null}, ${data.supplier_name || null}, ${data.moq || null},
          ${data.unit_price ? Number.parseFloat(data.unit_price.replace(/[^0-9.]/g, "")) : null},
          ${data.shipping_method || null}, ${data.sample_ordered || false},
          ${data.start_date || null}, ${data.end_date || null},
          ${data.marketing_channels || []}, ${data.content_plan || null}, ${data.funnel_description || null}
        ) RETURNING id
      `
      submissionId = result[0].id
    }

    // Update implementation steps
    await sql`DELETE FROM ecommerce_implementation_steps WHERE submission_id = ${submissionId}`
    if (data.implementation_steps && data.implementation_steps.length > 0) {
      for (let i = 0; i < data.implementation_steps.length; i++) {
        if (data.implementation_steps[i]) {
          await sql`
            INSERT INTO ecommerce_implementation_steps (submission_id, step_number, step_description)
            VALUES (${submissionId}, ${i + 1}, ${data.implementation_steps[i]})
          `
        }
      }
    }

    // Update milestones
    await sql`DELETE FROM ecommerce_milestones WHERE submission_id = ${submissionId}`
    if (data.milestones && data.milestones.length > 0) {
      for (const milestone of data.milestones) {
        if (milestone.title) {
          await sql`
            INSERT INTO ecommerce_milestones (submission_id, milestone_title, milestone_date)
            VALUES (${submissionId}, ${milestone.title}, ${milestone.date || null})
          `
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving wizard data:", error)
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 })
  }
}
