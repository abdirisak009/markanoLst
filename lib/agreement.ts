import type { Sql } from "postgres"

export interface AgreementVersionRow {
  id: number
  version: string
  content_html: string | null
  content_text: string | null
  pdf_url: string | null
  pdf_name: string | null
  is_active: boolean
  force_reaccept: boolean
  created_at: Date
  updated_at: Date
}

export interface InstructorAgreementStatus {
  accepted: boolean
  mustAccept: boolean
  currentVersionId: number | null
  currentVersion: string | null
  acceptedVersionId: number | null
  agreementAcceptedAt: string | null
  useLegacy: boolean
}

/**
 * Get the current active agreement version (digital system).
 * Returns null if no versions exist or none is active (fallback to legacy PDF).
 */
export async function getCurrentAgreementVersion(
  sql: Sql
): Promise<AgreementVersionRow | null> {
  try {
    const [row] = await sql`
      SELECT id, version, content_html, content_text, pdf_url, pdf_name, is_active, force_reaccept, created_at, updated_at
      FROM instructor_agreement_versions
      WHERE is_active = true
      ORDER BY id DESC
      LIMIT 1
    `
    return row as AgreementVersionRow | undefined ?? null
  } catch {
    return null
  }
}

/**
 * Check if instructor has accepted the current agreement (digital or legacy).
 * For digital: must have accepted the active version; if force_reaccept, must have accepted after it was set.
 * For legacy: agreement_accepted_at is set.
 */
export async function getInstructorAgreementStatus(
  sql: Sql,
  instructorId: number
): Promise<InstructorAgreementStatus> {
  const result: InstructorAgreementStatus = {
    accepted: false,
    mustAccept: true,
    currentVersionId: null,
    currentVersion: null,
    acceptedVersionId: null,
    agreementAcceptedAt: null,
    useLegacy: true,
  }

  try {
    const [inst] = await sql`
      SELECT agreement_accepted_at, accepted_agreement_version_id
      FROM instructors
      WHERE id = ${instructorId} AND deleted_at IS NULL
    `
    if (!inst) return result

    result.agreementAcceptedAt = inst.agreement_accepted_at ?? null
    result.acceptedVersionId = inst.accepted_agreement_version_id ?? null

    const current = await getCurrentAgreementVersion(sql)
    if (!current) {
      result.useLegacy = true
      result.accepted = !!inst.agreement_accepted_at
      result.mustAccept = !inst.agreement_accepted_at
      return result
    }

    result.useLegacy = false
    result.currentVersionId = current.id
    result.currentVersion = current.version

    if (result.acceptedVersionId === current.id) {
      result.accepted = true
      result.mustAccept = false
      return result
    }

    result.mustAccept = true
    result.accepted = false
    return result
  } catch {
    return result
  }
}

/**
 * Returns true if the instructor must accept (or re-accept) before creating lessons, publishing, etc.
 */
export async function instructorMustAcceptAgreement(
  sql: Sql,
  instructorId: number
): Promise<boolean> {
  const status = await getInstructorAgreementStatus(sql, instructorId)
  return status.mustAccept
}
