"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ShoppingBag,
  Target,
  TrendingUp,
  Globe,
  Package,
  ListChecks,
  Calendar,
  Megaphone,
  CheckCircle2,
  Store,
  Users,
  DollarSign,
  Truck,
} from "lucide-react"

interface SubmissionData {
  id: number
  group_id: number
  group_name: string
  class_name: string
  business_name: string
  business_goal_short: string
  business_goal_long: string
  revenue_target: number
  kpis: string
  success_looks_like: string
  business_type: string
  target_market: string
  competitors: string
  market_position: string
  value_proposition: string
  platform_selected: string
  account_created: boolean
  branding_ready: boolean
  payment_setup: boolean
  shipping_setup: boolean
  product_name: string
  supplier_name: string
  moq: number
  unit_price: number
  shipping_method: string
  sample_ordered: boolean
  implementation_steps: string[]
  start_date: string
  end_date: string
  milestones: { title: string; date: string }[]
  marketing_channels: string[]
  content_plan: string
  funnel_description: string
  status: string
  current_step: number
  created_at: string
  updated_at: string
}

const STEPS = [
  { id: 1, title: "Goals & Vision", icon: Target },
  { id: 2, title: "Strategy & Market", icon: TrendingUp },
  { id: 3, title: "Platform Setup", icon: Globe },
  { id: 4, title: "Product Sourcing", icon: Package },
  { id: 5, title: "Implementation", icon: ListChecks },
  { id: 6, title: "Timeline", icon: Calendar },
  { id: 7, title: "Marketing", icon: Megaphone },
  { id: 8, title: "Review", icon: CheckCircle2 },
]

