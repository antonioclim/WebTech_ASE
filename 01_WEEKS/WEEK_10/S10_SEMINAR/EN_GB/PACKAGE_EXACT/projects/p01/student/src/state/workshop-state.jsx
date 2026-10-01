import React from "react";

const unavailableState = Object.freeze({ track: "all", savedIds: Object.freeze([]) });
const unavailableDispatch = () => {};

export function workshopReducer() {
  throw new Error("Workshop shared-state reducer not implemented");
}

export function WorkshopProvider({ children }) {
  // Keep the supplied UI runnable while the shared provider contract is built.
  return <>{children}</>;
}

export function useWorkshopState() {
  return unavailableState;
}

export function useWorkshopDispatch() {
  return unavailableDispatch;
}
