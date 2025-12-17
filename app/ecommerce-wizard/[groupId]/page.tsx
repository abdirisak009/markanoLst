"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Target,
  Search,
  Store,
  Package,
  ListChecks,
  Calendar,
  Megaphone,
  Send,
  Save,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react"
import { Navbar } from "@/components/navbar"

interface WizardData {
  // Step 1
  business_name: string
  business_goal_short: string
  business_goal_long: string
  revenue_target: string
  kpis: string
  success_definition: string
  // Step 2
  business_type: string
  target_market: string
  competitors: string
  market_position: string
  value_proposition: string
  // Step 3
  platform_selected: string
  account_created: boolean
  branding_ready: boolean
  payment_setup: boolean
  shipping_setup: boolean
  // Step 4
  product_name: string
  supplier_name: string
  moq: string
  unit_price: string
  shipping_method: string
  sample_ordered: boolean
  // Step 5
  implementation_steps: string[]
  // Step 6
  start_date: string
  end_date: string
  milestones: { title: string; date: string }[]
  // Step 7
  marketing_channels: string[]
  content_plan: string
  funnel_description: string
}

const initialData: WizardData = {
  business_name: "",
  business_goal_short: "",
  business_goal_long: "",
  revenue_target: "",
  kpis: "",
  success_definition: "",
  business_type: "",
  target_market: "",
  competitors: "",
  market_position: "",
  value_proposition: "",
  platform_selected: "",
  account_created: false,
  branding_ready: false,
  payment_setup: false,
  shipping_setup: false,
  product_name: "",
  supplier_name: "",
  moq: "",
  unit_price: "",
  shipping_method: "",
  sample_ordered: false,
  implementation_steps: ["", "", "", "", ""],
  start_date: "",
  end_date: "",
  milestones: [{ title: "", date: "" }],
  marketing_channels: [],
  content_plan: "",
  funnel_description: "",
}

const steps = [
  { id: 1, title: "Goals & Vision", icon: Target },
  { id: 2, title: "Strategy & Market", icon: Search },
  { id: 3, title: "Platform & Setup", icon: Store },
  { id: 4, title: "Product Sourcing", icon: Package },
  { id: 5, title: "Implementation", icon: ListChecks },
  { id: 6, title: "Timeline", icon: Calendar },
  { id: 7, title: "Marketing", icon: Megaphone },
  { id: 8, title: "Review & Submit", icon: Send },
]

const platforms = ["Shopify", "Amazon", "Alibaba", "Website", "Other"]
const marketingChannels = [
  "Social Media",
  "Google Ads",
  "Facebook Ads",
  "Email Marketing",
  "Influencer Marketing",
  "Content Marketing",
  "SEO",
  "TikTok",
  "YouTube",
]

