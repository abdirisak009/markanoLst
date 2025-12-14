"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

function Step1GoalsVision({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-white">Business Name *</Label>
        <Input
          value={data.business_name || ""}
          onChange={(e) => onChange({ business_name: e.target.value })}
          placeholder="Enter your business name"
          className="mt-2 bg-white/10 border-white/20 text-white"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label className="text-white">Short Term Goal *</Label>
          <Textarea
            value={data.business_goal_short || ""}
            onChange={(e) => onChange({ business_goal_short: e.target.value })}
            placeholder="What do you want to achieve in 3-6 months?"
            className="mt-2 bg-white/10 border-white/20 text-white"
            rows={4}
          />
        </div>
        <div>
          <Label className="text-white">Long Term Goal *</Label>
          <Textarea
            value={data.business_goal_long || ""}
            onChange={(e) => onChange({ business_goal_long: e.target.value })}
            placeholder="What do you want to achieve in 1-3 years?"
            className="mt-2 bg-white/10 border-white/20 text-white"
            rows={4}
          />
        </div>
      </div>

      <div>
        <Label className="text-white">Revenue Target *</Label>
        <Input
          type="number"
          value={data.revenue_target || ""}
          onChange={(e) => onChange({ revenue_target: e.target.value })}
          placeholder="e.g., 50000"
          className="mt-2 bg-white/10 border-white/20 text-white"
        />
      </div>

      <div>
        <Label className="text-white">Key Performance Indicators (KPIs)</Label>
        <Textarea
          value={data.kpis || ""}
          onChange={(e) => onChange({ kpis: e.target.value })}
          placeholder="What metrics will you track?"
          className="mt-2 bg-white/10 border-white/20 text-white"
          rows={3}
        />
      </div>

      <div>
        <Label className="text-white">Success Looks Like...</Label>
        <Textarea
          value={data.success_looks_like || ""}
          onChange={(e) => onChange({ success_looks_like: e.target.value })}
          placeholder="Describe what success means for your business"
          className="mt-2 bg-white/10 border-white/20 text-white"
          rows={4}
        />
      </div>
    </div>
  )
}

function Step2Strategy({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-white">Business Type *</Label>
        <Input
          value={data.business_type || ""}
          onChange={(e) => onChange({ business_type: e.target.value })}
          placeholder="e.g., Dropshipping, Wholesale, Private Label"
          className="mt-2 bg-white/10 border-white/20 text-white"
        />
      </div>

      <div>
        <Label className="text-white">Target Market *</Label>
        <Textarea
          value={data.target_market || ""}
          onChange={(e) => onChange({ target_market: e.target.value })}
          placeholder="Who are your customers? Demographics, interests, etc."
          className="mt-2 bg-white/10 border-white/20 text-white"
          rows={4}
        />
      </div>

      <div>
        <Label className="text-white">Competitors</Label>
        <Textarea
          value={data.competitors || ""}
          onChange={(e) => onChange({ competitors: e.target.value })}
          placeholder="List your main competitors"
          className="mt-2 bg-white/10 border-white/20 text-white"
          rows={3}
        />
      </div>

      <div>
        <Label className="text-white">Market Position</Label>
        <Textarea
          value={data.market_position || ""}
          onChange={(e) => onChange({ market_position: e.target.value })}
          placeholder="How do you differentiate from competitors?"
          className="mt-2 bg-white/10 border-white/20 text-white"
          rows={3}
        />
      </div>

      <div>
        <Label className="text-white">Value Proposition *</Label>
        <Textarea
          value={data.value_proposition || ""}
          onChange={(e) => onChange({ value_proposition: e.target.value })}
          placeholder="Why should customers buy from you?"
          className="mt-2 bg-white/10 border-white/20 text-white"
          rows={4}
        />
      </div>
    </div>
  )
}

