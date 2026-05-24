const STOP_WORDS = new Set([
  'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'ou', 'en',
  'à', 'au', 'aux', 'par', 'pour', 'sur', 'dans', 'avec', 'que', 'qui',
  'est', 'sont', 'a', 'ont', 'the', 'of', 'in', 'to', 'and', 'for',
  'an', 'is', 'it', 'at', 'be', 'as', 'was', 'we', 'our', 'their',
  'ce', 'cet', 'cette', 'ces', 'mon', 'ton', 'son', 'ma', 'ta', 'sa',
  'il', 'elle', 'ils', 'elles', 'on', 'nous', 'vous', 'je', 'tu',
  'se', 'si', 'ne', 'pas', 'plus', 'très', 'bien', 'mais', 'car',
]);

export function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

export function scoreBook(book, queryTokens, categoryId = null) {
  let score = 0;
  const titleTokens = tokenize(book.title);
  const descTokens = tokenize(book.description || '');
  const authorTokens = tokenize(book.author || '');

  for (const qt of queryTokens) {
    for (const tt of titleTokens) {
      if (tt === qt) { score += 5; break; }
      if (tt.includes(qt) || qt.includes(tt)) { score += 3; break; }
    }
    for (const dt of descTokens) {
      if (dt === qt) { score += 3; break; }
      if (dt.includes(qt) || qt.includes(dt)) { score += 1; break; }
    }
    for (const at of authorTokens) {
      if (at === qt) { score += 4; break; }
      if (at.includes(qt) || qt.includes(at)) { score += 2; break; }
    }
  }

  if (categoryId && book.category_id === categoryId) {
    score += 2;
  }

  score += Math.min(book.borrow_count / 10, 5);

  return score;
}

export function searchBooks(books, rawQuery) {
  const queryTokens = tokenize(rawQuery);
  if (queryTokens.length === 0) return books;

  const categoryId = books.find(b => tokenize(b.category_name || '').some(t => queryTokens.includes(t)))?.category_id || null;

  const scored = books.map(book => ({
    ...book,
    score: scoreBook(book, queryTokens, categoryId),
  }));

  return scored
    .filter(b => b.score > 0)
    .sort((a, b) => b.score - a.score);
}
