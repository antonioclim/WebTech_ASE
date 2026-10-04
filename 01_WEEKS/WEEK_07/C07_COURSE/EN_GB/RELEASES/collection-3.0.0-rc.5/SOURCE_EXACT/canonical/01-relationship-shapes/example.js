import assert from "node:assert/strict";
import { DataTypes, Sequelize } from "sequelize";

const sequelize = new Sequelize({ dialect: "sqlite", storage: ":memory:", logging: false });
const Conference = sequelize.define("Conference", { title: { type: DataTypes.STRING, allowNull: false } }, { timestamps: false });
const Session = sequelize.define("Session", { title: { type: DataTypes.STRING, allowNull: false } }, { timestamps: false });
const Attendee = sequelize.define("Attendee", { name: { type: DataTypes.STRING, allowNull: false } }, { timestamps: false });
const Registration = sequelize.define("Registration", {
  ticketType: { type: DataTypes.ENUM("student", "speaker", "standard"), allowNull: false },
}, { timestamps: false, indexes: [{ unique: true, fields: ["sessionId", "attendeeId"] }] });

Conference.hasMany(Session, { as: "sessions", foreignKey: { name: "conferenceId", allowNull: false } });
Session.belongsTo(Conference, { as: "conference", foreignKey: "conferenceId" });
Session.belongsToMany(Attendee, { through: Registration, as: "attendees", foreignKey: "sessionId", otherKey: "attendeeId" });
Attendee.belongsToMany(Session, { through: Registration, as: "sessions", foreignKey: "attendeeId", otherKey: "sessionId" });

await sequelize.sync({ force: true });
const conference = await Conference.create({ title: "Web Week" });
const session = await Session.create({ title: "HTTP", conferenceId: conference.id });
const attendee = await Attendee.create({ name: "Ana" });
await Registration.create({ sessionId: session.id, attendeeId: attendee.id, ticketType: "student" });

const graph = await Conference.findByPk(conference.id, {
  include: [{ model: Session, as: "sessions", include: [{ model: Attendee, as: "attendees", through: { attributes: ["ticketType"] } }] }],
});
assert.equal(graph.sessions[0].conferenceId, conference.id);
assert.equal(graph.sessions[0].attendees[0].Registration.ticketType, "student");
await assert.rejects(Registration.create({ sessionId: session.id, attendeeId: attendee.id, ticketType: "speaker" }), { name: "SequelizeUniqueConstraintError" });
await sequelize.close();
console.log(JSON.stringify(graph, null, 2));
