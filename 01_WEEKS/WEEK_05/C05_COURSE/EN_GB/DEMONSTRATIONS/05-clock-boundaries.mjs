// Arithmetic/record reading only. Does not implement terminalLogger.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=JSON.parse(await readFile(new URL('../data/guided.json',import.meta.url),'utf8'));
const record=source.records.find(row=>row.id==='G1');
const {start,commit,finish}=record.inputs;
const historicalCommitDuration=commit-start,firstTerminalDuration=finish-start;
assert.equal(historicalCommitDuration,12);assert.equal(firstTerminalDuration,35);
assert.equal(record.observed.logs[0].durationMs,12);
const events=[{name:'finish',status:201,clock:135},{name:'close',status:499,clock:140}];
const first=events[0];assert.equal(events.length,2);assert.equal(first.status,201);
console.log(JSON.stringify({scope:'ACTUAL_NODE_ARITHMETIC_PLUS_READING_RETAINED_RECORD',retainedRuntime:source.recorded_runtime,retainedClass:source.classification,instants:{start,commit,terminal:finish},historicalCommitDuration,firstTerminalDuration,retainedLog:record.observed.logs[0],suppliedEvents:events,naiveOnePerEventCount:events.length,firstEvent:first,limit:'The retained record is historical module-model text. Arithmetic does not execute its private replay, a logger closure, socket abort or client timing.'},null,2));
