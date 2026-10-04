export const candidates = Object.freeze([
  Object.freeze({
    id: "lifted",
    label: "Lifted state",
    behaviorSignature: "comfortable-toggle-compact",
    behaviorPassed: true,
    capabilities: Object.freeze({ noNewDependency: true, distantConsumers: true, crossRoute: false, asyncCoordination: false, eventHistory: false }),
    costs: Object.freeze({ conceptual: 1, dependency: 0, coordinationFactor: 1 })
  }),
  Object.freeze({
    id: "context-reducer",
    label: "Context + reducer",
    behaviorSignature: "comfortable-toggle-compact",
    behaviorPassed: true,
    capabilities: Object.freeze({ noNewDependency: true, distantConsumers: true, crossRoute: false, asyncCoordination: false, eventHistory: false }),
    costs: Object.freeze({ conceptual: 2, dependency: 0, coordinationFactor: 0.15 })
  })
]);
