export const STAGES = [
  { key: 'nominating', label: 'Nominations', dateField: 'nominations_open_at' },
  { key: 'voting', label: 'Voting', dateField: 'voting_open_at' },
  { key: 'results', label: 'Results', dateField: 'results_at' },
];

export const PHASE_LABEL = {
  closed: 'Not open yet',
  nominating: 'Nominations open',
  voting: 'Voting open',
  results: 'Results published',
};

export const PHASE_TONE = {
  closed: 'neutral',
  nominating: 'live',
  voting: 'live',
  results: 'done',
};

export function stageIndex(phase) {
  return STAGES.findIndex(stage => stage.key === phase);
}
