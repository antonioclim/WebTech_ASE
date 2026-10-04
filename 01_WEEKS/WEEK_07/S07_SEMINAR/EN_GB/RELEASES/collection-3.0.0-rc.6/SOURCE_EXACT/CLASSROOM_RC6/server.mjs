import {runOwned}from './http.mjs';import {handlerFactory}from './lesson-http.mjs';export async function serve(){await runOwned(handlerFactory());}
