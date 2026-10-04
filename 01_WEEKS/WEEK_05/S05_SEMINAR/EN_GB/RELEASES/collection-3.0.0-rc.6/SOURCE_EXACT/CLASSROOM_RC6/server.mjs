import {runOwned}from './http.mjs';import {handler}from './lesson-http.mjs';export async function serve(){await runOwned(handler);}
