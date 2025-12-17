"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Store,
  Target,
  TrendingUp,
  Globe,
  Package,
  ListChecks,
  Calendar,
  Megaphone,
  CheckCircle2,
  Clock,
  Users,
  MapPin,
  Truck,
} from "lucide-react"

const TABS = [
  { id: "overview", label: "Overview", icon: Store },
  { id: "strategy", label: "Strategy", icon: TrendingUp },
  { id: "platform", label: "Platform", icon: Globe },
  { id: "product", label: "Product", icon: Package },
  { id: "implementation", label: "Implementation", icon: ListChecks },
  { id: "timeline", label: "Timeline", icon: Calendar },
  { id: "marketing", label: "Marketing", icon: Megaphone },
]

export default function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params)
  const router = useRouter()
  const [submission, setSubmission] = useState<any>(null)
  const [groupInfo, setGroupInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchData()
  }, [groupId])

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/ecommerce-wizard/submission?groupId=${groupId}`)
      const data = await res.json()
      if (data.submission) {
        setSubmission(data.submission)
      }
      if (data.group) {
        setGroupInfo(data.group)
      }
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#9ed674] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-[#0f1419]">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Submission Not Found</h2>
          <Button onClick={() => router.push("/ecommerce-wizard/admin")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#9ed674]" />
                  Goals & Vision
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Business Name</p>
                    <p className="text-white font-medium">{submission.business_name || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Revenue Target</p>
                    <p className="text-2xl font-bold text-[#9ed674]">
                      ${Number(submission.revenue_target || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Short-term Goal</p>
                    <p className="text-white">{submission.business_goal_short || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Long-term Goal</p>
                    <p className="text-white">{submission.business_goal_long || "Not specified"}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
                <h3 className="text-lg font-semibold text-white mb-4">KPIs</h3>
                <p className="text-gray-300">{submission.kpis || "Not specified"}</p>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <h3 className="text-lg font-semibold text-white mb-4">Success Vision</h3>
              <p className="text-gray-300 leading-relaxed">{submission.success_looks_like || "Not specified"}</p>
            </div>
          </div>
        )

      case "strategy":
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <h3 className="text-lg font-semibold text-white mb-4">Business Type</h3>
              <span className="px-4 py-2 rounded-full bg-[#9ed674]/20 text-[#9ed674] font-medium">
                {submission.business_type || "Not specified"}
              </span>
            </div>

            <div className="p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <h3 className="text-lg font-semibold text-white mb-4">Target Market</h3>
              <p className="text-gray-300">{submission.target_market || "Not specified"}</p>
            </div>

            <div className="p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <h3 className="text-lg font-semibold text-white mb-4">Competitors</h3>
              <p className="text-gray-300">{submission.competitors || "Not specified"}</p>
            </div>

            <div className="p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <h3 className="text-lg font-semibold text-white mb-4">Market Position</h3>
              <p className="text-gray-300">{submission.market_position || "Not specified"}</p>
            </div>

            <div className="md:col-span-2 p-6 rounded-xl bg-gradient-to-br from-[#1d4041]/30 to-[#9ed674]/10 border border-[#9ed674]/30">
              <h3 className="text-lg font-semibold text-white mb-4">Value Proposition</h3>
              <p className="text-gray-300 text-lg">{submission.value_proposition || "Not specified"}</p>
            </div>
          </div>
        )

      case "platform":
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-[#1d4041]/30 to-[#0f1419] border border-[#1d4041]/30">
              <h3 className="text-lg font-semibold text-white mb-4">Selected Platform</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#9ed674]/20 flex items-center justify-center">
                  <Globe className="w-8 h-8 text-[#9ed674]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{submission.platform_selected || "Not selected"}</p>
                  <p className="text-gray-400">E-commerce Platform</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Account Created", value: submission.account_created },
                { label: "Branding Ready", value: submission.branding_ready },
                { label: "Payment Setup", value: submission.payment_setup },
                { label: "Shipping Setup", value: submission.shipping_setup },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${
                    item.value ? "bg-[#9ed674]/10 border-[#9ed674]/30" : "bg-[#1a2129]/50 border-[#1d4041]/30"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg mb-3 flex items-center justify-center ${
                      item.value ? "bg-[#9ed674]/20" : "bg-[#1d4041]/50"
                    }`}
                  >
                    {item.value ? (
                      <CheckCircle2 className="w-5 h-5 text-[#9ed674]" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <p className={`text-sm font-medium ${item.value ? "text-[#9ed674]" : "text-gray-400"}`}>
                    {item.label}
                  </p>
                  <p className={`text-xs ${item.value ? "text-[#9ed674]/70" : "text-gray-500"}`}>
                    {item.value ? "Completed" : "Pending"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )

      case "product":
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2 p-6 rounded-xl bg-gradient-to-br from-[#1d4041]/30 to-[#0f1419] border border-[#1d4041]/30">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-[#9ed674]/20 flex items-center justify-center">
                  <Package className="w-10 h-10 text-[#9ed674]" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Product Name</p>
                  <p className="text-3xl font-bold text-white">{submission.product_name || "Not specified"}</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-[#9ed674]" />
                <h3 className="text-lg font-semibold text-white">Supplier</h3>
              </div>
              <p className="text-xl text-white">{submission.supplier_name || "Not specified"}</p>
            </div>

            <div className="p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-5 h-5 text-[#9ed674]" />
                <h3 className="text-lg font-semibold text-white">Shipping</h3>
              </div>
              <p className="text-xl text-white">{submission.shipping_method || "Not specified"}</p>
            </div>

            <div className="p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <p className="text-sm text-gray-400 mb-2">Minimum Order Quantity</p>
              <p className="text-3xl font-bold text-white">{submission.moq || "0"} units</p>
            </div>

            <div className="p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <p className="text-sm text-gray-400 mb-2">Unit Price</p>
              <p className="text-3xl font-bold text-[#9ed674]">${submission.unit_price || "0"}</p>
            </div>

            <div className="md:col-span-2 p-4 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Sample Ordered</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    submission.sample_ordered ? "bg-[#9ed674]/20 text-[#9ed674]" : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {submission.sample_ordered ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        )

      case "implementation":
        return (
          <div className="p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
            <h3 className="text-lg font-semibold text-white mb-6">Implementation Steps</h3>
            <div className="space-y-4">
              {(submission.implementation_steps || []).map((step: string, index: number) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1d4041] to-[#9ed674]/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1 p-4 rounded-lg bg-[#0f1419] border border-[#1d4041]/30">
                    <p className="text-white">{step || "Not specified"}</p>
                  </div>
                </div>
              ))}
              {(!submission.implementation_steps || submission.implementation_steps.length === 0) && (
                <p className="text-gray-400 text-center py-8">No implementation steps defined</p>
              )}
            </div>
          </div>
        )

      case "timeline":
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
                <p className="text-sm text-gray-400 mb-2">Start Date</p>
                <p className="text-2xl font-bold text-white">{submission.start_date || "Not set"}</p>
              </div>
              <div className="p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
                <p className="text-sm text-gray-400 mb-2">End Date</p>
                <p className="text-2xl font-bold text-white">{submission.end_date || "Not set"}</p>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <h3 className="text-lg font-semibold text-white mb-6">Milestones</h3>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#1d4041]" />
                <div className="space-y-6">
                  {(submission.milestones || []).map((milestone: any, index: number) => (
                    <div key={index} className="flex items-start gap-4 relative">
                      <div className="w-10 h-10 rounded-full bg-[#9ed674] flex items-center justify-center z-10">
                        <MapPin className="w-5 h-5 text-[#0f1419]" />
                      </div>
                      <div className="flex-1 p-4 rounded-lg bg-[#0f1419] border border-[#1d4041]/30">
                        <p className="text-white font-medium">{milestone.title || "Unnamed milestone"}</p>
                        <p className="text-sm text-[#9ed674]">{milestone.date || "No date"}</p>
                      </div>
                    </div>
                  ))}
                  {(!submission.milestones || submission.milestones.length === 0) && (
                    <p className="text-gray-400 text-center py-8">No milestones defined</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case "marketing":
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <h3 className="text-lg font-semibold text-white mb-4">Marketing Channels</h3>
              <div className="flex flex-wrap gap-3">
                {(submission.marketing_channels || []).map((channel: string, index: number) => (
                  <span key={index} className="px-4 py-2 rounded-full bg-[#9ed674]/20 text-[#9ed674] font-medium">
                    {channel}
                  </span>
                ))}
                {(!submission.marketing_channels || submission.marketing_channels.length === 0) && (
                  <p className="text-gray-400">No channels selected</p>
                )}
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <h3 className="text-lg font-semibold text-white mb-4">Content Plan</h3>
              <p className="text-gray-300 leading-relaxed">{submission.content_plan || "Not specified"}</p>
            </div>

            <div className="p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <h3 className="text-lg font-semibold text-white mb-4">Sales Funnel</h3>
              <p className="text-gray-300 leading-relaxed">{submission.funnel_description || "Not specified"}</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1419]">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1d4041] to-[#0f1419] border-b border-[#1d4041]/30">
        <div className="container mx-auto px-4 py-6">
          <Button
            onClick={() => router.push("/ecommerce-wizard/admin")}
            variant="ghost"
            className="text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#9ed674]/20 flex items-center justify-center">
                <Store className="w-8 h-8 text-[#9ed674]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{submission.business_name || "Unnamed Business"}</h1>
                <p className="text-gray-400">
                  Group #{groupId} {groupInfo?.name ? `• ${groupInfo.name}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  submission.status === "submitted"
                    ? "bg-[#9ed674]/20 text-[#9ed674]"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {submission.status === "submitted" ? "Submitted" : "In Progress"}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-xs text-gray-400">Revenue Target</p>
              <p className="text-lg font-bold text-[#9ed674]">
                ${Number(submission.revenue_target || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-xs text-gray-400">Platform</p>
              <p className="text-lg font-bold text-white">{submission.platform_selected || "-"}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-xs text-gray-400">Product</p>
              <p className="text-lg font-bold text-white truncate">{submission.product_name || "-"}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-xs text-gray-400">Progress</p>
              <p className="text-lg font-bold text-white">{submission.current_step || 1}/8 Steps</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#1d4041]/30 bg-[#1a2129]/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-[#9ed674]/20 text-[#9ed674]"
                      : "text-gray-400 hover:text-white hover:bg-[#1d4041]/20"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">{renderTabContent()}</main>
    </div>
  )
}
