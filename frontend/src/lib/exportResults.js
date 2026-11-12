export async function exportResults(cycle, results) {
  const XLSX = await import('xlsx');
  const book = XLSX.utils.book_new();

  const summary = results.map(category => {
    const winners = category.nominees.filter(n => n.is_winner);

    return {
      Category: category.category_name,
      Winner: winners.map(w => w.nominee_name).join(' & ') || 'No votes',
      Department: winners.map(w => w.department || '-').join(' & ') || '-',
      'Winning votes': winners[0]?.vote_count ?? 0,
      'Winning %': winners[0]?.percentage ?? 0,
      'Total votes': category.total_votes,
      Tie: category.is_tie ? 'Yes' : 'No',
    };
  });

  const summarySheet = XLSX.utils.json_to_sheet(summary);
  summarySheet['!cols'] = [32, 30, 24, 14, 12, 12, 6].map(wch => ({ wch }));
  XLSX.utils.book_append_sheet(book, summarySheet, 'Summary');

  const detail = results.flatMap(category => [
    ...category.nominees.map((n, i) => ({
      Category: category.category_name,
      Rank: i + 1,
      Nominee: n.nominee_name,
      Department: n.department || '-',
      Votes: n.vote_count,
      '%': n.percentage,
      Winner: n.is_winner ? 'Yes' : 'No',
    })),
    {},
  ]);

  const detailSheet = XLSX.utils.json_to_sheet(detail);
  detailSheet['!cols'] = [32, 6, 26, 22, 8, 8, 8].map(wch => ({ wch }));
  XLSX.utils.book_append_sheet(book, detailSheet, 'Full breakdown');

  const fileName = cycle.title.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '').toLowerCase();
  XLSX.writeFile(book, `${fileName || 'cycle'}_results.xlsx`);
}
