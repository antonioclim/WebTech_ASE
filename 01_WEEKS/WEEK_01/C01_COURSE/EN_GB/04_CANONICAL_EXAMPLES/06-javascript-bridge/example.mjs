// C01/S01 prerequisite bridge: neutral library-card data, not an assessed target.
import assert from 'node:assert/strict';

function summariseCard(card) {
  // card is the parameter: the caller supplies one input object.
  // Dot notation reads a field. The object literal creates a different object.
  return { label: card.title.trim(), available: card.copies > 0 };
}
const cards = [{ title: '  Maps  ', copies: 2 }, { title: 'Poems', copies: 0 }];
const before = JSON.stringify(cards);
const summaries = cards.map(summariseCard);
assert.deepEqual(summaries, [{ label: 'Maps', available: true }, { label: 'Poems', available: false }]);
assert.equal(JSON.stringify(cards), before, 'reading cards must preserve their content');
assert.notEqual(summaries, cards, 'the result container must be new');
assert.notEqual(summaries[0], cards[0], 'each summary must be a new object');
assert.notEqual(summaries[1], cards[1], 'each summary must be a new object');
console.log(JSON.stringify({ cards, summaries, inputUnchanged: JSON.stringify(cards) === before, freshResults: summaries.every((row, index) => row !== cards[index]) }, null, 2));

// These operations parse text locally. They do not contact this fictional host.
const address = new URL('/catalogue?owner=Ada%20Lovelace#details', 'https://course.example');
assert.equal(address.pathname, '/catalogue');
assert.equal(address.searchParams.get('owner'), 'Ada Lovelace');
console.log(JSON.stringify({ pathname: address.pathname, requestTarget: address.pathname + address.search, decodedOwner: address.searchParams.get('owner'), clientFragment: address.hash }, null, 2));
for (const encoded of ['%20Ada%20', '%20%20', '%XX']) {
  try {
    const decoded = decodeURIComponent(encoded);
    console.log(JSON.stringify({ encoded, decoded, trimmed: decoded.trim() }));
  } catch (error) {
    if (!(error instanceof URIError)) throw error;
    console.log(JSON.stringify({ encoded, decoding: 'invalid percent encoding' }));
  }
}
