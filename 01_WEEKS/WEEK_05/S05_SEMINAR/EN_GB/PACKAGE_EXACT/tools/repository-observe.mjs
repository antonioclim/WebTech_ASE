/* Calls the unchanged repository, not the assessed router. No Express or socket. */
import {createTaskRepository} from '../projects/p01/src/task-repository.js';
const a=createTaskRepository(),b=createTaskRepository();const before=await a.list();await a.create({title:'S05 synthetic repository witness',completed:false});const changed=await a.list(),fresh=await b.list();
console.log(JSON.stringify({evidenceClass:'MODULE_MODEL',before,changedInstance:changed,independentFreshInstance:fresh,limitation:'Fresh repository objects only; not an HTTP exchange, server restart or router validation test'},null,2));
