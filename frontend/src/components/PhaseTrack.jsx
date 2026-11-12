import { STAGES, stageIndex } from '../lib/phases';
import { formatDate } from '../lib/format';
import Icon from './Icon';

const THEMES = {
  light: {
    bar: { active: 'bg-lime', done: 'bg-brand', todo: 'bg-line' },
    label: { active: 'text-brand-ink', done: 'text-brand', todo: 'text-muted' },
    note: 'text-muted',
  },
  dark: {
    bar: { active: 'bg-lime', done: 'bg-white/60', todo: 'bg-white/15' },
    label: { active: 'text-white', done: 'text-white/80', todo: 'text-white/50' },
    note: 'text-white/50',
  },
};

export default function PhaseTrack({ cycle, compact = false, theme = 'light' }) {
  const current = stageIndex(cycle?.phase);
  const colors = THEMES[theme];

  return (
    <ol className="grid grid-cols-3 gap-x-2" aria-label="Cycle progress">
      {STAGES.map((stage, i) => {
        const finished = cycle?.phase === 'results';
        const state = current === i && !finished ? 'active' : current > i || finished ? 'done' : 'todo';
        const date = formatDate(cycle?.[stage.dateField]);

        return (
          <li key={stage.key} aria-current={state === 'active' ? 'step' : undefined}>
            <div className={`h-2 rounded-full ${colors.bar[state]}`} />
            <div className={`mt-2 flex items-center gap-1.5 font-semibold ${compact ? 'text-xs' : 'text-xs sm:text-sm'} ${colors.label[state]}`}>
              {state === 'done' && <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.5} />}
              {stage.label}
            </div>
            {!compact && (
              <p className={`hidden text-xs sm:block ${colors.note}`}>
                {state === 'active' ? 'Open now' : date ? `Opened ${date}` : state === 'done' ? 'Done' : 'Upcoming'}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
