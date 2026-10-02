import {
  defineUnsafeReservation,
  unsafeCreateReservation,
} from "./unsafe-generated-persistence.js";

export class PersistenceValidationError extends Error {
  constructor() {
    super("Reservation violates persistence constraints");
    this.name = "PersistenceValidationError";
    this.code = "reservation_invalid";
  }
}

export class PersistenceConflictError extends Error {
  constructor() {
    super("Reservation code already exists");
    this.name = "PersistenceConflictError";
    this.code = "reservation_exists";
  }
}

export function defineReservation(sequelize) {
  // TODO: replace the preserved weak model with the constrained Reservation model.
  return defineUnsafeReservation(sequelize);
}

export function createReservation(Reservation, input) {
  // TODO: await creation and map only validation/unique failures at this boundary.
  return unsafeCreateReservation(Reservation, input);
}
