import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-24 px-4 overflow-hidden relative border-b border-blue-900/50">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-black z-0"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-3xl z-0 pointer-events-none"></div>
        <div className="container mx-auto max-w-5xl relative z-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12 pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/40 border border-blue-800/50 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Professional Education Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300">
            Master the Future of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Business Automation</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Gain executive-level expertise in Artificial Intelligence and Digital Transformation. Accelerate your career with our rigorous, industry-focused programs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/courses">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg shadow-blue-900/50 transition-all hover:-translate-y-0.5">
                Explore Courses
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white px-8 py-6 text-base font-semibold rounded-xl backdrop-blur-sm transition-all">
                For Companies
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-slate-50 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Professional Disciplines</h2>
            <p className="text-slate-500 mt-4 text-lg">Focused learning paths for modern enterprises and leaders.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 rounded-2xl overflow-hidden bg-white group">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6 group-hover:bg-blue-50/50 transition-colors">
                <CardTitle className="text-xl text-slate-900 font-bold">Artificial Intelligence</CardTitle>
                <CardDescription className="text-blue-600 font-medium mt-1">Generative AI, Data Strategy</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-600 leading-relaxed">Leverage AI to create automated workflows, optimize operations, and generate new revenue streams in the enterprise.</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 rounded-2xl overflow-hidden bg-white group">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6 group-hover:bg-indigo-50/50 transition-colors">
                <CardTitle className="text-xl text-slate-900 font-bold">Digital Leadership</CardTitle>
                <CardDescription className="text-indigo-600 font-medium mt-1">Agile, Cloud Architecture</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-600 leading-relaxed">Modernize legacy systems, manage technical teams, and adopt scalable cloud-based infrastructures for the future.</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 shadow-sm hover:shadow-xl hover:border-cyan-200 transition-all duration-300 rounded-2xl overflow-hidden bg-white group">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6 group-hover:bg-cyan-50/50 transition-colors">
                <CardTitle className="text-xl text-slate-900 font-bold">Process Automation</CardTitle>
                <CardDescription className="text-cyan-600 font-medium mt-1">RPA, System Integration</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-600 leading-relaxed">Implement robotic process automation to reduce overhead, eliminate human error, and accelerate outcomes.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Course Banner */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">Flagship Program</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-12 tracking-tight">Accelerate Your Technical Intuition</h3>

          <div className="p-1 rounded-3xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 shadow-sm">
            <div className="bg-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 md:gap-16 text-left border border-slate-100 shadow-xl shadow-slate-200/40">
              <div className="w-full md:w-5/12 aspect-[4/3] bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-inner group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop')] opacity-20 mix-blend-overlay bg-cover bg-center group-hover:scale-105 transition-transform duration-1000"></div>
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 z-10 group-hover:bg-white/20 transition-colors">
                  <span className="text-3xl font-black text-white">AI</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Online
                </div>
                <h4 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight">Generative AI for Business Automation</h4>
                <p className="text-base text-slate-600 mb-8 leading-relaxed">
                  A comprehensive 6-week journey designed exclusively for business leaders and technical managers to master Large Language Models and intelligent enterprise workflow automation.
                </p>
                <Link href="/courses">
                  <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-8 rounded-xl shadow-md w-full sm:w-auto">
                    View Course Details &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 pt-16 pb-8 px-4 border-t border-slate-200 mt-auto">
        <div className="container mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <span className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
              <div className="w-6 h-6 bg-blue-600 text-white flex items-center justify-center rounded mr-2 text-[10px]">EE</div>
              Executive<span className="text-blue-600">Edu</span>
            </span>
            <p className="mt-4 text-sm text-slate-500 leading-relaxed">Empowering the world's leading organizations with future-ready tech skills.</p>
          </div>
          <div>
            <h5 className="text-slate-900 font-semibold mb-4">Programs</h5>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Generative AI</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Cloud Architecture</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Data Strategy</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-slate-900 font-semibold mb-4">Company</h5>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Enterprise Solutions</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-slate-900 font-semibold mb-4">Legal</h5>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto max-w-6xl pt-8 border-t border-slate-200 text-sm text-slate-500 flex flex-col md:flex-row items-center justify-between">
          <p>&copy; {new Date().getFullYear()} ExecutiveEdu Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
