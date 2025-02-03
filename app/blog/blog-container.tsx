export default function BlogContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-2 sm:px-6 lg:px-8">
      <div className="relative mt-4 max-w-3xl mx-auto rounded-2xl p-[2px] bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
        <div className="bg-white rounded-xl p-4 sm:p-12">
          <article className="prose prose-lg max-w-none">
            {children}
          </article>
        </div>
      </div>
    </div>
  )
}