export default function SubmissionDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params)
  const [submission, setSubmission] = useState<SubmissionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(1)

  useEffect(() => {
    fetchSubmission()
  }, [groupId])

  const fetchSubmission = async () => {
    try {
      const res = await fetch(`/api/admin/ecommerce-submissions/${groupId}`)
      if (res.ok) {
        const data = await res.json()
        setSubmission(data.submission)
      }
    } catch (error) {
      console.error("Error fetching submission:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-3 border-[#e63946] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Submission Not Found</h2>
        <p className="text-gray-500 mb-4">This group hasn't started the E-commerce Wizard yet.</p>
        <Link href="/admin/ecommerce-submissions" className="text-[#e63946] hover:underline">
          Back to Submissions
        </Link>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <InfoCard label="Business Name" value={submission.business_name} icon={Store} />
              <InfoCard
                label="Revenue Target"
                value={submission.revenue_target ? `$${submission.revenue_target.toLocaleString()}` : "Not set"}
                icon={DollarSign}
              />
            </div>
            <InfoCard label="Short-term Goal" value={submission.business_goal_short} multiline />
            <InfoCard label="Long-term Goal" value={submission.business_goal_long} multiline />
            <InfoCard label="KPIs" value={submission.kpis} multiline />
            <InfoCard label="Success Vision" value={submission.success_looks_like} multiline />
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <InfoCard label="Business Type" value={submission.business_type} />
            <InfoCard label="Target Market" value={submission.target_market} multiline />
            <InfoCard label="Competitors" value={submission.competitors} multiline />
            <InfoCard label="Market Position" value={submission.market_position} multiline />
            <InfoCard label="Value Proposition" value={submission.value_proposition} multiline />
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <InfoCard label="Platform Selected" value={submission.platform_selected} icon={Globe} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <CheckItem label="Account Created" checked={submission.account_created} />
              <CheckItem label="Branding Ready" checked={submission.branding_ready} />
              <CheckItem label="Payment Setup" checked={submission.payment_setup} />
              <CheckItem label="Shipping Setup" checked={submission.shipping_setup} />
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <InfoCard label="Product Name" value={submission.product_name} icon={Package} />
              <InfoCard label="Supplier Name" value={submission.supplier_name} icon={Users} />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <InfoCard label="MOQ" value={submission.moq?.toString()} />
              <InfoCard label="Unit Price" value={submission.unit_price ? `$${submission.unit_price}` : ""} />
              <InfoCard label="Shipping Method" value={submission.shipping_method} icon={Truck} />
            </div>
            <CheckItem label="Sample Ordered" checked={submission.sample_ordered} />
          </div>
        )
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Implementation Steps</h3>
            {submission.implementation_steps?.length > 0 ? (
              <div className="space-y-3">
                {submission.implementation_steps.map(
                  (step, idx) =>
                    step && (
                      <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-[#e63946] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-gray-700 pt-1">{step}</p>
                      </div>
                    ),
                )}
              </div>
            ) : (
              <p className="text-gray-500">No implementation steps defined</p>
            )}
          </div>
        )
      case 6:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <InfoCard label="Start Date" value={submission.start_date} icon={Calendar} />
              <InfoCard label="End Date" value={submission.end_date} icon={Calendar} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h3>
              {submission.milestones?.length > 0 ? (
                <div className="space-y-3">
                  {submission.milestones.map(
                    (milestone, idx) =>
                      milestone.title && (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <span className="font-medium text-gray-900">{milestone.title}</span>
                          <span className="text-sm text-gray-500">{milestone.date}</span>
                        </div>
                      ),
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No milestones defined</p>
              )}
            </div>
          </div>
        )
      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketing Channels</h3>
              {submission.marketing_channels?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {submission.marketing_channels.map((channel) => (
                    <span
                      key={channel}
                      className="px-4 py-2 bg-[#e63946]/10 text-[#e63946] rounded-full text-sm font-medium"
                    >
                      {channel}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No marketing channels selected</p>
              )}
            </div>
            <InfoCard label="Content Plan" value={submission.content_plan} multiline />
            <InfoCard label="Sales Funnel" value={submission.funnel_description} multiline />
          </div>
        )
      case 8:
        return (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-[#e63946]/5 to-[#e63946]/10 rounded-2xl border border-[#e63946]/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Summary</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Store className="w-5 h-5 text-[#e63946]" />
                  <span className="text-gray-700">{submission.business_name || "Untitled Business"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-[#e63946]" />
                  <span className="text-gray-700">{submission.platform_selected || "No platform"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-[#e63946]" />
                  <span className="text-gray-700">{submission.product_name || "No product"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#e63946]" />
                  <span className="text-gray-700">
                    {submission.start_date || "No date"} - {submission.end_date || "No date"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/ecommerce-submissions" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{submission.business_name || "Untitled Business"}</h1>
          <p className="text-gray-500">
            {submission.group_name} • {submission.class_name}
          </p>
        </div>
        <div
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            submission.status === "submitted"
              ? "bg-[#e63946]/10 text-[#e63946]"
              : submission.status === "completed"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
          }`}
        >
          {submission.status === "submitted"
            ? "Submitted"
            : submission.status === "completed"
              ? "Completed"
              : "In Progress"}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Wizard Progress</span>
          <span className="text-sm text-gray-500">{submission.current_step}/8 Steps</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#e63946] to-[#ff1b4a] rounded-full transition-all"
            style={{ width: `${(submission.current_step / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveTab(step.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === step.id
                  ? "text-[#e63946] border-b-2 border-[#e63946] bg-[#e63946]/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <step.icon className="w-4 h-4" />
              {step.title}
            </button>
          ))}
        </div>
        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  )
}

function InfoCard({
  label,
  value,
  icon: Icon,
  multiline,
}: { label: string; value?: string; icon?: any; multiline?: boolean }) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-4 h-4 text-[#e63946]" />}
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      {multiline ? (
        <p className="text-gray-700 whitespace-pre-wrap">{value || "Not provided"}</p>
      ) : (
        <p className="text-gray-900 font-medium">{value || "Not provided"}</p>
      )}
    </div>
  )
}

function CheckItem({ label, checked }: { label: string; checked?: boolean }) {
  return (
    <div
      className={`p-4 rounded-xl border-2 ${checked ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-gray-50"}`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center ${checked ? "bg-emerald-500" : "bg-gray-300"}`}
        >
          {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
        </div>
        <span className={`text-sm font-medium ${checked ? "text-emerald-700" : "text-gray-500"}`}>{label}</span>
      </div>
    </div>
  )
}
