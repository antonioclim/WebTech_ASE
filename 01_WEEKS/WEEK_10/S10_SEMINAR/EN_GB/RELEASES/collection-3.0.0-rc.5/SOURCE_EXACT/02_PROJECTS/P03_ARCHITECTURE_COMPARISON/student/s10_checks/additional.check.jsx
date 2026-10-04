// S10 optional comparator extension. These Vitest tests were authored, not executed in production.
import { expect, it } from 'vitest';
import { compareArchitectures } from '../src/decision/compare-architectures.js';
import { candidates } from '../src/decision/evidence.js';
const clone=()=>structuredClone(candidates);
it('S10: equal-cost explicit selection has an equal-cost explanation',()=>{
 const cs=clone();cs[1].costs={...cs[0].costs};
 const r=compareArchitectures({candidates:cs,requirements:{requiredCapabilities:['noNewDependency'],coordinationPressure:0,tieBreak:'candidateId'}});
 expect(r.tie).toBe(true);expect(r.reasons.join(' ')).toMatch(/equal/i);
 expect(r.reasons.join(' ')).not.toMatch(/higher/i);expect(r.reasons.join(' ')).toContain('noNewDependency');
});
it('S10: malformed behaviour flags are rejected without claiming parity',()=>{
 const cs=clone();cs[0].behaviorPassed='false';
 const r=compareArchitectures({candidates:cs,requirements:{requiredCapabilities:[],coordinationPressure:0}});
 expect(r.parity).toBe(false);expect(r.selectedCandidateId).toBe(null);
});
it('S10: missing costs produce a structured refusal rather than a crash',()=>{
 const cs=clone();delete cs[0].costs.conceptual;
 const r=compareArchitectures({candidates:cs,requirements:{requiredCapabilities:[],coordinationPressure:0}});
 expect(r.parity).toBe(false);expect(r.reasons.join(' ')).toMatch(/invalid/i);
});
