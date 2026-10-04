export const scenarios = Object.freeze([
  Object.freeze({ id: "single-screen", label: "One screen, nearby consumers", requiredCapabilities: Object.freeze(["noNewDependency"]), coordinationPressure: 0 }),
  Object.freeze({ id: "distant-consumers", label: "Distant stable consumers", requiredCapabilities: Object.freeze(["noNewDependency", "distantConsumers"]), coordinationPressure: 3 }),
  Object.freeze({ id: "central-async", label: "Cross-route async with event history", requiredCapabilities: Object.freeze(["crossRoute", "asyncCoordination", "eventHistory"]), coordinationPressure: 4 })
]);
