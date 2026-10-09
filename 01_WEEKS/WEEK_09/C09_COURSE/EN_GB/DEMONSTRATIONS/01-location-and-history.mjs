import assert from 'node:assert/strict';
import { URL } from 'node:url';
import { assessCourseEnvironment } from '../tools/activity-environment.mjs';
const environment = await assessCourseEnvironment({unit:'C09',operation:'location and history model',cwd:process.cwd(),command:'node DEMONSTRATIONS/01-location-and-history.mjs',usesUrl:true,usesStructuredClone:true});
console.log(JSON.stringify(environment)); if(environment.exitCode) process.exit(environment.exitCode);
// This reads a library URL and manipulates supplied history arrays. It is not a route classifier.
const url = new URL('https://library.example.invalid/books/b-7?view=loans#summary');
const owners = {pathname:url.pathname,shareableChoice:url.searchParams.get('view'),fragment:url.hash,draft:'  new shelf label  ',confirmed:{id:'b-7',label:'Stored shelf'}};
assert.equal(owners.pathname,'/books/b-7'); assert.equal(owners.shareableChoice,'loans'); assert.equal(owners.fragment,'#summary');
const initial = {entries:['/books','/books/new'],cursor:1};
const pushed = structuredClone(initial); pushed.entries.splice(pushed.cursor+1); pushed.entries.push('/books/b-7'); pushed.cursor++;
const replaced = structuredClone(initial); replaced.entries[replaced.cursor]='/books/b-7';
const rows = [{operation:'push',entries:pushed.entries,cursor:pushed.cursor,back:pushed.entries[pushed.cursor-1]},{operation:'replace',entries:replaced.entries,cursor:replaced.cursor,back:replaced.entries[replaced.cursor-1]}];
assert.equal(rows[0].back,'/books/new'); assert.equal(rows[1].back,'/books');
const directStart={entries:['/books/new'],cursor:0}; directStart.entries[0]='/books/b-7';
assert.equal(directStart.entries[directStart.cursor-1],undefined);
console.log(JSON.stringify({status:'PASS_FINITE_MODEL',scope:'URL_FIELDS_AND_SUPPLIED_HISTORY_ARRAYS',owners,initial,rows,directStart:{...directStart,back:null},routeMatchingExecuted:false,nativeHistoryExecuted:false,confirmationRequests:0,limit:'The retained predecessor determines Back. A direct single-entry start has no supplied predecessor; neither model executes browser history or confirms a write.'},null,2));
