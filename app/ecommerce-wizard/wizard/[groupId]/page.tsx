"use client"

import { useState, useEffect, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import {
  ArrowLeft,
  ArrowRight,
  Target,
  TrendingUp,
  Globe,
  Package,
  ListChecks,
  Calendar,
  Megaphone,
  CheckCircle2,
  Save,
  Home,
  Plus,
  Trash2,
  Store,
  Loader2,
  ShoppingBag,
} from "lucide-react"

const STEPS = [
  { id: 1, title: "Goals & Vision", icon: Target },
  { id: 2, title: "Strategy & Market", icon: TrendingUp },
  { id: 3, title: "Platform Setup", icon: Globe },
  { id: 4, title: "Product Sourcing", icon: Package },
  { id: 5, title: "Implementation", icon: ListChecks },
  { id: 6, title: "Timeline", icon: Calendar },
  { id: 7, title: "Marketing", icon: Megaphone },
  { id: 8, title: "Review & Submit", icon: CheckCircle2 },
]

const PLATFORMS = ["Shopify", "Amazon", "Alibaba", "Custom Website", "WooCommerce", "Etsy"]
const MARKETING_CHANNELS = [
  "Social Media",
  "Google Ads",
  "Email Marketing",
  "Influencer Marketing",
  "SEO",
  "Content Marketing",
  "TikTok",
  "YouTube",
]

export default function WizardPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const leaderId = searchParams.get("leaderId") || ""

  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [groupInfo, setGroupInfo] = useState<any>(null)
  const [saveMessage, setSaveMessage] = useState("")
  const [formData, setFormData] = useState({
    // Step 1 - Goals & Vision
    business_name: "",
    business_goal_short: "",
    business_goal_long: "",
    revenue_target: "",
    kpis: "",
    success_looks_like: "",

    // Step 2 - Strategy & Market
    business_type: "",
    target_market: "",
    competitors: "",
    market_position: "",
    value_proposition: "",

    // Step 3 - Platform Setup
    platform_selected: "",
    account_created: false,
    branding_ready: false,
    payment_setup: false,
    shipping_setup: false,

    // Step 4 - Product Sourcing
    product_name: "",
    supplier_name: "",
    moq: "",
    unit_price: "",
    shipping_method: "",
    sample_ordered: false,

    // Step 5 - Implementation Steps
    implementation_steps: ["", "", "", "", ""],

    // Step 6 - Timeline
    start_date: "",
    end_date: "",
    milestones: [{ title: "", date: "" }],

    // Step 7 - Marketing
    marketing_channels: [] as string[],
    content_plan: "",
    funnel_description: "",

    // Leader ID
    leader_id: leaderId,
  })

  useEffect(() => {
    fetchGroupInfo()
    fetchExistingData()
  }, [groupId])

  const fetchGroupInfo = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`)
      if (res.ok) {
        const data = await res.json()
        setGroupInfo(data)
      }
    } catch (error) {
      console.error("Error fetching group info:", error)
    }
  }

  const fetchExistingData = async () => {
    try {
      const res = await fetch(`/api/ecommerce-wizard/submission/${groupId}`)
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setFormData((prev) => ({
            ...prev,
            ...data,
            implementation_steps: data.implementation_steps || ["", "", "", "", ""],
            milestones: data.milestones || [{ title: "", date: "" }],
            marketing_channels: data.marketing_channels || [],
            leader_id: leaderId || data.leader_id || "",
          }))
          if (data.current_step) {
            setCurrentStep(data.current_step)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching existing data:", error)
    }
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    setSaveMessage("")
    try {
      const res = await fetch("/api/ecommerce-wizard/submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          group_id: groupId,
          current_step: currentStep,
          status: "draft",
          leader_id: leaderId,
        }),
      })

      if (res.ok) {
        setSaveMessage("Draft saved successfully!")
        setTimeout(() => setSaveMessage(""), 3000)
      } else {
        setSaveMessage("Failed to save draft")
      }
    } catch (error) {
      console.error("Error saving draft:", error)
      setSaveMessage("Failed to save draft")
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch("/api/ecommerce-wizard/submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          group_id: groupId,
          current_step: 8,
          status: "submitted",
          leader_id: leaderId,
        }),
      })

      if (res.ok) {
        router.push("/ecommerce-wizard/success")
      }
    } catch (error) {
      console.error("Error submitting:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < 8) {
      handleSaveDraft()
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const addMilestone = () => {
    setFormData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, { title: "", date: "" }],
    }))
  }

  const removeMilestone = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }))
  }

  const updateMilestone = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    }))
  }

  const toggleMarketingChannel = (channel: string) => {
    setFormData((prev) => ({
      ...prev,
      marketing_channels: prev.marketing_channels.includes(channel)
        ? prev.marketing_channels.filter((c) => c !== channel)
        : [...prev.marketing_channels, channel],
    }))
  }

  const updateImplementationStep = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      implementation_steps: prev.implementation_steps.map((s, i) => (i === index ? value : s)),
    }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Name <span className="text-[#e63946]">*</span>
              </label>
              <Input
                placeholder="e.g., TechGadgets Somalia"
                value={formData.business_name}
                onChange={(e) => updateFormData("business_name", e.target.value)}
                className="bg-[#0f172a] border-[#e63946]/20 text-white placeholder-gray-500 focus:border-[#e63946] transition-all duration-300"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Short-term Goal</label>
                <Textarea
                  placeholder="What do you want to achieve in the next 3 months?"
                  value={formData.business_goal_short}
                  onChange={(e) => updateFormData("business_goal_short", e.target.value)}
                  className="bg-[#0f172a] border-[#e63946]/20 text-white placeholder-gray-500 focus:border-[#e63946] min-h-[100px] transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Long-term Goal</label>
                <Textarea
                  placeholder="Where do you see your business in 1-2 years?"
                  value={formData.business_goal_long}
                  onChange={(e) => updateFormData("business_goal_long", e.target.value)}
                  className="bg-[#0f172a] border-[#e63946]/20 text-white placeholder-gray-500 focus:border-[#e63946] min-h-[100px] transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Revenue Target ($)</label>
              <Input
                type="number"
                placeholder="e.g., 10000"
                value={formData.revenue_target}
                onChange={(e) => updateFormData("revenue_target", e.target.value)}
                className="bg-[#0f172a] border-[#e63946]/20 text-white placeholder-gray-500 focus:border-[#e63946] transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Key Performance Indicators (KPIs)</label>
              <Textarea
                placeholder="List your key metrics for measuring success..."
                value={formData.kpis}
                onChange={(e) => updateFormData("kpis", e.target.value)}
                className="bg-[#0f172a] border-[#e63946]/20 text-white placeholder-gray-500 focus:border-[#e63946] min-h-[100px] transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">What Does Success Look Like?</label>
              <Textarea
                placeholder="Describe your vision of success..."
                value={formData.success_looks_like}
                onChange={(e) => updateFormData("success_looks_like", e.target.value)}
                className="bg-[#0f172a] border-[#e63946]/20 text-white placeholder-gray-500 focus:border-[#e63946] min-h-[100px] transition-all duration-300"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Business Type</label>
              <Input
                placeholder="e.g., B2C, B2B, Dropshipping, etc."
                value={formData.business_type}
                onChange={(e) => updateFormData("business_type", e.target.value)}
                className="bg-[#0f172a] border-[#e63946]/20 text-white placeholder-gray-500 focus:border-[#e63946] transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Market</label>
              <Textarea
                placeholder="Describe your ideal customers..."
                value={formData.target_market}
                onChange={(e) => updateFormData("target_market", e.target.value)}
                className="bg-[#0f172a] border-[#e63946]/20 text-white placeholder-gray-500 focus:border-[#e63946] min-h-[100px] transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Competitors Analysis</label>
              <Textarea
                placeholder="List your main competitors and their strengths/weaknesses..."
                value={formData.competitors}
                onChange={(e) => updateFormData("competitors", e.target.value)}
                className="bg-[#0f172a] border-[#e63946]/20 text-white placeholder-gray-500 focus:border-[#e63946] min-h-[100px] transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Market Position</label>
              <Input
                placeholder="e.g., Premium, Budget-friendly, Niche specialist..."
                value={formData.market_position}
                onChange={(e) => updateFormData("market_position", e.target.value)}
                className="bg-[#0f172a] border-[#e63946]/20 text-white placeholder-gray-500 focus:border-[#e63946] transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Value Proposition</label>
              <Textarea
                placeholder="What makes your business unique? Why should customers choose you?"
                value={formData.value_proposition}
                onChange={(e) => updateFormData("value_proposition", e.target.value)}
                className="bg-[#0f172a] border-[#e63946]/20 text-white placeholder-gray-500 focus:border-[#e63946] min-h-[100px] transition-all duration-300"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Select Platform</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => updateFormData("platform_selected", platform)}
                    className={`p-4 rounded-xl border transition-all duration-300 transform hover:scale-105 ${
                      formData.platform_selected === platform
                        ? "bg-[#e63946]/20 border-[#e63946] text-white shadow-lg shadow-[#e63946]/10"
                        : "bg-[#0f172a] border-[#e63946]/20 text-gray-400 hover:border-[#e63946]/40"
                    }`}
                  >
                    <Store className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">{platform}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold text-white">Setup Checklist</h3>
              {[
                { key: "account_created", label: "Account Created" },
                { key: "branding_ready", label: "Branding Ready (Logo, Colors, etc.)" },
                { key: "payment_setup", label: "Payment Gateway Setup" },
                { key: "shipping_setup", label: "Shipping Configuration" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-3 p-4 bg-[#0f172a]/50 rounded-xl border border-[#e63946]/10 hover:border-[#e63946]/30 transition-all duration-300"
                >
                  <Checkbox
                    checked={formData[item.key as keyof typeof formData] as boolean}
                    onCheckedChange={(checked) => updateFormData(item.key, checked)}
                    className="border-[#e63946]/50 data-[state=checked]:bg-[#e63946] data-[state=checked]:border-[#e63946]"
                  />
                  <span className="text-gray-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Product Name</label>
              <Input
                placeholder="What product will you sell?"
                value={formData.product_name}
                onChange={(e) => updateFormData("product_name", e.target.value)}
                className="bg-[#0f172a] border-[#e63946]/20 text-white placeholder-gray-500 focus:border-[#e63946] transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Supplier Name</label>
              <Input
                placeholder="Who is your supplier?"
                value={formData.supplier_name}
                onChange={(e) => updateFormData("supplier_name", e.target.value)}
                className="bg-[#0f172a] border-[#e63946]/20 text-white placeholder-gray-500 focus:border-[#e63946] transition-all duration-300"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Order Quantity (MOQ)</label>
                <Input
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.moq}
                  onChange={(e) => updateFormData("moq", e.target.value)}
                  className="bg-[#0f172a] border-[#e63946]/20 text-white placeholder-gray-500 focus:border-[#e63946] transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Unit Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 5.99"
                  value={formData.unit_price}
                  onChange={(e) => updateFormData("unit_price", e.target.value)}
                  className="bg-[#0f172a] border-[#e63946]/20 text-white placeholder-gray-500 focus:border-[#e63946] transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Shipping Method</label>
              <Input
                placeholder="e.g., Air freight, Sea freight, Express shipping..."
                value={formData.shipping_method}
                onChange={(e) => updateFormData("shipping_method", e.target.value)}
                className="bg-[#0f172a] border-[#e63946]/20 text-white placeholder-gray-500 focus:border-[#e63946] transition-all duration-300"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#0f172a]/50 rounded-xl border border-[#e63946]/10">
              <Checkbox
                checked={formData.sample_ordered}
                onCheckedChange={(checked) => updateFormData("sample_ordered", checked)}
                className="border-[#e63946]/50 data-[state=checked]:bg-[#e63946] data-[state=checked]:border-[#e63946]"
              />
              <span className="text-gray-300">Sample Ordered</span>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6 animate-fadeIn">
            <p className="text-gray-400 mb-4">
              List the key implementation steps for launching your e-commerce business.
            </p>
            {formData.implementation_steps.map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-[#0f172a]/50 rounded-xl border border-[#e63946]/10 hover:border-[#e63946]/30 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-[#e63946] to-[#c1121f] rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  {index + 1}
                </div>
                <Input
                  placeholder={`Step ${index + 1}: Describe the action...`}
                  value={step}
                  onChange={(e) => updateImplementationStep(index, e.target.value)}
                  className="flex-1 bg-transparent border-0 text-white placeholder-gray-500 focus:ring-0"
                />
              </div>
            ))}
          </div>
        )

      case 6:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateFormData("start_date", e.target.value)}
                  className="bg-[#0f172a] border-[#e63946]/20 text-white focus:border-[#e63946] transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => updateFormData("end_date", e.target.value)}
                  className="bg-[#0f172a] border-[#e63946]/20 text-white focus:border-[#e63946] transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Milestones</h3>
                <Button
                  onClick={addMilestone}
                  variant="outline"
                  size="sm"
                  className="border-[#e63946]/30 text-[#e63946] hover:bg-[#e63946]/10 bg-transparent"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Milestone
                </Button>
              </div>

              {formData.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-[#0f172a]/50 rounded-xl border border-[#e63946]/10 hover:border-[#e63946]/30 transition-all duration-300"
                >
                  <div className="flex-1 grid md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Milestone title..."
                      value={milestone.title}
                      onChange={(e) => updateMilestone(index, "title", e.target.value)}
                      className="bg-transparent border-[#e63946]/20 text-white placeholder-gray-500"
                    />
                    <Input
                      type="date"
                      value={milestone.date}
                      onChange={(e) => updateMilestone(index, "date", e.target.value)}
                      className="bg-transparent border-[#e63946]/20 text-white"
                    />
                  </div>
                  {formData.milestones.length > 1 && (
                    <Button
                      onClick={() => removeMilestone(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Marketing Channels</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {MARKETING_CHANNELS.map((channel) => (
                  <button
                    key={channel}
                    onClick={() => toggleMarketingChannel(channel)}
                    className={`p-3 rounded-xl border text-sm transition-all duration-300 transform hover:scale-105 ${
                      formData.marketing_channels.includes(channel)
                        ? "bg-[#e63946]/20 border-[#e63946] text-white shadow-lg shadow-[#e63946]/10"
                        : "bg-[#0f172a] border-[#e63946]/20 text-gray-400 hover:border-[#e63946]/40"
                    }`}
                  >
                    {channel}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content Plan</label>
              <Textarea
                placeholder="Describe your content strategy..."
                value={formData.content_plan}
                onChange={(e) => updateFormData("content_plan", e.target.value)}
                className="bg-[#0f172a] border-[#e63946]/20 text-white placeholder-gray-500 focus:border-[#e63946] min-h-[120px] transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sales Funnel Description</label>
              <Textarea
                placeholder="How will you convert visitors to customers?"
                value={formData.funnel_description}
                onChange={(e) => updateFormData("funnel_description", e.target.value)}
                className="bg-[#0f172a] border-[#e63946]/20 text-white placeholder-gray-500 focus:border-[#e63946] min-h-[120px] transition-all duration-300"
              />
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-r from-[#e63946] to-[#c1121f] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#e63946]/30">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Review Your Business Plan</h3>
              <p className="text-gray-400">Make sure all information is correct before submitting.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-[#0f172a]/50 rounded-xl border border-[#e63946]/10">
                <h4 className="font-semibold text-[#e63946] mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Goals & Vision
                </h4>
                <p className="text-white font-medium">{formData.business_name || "Not set"}</p>
                <p className="text-gray-400 text-sm mt-1">Target: ${formData.revenue_target || "Not set"}</p>
              </div>

              <div className="p-6 bg-[#0f172a]/50 rounded-xl border border-[#e63946]/10">
                <h4 className="font-semibold text-[#e63946] mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Platform
                </h4>
                <p className="text-white font-medium">{formData.platform_selected || "Not selected"}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {[
                    formData.account_created && "Account ✓",
                    formData.branding_ready && "Branding ✓",
                    formData.payment_setup && "Payment ✓",
                    formData.shipping_setup && "Shipping ✓",
                  ]
                    .filter(Boolean)
                    .join(", ") || "Setup pending"}
                </p>
              </div>

              <div className="p-6 bg-[#0f172a]/50 rounded-xl border border-[#e63946]/10">
                <h4 className="font-semibold text-[#e63946] mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Product
                </h4>
                <p className="text-white font-medium">{formData.product_name || "Not set"}</p>
                <p className="text-gray-400 text-sm mt-1">
                  Supplier: {formData.supplier_name || "Not set"} | Price: ${formData.unit_price || "0"}
                </p>
              </div>

              <div className="p-6 bg-[#0f172a]/50 rounded-xl border border-[#e63946]/10">
                <h4 className="font-semibold text-[#e63946] mb-3 flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  Marketing
                </h4>
                <p className="text-white font-medium">{formData.marketing_channels.length} Channels Selected</p>
                <p className="text-gray-400 text-sm mt-1">
                  {formData.marketing_channels.slice(0, 3).join(", ")}
                  {formData.marketing_channels.length > 3 && "..."}
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-xl border-b border-[#e63946]/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/ecommerce-wizard")}
                className="p-2 hover:bg-[#e63946]/10 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5 text-gray-400" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#e63946]/20 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-[#e63946]" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">E-commerce Wizard</h1>
                  <p className="text-sm text-gray-400">
                    {groupInfo?.name || "Loading..."} • {groupInfo?.class_name || ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {saveMessage && <span className="text-sm text-green-400 animate-pulse">{saveMessage}</span>}
              <Button
                onClick={handleSaveDraft}
                disabled={saving}
                variant="outline"
                className="border-[#e63946]/30 text-[#e63946] hover:bg-[#e63946]/10 bg-transparent"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Draft
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="border-b border-[#e63946]/10 bg-[#1e293b]/30">
        <div className="max-w-6xl mx-auto px-4 py-4 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-[#e63946] text-white shadow-lg shadow-[#e63946]/30"
                      : isCompleted
                        ? "bg-[#e63946]/20 text-[#e63946]"
                        : "bg-[#0f172a]/50 text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium hidden md:inline">{step.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="h-1 bg-[#1e293b] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#e63946] to-[#c1121f] transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Step Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-r from-[#e63946] to-[#c1121f] rounded-2xl flex items-center justify-center shadow-lg shadow-[#e63946]/30">
            {(() => {
              const Icon = STEPS[currentStep - 1].icon
              return <Icon className="w-7 h-7 text-white" />
            })()}
          </div>
          <div>
            <p className="text-[#e63946] text-sm font-medium">Step {currentStep} of 8</p>
            <h2 className="text-2xl font-bold text-white">{STEPS[currentStep - 1].title}</h2>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-[#1e293b]/50 rounded-2xl border border-[#e63946]/10 p-8 mb-8">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            variant="outline"
            className="border-[#e63946]/30 text-gray-300 hover:bg-[#e63946]/10 disabled:opacity-30 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep === 8 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-[#e63946] to-[#c1121f] text-white hover:shadow-lg hover:shadow-[#e63946]/30"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Business Plan
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-[#e63946] to-[#c1121f] text-white hover:shadow-lg hover:shadow-[#e63946]/30 group"
            >
              Next Step
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#e63946]/10 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-3">
          <Image src="/images/markano-logo.png" alt="Markano" width={24} height={24} className="object-contain" />
          <span className="text-gray-500 text-sm">Powered by Markano Learning Platform</span>
        </div>
      </div>
    </div>
  )
}
