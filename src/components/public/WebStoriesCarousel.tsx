import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  ChevronRight,
  ChevronLeft,
  Eye,
  Play,
  Flame,
} from 'lucide-react';
import { WebStory } from '../../types';
import { WebStoryService } from '../../services/WebStoryService';
import { WebStoryPlayerModal } from './WebStoryPlayerModal';

export const WebStoriesCarousel: React.FC = () => {
  const [stories, setStories] = useState<WebStory[]>(() =>
    WebStoryService.getPublishedStories()
  );
  const [activeStory, setActiveStory] = useState<WebStory | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setStories(WebStoryService.getPublishedStories());
    };
    window.addEventListener('infonews:web-stories-updated', handleUpdate);
    return () =>
      window.removeEventListener('infonews:web-stories-updated', handleUpdate);
  }, []);

  if (!stories.length) return null;

  return (
    <>
      <div className="space-y-3.5 my-8">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b-2 border-red-600 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-red-600 text-white font-bold shadow-xs">
              <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '8s' }} />
            </span>
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
              वेब स्टोरीज (Google Web Stories)
            </h3>
            <span className="rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase px-2 py-0.5 hidden sm:inline">
              VISUAL STORIES
            </span>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            टॅप करून फोटो व पॉईंट्समध्ये बातमी पहा &rarr;
          </span>
        </div>

        {/* Horizontal Carousel Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stories.map((story) => (
            <div
              key={story.id}
              onClick={() => setActiveStory(story)}
              className="group relative aspect-9/16 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer ring-3 ring-transparent hover:ring-red-500/80 bg-slate-950"
            >
              {/* Cover Image with Ken-Burns scale on hover */}
              <img
                src={story.coverImage}
                alt={story.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              {/* Top Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                <span className="rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-amber-300 border border-white/20">
                  {story.category}
                </span>

                <span className="flex items-center gap-1 rounded-full bg-red-600/90 text-white px-2 py-0.5 text-[9px] font-black shadow-xs">
                  <Layers className="h-2.5 w-2.5" />
                  <span>{story.slides.length}</span>
                </span>
              </div>

              {/* Center Play Icon on Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="h-12 w-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white ring-4 ring-white/60 shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                  <Play className="h-6 w-6 fill-white ml-0.5" />
                </div>
              </div>

              {/* Bottom Caption */}
              <div className="absolute bottom-3 left-3 right-3 z-10 space-y-1.5">
                <h4 className="text-xs sm:text-sm font-black text-white leading-snug line-clamp-3 font-serif drop-shadow-md group-hover:text-amber-200 transition-colors">
                  {story.title}
                </h4>

                <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1 border-t border-white/20">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3 text-slate-400" />
                    <span>{story.viewsCount.toLocaleString('mr-IN')}</span>
                  </span>

                  <span className="font-bold text-amber-400">
                    पहा &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Story Viewer Modal */}
      {activeStory && (
        <WebStoryPlayerModal
          story={activeStory}
          onClose={() => setActiveStory(null)}
        />
      )}
    </>
  );
};
