

'use client';

import React, { useState } from 'react';
import LofiPlayer from '@/app/components/LofiPlayer';
import SavedLinks from '@/app/components/SavedLinks';

export default function Home() {
  const [currentVideoId, setCurrentVideoId] = useState('E2vONfzoyRI');

  return (
    <main className="min-h-screen bg-[#07070c] p-4 md:p-8 flex flex-col items-center">
      <h1 className="text-zinc-600 font-mono text-xs mb-8">LOFI.SPACE_OS v1.0</h1>
      
      {/* The Player */}
      <LofiPlayer videoId={currentVideoId} />
      
      {/* The Library */}
      <SavedLinks onSelectVideo={setCurrentVideoId} />
    </main>
  );
}