export const ADVANCE = {
  closed: {
    label: 'Open nominations',
    icon: 'play',
    title: 'Open nominations?',
    message: 'Staff will be able to nominate colleagues in every category of this cycle.',
    done: 'Nominations are open.',
  },
  nominating: {
    label: 'Start voting',
    icon: 'ballot',
    title: 'Close nominations and start voting?',
    message: 'No new nominations will be accepted. Staff can then vote for one nominee per category.',
    done: 'Voting is open.',
  },
  voting: {
    label: 'Publish results',
    icon: 'trophy',
    title: 'Close voting and publish results?',
    message: 'Voting ends immediately and the winners become visible to everyone with results access. This cannot be undone.',
    done: 'Results are published.',
  },
};
