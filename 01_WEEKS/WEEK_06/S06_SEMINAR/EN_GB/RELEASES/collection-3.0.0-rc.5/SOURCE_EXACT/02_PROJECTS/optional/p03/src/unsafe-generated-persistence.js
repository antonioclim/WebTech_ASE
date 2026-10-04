import { DataTypes } from "sequelize";

export function defineUnsafeReservation(sequelize) {
  return sequelize.define("UnsafeReservation", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: DataTypes.STRING,
    guestName: DataTypes.STRING,
    seats: DataTypes.INTEGER,
  });
}

export function unsafeCreateReservation(Reservation, input) {
  try {
    return Reservation.create(input);
  } catch (error) {
    throw new Error(`reservation failed: ${error.message}`);
  }
}