function Step3Platform({ data, onChange }: any) {
  const platforms = ["Alibaba", "Shopify", "Amazon", "Custom Website"]

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-white mb-3 block">Platform Selected *</Label>
        <div className="grid grid-cols-2 gap-3">
          {platforms.map((platform) => (
            <button
              key={platform}
              onClick={() => onChange({ platform_selected: platform })}
              className={`p-4 rounded-lg border-2 transition-all ${
                data.platform_selected === platform
                  ? "bg-[#ef4444]/20 border-[#ef4444] text-[#ef4444]"
                  : "bg-white/5 border-white/20 text-white hover:bg-white/10"
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">Setup Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={data.account_created || false}
              onCheckedChange={(checked) => onChange({ account_created: checked })}
            />
            <Label className="text-white cursor-pointer">Account Created</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              checked={data.branding_ready || false}
              onCheckedChange={(checked) => onChange({ branding_ready: checked })}
            />
            <Label className="text-white cursor-pointer">Branding Ready (Logo, Colors, etc.)</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              checked={data.payment_setup || false}
              onCheckedChange={(checked) => onChange({ payment_setup: checked })}
            />
            <Label className="text-white cursor-pointer">Payment Setup Complete</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              checked={data.shipping_setup || false}
              onCheckedChange={(checked) => onChange({ shipping_setup: checked })}
            />
            <Label className="text-white cursor-pointer">Shipping Setup Complete</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Step4Product({ data, onChange }: any) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-white">Product Name *</Label>
        <Input
          value={data.product_name || ""}
          onChange={(e) => onChange({ product_name: e.target.value })}
          placeholder="What product are you selling?"
          className="mt-2 bg-white/10 border-white/20 text-white"
        />
      </div>

      <div>
        <Label className="text-white">Supplier Name</Label>
        <Input
          value={data.supplier_name || ""}
          onChange={(e) => onChange({ supplier_name: e.target.value })}
          placeholder="Name of your supplier"
          className="mt-2 bg-white/10 border-white/20 text-white"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label className="text-white">MOQ (Minimum Order Quantity)</Label>
          <Input
            type="number"
            value={data.moq || ""}
            onChange={(e) => onChange({ moq: e.target.value })}
            placeholder="e.g., 100"
            className="mt-2 bg-white/10 border-white/20 text-white"
          />
        </div>
        <div>
          <Label className="text-white">Unit Price ($)</Label>
          <Input
            type="number"
            step="0.01"
            value={data.unit_price || ""}
            onChange={(e) => onChange({ unit_price: e.target.value })}
            placeholder="e.g., 5.99"
            className="mt-2 bg-white/10 border-white/20 text-white"
          />
        </div>
      </div>

      <div>
        <Label className="text-white">Shipping Method</Label>
        <Input
          value={data.shipping_method || ""}
          onChange={(e) => onChange({ shipping_method: e.target.value })}
          placeholder="e.g., Sea Freight, Air Cargo, Express"
          className="mt-2 bg-white/10 border-white/20 text-white"
        />
      </div>

      <div className="flex items-center gap-3">
        <Checkbox
          checked={data.sample_ordered || false}
          onCheckedChange={(checked) => onChange({ sample_ordered: checked })}
        />
        <Label className="text-white cursor-pointer">Sample Ordered</Label>
      </div>
    </div>
  )
}

function Step5Implementation({ data, onChange }: any) {
  const steps = data.implementation_steps || ["", "", "", "", ""]

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps]
    newSteps[index] = value
    onChange({ implementation_steps: newSteps })
  }

  const addStep = () => {
    onChange({ implementation_steps: [...steps, ""] })
  }

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      const newSteps = steps.filter((_: any, i: number) => i !== index)
      onChange({ implementation_steps: newSteps })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-white/80 mb-4">List the key steps to implement your e-commerce business</div>

      {steps.map((step: string, index: number) => (
        <div key={index} className="flex gap-3">
          <div className="flex-1">
            <Label className="text-white">Step {index + 1}</Label>
            <Input
              value={step}
              onChange={(e) => updateStep(index, e.target.value)}
              placeholder={`Enter implementation step ${index + 1}`}
              className="mt-2 bg-white/10 border-white/20 text-white"
            />
          </div>
          {steps.length > 1 && (
            <Button
              variant="ghost"
              onClick={() => removeStep(index)}
              className="mt-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Remove
            </Button>
          )}
        </div>
      ))}

      <Button
        onClick={addStep}
        variant="outline"
        className="w-full border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10 bg-transparent"
      >
        + Add Another Step
      </Button>
    </div>
  )
}

function Step6Timeline({ data, onChange }: any) {
  const milestones = data.milestones || [""]

  const updateMilestone = (index: number, value: string) => {
    const newMilestones = [...milestones]
    newMilestones[index] = value
    onChange({ milestones: newMilestones })
  }

  const addMilestone = () => {
    onChange({ milestones: [...milestones, ""] })
  }

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      const newMilestones = milestones.filter((_: any, i: number) => i !== index)
      onChange({ milestones: newMilestones })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label className="text-white">Start Date *</Label>
          <Input
            type="date"
            value={data.start_date || ""}
            onChange={(e) => onChange({ start_date: e.target.value })}
            className="mt-2 bg-white/10 border-white/20 text-white"
          />
        </div>
        <div>
          <Label className="text-white">End Date *</Label>
          <Input
            type="date"
            value={data.end_date || ""}
            onChange={(e) => onChange({ end_date: e.target.value })}
            className="mt-2 bg-white/10 border-white/20 text-white"
          />
        </div>
      </div>

      <div>
        <Label className="text-white mb-3 block">Milestones</Label>
        {milestones.map((milestone: string, index: number) => (
          <div key={index} className="flex gap-3 mb-3">
            <Input
              value={milestone}
              onChange={(e) => updateMilestone(index, e.target.value)}
              placeholder={`Milestone ${index + 1}`}
              className="bg-white/10 border-white/20 text-white"
            />
            {milestones.length > 1 && (
              <Button
                variant="ghost"
                onClick={() => removeMilestone(index)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          onClick={addMilestone}
          variant="outline"
          className="w-full border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10 bg-transparent"
        >
          + Add Milestone
        </Button>
      </div>
    </div>
  )
}

function Step7Marketing({ data, onChange }: any) {
  const channelOptions = [
    "Facebook Ads",
    "Instagram Ads",
    "Google Ads",
    "TikTok Ads",
    "SEO",
    "Influencer Marketing",
    "Email Marketing",
    "Content Marketing",
  ]

  const channels = data.marketing_channels || []

  const toggleChannel = (channel: string) => {
    const newChannels = channels.includes(channel)
      ? channels.filter((c: string) => c !== channel)
      : [...channels, channel]
    onChange({ marketing_channels: newChannels })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-white mb-3 block">Marketing Channels</Label>
        <div className="grid grid-cols-2 gap-3">
          {channelOptions.map((channel) => (
            <button
              key={channel}
              onClick={() => toggleChannel(channel)}
              className={`p-3 rounded-lg border-2 transition-all text-sm ${
                channels.includes(channel)
                  ? "bg-[#ef4444]/20 border-[#ef4444] text-[#ef4444]"
                  : "bg-white/5 border-white/20 text-white hover:bg-white/10"
              }`}
            >
              {channel}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-white">Content Plan</Label>
        <Textarea
          value={data.content_plan || ""}
          onChange={(e) => onChange({ content_plan: e.target.value })}
          placeholder="Describe your content strategy..."
          className="mt-2 bg-white/10 border-white/20 text-white"
          rows={5}
        />
      </div>

      <div>
        <Label className="text-white">Sales Funnel Description</Label>
        <Textarea
          value={data.funnel_description || ""}
          onChange={(e) => onChange({ funnel_description: e.target.value })}
          placeholder="Describe how customers will move through your funnel..."
          className="mt-2 bg-white/10 border-white/20 text-white"
          rows={5}
        />
      </div>
    </div>
  )
}

function Step8Review({ data }: any) {
  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-[#ef4444]">Step 1: Goals & Vision</CardTitle>
        </CardHeader>
        <CardContent className="text-white/80 space-y-2">
          <p>
            <strong>Business Name:</strong> {data.business_name || "N/A"}
          </p>
          <p>
            <strong>Revenue Target:</strong> ${data.revenue_target || "N/A"}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-[#ef4444]">Step 2: Strategy</CardTitle>
        </CardHeader>
        <CardContent className="text-white/80 space-y-2">
          <p>
            <strong>Business Type:</strong> {data.business_type || "N/A"}
          </p>
          <p>
            <strong>Value Proposition:</strong> {data.value_proposition || "N/A"}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-[#ef4444]">Step 3: Platform</CardTitle>
        </CardHeader>
        <CardContent className="text-white/80 space-y-2">
          <p>
            <strong>Platform:</strong> {data.platform_selected || "N/A"}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-[#ef4444]">Step 4: Product</CardTitle>
        </CardHeader>
        <CardContent className="text-white/80 space-y-2">
          <p>
            <strong>Product:</strong> {data.product_name || "N/A"}
          </p>
          <p>
            <strong>Supplier:</strong> {data.supplier_name || "N/A"}
          </p>
        </CardContent>
      </Card>

      <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg p-4 text-center">
        <p className="text-[#ef4444] font-medium">
          Review all your information above, then click Submit to complete your plan
        </p>
      </div>
    </div>
  )
}

function WizardBuilder({ searchParams }: { searchParams: { leaderId: string } }) {
  const router = useRouter()
  const leaderId = searchParams.leaderId

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [leaderInfo, setLeaderInfo] = useState<any>(null)

  const steps = [
    { number: 1, title: "Goals & Vision", component: Step1GoalsVision },
    { number: 2, title: "Strategy", component: Step2Strategy },
    { number: 3, title: "Platform", component: Step3Platform },
    { number: 4, title: "Product", component: Step4Product },
    { number: 5, title: "Implementation", component: Step5Implementation },
    { number: 6, title: "Timeline", component: Step6Timeline },
    { number: 7, title: "Marketing", component: Step7Marketing },
    { number: 8, title: "Review", component: Step8Review },
  ]

  useEffect(() => {
    if (leaderId) {
      loadLeaderData()
    }
  }, [leaderId])

  const loadLeaderData = async () => {
    try {
      // Load leader info
      const leaderRes = await fetch(`/api/university-students/${leaderId}`)
      const leader = await leaderRes.json()
      setLeaderInfo(leader)

      // Load existing submission if any
      const subRes = await fetch(`/api/ecommerce-wizard?leaderId=${leaderId}`)
      if (subRes.ok) {
        const submission = await subRes.json()
        if (submission) {
          setFormData(submission)
          setCurrentStep(submission.current_step || 1)
        }
      }
    } catch (err) {
      console.error("[v0] Error loading leader data:", err)
    }
  }

  const updateFormData = (newData: any) => {
    setFormData({ ...formData, ...newData })
  }

  const saveProgress = async () => {
    setLoading(true)
    try {
      await fetch("/api/ecommerce-wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leader_id: leaderId,
          ...formData,
          current_step: currentStep,
          status: "in_progress",
        }),
      })
    } catch (err) {
      console.error("[v0] Error saving:", err)
    }
    setLoading(false)
  }

  const handleNext = async () => {
    await saveProgress()
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await fetch("/api/ecommerce-wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leader_id: leaderId,
          ...formData,
          current_step: 8,
          status: "submitted",
          submitted_at: new Date().toISOString(),
        }),
      })

      alert("✅ Your e-commerce plan has been submitted successfully!")
      router.push("/ecommerce-wizard")
    } catch (err) {
      alert("Error submitting. Please try again.")
    }
    setLoading(false)
  }

  const CurrentStepComponent = steps[currentStep - 1].component

  if (!leaderId) {
    return <div className="text-center text-white p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1d4041] via-[#2a5a5c] to-[#1d4041]">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Image src="/markano-logo.png" alt="Markano" width={150} height={50} className="h-12 w-auto" />
            <div className="text-white">
              <span className="text-sm text-white/60">Leader:</span>{" "}
              <span className="font-semibold">{leaderInfo?.full_name || leaderId}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stepper */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    currentStep > step.number
                      ? "bg-[#ef4444] border-[#ef4444] text-white"
                      : currentStep === step.number
                        ? "bg-[#ef4444] border-[#ef4444] text-white"
                        : "bg-white/10 border-white/30 text-white/50"
                  }`}
                >
                  {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                </div>
                <div
                  className={`mt-2 text-xs text-center hidden md:block ${
                    currentStep >= step.number ? "text-[#ef4444]" : "text-white/50"
                  }`}
                >
                  {step.title}
                </div>
              </div>
            ))}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/20 -z-0" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-[#ef4444] transition-all duration-500 -z-0"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white">
              Step {currentStep}: {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent data={formData} onChange={updateFormData} />

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < steps.length ? (
                <Button onClick={handleNext} disabled={loading} className="bg-[#ef4444] hover:bg-[#dc3636] text-white">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-[#ef4444] hover:bg-[#dc3636] text-white font-semibold"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Submit Plan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1d4041] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#ef4444] animate-spin" />
        </div>
      }
    >
      <WizardBuilder searchParams={{ leaderId: "defaultLeaderId" }} />
    </Suspense>
  )
}
