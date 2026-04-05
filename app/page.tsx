import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Welcome to Your Website
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A modern, full-stack application built with Next.js, TypeScript, and Tailwind CSS
          </p>
        </header>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Frontend</h2>
            <p className="text-gray-300 mb-4">
              React 18 with TypeScript for type-safe, component-based development
            </p>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Modern React patterns</li>
              <li>• Tailwind CSS styling</li>
              <li>• shadcn/ui components</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-semibold mb-4 text-purple-400">Backend</h2>
            <p className="text-gray-300 mb-4">
              Built-in API routes for server-side functionality
            </p>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• RESTful API endpoints</li>
              <li>• Type-safe routes</li>
              <li>• Server-side rendering</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-semibold mb-4 text-green-400">Development</h2>
            <p className="text-gray-300 mb-4">
              Professional development setup with modern tooling
            </p>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Hot reload development</li>
              <li>• TypeScript strict mode</li>
              <li>• Optimized builds</li>
            </ul>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Build?</h2>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/api/hello"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Test API
            </Link>
            <Link 
              href="/api/users"
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View Users API
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
