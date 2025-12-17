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
  ShoppingCart,
  CreditCard,
  Truck,
  BarChart3,
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

const ECOMMERCE_ICONS = [
  { Icon: ShoppingCart, delay: "0s", duration: "20s", left: "5%", size: 24 },
  { Icon: CreditCard, delay: "3s", duration: "25s", left: "15%", size: 20 },
  { Icon: Package, delay: "6s", duration: "22s", left: "25%", size: 28 },
  { Icon: Truck, delay: "2s", duration: "28s", left: "35%", size: 22 },
  { Icon: Store, delay: "5s", duration: "24s", left: "45%", size: 26 },
  { Icon: BarChart3, delay: "1s", duration: "26s", left: "55%", size: 20 },
  { Icon: Globe, delay: "4s", duration: "21s", left: "65%", size: 24 },
  { Icon: Target, delay: "7s", duration: "23s", left: "75%", size: 22 },
  { Icon: Megaphone, delay: "3s", duration: "27s", left: "85%", size: 26 },
  { Icon: Sparkles, delay: "0s", duration: "29s", left: "95%", size: 20 },
]

export default function WizardPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params)
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [groupInfo, setGroupInfo] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
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
    setMounted(true)
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

  const inputStyles =
    "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#e63946] focus:ring-[#e63946]/20 transition-all duration-300"
  const textareaStyles =
    "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#e63946] focus:ring-[#e63946]/20 transition-all duration-300 min-h-[100px]"
  const selectStyles =
    "w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-900 focus:border-[#e63946] focus:ring-[#e63946]/20 transition-all duration-300"

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Business Name *</label>
              <Input
                value={formData.business_name}
                onChange={(e) => updateField("business_name", e.target.value)}
                placeholder="e.g., TechGadgets Somalia"
                className={inputStyles}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2">Short-term Goal</label>
                <Textarea
                  value={formData.business_goal_short}
                  onChange={(e) => updateField("business_goal_short", e.target.value)}
                  placeholder="What do you want to achieve in 3-6 months?"
                  className={textareaStyles}
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2">Long-term Goal</label>
                <Textarea
                  value={formData.business_goal_long}
                  onChange={(e) => updateField("business_goal_long", e.target.value)}
                  placeholder="Where do you see your business in 1-3 years?"
                  className={textareaStyles}
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Revenue Target ($)</label>
              <Input
                type="number"
                value={formData.revenue_target}
                onChange={(e) => updateField("revenue_target", e.target.value)}
                placeholder="e.g., 50000"
                className={inputStyles}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Key Performance Indicators (KPIs)</label>
              <Textarea
                value={formData.kpis}
                onChange={(e) => updateField("kpis", e.target.value)}
                placeholder="e.g., Monthly sales, Customer acquisition cost, Conversion rate..."
                className={textareaStyles}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">What Does Success Look Like?</label>
              <Textarea
                value={formData.success_looks_like}
                onChange={(e) => updateField("success_looks_like", e.target.value)}
                placeholder="Describe your vision of success..."
                className={`${textareaStyles} min-h-[120px]`}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Business Type</label>
              <select
                value={formData.business_type}
                onChange={(e) => updateField("business_type", e.target.value)}
                className={selectStyles}
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

            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Market</label>
              <Textarea
                value={formData.target_market}
                onChange={(e) => updateField("target_market", e.target.value)}
                placeholder="Who are your ideal customers? Age, location, interests..."
                className={textareaStyles}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Competitors Analysis</label>
              <Textarea
                value={formData.competitors}
                onChange={(e) => updateField("competitors", e.target.value)}
                placeholder="List your main competitors and their strengths/weaknesses..."
                className={textareaStyles}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Market Position</label>
              <Textarea
                value={formData.market_position}
                onChange={(e) => updateField("market_position", e.target.value)}
                placeholder="How will you position your business in the market?"
                className={textareaStyles}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Value Proposition</label>
              <Textarea
                value={formData.value_proposition}
                onChange={(e) => updateField("value_proposition", e.target.value)}
                placeholder="What unique value do you offer to customers?"
                className={textareaStyles}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Platform Selected</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => updateField("platform_selected", platform)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      formData.platform_selected === platform
                        ? "border-[#e63946] bg-[#e63946]/10 shadow-lg shadow-[#e63946]/20"
                        : "border-gray-600/50 hover:border-[#e63946]/50 hover:bg-[#e63946]/5"
                    }`}
                  >
                    <span className="text-white font-medium">{platform}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#1e293b]/50 border border-[#e63946]/20 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#e63946]" />
                Setup Checklist
              </h3>

              <div className="space-y-3">
                {[
                  { id: "account_created", label: "Account Created", desc: "Platform account is set up" },
                  { id: "branding_ready", label: "Branding Ready", desc: "Logo, colors, and brand assets" },
                  { id: "payment_setup", label: "Payment Setup", desc: "Payment gateway configured" },
                  { id: "shipping_setup", label: "Shipping Setup", desc: "Shipping methods configured" },
                ].map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                      formData[item.id as keyof typeof formData]
                        ? "border-[#e63946]/50 bg-[#e63946]/10"
                        : "border-gray-600/30 hover:border-[#e63946]/30"
                    }`}
                    onClick={() => updateField(item.id, !formData[item.id as keyof typeof formData])}
                  >
                    <Checkbox
                      checked={formData[item.id as keyof typeof formData] as boolean}
                      onCheckedChange={(checked) => updateField(item.id, checked)}
                      className="border-gray-500 data-[state=checked]:bg-[#e63946] data-[state=checked]:border-[#e63946]"
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
          <div className="space-y-6 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2">Product Name *</label>
                <Input
                  value={formData.product_name}
                  onChange={(e) => updateField("product_name", e.target.value)}
                  placeholder="e.g., Wireless Earbuds Pro"
                  className={inputStyles}
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2">Supplier Name</label>
                <Input
                  value={formData.supplier_name}
                  onChange={(e) => updateField("supplier_name", e.target.value)}
                  placeholder="e.g., Shenzhen Tech Co."
                  className={inputStyles}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2">MOQ (Minimum Order)</label>
                <Input
                  type="number"
                  value={formData.moq}
                  onChange={(e) => updateField("moq", e.target.value)}
                  placeholder="e.g., 100"
                  className={inputStyles}
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2">Unit Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) => updateField("unit_price", e.target.value)}
                  placeholder="e.g., 15.99"
                  className={inputStyles}
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2">Shipping Method</label>
                <select
                  value={formData.shipping_method}
                  onChange={(e) => updateField("shipping_method", e.target.value)}
                  className={selectStyles}
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
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                formData.sample_ordered
                  ? "border-[#e63946]/50 bg-[#e63946]/10"
                  : "border-gray-600/30 hover:border-[#e63946]/30"
              }`}
              onClick={() => updateField("sample_ordered", !formData.sample_ordered)}
            >
              <Checkbox
                checked={formData.sample_ordered}
                onCheckedChange={(checked) => updateField("sample_ordered", checked)}
                className="border-gray-500 data-[state=checked]:bg-[#e63946] data-[state=checked]:border-[#e63946]"
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
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-[#e63946]" />
                Implementation Steps
              </h3>
              <Button
                onClick={addImplementationStep}
                variant="outline"
                size="sm"
                className="border-[#e63946]/50 text-[#e63946] hover:bg-[#e63946]/10 transition-all duration-300 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Step
              </Button>
            </div>

            <div className="space-y-3">
              {formData.implementation_steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#1e293b]/30 border border-gray-700/30 transition-all duration-300 hover:border-[#e63946]/30 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#e63946] to-[#ff6b6b] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {index + 1}
                  </div>
                  <Input
                    value={step}
                    onChange={(e) => {
                      const newSteps = [...formData.implementation_steps]
                      newSteps[index] = e.target.value
                      updateField("implementation_steps", newSteps)
                    }}
                    placeholder={`Step ${index + 1}: e.g., Set up product listings`}
                    className={`flex-1 ${inputStyles}`}
                  />
                  {formData.implementation_steps.length > 1 && (
                    <button
                      onClick={() => removeImplementationStep(index)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateField("start_date", e.target.value)}
                  className={inputStyles}
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-gray-300 mb-2">Target End Date</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => updateField("end_date", e.target.value)}
                  className={inputStyles}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#e63946]" />
                  Milestones
                </h3>
                <Button
                  onClick={addMilestone}
                  variant="outline"
                  size="sm"
                  className="border-[#e63946]/50 text-[#e63946] hover:bg-[#e63946]/10 transition-all duration-300 bg-transparent"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Milestone
                </Button>
              </div>

              <div className="space-y-3">
                {formData.milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 rounded-lg bg-[#1e293b]/30 border border-gray-700/30 transition-all duration-300 hover:border-[#e63946]/30 group"
                  >
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#e63946] to-[#ff6b6b] shadow-lg shadow-[#e63946]/30" />
                    <Input
                      value={milestone.title}
                      onChange={(e) => {
                        const newMilestones = [...formData.milestones]
                        newMilestones[index].title = e.target.value
                        updateField("milestones", newMilestones)
                      }}
                      placeholder="Milestone title..."
                      className={`flex-1 ${inputStyles}`}
                    />
                    <Input
                      type="date"
                      value={milestone.date}
                      onChange={(e) => {
                        const newMilestones = [...formData.milestones]
                        newMilestones[index].date = e.target.value
                        updateField("milestones", newMilestones)
                      }}
                      className={`w-40 ${inputStyles}`}
                    />
                    {formData.milestones.length > 1 && (
                      <button
                        onClick={() => removeMilestone(index)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Marketing Channels</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {MARKETING_CHANNELS.map((channel) => (
                  <button
                    key={channel}
                    onClick={() => toggleMarketingChannel(channel)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      formData.marketing_channels.includes(channel)
                        ? "border-[#e63946] bg-[#e63946]/10 text-[#e63946] shadow-lg shadow-[#e63946]/20"
                        : "border-gray-600/50 text-gray-300 hover:border-[#e63946]/50"
                    }`}
                  >
                    {channel}
                  </button>
                ))}
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Content Plan</label>
              <Textarea
                value={formData.content_plan}
                onChange={(e) => updateField("content_plan", e.target.value)}
                placeholder="Describe your content strategy..."
                className={textareaStyles}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Sales Funnel Description</label>
              <Textarea
                value={formData.funnel_description}
                onChange={(e) => updateField("funnel_description", e.target.value)}
                placeholder="How will you guide customers from awareness to purchase?"
                className={`${textareaStyles} min-h-[120px]`}
              />
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#e63946] to-[#ff6b6b] flex items-center justify-center shadow-xl shadow-[#e63946]/30 animate-pulse">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Review Your Business Plan</h3>
              <p className="text-gray-400">Check all details before submitting</p>
            </div>

            <div className="grid gap-4">
              {[
                { label: "Business Name", value: formData.business_name },
                { label: "Platform", value: formData.platform_selected },
                { label: "Product", value: formData.product_name },
                { label: "Revenue Target", value: formData.revenue_target ? `$${formData.revenue_target}` : "-" },
                { label: "Marketing Channels", value: formData.marketing_channels.join(", ") || "-" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-4 rounded-lg bg-[#1e293b]/50 border border-gray-700/30 transition-all duration-300 hover:border-[#e63946]/30"
                >
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-white font-medium">{item.value || "-"}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:from-[#d62839] hover:to-[#e63946] text-white rounded-xl shadow-xl shadow-[#e63946]/30 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Submit Business Plan
                </span>
              )}
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  const CurrentStepIcon = STEPS[currentStep - 1]?.icon || Target

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#0f172a]/95 to-[#1e293b]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#e63946 1px, transparent 1px), linear-gradient(90deg, #e63946 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Floating e-commerce icons */}
        {mounted &&
          ECOMMERCE_ICONS.map((item, index) => (
            <div
              key={index}
              className="absolute animate-float opacity-[0.06]"
              style={{
                left: item.left,
                animationDelay: item.delay,
                animationDuration: item.duration,
              }}
            >
              <item.Icon className="text-[#e63946]" style={{ width: item.size, height: item.size }} />
            </div>
          ))}

        {/* Glow effects */}
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-[#e63946]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-[#e63946]/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-[#0f172a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/ecommerce-wizard")}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
            >
              <Home className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#e63946] to-[#ff6b6b] flex items-center justify-center shadow-lg shadow-[#e63946]/30">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold">E-commerce Wizard</h1>
                <p className="text-sm text-gray-400">
                  {groupInfo ? `${groupInfo.group_name} - ${groupInfo.class_code}` : `Group ${groupId}`}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => handleSave()}
            disabled={saving}
            variant="outline"
            className="border-[#e63946]/50 text-[#e63946] hover:bg-[#e63946]/10 transition-all duration-300"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-[#e63946]/30 border-t-[#e63946] rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Draft
          </Button>
        </div>
      </header>

      <nav className="border-b border-gray-800/50 bg-[#0f172a]/50 backdrop-blur-sm overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 min-w-max">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    handleSave(step.id)
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? "bg-gradient-to-r from-[#e63946] to-[#ff6b6b] text-white shadow-lg shadow-[#e63946]/30"
                      : isCompleted
                        ? "bg-[#e63946]/20 text-[#e63946]"
                        : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
                  }`}
                >
                  <StepIcon className="w-4 h-4" />
                  <span className="text-sm font-medium whitespace-nowrap hidden md:inline">{step.title}</span>
                </button>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#e63946] to-[#ff6b6b] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-12 relative z-10">
        {/* Step Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#e63946] to-[#ff6b6b] flex items-center justify-center shadow-xl shadow-[#e63946]/30">
            <CurrentStepIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-[#e63946] text-sm font-medium">
              Step {currentStep} of {STEPS.length}
            </p>
            <h2 className="text-2xl font-bold text-white">{STEPS[currentStep - 1]?.title}</h2>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-xl">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button
            onClick={() => handleSave(currentStep - 1)}
            disabled={currentStep === 1 || saving}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800/50 disabled:opacity-30 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < STEPS.length && (
            <Button
              onClick={() => handleSave(currentStep + 1)}
              disabled={saving}
              className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:from-[#d62839] hover:to-[#e63946] text-white shadow-lg shadow-[#e63946]/30 transition-all duration-300 transform hover:scale-105"
            >
              Next Step
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </main>

      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.06;
          }
          90% {
            opacity: 0.06;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
