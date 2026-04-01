import { readFileSync } from 'fs';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const jsonPath = join(__dirname, 'data', 'data.json');
const dbPath = join(__dirname, 'data', 'flashcards.db');

const raw = readFileSync(jsonPath, 'utf-8');
const data = JSON.parse(raw);

const db = new Database(dbPath);

const clearTables = db.transaction(() => {
  db.prepare('DELETE FROM cards').run();
  db.prepare('DELETE FROM decks').run();
});

const insertData = db.transaction(() => {
  const insertDeck = db.prepare(`
    INSERT INTO decks (id, name, description)
    VALUES (?, ?, ?)
  `);

  const insertCard = db.prepare(`
    INSERT INTO cards (id, question, answer, learned, deck_id)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const deck of data.decks) {
    insertDeck.run(
      deck.id,
      deck.name,
      deck.description ?? null
    );
  }

  for (const card of data.cards) {
    insertCard.run(
      card.id,
      card.question,
      card.answer,
      card.learned ? 1 : 0,
      card.deckId
    );
  }
});

clearTables();
insertData();

console.log('Migration complete.');
console.log(`Decks inserted: ${data.decks.length}`);
console.log(`Cards inserted: ${data.cards.length}`);

db.close();