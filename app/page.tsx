import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  // Test database connection
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Fashion Trends</h1>
      <p className="text-gray-600 mb-4">Trend visualization coming soon...</p>

      {/* Database connection test */}
      <div className="mt-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Database Status</h2>
        {error ? (
          <p className="text-sm text-red-600">Error: {error.message}</p>
        ) : (
          <p className="text-sm text-green-600">
            ✓ Connected to Supabase ({categories?.length || 0} categories)
          </p>
        )}
      </div>
    </main>
  )
}
