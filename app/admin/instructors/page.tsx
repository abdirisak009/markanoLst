"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AdminSidebar } from "@/components/admin-sidebar"
import {
  GraduationCap,
  Search,
  Eye,
  RefreshCw,
  Mail,
  Building2,
  Loader2,
  UserCheck,
} from "lucide-react"
import { toast } from "sonner"

interface Instructor {
  id: number
  application_id: number | null
  full_name: string
  email: string
  phone: string | null
  profile_image_url: string | null
  bio: string | null
  status: string
  created_at: string
  university_name: string | null
}

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [filtered, setFiltered] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchInstructors()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(instructors)
      return
    }
    const q = searchQuery.toLowerCase()
    setFiltered(
      instructors.filter(
        (i) =>
          i.full_name?.toLowerCase().includes(q) ||
          i.email?.toLowerCase().includes(q) ||
          i.university_name?.toLowerCase().includes(q)
      )
    )
  }, [searchQuery, instructors])

  const fetchInstructors = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/instructors", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setInstructors(Array.isArray(data) ? data : [])
      setFiltered(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load instructors")
      setInstructors([])
      setFiltered([])
    } finally {
      setLoading(false)
    }
  }

  const activeCount = instructors.filter((i) => i.status === "active").length
  const suspendedCount = instructors.filter((i) => i.status === "suspended").length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#e63946] mx-auto mb-4" />
          <p className="text-gray-600">Loading instructors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-[#e63946] to-[#d62839] rounded-lg shadow-md">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                  Instructors
                </h1>
                <p className="text-gray-600 mt-1">Approved teachers and their courses</p>
              </div>
              <Button variant="outline" onClick={fetchInstructors} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-gray-500 text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{instructors.length}</p>
                </CardContent>
              </Card>
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-green-600 text-sm font-medium">Active</p>
                  <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                </CardContent>
              </Card>
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-amber-600 text-sm font-medium">Suspended</p>
                  <p className="text-2xl font-bold text-amber-600">{suspendedCount}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-gray-200 shadow-sm mb-6">
              <CardContent className="p-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, university..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardContent>
            </Card>

            {filtered.length === 0 ? (
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-12 text-center">
                  <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No instructors found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Approve applications from{" "}
                    <Link href="/admin/instructor-applications" className="text-[#e63946] hover:underline">
                      Instructor Applications
                    </Link>
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-[#013565] to-[#024a8c] hover:bg-none">
                        <TableHead className="text-white font-medium">ID</TableHead>
                        <TableHead className="text-white font-medium">Name</TableHead>
                        <TableHead className="text-white font-medium">Email</TableHead>
                        <TableHead className="text-white font-medium">University</TableHead>
                        <TableHead className="text-white font-medium">Status</TableHead>
                        <TableHead className="text-white font-medium">Joined</TableHead>
                        <TableHead className="text-white font-medium text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((i) => (
                        <TableRow key={i.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">#{i.id}</TableCell>
                          <TableCell>{i.full_name}</TableCell>
                          <TableCell className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {i.email}
                          </TableCell>
                          <TableCell>
                            {i.university_name ? (
                              <span className="flex items-center gap-1.5">
                                <Building2 className="h-3 w-3 text-gray-400" />
                                {i.university_name}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                i.status === "active"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }
                            >
                              {i.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600 text-sm">
                            {new Date(i.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild className="text-[#e63946] hover:bg-red-50">
                              <Link href={`/admin/instructors/${i.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
