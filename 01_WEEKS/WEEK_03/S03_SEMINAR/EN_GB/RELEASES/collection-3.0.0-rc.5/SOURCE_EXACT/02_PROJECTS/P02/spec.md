# Rule Engine — optional advanced route

Derived public contract v1.2.0, based on canonical U02. No teacher implementation is included.

## Scope and edit boundary

This optional 45–60-minute source project is separate from the S03 core and required P03 portfolio. Edit only student/src/rule-engine.js. No additional S03 marks depend on completion. Preserve compileRule and evaluateRecords. Do not use eval, new Function, dependencies or dynamic code generation.

## Rule contract

compileRule returns a reusable predicate. A leaf has own field, operator and value fields; supported operators are equals, atLeast and includes. equals uses strict equality, atLeast compares numeric actual/expected values without coercion and includes requires an array-valued record field. A leaf only reads its configured field when that field is an own record property. Composite forms are all: nonempty array, any: nonempty array or not: one rule, with short-circuit semantics.

## Validation and evaluation

Reject an invalid/ambiguous definition, empty all/any, missing leaf fields or unsupported operator during compilation using descriptive TypeErrors. Compile child predicates once. evaluateRecords returns matchedIds and rejectedIds in source order without mutating the definition or records. The source defines ordinary rule/record shapes and a bounded educational test set; do not claim exhaustive validation for all JavaScript objects.

## Commands and test contract

From the kit root: node 02_PROJECTS/tools/gate.mjs P02 initial; node 02_PROJECTS/tools/run-cli.mjs P02; after the permitted edit, node 02_PROJECTS/tools/gate.mjs P02 complete. Initial baseline: 1 pass, objective: 1 pass and 3 assertion failures, regression: 3 pass. Completed suite: 8 pass. Do not reuse the P01 or P03 failure counts.

