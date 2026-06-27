import LofiPlayer from '@/app/components/LofiPlayer';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#07070c] p-4 selection:bg-purple-500 selection:text-white">
      <LofiPlayer />
    </main>
  );
}