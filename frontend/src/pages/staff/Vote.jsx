
import { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useCycle } from '../../hooks/useCycle';
import { useNominations } from '../../hooks/useNominations';
import { useVotes } from '../../hooks/useVotes';
import { useToast } from '../../components/Toast';
import { PageSkeleton } from '../../components/Skeleton';
import PhaseBanner from '../../components/PhaseBanner';
import Card from '../../components/Card';
import api from '../../api/axios';

export default function Vote() {
  const { user }                 = useAuth();
  const { cycle, loading }       = useCycle();
  const { nominations }          = useNominations(cycle?.id);
  const { myVotes, updateLocal } = useVotes(cycle?.id);
  const { toast }                = useToast();
  const [busy, setBusy]          = useState({});

  if (loading) return <PageSkeleton />;
  if (!cycle || cycle.phase !== 'voting') {
    return <PhaseBanner phase={cycle?.phase} expected="voting" label="Voting" />;
  }

  async function castVote(categoryId, nominationId) {
    setBusy(b => ({ ...b, [categoryId]: true }));
    try {
      await api.post(`/cycles/${cycle.id}/votes`, {
        category_id:   categoryId,
        nomination_id: nominationId,
      });
      updateLocal(categoryId, nominationId);
      toast.success('Vote recorded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Vote failed.');
    } finally {
      setBusy(b => ({ ...b, [categoryId]: false }));
    }
  }

  const byCategory = cycle.categories?.map(cat => ({
    ...cat,
    nominees: nominations.filter(n => n.category_id === cat.id),
  })) || [];

  const votedCount = myVotes.length;
  const total      = byCategory.length;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-[#7F622C] mb-1">Cast Your Vote</h2>
      <p className="text-gray-500 text-sm mb-4">{cycle.title} — one vote per category</p>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 mb-6 flex items-center gap-4">
        <div className="flex-1 bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-[#CBD300] h-2.5 rounded-full transition-all duration-500"
            style={{ width: total ? `${(votedCount / total) * 100}%` : '0%' }}
          />
        </div>
        <p className="text-xs text-gray-600 font-medium shrink-0">
          {votedCount}/{total} voted
        </p>
      </div>

      <div className="space-y-5">
        {byCategory.map(cat => {
          const myVote = myVotes.find(v => v.category_id === cat.id);
          const isBusy = busy[cat.id];

          return (
            <Card key={cat.id}>
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-bold text-gray-800">{cat.name}</h4>
                {myVote && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                    ✓ Voted
                  </span>
                )}
              </div>
              {cat.criteria && <p className="text-xs text-gray-400 mb-3">{cat.criteria}</p>}

              {cat.nominees.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No nominations in this category.</p>
              ) : (
                <div className="space-y-2">
                  {cat.nominees.map(n => {
                    const selected = myVote?.nomination_id === n.id;
                    const isMe     = n.nominee_id === user.id;

                    return (
                      <button
                        key={n.id}
                        disabled={isBusy || isMe}
                        onClick={() => castVote(cat.id, n.id)}
                        title={isMe ? 'You cannot vote for yourself' : ''}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                          selected
                            ? 'bg-[#7F622C] text-white border-[#7F622C]'
                            : isMe
                            ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#CBD300] hover:bg-[#CBD300]/5'
                        } disabled:opacity-60`}
                      >
                        <span className="font-semibold">{n.nominee?.name}</span>
                        {n.nominee?.department && (
                          <span className={`ml-2 text-xs ${selected ? 'text-[#CBD300]' : 'text-gray-400'}`}>
                            {n.nominee.department}
                          </span>
                        )}
                        {isMe && <span className="ml-2 text-xs italic">(you)</span>}
                        {selected && <span className="float-right">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}