import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function PropertyDetailLoading() {
  return (
    <div className="min-h-screen bg-[#EEF6F6] text-[#19322F] flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Gallery Skeleton */}
          <div className="lg:col-span-8 space-y-4">
            <div className="aspect-[16/10] w-full rounded-xl bg-[#D9ECC8]/50" />
            <div className="flex gap-4 overflow-hidden pb-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex-none w-48 aspect-[4/3] rounded-lg bg-[#D9ECC8]/40"
                />
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-[#006655]/5 space-y-6">
              <div className="space-y-3">
                <div className="h-10 w-48 bg-slate-200 rounded" />
                <div className="h-4 w-64 bg-slate-100 rounded" />
              </div>
              <div className="h-px bg-slate-100" />
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-200" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-14 w-full bg-[#006655]/20 rounded-lg" />
                <div className="h-14 w-full bg-slate-100 rounded-lg" />
              </div>
            </div>

            <div className="bg-white p-2 rounded-xl border border-[#006655]/5">
              <div className="w-full aspect-[4/3] rounded-lg bg-slate-100" />
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="lg:col-span-8 lg:row-start-2 lg:-mt-8 space-y-8">
            <div className="bg-white p-8 rounded-xl border border-[#006655]/5">
              <div className="h-6 w-40 bg-slate-200 rounded mb-6" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-28 bg-[#006655]/5 rounded-lg border border-[#006655]/10"
                  />
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl border border-[#006655]/5 space-y-3">
              <div className="h-6 w-36 bg-slate-200 rounded mb-4" />
              <div className="h-4 w-full bg-slate-100 rounded" />
              <div className="h-4 w-11/12 bg-slate-100 rounded" />
              <div className="h-4 w-4/5 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
