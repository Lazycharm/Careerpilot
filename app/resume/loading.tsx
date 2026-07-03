import { Skeleton } from '@/components/ui/skeleton'

export default function ResumeLoading() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="h-16 bg-white border-b">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left panel */}
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          {/* Right preview */}
          <div className="hidden lg:block">
            <Skeleton className="aspect-[8.5/11] w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
