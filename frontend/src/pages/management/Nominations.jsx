import { useCycle } from '../../hooks/useCycle';
import { useNominations } from '../../hooks/useNominations';
import { useToast } from '../../components/Toast';
import { PageSkeleton } from '../../components/Skeleton';
import api from '../../api/axios';

export default function ManageNominations() {
  const { cycle, loading }       = useCycle();
  const { nominations, refetch } = useNominations(cycle?.id);
  const { toast }                = useToast();

  if (loading) return <PageSkeleton />;

  if (!cycle) return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-semibold text-[#7F622C] uppercase tracking-widest mb-1">Administration</p>
        <h2 className="text-2xl font-bold text-gray-900">Nominations</h2>
      </div>
      <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
        <p className="text-3xl mb-3">📋</p>
        <p className="text-sm font-semibold text-gray-400">No active cycle</p>
        <p className="text-xs text-gray-300 mt-1">Open a cycle from the Cycles page to start receiving nominations.</p>
      </div>
    </div>
  );

  async function remove(id) {
    if (!confirm('Remove this nomination? This cannot be undone.')) return;
    try {
      await api.delete(`/nominations/${id}`);
      toast.success('Nomination removed.');
      refetch();
    } catch {
      toast.error('Failed to remove nomination.');
    }
  }

  const byCategory = cycle.categories?.map(cat => ({
    ...cat,
    nominees: nominations.filter(n => n.category_id === cat.id),
  })) || [];

  return (
    <div className="max-w-5xl mx-auto">

      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#7F622C] uppercase tracking-widest mb-1">Administration</p>
          <h2 className="text-2xl font-bold text-gray-900">Nominations</h2>
          <p className="text-gray-400 text-sm mt-1">{cycle.title}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-gray-900">{nominations.length}</p>
          <p className="text-xs text-gray-400">total nominations</p>
        </div>
      </div>

      {byCategory.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-300">No categories in this cycle.</p>
        </div>
      )}

      <div className="space-y-5">
        {byCategory.map(cat => (
          <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h4 className="font-bold text-gray-900">{cat.name}</h4>
              <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
                {cat.nominees.length} nominee{cat.nominees.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="px-6 py-4">
              {cat.nominees.length === 0 ? (
                <p className="text-xs text-gray-300 italic py-2">No nominations yet.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {cat.nominees.map(n => (
                    <div key={n.id} className="py-3.5 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#7F622C]/10 text-[#7F622C] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {(n.nominee?.name || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{n.nominee?.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {n.nominee?.department}
                            {n.nominator?.name && (
                              <> · Nominated by <span className="font-medium text-gray-500">{n.nominator.name}</span></>
                            )}
                          </p>
                          {n.reason && (
                            <p className="text-xs text-gray-400 mt-1.5 italic line-clamp-2">
                              "{n.reason}"
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => remove(n.id)}
                        className="shrink-0 text-xs font-medium text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 hover:bg-red-50 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}