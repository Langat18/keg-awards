
import { useCycle } from '../../hooks/useCycle';
import { useNominations } from '../../hooks/useNominations';
import { useToast } from '../../components/Toast';
import { PageSkeleton } from '../../components/Skeleton';
import Card from '../../components/Card';
import api from '../../api/axios';

export default function ManageNominations() {
  const { cycle, loading }           = useCycle();
  const { nominations, refetch }     = useNominations(cycle?.id);
  const { toast }                    = useToast();

  if (loading) return <PageSkeleton />;
  if (!cycle) return <p className="text-gray-400 text-sm">No active cycle.</p>;

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
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-[#7F622C] mb-1">Nominations</h2>
      <p className="text-gray-500 text-sm mb-6">
        {cycle.title} — {nominations.length} total nomination{nominations.length !== 1 ? 's' : ''}
      </p>

      <div className="space-y-5">
        {byCategory.map(cat => (
          <Card key={cat.id}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-800">{cat.name}</h4>
              <span className="text-xs text-gray-400">
                {cat.nominees.length} nominee{cat.nominees.length !== 1 ? 's' : ''}
              </span>
            </div>

            {cat.nominees.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No nominations yet.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {cat.nominees.map(n => (
                  <div key={n.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{n.nominee?.name}</p>
                      <p className="text-xs text-gray-400">
                        {n.nominee?.department}
                        {n.nominator?.name && <> · Nominated by <strong>{n.nominator.name}</strong></>}
                      </p>
                      {n.reason && (
                        <p className="text-xs text-gray-500 mt-1 italic truncate max-w-sm">
                          "{n.reason}"
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => remove(n.id)}
                      className="shrink-0 text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 rounded px-2 py-1 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}