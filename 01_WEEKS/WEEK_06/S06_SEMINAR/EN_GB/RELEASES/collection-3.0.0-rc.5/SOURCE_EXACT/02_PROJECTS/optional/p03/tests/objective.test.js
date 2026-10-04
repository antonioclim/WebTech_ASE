import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  createReservation,
  PersistenceConflictError,
  PersistenceValidationError,
} from "../src/persistence-repair.js";
import { postJson, withApi, withDatabase } from "./helpers.js";

test("model metadata, normalization, ranges, and detached success are correct", async () => {
  await withDatabase(async ({ Reservation }) => {
    const attributes = Reservation.getAttributes();
    assert.equal(attributes.code.allowNull, false);
    assert.equal(attributes.code.unique, true);
    assert.equal(attributes.guestName.allowNull, false);
    assert.equal(attributes.seats.allowNull, false);
    assert.equal(attributes.seats.validate.min, 1);
    assert.equal(attributes.seats.validate.max, 8);

    const created = await createReservation(Reservation, {
      code: "  ABC-1  ", guestName: "  Ada  ", seats: 2,
    });
    assert.equal(created.code, "ABC-1");
    assert.equal(created.guestName, "Ada");
    assert.equal(typeof created.get, "undefined");
    assert.equal((await Reservation.findByPk(created.id)).code, "ABC-1");
  });
});

test("invalid and duplicate writes map exact custom errors and insert nothing", async () => {
  await withDatabase(async ({ Reservation }) => {
    const invalidInputs = [
      { code: null, guestName: "Ada", seats: 1 },
      { code: "bad", guestName: "Ada", seats: 1 },
      { code: "GOOD-1", guestName: " ", seats: 1 },
      { code: "GOOD-2", guestName: "Ada", seats: 0 },
      { code: "GOOD-3", guestName: "Ada", seats: 9 },
      { code: "GOOD-4", guestName: "Ada", seats: 1.5 },
    ];
    for (const input of invalidInputs) {
      await assert.rejects(createReservation(Reservation, input), (error) => {
        assert.equal(error instanceof PersistenceValidationError, true);
        assert.equal(error.code, "reservation_invalid");
        return true;
      });
    }
    assert.equal(await Reservation.count(), 0);

    await createReservation(Reservation, { code: "DUP-1", guestName: "Ada", seats: 1 });
    await assert.rejects(
      createReservation(Reservation, { code: "DUP-1", guestName: "Grace", seats: 2 }),
      (error) => {
        assert.equal(error instanceof PersistenceConflictError, true);
        assert.equal(error.code, "reservation_exists");
        return true;
      },
    );
    assert.equal(await Reservation.count(), 1);
  });
});

test("unexpected failures preserve identity", async () => {
  const sentinel = new Error("driver disconnected");
  const Reservation = { create: async () => { throw sentinel; } };
  await assert.rejects(createReservation(Reservation, {}), (error) => error === sentinel);
});

test("HTTP waits for persistence and maps validation/conflict safely", async () => {
  await withDatabase(async (database) => {
    await withApi(database, async (baseUrl) => {
      const created = await fetch(`${baseUrl}/api/reservations`, postJson({ code: "LIVE-1", guestName: " Linus ", seats: 2 }));
      assert.equal(created.status, 201);
      assert.equal(created.headers.get("location"), "/api/reservations/1");
      const list = await fetch(`${baseUrl}/api/reservations`);
      assert.equal((await list.json()).data.length, 1);

      const invalid = await fetch(`${baseUrl}/api/reservations`, postJson({ code: "x", guestName: "", seats: 0 }));
      assert.equal(invalid.status, 400);
      assert.equal((await invalid.json()).error.code, "reservation_invalid");
      const duplicate = await fetch(`${baseUrl}/api/reservations`, postJson({ code: "LIVE-1", guestName: "Grace", seats: 1 }));
      assert.equal(duplicate.status, 409);
      assert.equal((await duplicate.json()).error.code, "reservation_exists");
    });
  });
});

test("unsafe evidence stays separate from repaired module", async () => {
  const unsafe = await readFile(new URL("../src/unsafe-generated-persistence.js", import.meta.url), "utf8");
  const repaired = await readFile(new URL("../src/persistence-repair.js", import.meta.url), "utf8");
  assert.match(unsafe, /return Reservation\.create\(input\)/);
  assert.match(repaired, /await Reservation\.create\(input\)/);
  assert.doesNotMatch(unsafe, /PersistenceValidationError|PersistenceConflictError/);
});
