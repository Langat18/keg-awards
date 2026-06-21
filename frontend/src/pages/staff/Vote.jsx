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
  const [searches, setSearches]  = useState({});

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

  function setSearch(catId, value) {
    setSearches(s => ({ ...s, [catId]: value }));
  }

  const byCategory = cycle.categories?.map(cat => ({
    ...cat,
    nominees: nominations.filter(n => n.category_id === cat.id),
  })) || [];

  const votedCount = myVotes.length;
  const total      = byCategory.length;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-[#7F622C] mb-1">Cast Your Vote</h2>
      <p className="text-gray-500 text-sm mb-4">{cycle.title} — one vote per category</p>

     
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
          const myVote  = myVotes.find(v => v.category_id === cat.id);
          const isBusy  = busy[cat.id];
          const query   = (searches[cat.id] || '').toLowerCase();

          const filtered = cat.nominees.filter(n => {
            if (!query) return true;
            return (
              n.nominee?.name.toLowerCase().includes(query) ||
              (n.nominee?.department || '').toLowerCase().includes(query)
            );
          });

          const votedNominee = myVote
            ? cat.nominees.find(n => n.id === myVote.nomination_id)
            : null;
          const toShow = votedNominee && !filtered.includes(votedNominee)
            ? [votedNominee, ...filtered]
            : filtered;

          return (
            <Card key={cat.id}>
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-bold text-gray-800">{cat.name}</h4>
                {myVote && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold shrink-0 ml-2">
                    ✓ Voted
                  </span>
                )}
              </div>
              {cat.criteria && <p className="text-xs text-gray-400 mb-3">{cat.criteria}</p>}

              {cat.nominees.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No nominations in this category.</p>
              ) : (
                <>
                  {cat.nominees.length > 5 && (
                    <div className="relative mb-3">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                      </svg>
                      <input
                        type="text"
                        value={searches[cat.id] || ''}
                        onChange={e => setSearch(cat.id, e.target.value)}
                        placeholder={`Search ${cat.nominees.length} nominees…`}
                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#7F622C] focus:ring-1 focus:ring-[#7F622C]/20 bg-gray-50"
                      />
                      {searches[cat.id] && (
                        <button
                          type="button"
                          onClick={() => setSearch(cat.id, '')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    {toShow.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-3">No nominees match your search.</p>
                    ) : (
                      toShow.map(n => {
                        const selected = myVote?.nomination_id === n.id;
                        const isMe     = n.nominee_id === user.id;

                        return (
                          <button
                            key={n.id}
                            disabled={isBusy}
                            onClick={() => castVote(cat.id, n.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all disabled:opacity-60 ${
                              selected
                                ? 'bg-[#7F622C] text-white border-[#7F622C]'
                                : isMe
                                ? 'bg-[#CBD300]/5 text-gray-700 border-[#CBD300]/40 hover:border-[#CBD300] hover:bg-[#CBD300]/10'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#CBD300] hover:bg-[#CBD300]/5'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                selected ? 'bg-white/20 text-white' : 'bg-[#7F622C]/10 text-[#7F622C]'
                              }`}>
                                {(n.nominee?.name || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-semibold block truncate">
                                  {n.nominee?.name}
                                  {isMe && (
                                    <span className={`ml-1.5 text-xs font-medium italic ${selected ? 'text-[#CBD300]' : 'text-[#7F622C]'}`}>
                                      (you)
                                    </span>
                                  )}
                                </span>
                                {n.nominee?.department && (
                                  <span className={`text-xs ${selected ? 'text-[#CBD300]' : 'text-gray-400'}`}>
                                    {n.nominee.department}
                                  </span>
                                )}
                              </div>
                              {selected && (
                                <svg className="w-4 h-4 text-[#CBD300] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {query && (
                    <p className="text-[10px] text-gray-400 mt-2 text-right">
                      {filtered.length} of {cat.nominees.length} nominees
                    </p>
                  )}
                </>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}