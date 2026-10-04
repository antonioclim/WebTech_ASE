import assert from "node:assert/strict";
import test from "node:test";
import {
  defineUnsafeReservation,
  unsafeCreateReservation,
} from "../src/unsafe-generated-persistence.js";
import { withUnsafeDatabase } from "./helpers.js";

test("unsafe evidence reproducibly has weak metadata and raw async rejection", async () => {
  await withUnsafeDatabase(async (sequelize) => {
    const Unsafe = defineUnsafeReservation(sequelize);
    await sequelize.sync({ force: true });
    const attributes = Unsafe.getAttributes();
    assert.notEqual(attributes.code.allowNull, false);
    assert.equal(attributes.code.unique, undefined);
    assert.equal(attributes.seats.validate, undefined);
    const weak = await unsafeCreateReservation(Unsafe, { code: null, guestName: "", seats: 0 });
    assert.equal(weak.seats, 0);

    const rejection = unsafeCreateReservation(Unsafe, { id: weak.id, code: "DUP", guestName: "x", seats: 1 });
    assert.equal(rejection instanceof Promise, true);
    await assert.rejects(rejection, { name: "SequelizeUniqueConstraintError" });
  });
});
