# S07 assessment criteria — adopted candidate rubric

The six groups below total 10 points and have three levels each: maximum, intermediate and zero. They evaluate distinct qualities. Do not add historical rubric scores or count one technical result twice. Full P01/P03 implementation is optional. The P03-informed ADR itself is required, with one point reserved in mechanism.

|Group|Maximum|Intermediate|Zero|What is assessed|
|---|---:|---:|---:|---|
|G1 Experiment and technical result|3|1.5|0|P02 success, both required rollback failures and same-instance recovery|
|G2 Reproducible evidence|2|1|0|Prior prediction chronology, fixture/environment identity, commands/states/classes and five-operation trace provenance|
|G3 Explanation of mechanism|2|1|0|One point P02 invariant/boundary/settlement/error interpretation and one point required ADR reasoning|
|G4 Critical Gemini audit|1.5|0.75|0|Actual bounded claim, independent check, justified verdict/correction and claim-specific limit|
|G5 Limitations and reflection|1|0.5|0|Scope of sequential/concurrency/durability/external claims and own uncertainty/next check|
|G6 Completeness and format|0.5|0.25|0|Readable required sections in one correctly named PDF, privacy and truthful declaration|

## Distinct evidence atoms within the group ceilings

|Group|Atom|Maximum contribution|
|---|---|---:|
|G1|P02 successful state and response|1|
|G1|Both controlled failures preserve the required state|1.5|
|G1|Independent successful recovery on the same instance|0.5|
|G2|Two preserved predictions and their prior order|0.25|
|G2|Fixture, request and measured environment identity|0.5|
|G2|Reproducible commands, before/after and evidence classes|0.75|
|G2|Five-operation identity trace with provenance|0.5|
|G3|Invariant, managed boundary and outer settlement explanation|0.75|
|G3|Error precedence and class-origin distinction|0.25|
|G3|ADR context, identity, alternatives and justified decision|0.5|
|G3|ADR transaction scope, eight repeat rows and consequences|0.5|
|G4|Actual sanitised prompt and bounded claim|0.25|
|G4|Small independent check|0.5|
|G4|Justified verdict and correction|0.5|
|G4|Limit of the particular claim/check|0.25|
|G5|Sequential/concurrency/durability/external scope|0.5|
|G5|Own reflection, uncertainty and next check|0.5|
|G6|Readable required sections in one PDF|0.25|
|G6|Filename, privacy and truthful declaration|0.25|

There are 19 evidence atoms, not 19 additional criteria. The group level reflects the corresponding descriptor and ceiling. A reasoned rejection of an actual generated claim can receive full Gemini credit. No actual/generated agreement bonus exists. Synthetic practice is not automatically actual Gemini or genuine database evidence.
