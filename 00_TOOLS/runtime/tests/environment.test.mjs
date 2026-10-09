import test from 'node:test';
import assert from 'node:assert/strict';
import {parseVersion,compareVersions,decideEnvironment} from '../environment.mjs';
import {verifyCarriers} from '../verify-carriers.mjs';
// Injected strings exercise policy; they do not qualify another actual runtime.
test('numeric versions and unqualified drift cannot silently become reference qualification',()=>{
 assert.equal(compareVersions('11.9.0','11.19.0'),-1);
 assert.equal(parseVersion('v24.21.0-rc.1').prerelease,'rc.1');
 for(const bad of [null,'','v24.21','24.021.0','24.21.0junk'])assert.equal(parseVersion(bad),null);
 const absentNpm=decideEnvironment({nodeVersion:'v24.19.0',usesNpm:false});
 assert.equal(absentNpm.exitCode,0);assert.equal(absentNpm.versionPolicy.npm.status,'NOT_REQUIRED');
 assert.equal(decideEnvironment({nodeVersion:'v24.21.0',npmVersion:'11.17.0',usesNpm:true}).status,'ENV_WARN');
 assert.equal(decideEnvironment({nodeVersion:'v25.0.0'}).status,'ENV_WARN');
 assert.equal(decideEnvironment({nodeVersion:'v24.21.0',checks:[{status:'ENV_BLOCKED',feature:'sqlite'}]}).exitCode,2);
});
test('standalone policy carriers must remain byte-identical',()=>assert.equal(verifyCarriers(),5));
