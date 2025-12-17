"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
  Sparkles,
  Store,
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
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [groupInfo, setGroupInfo] = useState<any>(null)
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
  })

  useEffect(() => {
    fetchExistingData()
  }, [groupId])

  const fetchExistingData = async () => {
    try {
      const res = await fetch(`/api/ecommerce-wizard/submission?groupId=${groupId}`)
      const data = await res.json()

      if (data.submission) {
        const sub = data.submission
        setFormData({
          business_name: sub.business_name || "",
          business_goal_short: sub.business_goal_short || "",
          business_goal_long: sub.business_goal_long || "",
          revenue_target: sub.revenue_target?.toString() || "",
          kpis: sub.kpis || "",
          success_looks_like: sub.success_looks_like || "",
          business_type: sub.business_type || "",
          target_market: sub.target_market || "",
          competitors: sub.competitors || "",
          market_position: sub.market_position || "",
          value_proposition: sub.value_proposition || "",
          platform_selected: sub.platform_selected || "",
          account_created: sub.account_created || false,
          branding_ready: sub.branding_ready || false,
          payment_setup: sub.payment_setup || false,
          shipping_setup: sub.shipping_setup || false,
          product_name: sub.product_name || "",
          supplier_name: sub.supplier_name || "",
          moq: sub.moq?.toString() || "",
          unit_price: sub.unit_price?.toString() || "",
          shipping_method: sub.shipping_method || "",
          sample_ordered: sub.sample_ordered || false,
          implementation_steps: sub.implementation_steps || ["", "", "", "", ""],
          start_date: sub.start_date || "",
          end_date: sub.end_date || "",
          milestones: sub.milestones || [{ title: "", date: "" }],
          marketing_channels: sub.marketing_channels || [],
          content_plan: sub.content_plan || "",
          funnel_description: sub.funnel_description || "",
        })
        setCurrentStep(sub.current_step || 1)
      }

      if (data.group) {
        setGroupInfo(data.group)
      }
    } catch (err) {
      console.error("Error fetching data:", err)
    }
  }

  const handleSave = async (nextStep?: number) => {
    setSaving(true)
    try {
      await fetch("/api/ecommerce-wizard/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          currentStep: nextStep || currentStep,
          ...formData,
        }),
      })

      if (nextStep) {
        setCurrentStep(nextStep)
      }
    } catch (err) {
      console.error("Error saving:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await fetch("/api/ecommerce-wizard/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          ...formData,
        }),
      })

      router.push(`/ecommerce-wizard/success?groupId=${groupId}`)
    } catch (err) {
      console.error("Error submitting:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addImplementationStep = () => {
    setFormData((prev) => ({
      ...prev,
      implementation_steps: [...prev.implementation_steps, ""],
    }))
  }

  const removeImplementationStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      implementation_steps: prev.implementation_steps.filter((_, i) => i !== index),
    }))
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

  const toggleMarketingChannel = (channel: string) => {
    setFormData((prev) => ({
      ...prev,
      marketing_channels: prev.marketing_channels.includes(channel)
        ? prev.marketing_channels.filter((c) => c !== channel)
        : [...prev.marketing_channels, channel],
    }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Business Name *</label>
              <Input
                value={formData.business_name}
                onChange={(e) => updateField("business_name", e.target.value)}
                placeholder="e.g., TechGadgets Somalia"
                className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Short-term Goal</label>
                <Textarea
                  value={formData.business_goal_short}
                  onChange={(e) => updateField("business_goal_short", e.target.value)}
                  placeholder="What do you want to achieve in 3-6 months?"
                  className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674] min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Long-term Goal</label>
                <Textarea
                  value={formData.business_goal_long}
                  onChange={(e) => updateField("business_goal_long", e.target.value)}
                  placeholder="Where do you see your business in 1-3 years?"
                  className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674] min-h-[100px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Revenue Target ($)</label>
              <Input
                type="number"
                value={formData.revenue_target}
                onChange={(e) => updateField("revenue_target", e.target.value)}
                placeholder="e.g., 50000"
                className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Key Performance Indicators (KPIs)</label>
              <Textarea
                value={formData.kpis}
                onChange={(e) => updateField("kpis", e.target.value)}
                placeholder="e.g., Monthly sales, Customer acquisition cost, Conversion rate..."
                className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">What Does Success Look Like?</label>
              <Textarea
                value={formData.success_looks_like}
                onChange={(e) => updateField("success_looks_like", e.target.value)}
                placeholder="Describe your vision of success..."
                className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674] min-h-[120px]"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Business Type</label>
              <select
                value={formData.business_type}
                onChange={(e) => updateField("business_type", e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#0f1419] border border-[#1d4041]/50 text-white focus:border-[#9ed674]"
              >
                <option value="">Select type...</option>
                <option value="B2C">B2C (Business to Consumer)</option>
                <option value="B2B">B2B (Business to Business)</option>
                <option value="C2C">C2C (Consumer to Consumer)</option>
                <option value="D2C">D2C (Direct to Consumer)</option>
                <option value="Dropshipping">Dropshipping</option>
                <option value="Wholesale">Wholesale</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Market</label>
              <Textarea
                value={formData.target_market}
                onChange={(e) => updateField("target_market", e.target.value)}
                placeholder="Who are your ideal customers? Age, location, interests..."
                className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674] min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Competitors Analysis</label>
              <Textarea
                value={formData.competitors}
                onChange={(e) => updateField("competitors", e.target.value)}
                placeholder="List your main competitors and their strengths/weaknesses..."
                className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674] min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Market Position</label>
              <Textarea
                value={formData.market_position}
                onChange={(e) => updateField("market_position", e.target.value)}
                placeholder="How will you position your business in the market?"
                className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Value Proposition</label>
              <Textarea
                value={formData.value_proposition}
                onChange={(e) => updateField("value_proposition", e.target.value)}
                placeholder="What unique value do you offer to customers?"
                className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674] min-h-[100px]"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Platform Selected</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => updateField("platform_selected", platform)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.platform_selected === platform
                        ? "border-[#9ed674] bg-[#9ed674]/10"
                        : "border-[#1d4041]/50 hover:border-[#1d4041]"
                    }`}
                  >
                    <span className="text-white font-medium">{platform}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <h3 className="text-lg font-semibold text-white mb-4">Setup Checklist</h3>

              <div className="space-y-4">
                {[
                  { id: "account_created", label: "Account Created", desc: "Platform account is set up" },
                  { id: "branding_ready", label: "Branding Ready", desc: "Logo, colors, and brand assets" },
                  { id: "payment_setup", label: "Payment Setup", desc: "Payment gateway configured" },
                  { id: "shipping_setup", label: "Shipping Setup", desc: "Shipping methods configured" },
                ].map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer ${
                      formData[item.id as keyof typeof formData]
                        ? "border-[#9ed674]/50 bg-[#9ed674]/5"
                        : "border-[#1d4041]/30 hover:border-[#1d4041]"
                    }`}
                    onClick={() => updateField(item.id, !formData[item.id as keyof typeof formData])}
                  >
                    <Checkbox
                      checked={formData[item.id as keyof typeof formData] as boolean}
                      onCheckedChange={(checked) => updateField(item.id, checked)}
                      className="border-[#1d4041] data-[state=checked]:bg-[#9ed674] data-[state=checked]:border-[#9ed674]"
                    />
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Product Name *</label>
                <Input
                  value={formData.product_name}
                  onChange={(e) => updateField("product_name", e.target.value)}
                  placeholder="e.g., Wireless Earbuds Pro"
                  className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Supplier Name</label>
                <Input
                  value={formData.supplier_name}
                  onChange={(e) => updateField("supplier_name", e.target.value)}
                  placeholder="e.g., Shenzhen Tech Co."
                  className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674]"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">MOQ (Minimum Order)</label>
                <Input
                  type="number"
                  value={formData.moq}
                  onChange={(e) => updateField("moq", e.target.value)}
                  placeholder="e.g., 100"
                  className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Unit Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) => updateField("unit_price", e.target.value)}
                  placeholder="e.g., 15.99"
                  className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Shipping Method</label>
                <select
                  value={formData.shipping_method}
                  onChange={(e) => updateField("shipping_method", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#0f1419] border border-[#1d4041]/50 text-white focus:border-[#9ed674]"
                >
                  <option value="">Select...</option>
                  <option value="Air Freight">Air Freight</option>
                  <option value="Sea Freight">Sea Freight</option>
                  <option value="Express (DHL/FedEx)">Express (DHL/FedEx)</option>
                  <option value="ePacket">ePacket</option>
                </select>
              </div>
            </div>

            <div
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer ${
                formData.sample_ordered
                  ? "border-[#9ed674]/50 bg-[#9ed674]/5"
                  : "border-[#1d4041]/30 hover:border-[#1d4041]"
              }`}
              onClick={() => updateField("sample_ordered", !formData.sample_ordered)}
            >
              <Checkbox
                checked={formData.sample_ordered}
                onCheckedChange={(checked) => updateField("sample_ordered", checked)}
                className="border-[#1d4041] data-[state=checked]:bg-[#9ed674] data-[state=checked]:border-[#9ed674]"
              />
              <div>
                <p className="text-white font-medium">Sample Ordered</p>
                <p className="text-sm text-gray-400">Have you ordered a product sample from the supplier?</p>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Implementation Steps</h3>
              <Button
                onClick={addImplementationStep}
                variant="outline"
                size="sm"
                className="border-[#9ed674]/50 text-[#9ed674] hover:bg-[#9ed674]/10 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Step
              </Button>
            </div>

            <div className="space-y-4">
              {formData.implementation_steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#1d4041] flex items-center justify-center flex-shrink-0 mt-2">
                    <span className="text-[#9ed674] text-sm font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <Input
                      value={step}
                      onChange={(e) => {
                        const newSteps = [...formData.implementation_steps]
                        newSteps[index] = e.target.value
                        updateField("implementation_steps", newSteps)
                      }}
                      placeholder={`Step ${index + 1}: Describe what needs to be done...`}
                      className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674]"
                    />
                  </div>
                  {formData.implementation_steps.length > 1 && (
                    <Button
                      onClick={() => removeImplementationStep(index)}
                      variant="ghost"
                      size="icon"
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

      case 6:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateField("start_date", e.target.value)}
                  className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => updateField("end_date", e.target.value)}
                  className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Milestones</h3>
                <Button
                  onClick={addMilestone}
                  variant="outline"
                  size="sm"
                  className="border-[#9ed674]/50 text-[#9ed674] hover:bg-[#9ed674]/10 bg-transparent"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Milestone
                </Button>
              </div>

              <div className="space-y-4">
                {formData.milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg bg-[#1a2129]/50 border border-[#1d4041]/30"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1d4041] to-[#9ed674]/50 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 grid md:grid-cols-2 gap-4">
                      <Input
                        value={milestone.title}
                        onChange={(e) => {
                          const newMilestones = [...formData.milestones]
                          newMilestones[index] = { ...milestone, title: e.target.value }
                          updateField("milestones", newMilestones)
                        }}
                        placeholder="Milestone title..."
                        className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674]"
                      />
                      <Input
                        type="date"
                        value={milestone.date}
                        onChange={(e) => {
                          const newMilestones = [...formData.milestones]
                          newMilestones[index] = { ...milestone, date: e.target.value }
                          updateField("milestones", newMilestones)
                        }}
                        className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674]"
                      />
                    </div>
                    {formData.milestones.length > 1 && (
                      <Button
                        onClick={() => removeMilestone(index)}
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">Marketing Channels</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {MARKETING_CHANNELS.map((channel) => (
                  <button
                    key={channel}
                    onClick={() => toggleMarketingChannel(channel)}
                    className={`p-3 rounded-xl border-2 transition-all text-sm ${
                      formData.marketing_channels.includes(channel)
                        ? "border-[#9ed674] bg-[#9ed674]/10 text-[#9ed674]"
                        : "border-[#1d4041]/50 text-gray-400 hover:border-[#1d4041] hover:text-white"
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
                value={formData.content_plan}
                onChange={(e) => updateField("content_plan", e.target.value)}
                placeholder="Describe your content strategy: What content will you create? How often will you post?"
                className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674] min-h-[120px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sales Funnel Description</label>
              <Textarea
                value={formData.funnel_description}
                onChange={(e) => updateField("funnel_description", e.target.value)}
                placeholder="Describe your customer journey from awareness to purchase..."
                className="bg-[#0f1419] border-[#1d4041]/50 text-white focus:border-[#9ed674] min-h-[120px]"
              />
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#1d4041] to-[#9ed674] flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Review Your Submission</h3>
              <p className="text-gray-400">Please review all the information before submitting</p>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Business Info */}
              <div className="p-4 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
                <h4 className="text-[#9ed674] font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Business Info
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400">Name:</span>{" "}
                    <span className="text-white">{formData.business_name || "Not set"}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Type:</span>{" "}
                    <span className="text-white">{formData.business_type || "Not set"}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Revenue Target:</span>{" "}
                    <span className="text-white">${formData.revenue_target || "0"}</span>
                  </p>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
                <h4 className="text-[#9ed674] font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Product Info
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400">Product:</span>{" "}
                    <span className="text-white">{formData.product_name || "Not set"}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Supplier:</span>{" "}
                    <span className="text-white">{formData.supplier_name || "Not set"}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Unit Price:</span>{" "}
                    <span className="text-white">${formData.unit_price || "0"}</span>
                  </p>
                </div>
              </div>

              {/* Platform */}
              <div className="p-4 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
                <h4 className="text-[#9ed674] font-semibold mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Platform
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400">Platform:</span>{" "}
                    <span className="text-white">{formData.platform_selected || "Not set"}</span>
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.account_created && (
                      <span className="px-2 py-1 rounded bg-[#9ed674]/20 text-[#9ed674] text-xs">Account ✓</span>
                    )}
                    {formData.branding_ready && (
                      <span className="px-2 py-1 rounded bg-[#9ed674]/20 text-[#9ed674] text-xs">Branding ✓</span>
                    )}
                    {formData.payment_setup && (
                      <span className="px-2 py-1 rounded bg-[#9ed674]/20 text-[#9ed674] text-xs">Payment ✓</span>
                    )}
                    {formData.shipping_setup && (
                      <span className="px-2 py-1 rounded bg-[#9ed674]/20 text-[#9ed674] text-xs">Shipping ✓</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-4 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
                <h4 className="text-[#9ed674] font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Timeline
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400">Start:</span>{" "}
                    <span className="text-white">{formData.start_date || "Not set"}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">End:</span>{" "}
                    <span className="text-white">{formData.end_date || "Not set"}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Milestones:</span>{" "}
                    <span className="text-white">{formData.milestones.filter((m) => m.title).length} items</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Marketing */}
            <div className="p-4 rounded-xl bg-[#1a2129]/50 border border-[#1d4041]/30">
              <h4 className="text-[#9ed674] font-semibold mb-3 flex items-center gap-2">
                <Megaphone className="w-4 h-4" /> Marketing Channels
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.marketing_channels.length > 0 ? (
                  formData.marketing_channels.map((channel) => (
                    <span key={channel} className="px-3 py-1 rounded-full bg-[#1d4041]/50 text-white text-sm">
                      {channel}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">No channels selected</span>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1419]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f1419]/95 backdrop-blur-xl border-b border-[#1d4041]/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/ecommerce-wizard")}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <Home className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#9ed674]" />
                  E-commerce Wizard
                </h1>
                <p className="text-sm text-gray-400">
                  Group {groupId} {groupInfo?.name ? `- ${groupInfo.name}` : ""}
                </p>
              </div>
            </div>

            <Button
              onClick={() => handleSave()}
              disabled={saving}
              variant="outline"
              className="border-[#9ed674]/50 text-[#9ed674] hover:bg-[#9ed674]/10"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Draft"}
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-[#1a2129]/50 border-b border-[#1d4041]/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    handleSave(step.id)
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#9ed674]/20 text-[#9ed674]"
                      : isCompleted
                        ? "text-[#9ed674]/70 hover:bg-[#1d4041]/30"
                        : "text-gray-500 hover:text-gray-400 hover:bg-[#1d4041]/20"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive
                        ? "bg-[#9ed674] text-[#0f1419]"
                        : isCompleted
                          ? "bg-[#9ed674]/30 text-[#9ed674]"
                          : "bg-[#1d4041]/50 text-gray-400"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="hidden md:inline text-sm font-medium">{step.title}</span>
                </button>
              )
            })}
          </div>

          {/* Progress Line */}
          <div className="mt-4 h-2 bg-[#1d4041]/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1d4041] to-[#9ed674] transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Step Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1d4041] to-[#9ed674]/50 flex items-center justify-center">
                {(() => {
                  const Icon = STEPS[currentStep - 1]?.icon
                  return Icon ? <Icon className="w-5 h-5 text-white" /> : null
                })()}
              </div>
              <div>
                <p className="text-sm text-[#9ed674]">
                  Step {currentStep} of {STEPS.length}
                </p>
                <h2 className="text-2xl font-bold text-white">{STEPS[currentStep - 1]?.title}</h2>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-[#1a2129]/50 rounded-2xl border border-[#1d4041]/30 p-6 md:p-8">{renderStepContent()}</div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              onClick={() => handleSave(currentStep - 1)}
              disabled={currentStep === 1 || saving}
              variant="outline"
              className="border-[#1d4041] text-gray-400 hover:text-white hover:border-[#9ed674]/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep === STEPS.length ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-gradient-to-r from-[#9ed674] to-[#1d4041] hover:from-[#9ed674]/90 hover:to-[#1d4041]/90 text-white px-8"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Submit Plan
                  </span>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => handleSave(currentStep + 1)}
                disabled={saving}
                className="bg-gradient-to-r from-[#1d4041] to-[#9ed674]/80 hover:from-[#9ed674] hover:to-[#1d4041] text-white"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
