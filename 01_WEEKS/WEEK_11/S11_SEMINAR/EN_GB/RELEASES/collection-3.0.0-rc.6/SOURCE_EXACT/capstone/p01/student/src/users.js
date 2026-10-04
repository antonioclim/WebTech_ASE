const records = [Object.freeze({ id: "u1", email: "ada@example.test", displayName: "Ada", role: "member", password: Object.freeze({ salt: "user-salt-01", hash: "f6yvtLWAB9wPzh1y1tzZOonQNqWS6IoLn9Z4GmjYiMc=", keyLength: 32 }) })];

export function createUserRepository() {
  return {
    async findByEmail(email) { return records.find((user) => user.email === email) ?? null; },
    async findById(id) { return records.find((user) => user.id === id) ?? null; },
    toPublic(user) { return Object.freeze({ id: user.id, email: user.email, displayName: user.displayName }); }
  };
}
