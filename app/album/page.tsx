import { Metadata } from "next";
import { getAlbumItems } from "@/lib/notion-api";
import AlbumCard from "./album-card";

export const metadata: Metadata = {
  title: "Album",
  description: "My photo album with stories",
};

export default async function AlbumPage() {
  const albumItems = await getAlbumItems();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Album</h1>
          <p className="text-lg text-gray-600">
            A collection of moments and the stories behind them
          </p>
        </div>

        {/* Masonry Grid */}
        {albumItems.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
            {albumItems.map((item) => (
              <div
                key={item.id}
                className="break-inside-avoid mb-6"
              >
                <AlbumCard
                  title={item.title}
                  imageUrl={item.imageUrl}
                  story={item.story}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No album items found. Add items to your Album page in Notion.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
