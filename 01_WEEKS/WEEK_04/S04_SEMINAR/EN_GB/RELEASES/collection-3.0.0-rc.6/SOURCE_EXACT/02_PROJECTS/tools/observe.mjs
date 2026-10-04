import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';
const code=process.argv[2];
export async function observe(project,importer=s=>import(s)){
  if(project==='P01'){
    const {loadDashboard}=await importer('../P01_MULTI_SOURCE_DASHBOARD/public/dashboard.js');
    const values={'/data/profile.json':{name:'Ada',team:'Web Lab'},'/data/tasks.json':[{id:'T-1',status:'open'},{id:'T-2',status:'done'},{id:'T-3',status:'open'}],'/data/notices.json':['Review the diff','Run the checks']};
    const called=[],released=[],completed=[],resolvers=[];
    const fetchImpl=path=>{called.push(path);return new Promise(resolve=>resolvers.push(()=>{released.push(path);resolve({ok:true,status:200,json:async()=>{completed.push(path);return structuredClone(values[path])}})}))};
    const rendered=[];const pending=loadDashboard({fetchImpl,render:m=>rendered.push(structuredClone(m))});await Promise.resolve();const before={called:[...called],released:[...released],completed:[...completed]};for(const r of [...resolvers].reverse())r();const result=await pending;return {project,scope:'MODEL_OR_INJECTED',beforeRelease:before,after:{called,released,completed,result,rendered},initiatedBeforeRelease:before.called.length===3,limit:'Injected deferred witness, not a real Network trace or proof of parallel CPU threads.'};
  }
  if(project==='P02'){
    const {bindTaskEvents}=await importer('../P02_INTERACTIVE_TASK_LIST/public/task-view.js');const {FakeElement}=await importer('../P02_INTERACTIVE_TASK_LIST/tests/fakes.js');const form=new FakeElement('form'),list=new FakeElement('ul'),row=new FakeElement('li'),button=new FakeElement('button'),icon=new FakeElement('span'),calls=[];form.elements={title:{value:''}};form.reset=()=>{};row.dataset.taskId='task-7';button.dataset.action='delete';button.append(icon);row.append(button);list.append(row);const cleanup=bindTaskEvents({form,list,onAdd:()=>{},onToggle:id=>calls.push('t:'+id),onDelete:id=>calls.push('d:'+id)});list.emit('click',{target:icon});const beforeCleanup=[...calls];cleanup();list.emit('click',{target:icon});return {project,scope:'MODEL_OR_INJECTED',beforeCleanup,afterCleanup:[...calls],formListeners:form.listeners.size,listListeners:list.listeners.size,limit:'Fake DOM witness, not a real browser event trace.'};
  }
  if(project==='P03'){
    const {fetchWithPolicy}=await importer('../P03_RESILIENT_FETCH_OPTIONAL/public/fetch-policy.js');let calls=0;const delays=[];let result,error;try{result=await fetchWithPolicy('/x',{fetchImpl:async()=>{calls++;if(calls===1)throw Error('offline');return {ok:true,status:200,json:async()=>({ok:true})}},retries:1,sleep:async ms=>delays.push(ms),setTimer:()=>1,clearTimer:()=>{}})}catch(e){error={name:e.name,message:e.message,cause:e.cause?.message}}return {project,scope:'MODEL_OR_INJECTED',calls,delays,result,error,limit:'Injected fetch policy witness, not production-network reliability evidence.'};
  }throw Error('Use P01, P02 or P03.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)try{console.log(JSON.stringify(await observe(code),null,2))}catch(e){console.error(e.message);process.exitCode=1}
