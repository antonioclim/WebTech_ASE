import assert from "node:assert/strict";
import { DataTypes, Sequelize } from "sequelize";

const sequelize = new Sequelize({ dialect: "sqlite", storage: ":memory:", logging: false });
const Session = sequelize.define("Session", { availableSeats: { type: DataTypes.INTEGER, allowNull: false } }, { timestamps: false });
const Booking = sequelize.define("Booking", { seats: { type: DataTypes.INTEGER, allowNull: false } }, { timestamps: false });
const Audit = sequelize.define("Audit", { action: { type: DataTypes.STRING, allowNull: false } }, { timestamps: false });
await sequelize.sync({ force: true });
const session = await Session.create({ availableSeats: 3 });

async function book({ failAudit = false } = {}) {
  return sequelize.transaction(async (transaction) => {
    const current = await Session.findByPk(session.id, { transaction });
    current.availableSeats -= 1;
    await current.save({ transaction });
    const booking = await Booking.create({ seats: 1 }, { transaction });
    if (failAudit) throw new Error("audit unavailable");
    await Audit.create({ action: `booking:${booking.id}:created` }, { transaction });
  });
}
await assert.rejects(book({ failAudit: true }), /audit unavailable/);
assert.equal((await Session.findByPk(session.id)).availableSeats, 3);
assert.equal(await Booking.count(), 0);
assert.equal(await Audit.count(), 0);
await book();
assert.equal((await Session.findByPk(session.id)).availableSeats, 2);
assert.equal(await Booking.count(), 1);
assert.equal(await Audit.count(), 1);
await sequelize.close();
console.log("rollback and commit verified with a managed Sequelize transaction");