export default function WizardPage({ params }: { params: Promise<{ groupId: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<WizardData>(initialData)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchExistingData()
  }, [])

  const fetchExistingData = async () => {
    try {
      const res = await fetch(`/api/ecommerce-wizard/${resolvedParams.groupId}`)
      if (res.ok) {
        const result = await res.json()
        if (result.data) {
          setData({ ...initialData, ...result.data })
          setCurrentStep(result.data.current_step || 1)
          if (result.data.status === "submitted") {
            setSubmitted(true)
          }
        }
        if (result.group_name) {
          setGroupName(result.group_name)
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const updateField = (field: keyof WizardData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const saveProgress = async () => {
    setSaving(true)
    try {
      await fetch(`/api/ecommerce-wizard/${resolvedParams.groupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, current_step: currentStep }),
      })
    } catch (error) {
      console.error("Error saving:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleNext = async () => {
    await saveProgress()
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await fetch(`/api/ecommerce-wizard/${resolvedParams.groupId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      setSubmitted(true)
    } catch (error) {
      console.error("Error submitting:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const addImplementationStep = () => {
    setData((prev) => ({
      ...prev,
      implementation_steps: [...prev.implementation_steps, ""],
    }))
  }

  const removeImplementationStep = (index: number) => {
    setData((prev) => ({
      ...prev,
      implementation_steps: prev.implementation_steps.filter((_, i) => i !== index),
    }))
  }

  const addMilestone = () => {
    setData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, { title: "", date: "" }],
    }))
  }

  const removeMilestone = (index: number) => {
    setData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Business Name *</label>
              <input
                type="text"
                value={data.business_name}
                onChange={(e) => updateField("business_name", e.target.value)}
                className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50"
                placeholder="Enter your business name"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Short-term Goal</label>
                <textarea
                  value={data.business_goal_short}
                  onChange={(e) => updateField("business_goal_short", e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50 h-24 resize-none"
                  placeholder="What do you want to achieve in 3-6 months?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Long-term Goal</label>
                <textarea
                  value={data.business_goal_long}
                  onChange={(e) => updateField("business_goal_long", e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50 h-24 resize-none"
                  placeholder="Where do you see your business in 1-2 years?"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Revenue Target</label>
              <input
                type="text"
                value={data.revenue_target}
                onChange={(e) => updateField("revenue_target", e.target.value)}
                className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50"
                placeholder="e.g., $10,000/month"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Key Performance Indicators (KPIs)</label>
              <textarea
                value={data.kpis}
                onChange={(e) => updateField("kpis", e.target.value)}
                className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50 h-24 resize-none"
                placeholder="List your KPIs (e.g., Monthly sales, Customer acquisition cost, etc.)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">What Does Success Look Like?</label>
              <textarea
                value={data.success_definition}
                onChange={(e) => updateField("success_definition", e.target.value)}
                className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50 h-32 resize-none"
                placeholder="Describe what success means for your business..."
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
                value={data.business_type}
                onChange={(e) => updateField("business_type", e.target.value)}
                className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50"
              >
                <option value="">Select business type</option>
                <option value="B2C">B2C (Business to Consumer)</option>
                <option value="B2B">B2B (Business to Business)</option>
                <option value="C2C">C2C (Consumer to Consumer)</option>
                <option value="D2C">D2C (Direct to Consumer)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Market</label>
              <textarea
                value={data.target_market}
                onChange={(e) => updateField("target_market", e.target.value)}
                className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50 h-24 resize-none"
                placeholder="Describe your target audience (age, location, interests, etc.)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Competitors</label>
              <textarea
                value={data.competitors}
                onChange={(e) => updateField("competitors", e.target.value)}
                className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50 h-24 resize-none"
                placeholder="List your main competitors and their strengths/weaknesses"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Market Position</label>
              <textarea
                value={data.market_position}
                onChange={(e) => updateField("market_position", e.target.value)}
                className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50 h-24 resize-none"
                placeholder="How will you position your business in the market?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Value Proposition</label>
              <textarea
                value={data.value_proposition}
                onChange={(e) => updateField("value_proposition", e.target.value)}
                className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50 h-24 resize-none"
                placeholder="What unique value do you offer to customers?"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">Select Platform</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {platforms.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => updateField("platform_selected", platform)}
                    className={`p-4 rounded-xl border transition-all ${
                      data.platform_selected === platform
                        ? "bg-[#9ed674]/20 border-[#9ed674] text-white"
                        : "bg-[#0f1a1a] border-[#9ed674]/20 text-gray-400 hover:border-[#9ed674]/40"
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">Setup Checklist</label>
              <div className="space-y-3">
                {[
                  { key: "account_created", label: "Account Created" },
                  { key: "branding_ready", label: "Branding Ready" },
                  { key: "payment_setup", label: "Payment Setup" },
                  { key: "shipping_setup", label: "Shipping Setup" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => updateField(item.key as keyof WizardData, !data[item.key as keyof WizardData])}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      data[item.key as keyof WizardData]
                        ? "bg-[#9ed674]/20 border-[#9ed674]"
                        : "bg-[#0f1a1a] border-[#9ed674]/20 hover:border-[#9ed674]/40"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                        data[item.key as keyof WizardData] ? "bg-[#9ed674] border-[#9ed674]" : "border-gray-500"
                      }`}
                    >
                      {data[item.key as keyof WizardData] && <Check className="w-4 h-4 text-[#0f1a1a]" />}
                    </div>
                    <span className={data[item.key as keyof WizardData] ? "text-white" : "text-gray-400"}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Product Name</label>
                <input
                  type="text"
                  value={data.product_name}
                  onChange={(e) => updateField("product_name", e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Supplier Name</label>
                <input
                  type="text"
                  value={data.supplier_name}
                  onChange={(e) => updateField("supplier_name", e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50"
                  placeholder="Enter supplier name"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">MOQ (Minimum Order)</label>
                <input
                  type="text"
                  value={data.moq}
                  onChange={(e) => updateField("moq", e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50"
                  placeholder="e.g., 100 units"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Unit Price</label>
                <input
                  type="text"
                  value={data.unit_price}
                  onChange={(e) => updateField("unit_price", e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50"
                  placeholder="e.g., $5.99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Shipping Method</label>
                <select
                  value={data.shipping_method}
                  onChange={(e) => updateField("shipping_method", e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50"
                >
                  <option value="">Select method</option>
                  <option value="Air">Air Freight</option>
                  <option value="Sea">Sea Freight</option>
                  <option value="Express">Express (DHL/FedEx)</option>
                  <option value="Economy">Economy</option>
                </select>
              </div>
            </div>
            <div>
              <button
                onClick={() => updateField("sample_ordered", !data.sample_ordered)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  data.sample_ordered
                    ? "bg-[#9ed674]/20 border-[#9ed674]"
                    : "bg-[#0f1a1a] border-[#9ed674]/20 hover:border-[#9ed674]/40"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                    data.sample_ordered ? "bg-[#9ed674] border-[#9ed674]" : "border-gray-500"
                  }`}
                >
                  {data.sample_ordered && <Check className="w-4 h-4 text-[#0f1a1a]" />}
                </div>
                <span className={data.sample_ordered ? "text-white" : "text-gray-400"}>Sample Ordered</span>
              </button>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-300">Implementation Steps</label>
              <button
                onClick={addImplementationStep}
                className="flex items-center gap-2 px-3 py-2 bg-[#9ed674]/20 text-[#9ed674] rounded-lg hover:bg-[#9ed674]/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>
            <div className="space-y-3">
              {data.implementation_steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#9ed674]/20 rounded-lg flex items-center justify-center text-[#9ed674] font-medium">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => {
                      const newSteps = [...data.implementation_steps]
                      newSteps[index] = e.target.value
                      updateField("implementation_steps", newSteps)
                    }}
                    className="flex-1 px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50"
                    placeholder={`Step ${index + 1} description`}
                  />
                  {data.implementation_steps.length > 1 && (
                    <button
                      onClick={() => removeImplementationStep(index)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={data.start_date}
                  onChange={(e) => updateField("start_date", e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                <input
                  type="date"
                  value={data.end_date}
                  onChange={(e) => updateField("end_date", e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-300">Milestones</label>
                <button
                  onClick={addMilestone}
                  className="flex items-center gap-2 px-3 py-2 bg-[#9ed674]/20 text-[#9ed674] rounded-lg hover:bg-[#9ed674]/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Milestone
                </button>
              </div>
              <div className="space-y-3">
                {data.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={milestone.title}
                      onChange={(e) => {
                        const newMilestones = [...data.milestones]
                        newMilestones[index].title = e.target.value
                        updateField("milestones", newMilestones)
                      }}
                      className="flex-1 px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50"
                      placeholder="Milestone title"
                    />
                    <input
                      type="date"
                      value={milestone.date}
                      onChange={(e) => {
                        const newMilestones = [...data.milestones]
                        newMilestones[index].date = e.target.value
                        updateField("milestones", newMilestones)
                      }}
                      className="px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50"
                    />
                    {data.milestones.length > 1 && (
                      <button
                        onClick={() => removeMilestone(index)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
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
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">Marketing Channels</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {marketingChannels.map((channel) => (
                  <button
                    key={channel}
                    onClick={() => {
                      const channels = data.marketing_channels.includes(channel)
                        ? data.marketing_channels.filter((c) => c !== channel)
                        : [...data.marketing_channels, channel]
                      updateField("marketing_channels", channels)
                    }}
                    className={`p-3 rounded-xl border transition-all text-sm ${
                      data.marketing_channels.includes(channel)
                        ? "bg-[#9ed674]/20 border-[#9ed674] text-white"
                        : "bg-[#0f1a1a] border-[#9ed674]/20 text-gray-400 hover:border-[#9ed674]/40"
                    }`}
                  >
                    {channel}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content Plan</label>
              <textarea
                value={data.content_plan}
                onChange={(e) => updateField("content_plan", e.target.value)}
                className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50 h-32 resize-none"
                placeholder="Describe your content strategy..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sales Funnel Description</label>
              <textarea
                value={data.funnel_description}
                onChange={(e) => updateField("funnel_description", e.target.value)}
                className="w-full px-4 py-3 bg-[#0f1a1a] border border-[#9ed674]/20 rounded-xl text-white focus:outline-none focus:border-[#9ed674]/50 h-32 resize-none"
                placeholder="Describe your customer journey funnel..."
              />
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-[#9ed674]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-[#9ed674]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Submission Successful!</h3>
                <p className="text-gray-400 mb-8">Your e-commerce plan has been submitted for review.</p>
                <button
                  onClick={() => router.push("/ecommerce-wizard")}
                  className="px-6 py-3 bg-[#1d4041] text-white rounded-xl hover:bg-[#1d4041]/80 transition-colors"
                >
                  Back to Home
                </button>
              </div>
            ) : (
              <>
                <div className="bg-[#0f1a1a] border border-[#9ed674]/20 rounded-2xl p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-[#9ed674]">Business Overview</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500 text-sm">Business Name</span>
                      <p className="text-white">{data.business_name || "-"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Revenue Target</span>
                      <p className="text-white">{data.revenue_target || "-"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Platform</span>
                      <p className="text-white">{data.platform_selected || "-"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Product</span>
                      <p className="text-white">{data.product_name || "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f1a1a] border border-[#9ed674]/20 rounded-2xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-[#9ed674]">Implementation Steps</h3>
                  <div className="space-y-2">
                    {data.implementation_steps
                      .filter((s) => s)
                      .map((step, i) => (
                        <div key={i} className="flex items-center gap-3 text-gray-300">
                          <span className="w-6 h-6 bg-[#9ed674]/20 rounded text-[#9ed674] text-sm flex items-center justify-center">
                            {i + 1}
                          </span>
                          {step}
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-[#0f1a1a] border border-[#9ed674]/20 rounded-2xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-[#9ed674]">Marketing Channels</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.marketing_channels.map((channel) => (
                      <span key={channel} className="px-3 py-1 bg-[#9ed674]/20 text-[#9ed674] rounded-full text-sm">
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1a1a]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.push("/ecommerce-wizard")}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-white">{groupName || "E-commerce Wizard"}</h1>
          </div>
          <button
            onClick={saveProgress}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#1d4041] text-white rounded-xl hover:bg-[#1d4041]/80 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Progress
          </button>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex flex-col items-center gap-2 group ${
                    step.id === currentStep
                      ? "text-[#9ed674]"
                      : step.id < currentStep
                        ? "text-[#9ed674]/60"
                        : "text-gray-500"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      step.id === currentStep
                        ? "bg-[#9ed674] text-[#0f1a1a]"
                        : step.id < currentStep
                          ? "bg-[#9ed674]/20 text-[#9ed674]"
                          : "bg-[#1d4041] text-gray-500"
                    }`}
                  >
                    {step.id < currentStep ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  <span className="text-xs hidden md:block">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 lg:w-16 h-1 mx-1 rounded ${
                      step.id < currentStep ? "bg-[#9ed674]/40" : "bg-[#1d4041]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          {/* Progress Bar */}
          <div className="h-2 bg-[#1d4041] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#9ed674] to-[#7bc043] transition-all duration-500"
              style={{ width: `${(currentStep / 8) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-[#1d4041]/30 border border-[#9ed674]/10 rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#9ed674]/20 rounded-xl">
              {(() => {
                const StepIcon = steps[currentStep - 1].icon
                return <StepIcon className="w-6 h-6 text-[#9ed674]" />
              })()}
            </div>
            <div>
              <div className="text-sm text-[#9ed674]">Step {currentStep} of 8</div>
              <h2 className="text-xl font-bold text-white">{steps[currentStep - 1].title}</h2>
            </div>
          </div>
          {renderStepContent()}
        </div>

        {/* Navigation */}
        {!submitted && (
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 bg-[#1d4041] text-white rounded-xl hover:bg-[#1d4041]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </button>

            {currentStep === 8 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#9ed674] to-[#7bc043] text-[#0f1a1a] font-bold rounded-xl hover:shadow-lg hover:shadow-[#9ed674]/25 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Plan
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9ed674] to-[#7bc043] text-[#0f1a1a] font-bold rounded-xl hover:shadow-lg hover:shadow-[#9ed674]/25 transition-all"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
