import { getMyCollections, createCollection, deleteCollection } from "@/actions/collection-actions";

export default async function SellerCollectionsPage() {
  const collections = await getMyCollections();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">My Collections</h1>

      {/* Create form */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4">
          New Collection
        </h2>
        <form action={createCollection} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Summer 2025"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder="Optional short description"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black resize-none"
            />
          </div>
          <button
            type="submit"
            className="bg-black text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Create
          </button>
        </form>
      </div>

      {/* Collections list */}
      {collections.length === 0 ? (
        <p className="text-sm text-gray-400">No collections yet. Create one above.</p>
      ) : (
        <div className="space-y-2">
          {collections.map((col) => (
            <div
              key={col._id}
              className="flex items-center justify-between gap-4 border border-gray-200 rounded-lg px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{col.title}</p>
                {col.description && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">{col.description}</p>
                )}
              </div>
              <form action={deleteCollection.bind(null, col._id)}>
                <button
                  type="submit"
                  className="text-xs text-red-500 hover:text-red-700 whitespace-nowrap"
                >
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
