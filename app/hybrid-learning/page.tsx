import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, Users, Calendar, Globe, MapPin } from "lucide-react"

export default function HybridLearningPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8c] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Hybrid Learning Experience</h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Combine the flexibility of online learning with the engagement of in-person sessions
          </p>
        </div>
      </section>

      {/* What is Hybrid Learning */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 mb-12">
              <h2 className="text-3xl font-bold text-[#1e3a5f] mb-6 text-center">What is Hybrid Learning?</h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Hybrid learning at Markano combines the best of both worlds: you get the flexibility to learn at your
                own pace through our comprehensive online video courses, while also benefiting from scheduled in-person
                sessions where you can interact with instructors and fellow students face-to-face.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                This blended approach ensures you have the support and community of traditional classroom learning, with
                the convenience and accessibility of online education.
              </p>
            </Card>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card className="p-6">
                <div className="w-12 h-12 bg-[#ef4444] rounded-lg flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">Flexible Online Learning</h3>
                <p className="text-gray-600">
                  Access course materials 24/7, learn at your own pace, and rewatch lessons as many times as you need.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 bg-[#ef4444] rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">Interactive In-Person Sessions</h3>
                <p className="text-gray-600">
                  Attend regular workshops, get hands-on practice, and network with peers and instructors.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 bg-[#ef4444] rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">Global Community</h3>
                <p className="text-gray-600">
                  Connect with students from around the world online, while building local relationships in person.
                </p>
              </Card>

              <Card className="p-6">
                <div className="w-12 h-12 bg-[#ef4444] rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">Local Learning Centers</h3>
                <p className="text-gray-600">
                  Attend sessions at our conveniently located learning centers in major cities worldwide.
                </p>
              </Card>
            </div>

            {/* Sample Schedule */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6 text-center">Sample Weekly Schedule</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-[#ef4444] pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-[#ef4444]" />
                    <h4 className="font-semibold text-[#1e3a5f]">Monday - Friday</h4>
                  </div>
                  <p className="text-gray-700">
                    <strong>Online Learning:</strong> Watch video lessons, complete exercises, and practice coding at
                    your own pace (2-3 hours daily recommended)
                  </p>
                </div>

                <div className="border-l-4 border-[#1e3a5f] pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-[#1e3a5f]" />
                    <h4 className="font-semibold text-[#1e3a5f]">Saturday Morning</h4>
                  </div>
                  <p className="text-gray-700">
                    <strong>In-Person Workshop:</strong> 3-hour hands-on coding session with instructor and peers (10am
                    - 1pm)
                  </p>
                </div>

                <div className="border-l-4 border-[#1e3a5f] pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-[#1e3a5f]" />
                    <h4 className="font-semibold text-[#1e3a5f]">Saturday Afternoon</h4>
                  </div>
                  <p className="text-gray-700">
                    <strong>Q&A Session:</strong> 1-hour group discussion and doubt clearing with instructors (2pm -
                    3pm)
                  </p>
                </div>

                <div className="border-l-4 border-gray-300 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <h4 className="font-semibold text-gray-700">Sunday</h4>
                  </div>
                  <p className="text-gray-600">
                    <strong>Optional:</strong> Project work, peer study groups, or rest day
                  </p>
                </div>
              </div>
            </Card>

            {/* CTA */}
            <div className="text-center mt-12">
              <h3 className="text-2xl font-bold text-[#1e3a5f] mb-4">Ready to Experience Hybrid Learning?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join thousands of students who are achieving their learning goals with our unique hybrid approach.
              </p>
              <Button size="lg" className="bg-[#ef4444] hover:bg-[#dc2626] text-white text-lg px-8" asChild>
                <a href="/register">Register Now</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
