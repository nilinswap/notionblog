export default function AlbumLoading() {
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center space-y-5">
        <div className="relative flex h-20 w-20 items-center justify-center">
          {/* Glowing gradient backlight */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-400 opacity-25 blur-lg animate-pulse" />
          {/* Outer ring */}
          <div className="h-16 w-16 rounded-full border-2 border-blue-100/50" />
          {/* Spinning gradient arc */}
          <div className="absolute h-16 w-16 rounded-full border-2 border-t-blue-600 border-l-indigo-400 animate-spin" />
        </div>
        <div className="space-y-1 text-center">
          <h3 className="text-sm font-semibold tracking-wider text-gray-700 uppercase animate-pulse">Loading Album</h3>
          <p className="text-xs text-gray-400">Fetching stories & moments...</p>
        </div>
      </div>
    </div>
  );
}
