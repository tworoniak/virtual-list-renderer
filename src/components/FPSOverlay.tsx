import { useFPS } from '../hooks/useFPS';

export function FPSOverlay() {
  const fps = useFPS();

  const color =
    fps >= 55
      ? 'text-emerald-400'
      : fps >= 30
        ? 'text-yellow-400'
        : 'text-red-400';

  return (
    <div className='fixed bottom-4 right-4 z-50 bg-zinc-950/90 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-xs flex items-center gap-2 backdrop-blur-sm'>
      <span className={`text-lg font-bold tabular-nums ${color}`}>{fps}</span>
      <div className='flex flex-col'>
        <span className='text-zinc-400 leading-none'>FPS</span>
        <span className={`leading-none text-[10px] ${color}`}>
          {fps >= 55 ? 'smooth' : fps >= 30 ? 'ok' : 'janky'}
        </span>
      </div>
    </div>
  );
}
