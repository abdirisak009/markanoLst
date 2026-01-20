"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Star, Search, Filter, X, ArrowUpDown, ArrowUp, ArrowDown, Calendar, Loader2, RefreshCw } from "lucide-react"

interface StarRating {
  id: number
  activity: string
  rating: number
  student_id: string | null
  created_at: string
  updated_at: string
}

type SortField = "id" | "rating" | "student_id" | "date"
type SortOrder = "asc" | "desc"

export default function StarRatingsPage() {
  const [ratings, setRatings] = useState<StarRating[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  useEffect(() => {
    fetchRatings()
  }, [])

  const fetchRatings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/temporary-activities")
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to fetch ratings" }))
        toast.error(errorData.error || "Failed to fetch ratings")
        return
      }

      const data = await response.json()
      
      if (Array.isArray(data)) {
        console.log("Raw data received:", data.length, "activities")
        console.log("First 3 raw activities:", data.slice(0, 3).map((a: any) => ({
          id: a.id,
          rating: a.rating,
          ratingType: typeof a.rating,
          student_id: a.student_id,
        })))
        
        // Filter only activities with ratings and properly parse them
        const ratingsWithStars = data
          .filter((activity: any) => {
            // Check if rating exists and is valid
            const ratingValue = activity.rating
            console.log(`Checking activity ${activity.id}: rating = ${ratingValue}, type = ${typeof ratingValue}`)
            
            if (ratingValue === null || ratingValue === undefined || ratingValue === '') {
              return false
            }
            const parsed = parseInt(ratingValue.toString())
            const isValid = !isNaN(parsed) && parsed >= 1 && parsed <= 5
            console.log(`Activity ${activity.id}: parsed = ${parsed}, valid = ${isValid}`)
            return isValid
          })
          .map((activity: any) => {
            const parsedRating = parseInt(activity.rating.toString())
            return {
              ...activity,
              rating: parsedRating,
            }
          })
        
        setRatings(ratingsWithStars)
        console.log("Fetched all activities:", data.length)
        console.log("Activities with ratings:", ratingsWithStars.length)
        
        if (ratingsWithStars.length > 0) {
          console.log("Sample ratings:", ratingsWithStars.slice(0, 5).map((r: any) => ({ 
            id: r.id, 
            rating: r.rating, 
            student_id: r.student_id,
            activity: r.activity?.substring(0, 30) 
          })))
        } else {
          console.warn("No ratings found! Check if:")
          console.warn("1. Rating column exists in database (run migration script 052)")
          console.warn("2. Students have actually submitted ratings")
          console.warn("3. Rating values are between 1-5")
        }
      } else if (data.error) {
        toast.error(data.error)
        setRatings([])
      } else {
        setRatings([])
      }
    } catch (error) {
      console.error("Error fetching ratings:", error)
      toast.error("Failed to fetch ratings. Please check your connection and try again.")
      setRatings([])
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedRatings = useMemo(() => {
    let filtered = [...ratings]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (rating) =>
          rating.id.toString().includes(query) ||
          rating.student_id?.toLowerCase().includes(query) ||
          rating.activity.toLowerCase().includes(query)
      )
    }

    // Rating filter
    if (ratingFilter !== "all") {
      const filterRating = parseInt(ratingFilter)
      filtered = filtered.filter((rating) => rating.rating === filterRating)
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filtered = filtered.filter((rating) => {
        const ratingDate = new Date(rating.created_at)
        const fromDate = dateFrom ? new Date(dateFrom) : null
        const toDate = dateTo ? new Date(dateTo) : null

        if (fromDate && ratingDate < fromDate) return false
        if (toDate && ratingDate > toDate) return false
        return true
      })
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "id":
          comparison = a.id - b.id
          break
        case "rating":
          comparison = a.rating - b.rating
          break
        case "student_id":
          comparison = (a.student_id || "").localeCompare(b.student_id || "")
          break
        case "date":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [ratings, searchQuery, sortField, sortOrder, ratingFilter, dateFrom, dateTo])

  const hasActiveFilters = searchQuery !== "" || ratingFilter !== "all" || dateFrom !== "" || dateTo !== ""

  const clearFilters = () => {
    setSearchQuery("")
    setRatingFilter("all")
    setDateFrom("")
    setDateTo("")
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />
    }
    return sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
  }

  const getRatingStats = () => {
    const total = ratings.length
    const avg = total > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / total : 0
    const byRating = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: ratings.filter((r) => r.rating === star).length,
    }))
    return { total, avg: avg.toFixed(1), byRating }
  }

  const stats = getRatingStats()

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20">
            <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Star Ratings</h1>
            <p className="text-gray-400 mt-1">View and manage all student star ratings</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Ratings</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Average Rating</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.avg}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${
                        star <= Math.round(parseFloat(stats.avg))
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-600 fill-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-white/10">
            <CardContent className="p-6">
              <div>
                <p className="text-gray-400 text-sm">5 Star Ratings</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.byRating[4].count}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-white/10">
            <CardContent className="p-6">
              <div>
                <p className="text-gray-400 text-sm">Filtered Results</p>
                <p className="text-3xl font-bold text-white mt-2">{filteredAndSortedRatings.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  placeholder="Search by ID, Student ID, or Activity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#0a0a0f] border-white/10 text-white focus:border-yellow-400"
                />
              </div>

              {/* Rating Filter */}
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[150px] bg-[#0a0a0f] border-white/10 text-white focus:border-yellow-400">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0f] border-white/10">
                  <SelectItem value="all" className="text-white hover:bg-white/10">
                    All Ratings
                  </SelectItem>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <SelectItem key={star} value={star.toString()} className="text-white hover:bg-white/10">
                      {star} Star{star > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date From */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  type="date"
                  placeholder="From Date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pl-10 bg-[#0a0a0f] border-white/10 text-white focus:border-yellow-400 w-[180px]"
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
                  className="pl-10 bg-[#0a0a0f] border-white/10 text-white focus:border-yellow-400 w-[180px]"
                />
              </div>

              {/* Sort By */}
              <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                <SelectTrigger className="w-[150px] bg-[#0a0a0f] border-white/10 text-white focus:border-yellow-400">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0f] border-white/10">
                  <SelectItem value="date" className="text-white hover:bg-white/10">
                    Date
                  </SelectItem>
                  <SelectItem value="rating" className="text-white hover:bg-white/10">
                    Rating
                  </SelectItem>
                  <SelectItem value="student_id" className="text-white hover:bg-white/10">
                    Student ID
                  </SelectItem>
                  <SelectItem value="id" className="text-white hover:bg-white/10">
                    ID
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

              {/* Refresh */}
              <Button
                onClick={fetchRatings}
                disabled={loading}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ratings Table */}
        <Card className="bg-gradient-to-br from-[#0a0a0f] to-[#0f0f1a] border-white/10 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-b border-white/10">
            <CardTitle className="text-white flex items-center justify-between text-xl">
              <span className="font-bold">
                All Star Ratings ({filteredAndSortedRatings.length}
                {hasActiveFilters && ` of ${ratings.length}`})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
              </div>
            ) : filteredAndSortedRatings.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Star className="h-16 w-16 text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">No ratings found</p>
                <p className="text-gray-500 text-sm mt-2">
                  {hasActiveFilters ? "Try adjusting your filters" : "Ratings will appear here when students submit them"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-b border-white/10">
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
                        Student ID
                      </th>
                      <th className="text-left p-4 text-gray-300 font-bold text-sm uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="text-left p-4 text-gray-300 font-bold text-sm uppercase tracking-wider">
                        <button
                          onClick={() => handleSort("rating")}
                          className="flex items-center gap-2 hover:text-white transition-colors"
                        >
                          Rating
                          <SortIcon field="rating" />
                        </button>
                      </th>
                      <th className="text-left p-4 text-gray-300 font-bold text-sm uppercase tracking-wider">
                        <button
                          onClick={() => handleSort("date")}
                          className="flex items-center gap-2 hover:text-white transition-colors"
                        >
                          Rated At
                          <SortIcon field="date" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredAndSortedRatings.map((rating, index) => (
                      <tr
                        key={rating.id}
                        className={`transition-all duration-200 ${
                          index % 2 === 0 ? "bg-white/2 hover:bg-white/10" : "bg-white/5 hover:bg-white/15"
                        }`}
                      >
                        <td className="p-4">
                          <span className="text-white font-semibold text-base">{rating.id}</span>
                        </td>
                        <td className="p-4">
                          {rating.student_id ? (
                            <span className="text-white text-sm font-semibold bg-yellow-500/20 px-3 py-1 rounded">
                              {rating.student_id}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm italic">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-white text-base font-medium">{rating.activity}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 transition-all ${
                                  star <= rating.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-600 fill-gray-600"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-yellow-400 text-sm font-bold">({rating.rating}/5)</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-300 text-sm">
                            {new Date(rating.updated_at).toLocaleString("en-US", {
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
