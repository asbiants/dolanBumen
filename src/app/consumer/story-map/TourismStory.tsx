import React from "react";

export default function TourismStory({ story }: { story: any }) {
  return (
    <div>
      <div className="w-full aspect-video overflow-hidden mb-6 bg-gray-100 flex items-center justify-center">
        {story.image ? (
          <img src={story.image} alt={story.heading} className="object-cover w-full h-full" />
        ) : (
          <span className="text-gray-400">No Image</span>
        )}
      </div>
      <div className="uppercase text-gray-400 font-bold mb-2 tracking-wide">{story.title}</div>
      <h1 className="text-3xl font-bold mb-4 leading-tight">{story.heading}</h1>
      <p className="mb-4 text-gray-700 text-base leading-relaxed">{story.description}</p>
    </div>
  );
} 