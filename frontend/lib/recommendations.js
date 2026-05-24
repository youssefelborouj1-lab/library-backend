import { query } from './db';
import { tokenize } from './search';

export async function generateRecommendations(userId) {
  const borrowedBooks = await query(
    `SELECT b.* FROM borrows br
     JOIN books b ON b.id = br.book_id
     WHERE br.user_id = ?
     ORDER BY br.borrowed_at DESC LIMIT 20`,
    [userId]
  );

  if (borrowedBooks.length === 0) {
    const popular = await query(
      `SELECT b.*, c.name as category_name,
        (SELECT COUNT(*) FROM copies cp WHERE cp.book_id = b.id AND cp.status = 'available') as available_copies
       FROM books b
       LEFT JOIN categories c ON c.id = b.category_id
       ORDER BY b.borrow_count DESC LIMIT 10`
    );
    return popular;
  }

  const categoryIds = [...new Set(borrowedBooks.map(b => b.category_id).filter(Boolean))];
  const borrowedIds = borrowedBooks.map(b => b.id);

  const keywords = new Set();
  for (const book of borrowedBooks.slice(0, 5)) {
    for (const token of tokenize(book.title)) keywords.add(token);
    for (const token of tokenize(book.description || '')) keywords.add(token);
  }

  const candidates = await query(
    `SELECT b.*, c.name as category_name,
      (SELECT COUNT(*) FROM copies cp WHERE cp.book_id = b.id AND cp.status = 'available') as available_copies
     FROM books b
     LEFT JOIN categories c ON c.id = b.category_id
     WHERE b.id NOT IN (${borrowedIds.length ? borrowedIds.join(',') : 0})
     ORDER BY b.borrow_count DESC LIMIT 50`
  );

  const scored = candidates.map(book => {
    let score = 0;
    if (categoryIds.includes(book.category_id)) score += 5;
    score += Math.min(book.borrow_count / 10, 3);
    const bookTokens = tokenize(book.title + ' ' + (book.description || ''));
    for (const kw of keywords) {
      if (bookTokens.includes(kw)) score += 1;
    }
    return { ...book, rec_score: score };
  });

  return scored
    .filter(b => b.rec_score > 0)
    .sort((a, b) => b.rec_score - a.rec_score)
    .slice(0, 10);
}
