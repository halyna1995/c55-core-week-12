// database.js
// Your task: implement each function below using better-sqlite3.
// The function signatures are identical to storage.js so you can
// compare the two files side by side.
//
// When every function works correctly, `node app.js` should
// print exactly the same output as it did with storage.js.

import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_FILE = join(__dirname, "../data/flashcards.db");

const db = new Database(DB_FILE);

// ----------------------------------------------------------------
// Decks
// ----------------------------------------------------------------

export function getAllDecks() {
  return db
    .prepare(
      `
    SELECT id, name, description
    FROM decks
    ORDER BY id
  `,
    )
    .all();
}

export function getDeckById(id) {
  const deck = db
    .prepare(
      `
    SELECT id, name, description
    FROM decks
    WHERE id = ?
  `,
    )
    .get(id);

  return deck || null;
}

export function addDeck(name, description) {
  const info = db
    .prepare(
      `
    INSERT INTO decks (name, description)
    VALUES (?, ?)
  `,
    )
    .run(name, description);

  return {
    id: Number(info.lastInsertRowid),
    name,
    description,
  };
}

export function deleteDeck(deckId) {
  const info = db
    .prepare(
      `
    DELETE FROM decks
    WHERE id = ?
  `,
    )
    .run(deckId);

  return info.changes > 0;
}

// ----------------------------------------------------------------
// Cards
// ----------------------------------------------------------------

export function getAllCardsForDeck(deckId) {
  const rows = db
    .prepare(
      `
    SELECT id, question, answer, learned, deck_id AS deckId
    FROM cards
    WHERE deck_id = ?
    ORDER BY id
  `,
    )
    .all(deckId);

  return rows.map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    learned: Boolean(row.learned),
    deckId: row.deckId,
  }));
}

export function addCard(question, answer, deckId) {
  const info = db
    .prepare(
      `
    INSERT INTO cards (question, answer, learned, deck_id)
    VALUES (?, ?, 0, ?)
  `,
    )
    .run(question, answer, deckId);

  return {
    id: Number(info.lastInsertRowid),
    question,
    answer,
    learned: false,
    deckId,
  };
}

export function markCardLearned(cardId) {
  const info = db
    .prepare(
      `
    UPDATE cards
    SET learned = 1
    WHERE id = ?
  `,
    )
    .run(cardId);

  if (info.changes === 0) {
    return null;
  }

  const row = db
    .prepare(
      `
    SELECT id, question, answer, learned, deck_id AS deckId
    FROM cards
    WHERE id = ?
  `,
    )
    .get(cardId);

  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    learned: Boolean(row.learned),
    deckId: row.deckId,
  };
}

export function deleteCard(cardId) {
  const info = db
    .prepare(
      `
    DELETE FROM cards
    WHERE id = ?
  `,
    )
    .run(cardId);

  return info.changes > 0;
}
