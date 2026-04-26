import { db } from "@/lib/db";
import { logs, media } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { StarRating } from "@/components/ui/star-rating";
import { Heart } from "lucide-react";

export async function RecentActivity() {
  const activities = await db.query.logs.findMany({
    with: {
      media: true,
    },
    orderBy: [desc(logs.createdAt)],
    limit: 6,
  });

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-2 w-12 bg-primary rounded-full" />
        <h2 className="text-3xl font-black text-white tracking-tight uppercase">Recent Activity</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activities.map((log) => (
          <div 
            key={log.id}
            className="glass-card glass-card-hover p-5 flex gap-6"
          >
            <div className="relative h-28 w-20 overflow-hidden rounded-2xl border border-white/10 shadow-xl flex-shrink-0 group-hover:scale-105 transition-transform">
              <img src={log.media.posterUrl!} alt={log.media.title} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col gap-2 py-1 justify-center flex-1">
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-white transition-colors line-clamp-1">{log.media.title}</h3>
                <span className="text-xs font-medium text-white/40 uppercase tracking-widest">{log.media.type} • {log.media.releaseYear}</span>
              </div>
              <div className="flex items-center justify-between">
                <StarRating value={log.media.rating || 0} size="sm" />
                {/* Liked status is not in new logs schema, using media rating as proxy or just showing if rating > 4 */}
                {(log.media.rating || 0) >= 4 && (
                  <Heart className="h-4 w-4 fill-primary text-primary drop-shadow-[0_0_8px_rgba(24,86,255,0.4)]" />
                )}
              </div>
              {log.notes && (
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl mt-1">
                  <p className="text-[10px] text-white/50 line-clamp-2 italic font-medium leading-relaxed">
                    "{log.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
