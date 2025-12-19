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
  { id: 1, title: "Hadafka & Aragtida", icon: Target },
  { id: 2, title: "Istaraatiijiyadda & Suuqa", icon: TrendingUp },
  { id: 3, title: "Dejinta Platform-ka", icon: Globe },
  { id: 4, title: "Helitaanka Alaabta", icon: Package },
  { id: 5, title: "Fulinta", icon: ListChecks },
  { id: 6, title: "Jadwalka", icon: Calendar },
  { id: 7, title: "Suuq-geynta", icon: Megaphone },
  { id: 8, title: "Dib u Eegis & Gudbi", icon: CheckCircle2 },
]

const PLATFORMS = ["Shopify", "Amazon", "Alibaba", "Custom Store", "WooCommerce", "Etsy"]

const MARKETING_CHANNELS = [
  "Baraha Bulshada (Social Media)",
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
    custom_store_url: "",
    custom_store_name: "",

    // Step 4 - Product Sourcing
    product_name: "",
    supplier_name: "",
    moq: "",
    unit_price: "",
    shipping_method: "",
    sample_ordered: false,
    product_link: "",

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
          custom_store_url: sub.custom_store_url || "",
          custom_store_name: sub.custom_store_name || "",
          product_name: sub.product_name || "",
          supplier_name: sub.supplier_name || "",
          moq: sub.moq?.toString() || "",
          unit_price: sub.unit_price?.toString() || "",
          shipping_method: sub.shipping_method || "",
          sample_ordered: sub.sample_ordered || false,
          product_link: sub.product_link || "",
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
                Magaca Ganacsiga *
              </label>
              <Input
                value={formData.business_name}
                onChange={(e) => updateField("business_name", e.target.value)}
                placeholder="tusaale: TechGadgets Somalia"
                className={inputStyles}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2">Hadafka Gaaban (3-6 Bilood)</label>
                <Textarea
                  value={formData.business_goal_short}
                  onChange={(e) => updateField("business_goal_short", e.target.value)}
                  placeholder="Maxaad rabtaa inaad gaarto 3-6 bilood gudahood?"
                  className={textareaStyles}
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2">Hadafka Dheer (1-3 Sano)</label>
                <Textarea
                  value={formData.business_goal_long}
                  onChange={(e) => updateField("business_goal_long", e.target.value)}
                  placeholder="Xaggee ayaad ku aragtaa ganacsigaaga 1-3 sano?"
                  className={textareaStyles}
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2">Bartilmaameedka Dakhliga ($)</label>
              <Input
                type="number"
                value={formData.revenue_target}
                onChange={(e) => updateField("revenue_target", e.target.value)}
                placeholder="tusaale: 50000"
                className={inputStyles}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2">Cabbirrada Waxqabadka (KPIs)</label>
              <Textarea
                value={formData.kpis}
                onChange={(e) => updateField("kpis", e.target.value)}
                placeholder="tusaale: Iibka bishiiba, Kharashka helitaanka macaamiisha, Heerka beddelka..."
                className={textareaStyles}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2">Sidee u Muuqataa Guusha?</label>
              <Textarea
                value={formData.success_looks_like}
                onChange={(e) => updateField("success_looks_like", e.target.value)}
                placeholder="Sharax aragtidaada guusha..."
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
                Nooca Ganacsiga
              </label>
              <select
                value={formData.business_type}
                onChange={(e) => updateField("business_type", e.target.value)}
                className={selectStyles}
              >
                <option value="">Dooro nooca...</option>
                <option value="B2C">B2C (Ganacsi ilaa Macmiil)</option>
                <option value="B2B">B2B (Ganacsi ilaa Ganacsi)</option>
                <option value="C2C">C2C (Macmiil ilaa Macmiil)</option>
                <option value="D2C">D2C (Toos Macmiilka)</option>
                <option value="Dropshipping">Dropshipping</option>
                <option value="Wholesale">Wholesale (Jumlad)</option>
              </select>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2">Suuqa Bartilmaameedka</label>
              <Textarea
                value={formData.target_market}
                onChange={(e) => updateField("target_market", e.target.value)}
                placeholder="Yaa macaamiishaada ugu fiican? Da'da, goobta, xiisaha..."
                className={textareaStyles}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2">Falanqaynta Tartamayaasha</label>
              <Textarea
                value={formData.competitors}
                onChange={(e) => updateField("competitors", e.target.value)}
                placeholder="Liis gali tartamayaashaada ugu waaweyn iyo awoodahooda/daciifadooda..."
                className={textareaStyles}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2">Booska Suuqa</label>
              <Textarea
                value={formData.market_position}
                onChange={(e) => updateField("market_position", e.target.value)}
                placeholder="Sideed ganacsigaaga ugu dhigi doontaa suuqa?"
                className={textareaStyles}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2">Qiimaha Gaar ah ee Aad Bixiso</label>
              <Textarea
                value={formData.value_proposition}
                onChange={(e) => updateField("value_proposition", e.target.value)}
                placeholder="Qiime gaar ah maxaad macaamiisha u bixisaa?"
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
                Platform-ka La Doortay
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

            {formData.platform_selected === "Custom Store" && (
              <div className="p-6 rounded-2xl bg-[#1e293b]/80 border border-[#e63946]/20 backdrop-blur-sm shadow-xl space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#e63946]" />
                  Macluumaadka Custom Store-kaaga
                </h3>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-200 mb-2">Magaca Dukaankaaga</label>
                  <Input
                    value={formData.custom_store_name}
                    onChange={(e) => updateField("custom_store_name", e.target.value)}
                    placeholder="tusaale: Dukaan Online Somalia"
                    className={inputStyles}
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    URL-ka Website-ka (haddii jiro)
                  </label>
                  <Input
                    type="url"
                    value={formData.custom_store_url}
                    onChange={(e) => updateField("custom_store_url", e.target.value)}
                    placeholder="tusaale: https://www.dukaankayga.com"
                    className={inputStyles}
                  />
                </div>
              </div>
            )}

            <div className="p-6 rounded-2xl bg-[#1e293b]/80 border border-[#e63946]/20 backdrop-blur-sm shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#e63946]" />
                Liiska Hubinta Dejinta
              </h3>

              <div className="space-y-3">
                {[
                  { id: "account_created", label: "Akoon La Sameeyay", desc: "Akoonka platform-ka waa la dejiyay" },
                  { id: "branding_ready", label: "Branding-ku Diyaar", desc: "Logo, midabka, iyo hantida brand-ka" },
                  {
                    id: "payment_setup",
                    label: "Lacag Bixinta La Dejiyay",
                    desc: "Habka lacag bixinta waa la habeeyay",
                  },
                  { id: "shipping_setup", label: "Dirista La Dejiyay", desc: "Habka dirista alaabta waa la habeeyay" },
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
                  Magaca Alaabta *
                </label>
                <Input
                  value={formData.product_name}
                  onChange={(e) => updateField("product_name", e.target.value)}
                  placeholder="tusaale: Dhegaha Wireless Pro"
                  className={inputStyles}
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2">Magaca Bixiyaha Alaabta</label>
                <Input
                  value={formData.supplier_name}
                  onChange={(e) => updateField("supplier_name", e.target.value)}
                  placeholder="tusaale: Shenzhen Tech Co."
                  className={inputStyles}
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#e63946]" />
                Link-ka Alaabta (Alibaba/Bixiyaha URL)
              </label>
              <div className="relative">
                <Input
                  type="url"
                  value={formData.product_link}
                  onChange={(e) => updateField("product_link", e.target.value)}
                  placeholder="tusaale: https://www.alibaba.com/product-detail/..."
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
                  Fiiri Link-ka
                </a>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2">MOQ (Dalabka Ugu Yar)</label>
                <Input
                  type="number"
                  value={formData.moq}
                  onChange={(e) => updateField("moq", e.target.value)}
                  placeholder="tusaale: 100"
                  className={inputStyles}
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2">Qiimaha Hal Shiil ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) => updateField("unit_price", e.target.value)}
                  placeholder="tusaale: 15.99"
                  className={inputStyles}
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2">Habka Dirista</label>
                <select
                  value={formData.shipping_method}
                  onChange={(e) => updateField("shipping_method", e.target.value)}
                  className={selectStyles}
                >
                  <option value="">Dooro...</option>
                  <option value="Air Freight">Diyaarad (Air Freight)</option>
                  <option value="Sea Freight">Markab (Sea Freight)</option>
                  <option value="Express (DHL/FedEx)">Degdeg (DHL/FedEx)</option>
                  <option value="Local Supplier">Bixiye Maxalli</option>
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
                <p className="text-white font-medium">Sample La Dalbaday</p>
                <p className="text-sm text-gray-400">Ma dalbaday sample alaabta?</p>
              </div>
            </div>

            {formData.platform_selected === "Alibaba" && (
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2">Alibaba Product URL</label>
                <Input
                  value={formData.product_link}
                  onChange={(e) => updateField("product_link", e.target.value)}
                  placeholder="tusaale: https://www.alibaba.com/product"
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
                Tallaabooyinka Fulinta
              </label>
              <Button
                onClick={addImplementationStep}
                size="sm"
                className="bg-[#e63946] hover:bg-[#ff6b6b] text-white transition-all duration-300 hover:scale-105 shadow-lg shadow-[#e63946]/20"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ku Dar Tallaabo
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
                    placeholder={`Tallaabada ${index + 1}: Sharax tallaabadan...`}
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
                  Taariikhda Bilowga
                </label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateField("start_date", e.target.value)}
                  className={inputStyles}
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2">Taariikhda Dhamaadka</label>
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
                <label className="text-sm font-semibold text-gray-200">Hadafyada Muhiimka (Milestones)</label>
                <Button
                  onClick={addMilestone}
                  size="sm"
                  className="bg-[#e63946] hover:bg-[#ff6b6b] text-white transition-all duration-300 hover:scale-105 shadow-lg shadow-[#e63946]/20"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ku Dar Hadaf
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
                        placeholder="Cinwaanka hadafka"
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
                Habab Suuq-geynta (Marketing Channels)
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
              <label className="block text-sm font-semibold text-gray-200 mb-2">Qorshaha Content-ka</label>
              <Textarea
                value={formData.content_plan}
                onChange={(e) => updateField("content_plan", e.target.value)}
                placeholder="Sharax istaraatiijiyadaada content-ka..."
                className={`${textareaStyles} min-h-[120px]`}
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2">Sharaxaada Sales Funnel-ka</label>
              <Textarea
                value={formData.funnel_description}
                onChange={(e) => updateField("funnel_description", e.target.value)}
                placeholder="Sharax safarki macmiilka laga bilaabo ogaanshaha ilaa iibsiga..."
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
                Diyaar Ma Tahay Inaad Gudbiso?
              </h3>
              <p className="text-gray-300 text-sm">
                Dib u eeg qorshahaaga fulinta e-commerce ka hor inta aadan gudbin. Wali waad beddeli kartaa ka dib
                gudbinta.
              </p>
            </div>

            {/* Summary sections */}
            <div className="grid gap-4">
              <div className="p-4 rounded-xl bg-[#1e293b]/50 border border-gray-700">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#e63946]" />
                  Hadafka & Aragtida
                </h4>
                <p className="text-gray-300 text-sm">
                  <strong>Magaca:</strong> {formData.business_name || "—"}
                </p>
                <p className="text-gray-300 text-sm">
                  <strong>Bartilmaameedka Dakhliga:</strong> ${formData.revenue_target || "—"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#1e293b]/50 border border-gray-700">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#e63946]" />
                  Platform-ka
                </h4>
                <p className="text-gray-300 text-sm">
                  <strong>Platform-ka La Doortay:</strong> {formData.platform_selected || "—"}
                </p>
                {formData.platform_selected === "Custom Store" && formData.custom_store_name && (
                  <p className="text-gray-300 text-sm">
                    <strong>Magaca Dukaanka:</strong> {formData.custom_store_name}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#1e293b]/50 border border-gray-700">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#e63946]" />
                  Alaabta
                </h4>
                <p className="text-gray-300 text-sm">
                  <strong>Magaca Alaabta:</strong> {formData.product_name || "—"}
                </p>
                <p className="text-gray-300 text-sm">
                  <strong>Bixiyaha:</strong> {formData.supplier_name || "—"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#1e293b]/50 border border-gray-700">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#e63946]" />
                  Suuq-geynta
                </h4>
                <p className="text-gray-300 text-sm">
                  <strong>Hababka:</strong>{" "}
                  {formData.marketing_channels.length > 0 ? formData.marketing_channels.join(", ") : "—"}
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0f1a1a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#e63946]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1a1a] via-[#1a2626] to-[#0f1a1a] relative overflow-hidden">
      {/* Floating e-commerce icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-5">
        {ECOMMERCE_ICONS.map((item, index) => (
          <div
            key={index}
            className="absolute animate-float"
            style={{
              left: item.left,
              animationDelay: item.delay,
              animationDuration: item.duration,
            }}
          >
            <item.Icon className="w-8 h-8 text-white" />
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f1a1a]/80 backdrop-blur-lg border-b border-[#e63946]/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push("/ecommerce-wizard")}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">E-commerce Wizard</h1>
          <Button
            onClick={() => handleSave()}
            disabled={saving}
            size="sm"
            className="bg-[#e63946] hover:bg-[#ff6b6b] text-white"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="ml-2 hidden sm:inline">Kaydi</span>
          </Button>
        </div>
      </header>

      <main className="pt-20 pb-32 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Group Info */}
          {groupInfo && (
            <div className="mb-6 p-4 rounded-2xl bg-[#1e293b]/50 border border-[#e63946]/20 backdrop-blur-sm">
              <p className="text-white font-semibold">{groupInfo.name}</p>
              <p className="text-gray-400 text-sm">Group ID: {groupId}</p>
            </div>
          )}

          {/* Step Indicator */}
          <div className="mb-8 overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max">
              {STEPS.map((step) => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id

                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      handleSave(step.id)
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-[#e63946] text-white shadow-lg shadow-[#e63946]/30"
                        : isCompleted
                          ? "bg-[#e63946]/20 text-[#e63946]"
                          : "bg-[#1e293b]/50 text-gray-400 hover:bg-[#1e293b]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium hidden md:inline">{step.title}</span>
                    <span className="text-sm font-medium md:hidden">{step.id}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-[#1e293b]/30 backdrop-blur-sm rounded-3xl border border-[#e63946]/10 p-6 md:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              {(() => {
                const Icon = STEPS[currentStep - 1].icon
                return <Icon className="w-6 h-6 text-[#e63946]" />
              })()}
              <h2 className="text-2xl font-bold text-white">{STEPS[currentStep - 1].title}</h2>
            </div>

            {renderStepContent()}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f1a1a]/90 backdrop-blur-lg border-t border-[#e63946]/20 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            onClick={() => handleSave(currentStep - 1)}
            disabled={currentStep === 1 || saving}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-[#1e293b] hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Ka Hore
          </Button>

          <div className="flex items-center gap-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentStep === step.id
                    ? "bg-[#e63946] w-4"
                    : currentStep > step.id
                      ? "bg-[#e63946]/50"
                      : "bg-gray-600"
                }`}
              />
            ))}
          </div>

          {currentStep < 8 ? (
            <Button
              onClick={() => handleSave(currentStep + 1)}
              disabled={saving}
              className="bg-[#e63946] hover:bg-[#ff6b6b] text-white"
            >
              Xiga
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-[#e63946] to-[#ff6b6b] hover:from-[#ff6b6b] hover:to-[#e63946] text-white shadow-lg shadow-[#e63946]/30"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Gudbi Qorshaha
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
