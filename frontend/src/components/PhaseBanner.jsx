
export default function PhaseBanner({ phase, expected, label }) {
  const msg =
    !phase || phase === 'closed'
      ? 'There is no active awards cycle at the moment. Check back soon.'
      : `${label} are not open right now. Current phase: ${phase}.`;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
      <p className="text-amber-800 text-sm font-medium">{msg}</p>
    </div>
  );
}