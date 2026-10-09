# C03 — Six lenses on one non-assessed fixture

From `01_WEEKS/WEEK_03/C03_COURSE/EN_GB`, run the course capability check, then:

```sh
node DEMONSTRATIONS/six-lens-route.mjs
```

The defined claims are c-2/approved/8, c-1/approved/3 and c-3/not-approved/20. c-2 has an actual nested supplier in York and inherits priority from an ordinary defaults object. These synthetic data are separate from S03’s assessed tasks/events and its leaf language.

Predict each row below before running. The output is an actual local observation only after you execute the command; the table is an explanation of expected results.

| Lens | Operation | Expected witness and cause |
| --- | --- | --- |
| Value | Inspect number fields and coercion expressions | Boolean("false") is true; 0+"3" is "03". Calculation does not validate the original field. |
| Property | Read priority and compare ownership | Priority lookup finds normal while hasOwn is false. Own amount and inherited priority have different provenance. |
| Identity | Copy container/top record/changed supplier path | New array shares its record; shallow copy shares supplier; changed-path update leaves York in source and has Leeds in the updated supplier. |
| Function | Method, detached call and configured minimum | Method/call return c-2; bare module call produces captured TypeError. Minimum 3 and minimum 10 retain distinct configuration for amount 8. |
| Shape | Select, project, order and summarise | Selected c-2/c-1; ordered c-1/c-2; total 11. Entire input totals 31 and an empty reduction totals 0. |
| Effect | Compare source before/after and identities | Source content and order remain unchanged; views are new records; ordered is a new array retaining view records. |

The source validates the numeric fixture fields used by this demonstration and the minimum configuration. It is not a universal validator or the S03 whole-task boundary. Sorting by amount ascending here does not replace S03 P01’s estimate-descending/ASCII-ID order. The canonical 04 task fixture totals 6 and S03 P01 totals 8; a different population explains the different result.

To challenge an identity claim, make a disposable copy outside the collection and change only the sharing/copy operation. To challenge the total, change only a selected amount and trace the supplying population. Keep an actual before observation. A correct total, an unchanged source and fresh records are separate claims. No complete assessed S03 implementation is included.

The neutral [reading bridge](reading-bridge.mjs) reactivates function-as-value, parameter, call, return, array and record access before the six lenses. Predict the three logged values, then run `node DEMONSTRATIONS/reading-bridge.mjs` from the same C03 EN_GB CWD. It returns a trimmed label while preserving the supplied note text; it imports no assessed target.
