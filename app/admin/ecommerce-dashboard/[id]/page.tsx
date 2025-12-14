"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, CheckCircle, TrendingUp, Package, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SubmissionDetail() {
  const params = useParams()
  const router = useRouter()
  const [submission, setSubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubmission()
  }, [])

  const loadSubmission = async () => {
    try {
      const res = await fetch("/api/ecommerce-wizard")
      const data = await res.json()
      const sub = data.find((s: any) => s.id === Number.parseInt(params.id as string))
      setSubmission(sub)
    } catch (err) {
      console.error("Error loading submission:", err)
    }
    setLoading(false)
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!submission) return <div className="p-6">Submission not found</div>

  const implementationSteps = Array.isArray(submission.implementation_steps) ? submission.implementation_steps : []
  const milestones = Array.isArray(submission.milestones) ? submission.milestones : []
  const marketingChannels = Array.isArray(submission.marketing_channels) ? submission.marketing_channels : []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{submission.business_name}</h1>
          <p className="text-gray-500">Group: {submission.group_name}</p>
        </div>
        <Badge
          className={
            submission.status === "submitted"
              ? "bg-[#9ed674] text-[#1d4041] text-lg px-4 py-2"
              : "bg-blue-500 text-lg px-4 py-2"
          }
        >
          {submission.status === "submitted" ? "Submitted" : "In Progress"}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#9ed674]" />
                  Revenue Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-[#1d4041]">
                  ${submission.revenue_target?.toLocaleString() || "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#9ed674]" />
                  Platform
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{submission.platform_selected || "N/A"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#9ed674]" />
                  Business Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{submission.business_type || "N/A"}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Goals & Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Short Term Goal</p>
                <p>{submission.business_goal_short || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Long Term Goal</p>
                <p>{submission.business_goal_long || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Success Looks Like</p>
                <p>{submission.success_looks_like || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Product Name</p>
                  <p className="font-medium">{submission.product_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Supplier</p>
                  <p className="font-medium">{submission.supplier_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">MOQ</p>
                  <p className="font-medium">{submission.moq || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unit Price</p>
                  <p className="font-medium">${submission.unit_price || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Research</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Target Market</p>
                <p>{submission.target_market || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Competitors</p>
                <p>{submission.competitors || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Market Position</p>
                <p>{submission.market_position || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Value Proposition</p>
                <p>{submission.value_proposition || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {implementationSteps.length > 0 ? (
                  implementationSteps.map((step: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-[#1d4041] text-white flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="flex-1 pt-1">{step}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No implementation steps added</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Setup Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {submission.account_created ? (
                    <CheckCircle className="w-5 h-5 text-[#9ed674]" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span>Account Created</span>
                </div>
                <div className="flex items-center gap-2">
                  {submission.branding_ready ? (
                    <CheckCircle className="w-5 h-5 text-[#9ed674]" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span>Branding Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  {submission.payment_setup ? (
                    <CheckCircle className="w-5 h-5 text-[#9ed674]" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span>Payment Setup</span>
                </div>
                <div className="flex items-center gap-2">
                  {submission.shipping_setup ? (
                    <CheckCircle className="w-5 h-5 text-[#9ed674]" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span>Shipping Setup</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#9ed674]" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{submission.start_date || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">{submission.end_date || "N/A"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-3">Milestones</p>
                <div className="space-y-2">
                  {milestones.length > 0 ? (
                    milestones.map((milestone: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <CheckCircle className="w-4 h-4 text-[#9ed674]" />
                        <span>{milestone}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No milestones added</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Marketing Channels</p>
                <div className="flex flex-wrap gap-2">
                  {marketingChannels.length > 0 ? (
                    marketingChannels.map((channel: string) => (
                      <Badge key={channel} className="bg-[#1d4041] text-white">
                        {channel}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500">No channels selected</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Content Plan</p>
                <p>{submission.content_plan || "N/A"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Sales Funnel</p>
                <p>{submission.funnel_description || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
