"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
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
  Star,
  Rocket,
  Loader2,
  Link2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
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
  { Icon: ShoppingCart, delay: "0s", duration: "25s", left: "3%" },
  { Icon: CreditCard, delay: "4s", duration: "28s", left: "12%" },
  { Icon: Package, delay: "2s", duration: "22s", left: "22%" },
  { Icon: Truck, delay: "6s", duration: "30s", left: "32%" },
  { Icon: Store, delay: "1s", duration: "26s", left: "42%" },
  { Icon: BarChart3, delay: "5s", duration: "24s", left: "52%" },
  { Icon: Globe, delay: "3s", duration: "27s", left: "62%" },
  { Icon: Target, delay: "7s", duration: "23s", left: "72%" },
  { Icon: Star, delay: "2s", duration: "29s", left: "82%" },
  { Icon: Rocket, delay: "4s", duration: "21s", left: "92%" },
]

export default function WizardPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params)
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [groupInfo, setGroupInfo] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [stepTransition, setStepTransition] = useState(false)
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
    product_link: "", // Added product_link field for Alibaba product URL

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
          product_link: sub.product_link || "", // Added product_link field for Alibaba product URL
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
        setStepTransition(true)
        setTimeout(() => {
          setCurrentStep(nextStep)
          setStepTransition(false)
        }, 200)
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
    "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-[#e63946] focus:ring-2 focus:ring-[#e63946]/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md"
  const textareaStyles =
    "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-[#e63946] focus:ring-2 focus:ring-[#e63946]/20 transition-all duration-300 min-h-[100px] rounded-xl shadow-sm hover:shadow-md resize-none"
  const selectStyles =
    "w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:border-[#e63946] focus:ring-2 focus:ring-[#e63946]/20 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"

  const renderStepContent = () => {
    const contentClass = `transition-all duration-300 ${stepTransition ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`

    switch (currentStep) {
      case 1:
        return (
          <div className={`space-y-6 ${contentClass}`}>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#e63946]" />
                Business Name *
              </label>
              <Input
                value={formData.business_name}
                onChange={(e) => updateField("business_name", e.target.value)}
                placeholder="e.g., TechGadgets Somalia"
                className={inputStyles}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2">Short-term Goal</label>
                <Textarea
                  value={formData.business_goal_short}
                  onChange={(e) => updateField("business_goal_short", e.target.value)}
                  placeholder="What do you want to achieve in 3-6 months?"
                  className={textareaStyles}
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2">Long-term Goal</label>
                <Textarea
                  value={formData.business_goal_long}
                  onChange={(e) => updateField("business_goal_long", e.target.value)}
                  placeholder="Where do you see your business in 1-3 years?"
                  className={textareaStyles}
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2">Revenue Target ($)</label>
              <Input
                type="number"
                value={formData.revenue_target}
                onChange={(e) => updateField("revenue_target", e.target.value)}
                placeholder="e.g., 50000"
                className={inputStyles}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Key Performance Indicators (KPIs)
              </label>
              <Textarea
                value={formData.kpis}
                onChange={(e) => updateField("kpis", e.target.value)}
                placeholder="e.g., Monthly sales, Customer acquisition cost, Conversion rate..."
                className={textareaStyles}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2">What Does Success Look Like?</label>
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
          <div className={`space-y-6 ${contentClass}`}>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#e63946]" />
                Business Type
              </label>
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
              <label className="block text-sm font-semibold text-gray-200 mb-2">Target Market</label>
              <Textarea
                value={formData.target_market}
                onChange={(e) => updateField("target_market", e.target.value)}
                placeholder="Who are your ideal customers? Age, location, interests..."
                className={textareaStyles}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2">Competitors Analysis</label>
              <Textarea
                value={formData.competitors}
                onChange={(e) => updateField("competitors", e.target.value)}
                placeholder="List your main competitors and their strengths/weaknesses..."
                className={textareaStyles}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2">Market Position</label>
              <Textarea
                value={formData.market_position}
                onChange={(e) => updateField("market_position", e.target.value)}
                placeholder="How will you position your business in the market?"
                className={textareaStyles}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2">Value Proposition</label>
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
          <div className={`space-y-6 ${contentClass}`}>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#e63946]" />
                Platform Selected
              </label>
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

            <div className="p-6 rounded-2xl bg-[#1e293b]/80 border border-[#e63946]/20 backdrop-blur-sm shadow-xl">
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
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                      formData[item.id as keyof typeof formData]
                        ? "border-[#e63946]/50 bg-[#e63946]/10 shadow-md"
                        : "border-gray-600/30 hover:border-[#e63946]/30"
                    }`}
                    onClick={() => updateField(item.id, !formData[item.id as keyof typeof formData])}
                  >
                    <Checkbox
                      checked={formData[item.id as keyof typeof formData] as boolean}
                      onCheckedChange={(checked) => updateField(item.id, checked)}
                      className="border-gray-400 data-[state=checked]:bg-[#e63946] data-[state=checked]:border-[#e63946]"
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
          <div className={`space-y-6 ${contentClass}`}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#e63946]" />
                  Product Name *
                </label>
                <Input
                  value={formData.product_name}
                  onChange={(e) => updateField("product_name", e.target.value)}
                  placeholder="e.g., Wireless Earbuds Pro"
                  className={inputStyles}
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2">Supplier Name</label>
                <Input
                  value={formData.supplier_name}
                  onChange={(e) => updateField("supplier_name", e.target.value)}
                  placeholder="e.g., Shenzhen Tech Co."
                  className={inputStyles}
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#e63946]" />
                Product Link (Alibaba/Supplier URL)
              </label>
              <div className="relative">
                <Input
                  type="url"
                  value={formData.product_link}
                  onChange={(e) => updateField("product_link", e.target.value)}
                  placeholder="e.g., https://www.alibaba.com/product-detail/..."
                  className={`${inputStyles} pl-10`}
                />
                <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {formData.product_link && (
                <a
                  href={formData.product_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-sm text-[#e63946] hover:text-[#ff6b6b] transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Preview Link
                </a>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2">MOQ (Minimum Order)</label>
                <Input
                  type="number"
                  value={formData.moq}
                  onChange={(e) => updateField("moq", e.target.value)}
                  placeholder="e.g., 100"
                  className={inputStyles}
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2">Unit Price ($)</label>
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
                <label className="block text-sm font-semibold text-gray-200 mb-2">Shipping Method</label>
                <select
                  value={formData.shipping_method}
                  onChange={(e) => updateField("shipping_method", e.target.value)}
                  className={selectStyles}
                >
                  <option value="">Select...</option>
                  <option value="Air Freight">Air Freight</option>
                  <option value="Sea Freight">Sea Freight</option>
                  <option value="Express (DHL/FedEx)">Express (DHL/FedEx)</option>
                  <option value="Local Supplier">Local Supplier</option>
                </select>
              </div>
            </div>

            <div
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer transform hover:scale-[1.01] ${
                formData.sample_ordered
                  ? "border-[#e63946]/50 bg-[#e63946]/10 shadow-md"
                  : "border-gray-600/30 hover:border-[#e63946]/30"
              }`}
              onClick={() => updateField("sample_ordered", !formData.sample_ordered)}
            >
              <Checkbox
                checked={formData.sample_ordered}
                onCheckedChange={(checked) => updateField("sample_ordered", checked)}
                className="border-gray-400 data-[state=checked]:bg-[#e63946] data-[state=checked]:border-[#e63946]"
              />
              <div>
                <p className="text-white font-medium">Sample Ordered</p>
                <p className="text-sm text-gray-400">Have you ordered a sample product?</p>
              </div>
            </div>

            {formData.platform_selected === "Alibaba" && (
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2">Alibaba Product URL</label>
                <Input
                  value={formData.product_link}
                  onChange={(e) => updateField("product_link", e.target.value)}
                  placeholder="e.g., https://www.alibaba.com/product"
                  className={inputStyles}
                />
              </div>
            )}
          </div>
        )

      case 5:
        return (
          <div className={`space-y-6 ${contentClass}`}>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-[#e63946]" />
                Implementation Steps
              </label>
              <Button
                onClick={addImplementationStep}
                size="sm"
                className="bg-[#e63946] hover:bg-[#ff6b6b] text-white transition-all duration-300 hover:scale-105 shadow-lg shadow-[#e63946]/20"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Step
              </Button>
            </div>

            <div className="space-y-3">
              {formData.implementation_steps.map((step, index) => (
                <div key={index} className="flex gap-3 items-start group">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e63946]/20 text-[#e63946] font-bold text-sm flex-shrink-0 mt-2">
                    {index + 1}
                  </div>
                  <Textarea
                    value={step}
                    onChange={(e) => {
                      const newSteps = [...formData.implementation_steps]
                      newSteps[index] = e.target.value
                      updateField("implementation_steps", newSteps)
                    }}
                    placeholder={`Step ${index + 1}: Describe this implementation step...`}
                    className={`${textareaStyles} flex-1`}
                  />
                  {formData.implementation_steps.length > 1 && (
                    <Button
                      onClick={() => removeImplementationStep(index)}
                      size="icon"
                      variant="ghost"
                      className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
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
          <div className={`space-y-6 ${contentClass}`}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#e63946]" />
                  Start Date
                </label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateField("start_date", e.target.value)}
                  className={inputStyles}
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2">End Date</label>
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
                <label className="text-sm font-semibold text-gray-200">Milestones</label>
                <Button
                  onClick={addMilestone}
                  size="sm"
                  className="bg-[#e63946] hover:bg-[#ff6b6b] text-white transition-all duration-300 hover:scale-105 shadow-lg shadow-[#e63946]/20"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Milestone
                </Button>
              </div>

              <div className="space-y-3">
                {formData.milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-start p-4 rounded-xl bg-[#1e293b]/50 border border-[#e63946]/10 group hover:border-[#e63946]/30 transition-all duration-300"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e63946]/20 text-[#e63946] font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 grid md:grid-cols-2 gap-3">
                      <Input
                        value={milestone.title}
                        onChange={(e) => {
                          const newMilestones = [...formData.milestones]
                          newMilestones[index].title = e.target.value
                          updateField("milestones", newMilestones)
                        }}
                        placeholder="Milestone title"
                        className={inputStyles}
                      />
                      <Input
                        type="date"
                        value={milestone.date}
                        onChange={(e) => {
                          const newMilestones = [...formData.milestones]
                          newMilestones[index].date = e.target.value
                          updateField("milestones", newMilestones)
                        }}
                        className={inputStyles}
                      />
                    </div>
                    {formData.milestones.length > 1 && (
                      <Button
                        onClick={() => removeMilestone(index)}
                        size="icon"
                        variant="ghost"
                        className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
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
          <div className={`space-y-6 ${contentClass}`}>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#e63946]" />
                Marketing Channels
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {MARKETING_CHANNELS.map((channel) => (
                  <button
                    key={channel}
                    onClick={() => toggleMarketingChannel(channel)}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 text-sm ${
                      formData.marketing_channels.includes(channel)
                        ? "border-[#e63946] bg-[#e63946]/10 text-white shadow-lg shadow-[#e63946]/20"
                        : "border-gray-600/50 text-gray-300 hover:border-[#e63946]/50 hover:bg-[#e63946]/5"
                    }`}
                  >
                    {channel}
                  </button>
                ))}
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2">Content Plan</label>
              <Textarea
                value={formData.content_plan}
                onChange={(e) => updateField("content_plan", e.target.value)}
                placeholder="Describe your content strategy..."
                className={`${textareaStyles} min-h-[120px]`}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2">Sales Funnel Description</label>
              <Textarea
                value={formData.funnel_description}
                onChange={(e) => updateField("funnel_description", e.target.value)}
                placeholder="Describe your customer journey from awareness to purchase..."
                className={`${textareaStyles} min-h-[120px]`}
              />
            </div>
          </div>
        )

      case 8:
        return (
          <div className={`space-y-6 ${contentClass}`}>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#e63946]/10 to-[#ff6b6b]/5 border border-[#e63946]/20 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#e63946]" />
                Ready to Submit?
              </h3>
              <p className="text-gray-400">
                Review your e-commerce implementation plan before submitting. You can still make changes after
                submission until it&apos;s approved.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Business Info */}
              <div className="p-5 rounded-xl bg-[#1e293b]/80 border border-[#e63946]/10 space-y-3 hover:border-[#e63946]/30 transition-all duration-300">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#e63946]" />
                  Business Info
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">
                    Name: <span className="text-white">{formData.business_name || "Not set"}</span>
                  </p>
                  <p className="text-gray-400">
                    Type: <span className="text-white">{formData.business_type || "Not set"}</span>
                  </p>
                  <p className="text-gray-400">
                    Revenue Target: <span className="text-white">${formData.revenue_target || "Not set"}</span>
                  </p>
                </div>
              </div>

              {/* Platform */}
              <div className="p-5 rounded-xl bg-[#1e293b]/80 border border-[#e63946]/10 space-y-3 hover:border-[#e63946]/30 transition-all duration-300">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#e63946]" />
                  Platform
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">
                    Selected: <span className="text-white">{formData.platform_selected || "Not set"}</span>
                  </p>
                  <p className="text-gray-400">
                    Setup Progress:{" "}
                    <span className="text-[#e63946] font-semibold">
                      {
                        [
                          formData.account_created,
                          formData.branding_ready,
                          formData.payment_setup,
                          formData.shipping_setup,
                        ].filter(Boolean).length
                      }
                      /4
                    </span>
                  </p>
                </div>
              </div>

              {/* Product */}
              <div className="p-5 rounded-xl bg-[#1e293b]/80 border border-[#e63946]/10 space-y-3 hover:border-[#e63946]/30 transition-all duration-300">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#e63946]" />
                  Product
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">
                    Product: <span className="text-white">{formData.product_name || "Not set"}</span>
                  </p>
                  <p className="text-gray-400">
                    Supplier: <span className="text-white">{formData.supplier_name || "Not set"}</span>
                  </p>
                  <p className="text-gray-400">
                    Unit Price: <span className="text-white">${formData.unit_price || "Not set"}</span>
                  </p>
                  {formData.platform_selected === "Alibaba" && (
                    <p className="text-gray-400">
                      Product URL: <span className="text-white">{formData.product_link || "Not set"}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Marketing */}
              <div className="p-5 rounded-xl bg-[#1e293b]/80 border border-[#e63946]/10 space-y-3 hover:border-[#e63946]/30 transition-all duration-300">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#e63946]" />
                  Marketing
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">
                    Channels:{" "}
                    <span className="text-white">
                      {formData.marketing_channels.length > 0
                        ? formData.marketing_channels.slice(0, 3).join(", ") +
                          (formData.marketing_channels.length > 3
                            ? ` +${formData.marketing_channels.length - 3} more`
                            : "")
                        : "Not set"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:from-[#ff6b6b] hover:to-[#e63946] text-white py-6 text-lg font-semibold shadow-xl shadow-[#e63946]/30 hover:shadow-2xl hover:shadow-[#e63946]/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  Submit E-commerce Plan
                </>
              )}
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  const StepIcon = STEPS[currentStep - 1]?.icon || Target

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(230,57,70,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(230,57,70,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#e63946]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#ff6b6b]/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#e63946]/5 rounded-full blur-[200px]" />

        {/* Floating e-commerce icons */}
        {mounted &&
          ECOMMERCE_ICONS.map((item, index) => (
            <div
              key={index}
              className="absolute bottom-0 opacity-[0.07]"
              style={{
                left: item.left,
                animation: `float-up ${item.duration} linear infinite`,
                animationDelay: item.delay,
              }}
            >
              <item.Icon className="w-8 h-8 text-[#e63946]" />
            </div>
          ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-xl border-b border-[#e63946]/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/ecommerce-wizard")}
              className="p-2 rounded-lg hover:bg-[#e63946]/10 transition-all duration-300 text-gray-400 hover:text-white"
            >
              <Home className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#e63946]/10">
                <Store className="w-5 h-5 text-[#e63946]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">E-commerce Wizard</h1>
                <p className="text-xs text-gray-400">
                  {groupInfo ? `${groupInfo.name} - ${groupInfo.class_id}` : `Group ${groupId}`}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => handleSave()}
            disabled={saving}
            variant="outline"
            className="border-[#e63946]/30 text-[#e63946] hover:bg-[#e63946]/10 hover:border-[#e63946] transition-all duration-300"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Draft
          </Button>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
            {STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => {
                  if (step.id <= currentStep) {
                    setStepTransition(true)
                    setTimeout(() => {
                      setCurrentStep(step.id)
                      setStepTransition(false)
                    }, 200)
                  }
                }}
                disabled={step.id > currentStep}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-300 ${
                  step.id === currentStep
                    ? "bg-gradient-to-r from-[#e63946] to-[#ff6b6b] text-white shadow-lg shadow-[#e63946]/30"
                    : step.id < currentStep
                      ? "bg-[#e63946]/20 text-[#e63946] hover:bg-[#e63946]/30"
                      : "text-gray-500 cursor-not-allowed"
                }`}
              >
                <step.icon className="w-4 h-4" />
                <span className="text-sm font-medium hidden md:inline">{step.title}</span>
              </button>
            ))}
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#e63946] to-[#ff6b6b] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#e63946]/10">
              <StepIcon className="w-5 h-5 text-[#e63946]" />
            </div>
            <div>
              <p className="text-sm text-[#e63946] font-medium">
                Step {currentStep} of {STEPS.length}
              </p>
              <h2 className="text-2xl font-bold text-white">{STEPS[currentStep - 1]?.title}</h2>
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b]/60 backdrop-blur-xl rounded-2xl border border-[#e63946]/10 p-6 md:p-8 shadow-2xl">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 gap-4">
          <Button
            onClick={() => {
              if (currentStep > 1) {
                setStepTransition(true)
                setTimeout(() => {
                  setCurrentStep(currentStep - 1)
                  setStepTransition(false)
                }, 200)
              }
            }}
            disabled={currentStep === 1}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:text-white hover:border-[#e63946]/50 hover:bg-[#e63946]/10 disabled:opacity-30 transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < 8 && (
            <Button
              onClick={() => handleSave(currentStep + 1)}
              disabled={saving}
              className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:from-[#ff6b6b] hover:to-[#e63946] text-white shadow-lg shadow-[#e63946]/30 hover:shadow-xl hover:shadow-[#e63946]/40 transition-all duration-300 hover:scale-105"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <>
                  Next Step
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.07;
          }
          90% {
            opacity: 0.07;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
