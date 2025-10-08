'use client';
export default function AdSlot({ id, pack }) {
  const enabled = !!pack?.ads?.enabled && !!pack?.ads?.placements?.[id];
  if (!enabled) return null;
  // Placeholder (drop in GPT/partner tag later)
  return (
    <div data-ad-slot={id} className="border rounded-2xl p-4 my-4 text-sm opacity-80">
      Ad slot: <strong>{id}</strong> (network: {pack?.ads?.network || 'unset'})
    </div>
  );
}
