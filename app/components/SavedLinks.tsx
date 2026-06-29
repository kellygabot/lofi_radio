'use client';

import React, { useState, useEffect } from 'react';

export default function SavedLinks({ onSelectVideo }: { onSelectVideo: (id: string) => void }) {
  const [links, setLinks] = useState<string[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('my-lofi-links');
    if (saved) setLinks(JSON.parse(saved));
  }, []);

  const addLink = () => {
    const regExp = /^.*(youtu\.be\/|v\/|watch\?v=)([^#\&\?]*).*/;
    const match = input.match(regExp);
    const id = match ? match[2] : null;

    if (id && !links.includes(id)) {
      const updated = [id, ...links];
      setLinks(updated);
      localStorage.setItem('my-lofi-links', JSON.stringify(updated));
      setInput('');
    }
  };

  return (
    <div className="w-full max-w-4xl mt-8">
      <div className="flex gap-2 mb-4">
        <input 
          className="flex-1 bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-sm text-white"
          placeholder="Paste YouTube URL"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={addLink} className="bg-purple-600 px-6 py-2 rounded-lg text-white font-bold text-sm">SAVE</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {links.map((id) => (
          <button key={id} onClick={() => onSelectVideo(id)} className="relative aspect-video rounded-lg overflow-hidden border border-zinc-800">
            <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 hover:bg-transparent transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}