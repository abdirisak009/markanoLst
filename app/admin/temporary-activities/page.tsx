"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  Download,
  Upload,
  Trash2,
  FileSpreadsheet,
  Loader2,
  Plus,
  Search,
  Filter,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Star,
} from "lucide-react"
import * as XLSX from "xlsx"

interface TemporaryActivity {
  id: number
  activity: string
  rating?: number | null
  student_id?: string | null
  created_at: string
  updated_at: string
}

type SortField = "id" | "activity" | "date"
type SortOrder = "asc" | "desc"

export default function TemporaryActivitiesPage() {
  const [activities, setActivities] = useState<TemporaryActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newActivity, setNewActivity] = useState("")
  const [newActivityId, setNewActivityId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/temporary-activities")
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to fetch activities" }))
        toast.error(errorData.error || "Failed to fetch activities")
        console.error("API Error:", errorData)
        return
      }

      const data = await response.json()
      
      if (Array.isArray(data)) {
        // Ensure rating is properly parsed as number
        const activitiesWithRating = data.map((activity: any) => {
          let ratingValue = null
          if (activity.rating !== null && activity.rating !== undefined && activity.rating !== '') {
            const parsed = parseInt(activity.rating.toString())
            if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
              ratingValue = parsed
            }
          }
          return {
            ...activity,
            rating: ratingValue,
          }
        })
        setActivities(activitiesWithRating)
        console.log("Fetched activities:", activitiesWithRating.length, "items")
        console.log("Sample activities with ratings:", activitiesWithRating.slice(0, 5).map((a: any) => ({ id: a.id, rating: a.rating, hasRating: !!a.rating })))
      } else if (data.error) {
        toast.error(data.error)
        setActivities([])
      } else {
        setActivities([])
      }
    } catch (error) {
      console.error("Error fetching activities:", error)
      toast.error("Failed to fetch activities. Please check your connection and try again.")
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddActivity = async () => {
    const trimmedActivity = newActivity.trim()
    
    if (!trimmedActivity) {
      toast.error("Please enter an activity")
      return
    }

    if (adding) {
      return // Prevent multiple submissions
    }

    try {
      setAdding(true)
      const requestBody: { activity: string; id?: number } = { activity: trimmedActivity }
      
      // If ID is provided, try to use it
      if (newActivityId.trim()) {
        const customId = parseInt(newActivityId.trim())
        if (!isNaN(customId) && customId > 0) {
          requestBody.id = customId
        }
      }

      const response = await fetch("/api/admin/temporary-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        toast.success("Activity added successfully")
        setNewActivity("")
        setNewActivityId("")
        await fetchActivities()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to add activity")
      }
    } catch (error) {
      console.error("Error adding activity:", error)
      toast.error("Failed to add activity. Please try again.")
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this activity?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/temporary-activities?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Activity deleted successfully")
        fetchActivities()
      } else {
        toast.error("Failed to delete activity")
      }
    } catch (error) {
      console.error("Error deleting activity:", error)
      toast.error("Failed to delete activity")
    }
  }

  const handleDownloadTemplate = () => {
    const templateData = [
      { ID: 1, Activity: "Example Activity 1" },
      { ID: 2, Activity: "Example Activity 2" },
      { ID: 3, Activity: "Example Activity 3" },
    ]

    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Activities")

    // Set column widths
    worksheet["!cols"] = [{ wch: 10 }, { wch: 50 }]

    XLSX.writeFile(workbook, "temporary-activities-template.xlsx")
    toast.success("Template downloaded successfully")
  }

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      console.log("Starting Excel upload, file:", file.name)

      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      console.log("Parsed Excel data:", jsonData)

      const activitiesData = jsonData.map((row: any) => ({
        ID: row["ID"] || row["id"] || row["Id"] || null,
        Activity: String(row["Activity"] || row["activity"] || ""),
      }))

      console.log("Formatted activities data:", activitiesData)

      const response = await fetch("/api/admin/temporary-activities/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activities: activitiesData }),
      })

      const result = await response.json()
      console.log("Upload result:", result)

      if (result.success) {
        toast.success(
          `${result.inserted} activities uploaded successfully. ${result.errors > 0 ? `${result.errors} errors.` : ""}`,
        )

        if (result.errorDetails && result.errorDetails.length > 0) {
          console.error("Upload errors:", result.errorDetails)
        }

        fetchActivities()
      } else {
        toast.error(result.error || "Failed to upload activities")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload Excel file. Please check the format.")
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ""
    }
  }

  // Filter and sort activities
  const filteredAndSortedActivities = useMemo(() => {
    let filtered = activities.filter((activity) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        activity.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.id.toString().includes(searchQuery)

      // Date range filter
      const activityDate = new Date(activity.created_at)
      const fromDate = dateFrom ? new Date(dateFrom) : null
      const toDate = dateTo ? new Date(dateTo) : null

      const matchesDateFrom = !fromDate || activityDate >= fromDate
      const matchesDateTo = !toDate || activityDate <= toDate
      const matchesDate = matchesDateFrom && matchesDateTo

      return matchesSearch && matchesDate
    })

    // Sort activities
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "id":
          comparison = a.id - b.id
          break
        case "activity":
          comparison = a.activity.localeCompare(b.activity)
          break
        case "date":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [activities, searchQuery, sortField, sortOrder, dateFrom, dateTo])

  const hasActiveFilters = searchQuery !== "" || dateFrom !== "" || dateTo !== ""

  const clearFilters = () => {
    setSearchQuery("")
    setDateFrom("")
    setDateTo("")
    setSortField("date")
    setSortOrder("desc")
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 text-gray-400" />
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1 text-[#e63946]" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1 text-[#e63946]" />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#e63946]/20 to-purple-500/20">
              <FileSpreadsheet className="h-8 w-8 text-[#e63946]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Temporary Activities</h1>
              <p className="text-gray-400 mt-1">Manage temporary activities with Excel import/export</p>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Add New Activity */}
              <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                <Input
                  type="number"
                  placeholder="ID (optional)"
                  value={newActivityId}
                  onChange={(e) => setNewActivityId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddActivity()}
                  className="bg-[#0a0a0f] border-white/10 text-white focus:border-[#e63946] w-24"
                />
                <Input
                  placeholder="Enter new activity..."
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddActivity()}
                  className="bg-[#0a0a0f] border-white/10 text-white focus:border-[#e63946] flex-1"
                />
              </div>
              <Button
                onClick={handleAddActivity}
                disabled={adding || !newActivity.trim()}
                className="bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c5222f] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </>
                )}
              </Button>

              {/* Download Template */}
              <Button
                onClick={handleDownloadTemplate}
                variant="outline"
                className="border-white/10 text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>

              {/* Upload Excel */}
              <label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <Button
                  asChild
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/10 cursor-pointer"
                  disabled={uploading}
                >
                  <span>
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Excel
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Activities Table */}
        {loading ? (
          <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-white/10">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#e63946] mx-auto mb-4" />
              <p className="text-gray-400">Loading activities...</p>
            </CardContent>
          </Card>
        ) : activities.length === 0 ? (
          <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-white/10">
            <CardContent className="p-12 text-center">
              <FileSpreadsheet className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No activities found</p>
              <p className="text-gray-500 text-sm">Add activities manually or upload an Excel file</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Filter Bar */}
            <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-white/10">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Search */}
                  <div className="flex-1 min-w-[250px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by ID or Activity..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-[#0a0a0f] border-white/10 text-white focus:border-[#e63946]"
                      />
                    </div>
                  </div>

                  {/* Date From */}
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                      type="date"
                      placeholder="From Date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="pl-10 bg-[#0a0a0f] border-white/10 text-white focus:border-[#e63946] w-[180px]"
                    />
                  </div>

                  {/* Date To */}
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                      type="date"
                      placeholder="To Date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="pl-10 bg-[#0a0a0f] border-white/10 text-white focus:border-[#e63946] w-[180px]"
                    />
                  </div>

                  {/* Sort By */}
                  <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                    <SelectTrigger className="w-[150px] bg-[#0a0a0f] border-white/10 text-white focus:border-[#e63946]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0f] border-white/10">
                      <SelectItem value="id" className="text-white hover:bg-white/10">
                        ID
                      </SelectItem>
                      <SelectItem value="activity" className="text-white hover:bg-white/10">
                        Activity
                      </SelectItem>
                      <SelectItem value="date" className="text-white hover:bg-white/10">
                        Date
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort Order */}
                  <Button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    variant="outline"
                    size="sm"
                    className="border-white/10 text-white hover:bg-white/10"
                  >
                    {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </Button>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      size="sm"
                      className="border-white/10 text-white hover:bg-white/10"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Filter Summary */}
                {hasActiveFilters && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Filter className="h-4 w-4" />
                      <span>
                        Showing {filteredAndSortedActivities.length} of {activities.length} activities
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activities Table */}
            <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-white/10 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-[#e63946]/10 to-purple-500/10 border-b border-white/10">
                <CardTitle className="text-white flex items-center justify-between text-xl">
                  <span className="font-bold">
                    All Activities ({filteredAndSortedActivities.length}
                    {hasActiveFilters && ` of ${activities.length}`})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filteredAndSortedActivities.length === 0 ? (
                  <div className="p-12 text-center">
                    <FileSpreadsheet className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No activities found</p>
                    <p className="text-gray-500 text-sm">
                      {hasActiveFilters ? "Try adjusting your filters" : "Add activities manually or upload an Excel file"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#e63946]/10 to-purple-500/10 border-b border-white/10">
                        <th className="text-left p-4 text-gray-300 font-bold text-sm uppercase tracking-wider">
                          <button
                            onClick={() => handleSort("id")}
                            className="flex items-center gap-2 hover:text-white transition-colors"
                          >
                            ID
                            <SortIcon field="id" />
                          </button>
                        </th>
                        <th className="text-left p-4 text-gray-300 font-bold text-sm uppercase tracking-wider">
                          <button
                            onClick={() => handleSort("activity")}
                            className="flex items-center gap-2 hover:text-white transition-colors"
                          >
                            Activity
                            <SortIcon field="activity" />
                          </button>
                        </th>
                        <th className="text-left p-4 text-gray-300 font-bold text-sm uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="text-left p-4 text-gray-300 font-bold text-sm uppercase tracking-wider">
                          Student ID
                        </th>
                        <th className="text-left p-4 text-gray-300 font-bold text-sm uppercase tracking-wider">
                          <button
                            onClick={() => handleSort("date")}
                            className="flex items-center gap-2 hover:text-white transition-colors"
                          >
                            Created At
                            <SortIcon field="date" />
                          </button>
                        </th>
                        <th className="text-right p-4 text-gray-300 font-bold text-sm uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredAndSortedActivities.map((activity, index) => (
                          <tr
                            key={activity.id}
                            className={`transition-all duration-200 ${
                              index % 2 === 0
                                ? "bg-white/2 hover:bg-white/10"
                                : "bg-white/5 hover:bg-white/15"
                            }`}
                          >
                            <td className="p-4">
                              <span className="text-white font-semibold text-base">{activity.id}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-white text-base font-medium">{activity.activity}</span>
                            </td>
                            <td className="p-4">
                              {activity.rating && typeof activity.rating === 'number' && activity.rating > 0 && activity.rating <= 5 ? (
                                <div className="flex items-center gap-1.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 transition-all ${
                                        star <= activity.rating
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-gray-600 fill-gray-600"
                                      }`}
                                    />
                                  ))}
                                  <span className="ml-2 text-gray-400 text-sm font-medium">({activity.rating}/5)</span>
                                </div>
                              ) : (
                                <span className="text-gray-500 text-sm italic">No rating</span>
                              )}
                            </td>
                            <td className="p-4">
                              {activity.student_id ? (
                                <span className="text-white text-sm font-semibold bg-[#e63946]/20 px-2 py-1 rounded">
                                  {activity.student_id}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-sm italic">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className="text-gray-300 text-sm">
                                {new Date(activity.created_at).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                  hour12: true,
                                })}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <Button
                                onClick={() => handleDelete(activity.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
