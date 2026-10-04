(function(){'use strict';
 const engine=window.C10Models,select=document.getElementById('scenario'),prediction=document.getElementById('prediction'),run=document.getElementById('run'),exportButton=document.getElementById('export'),clear=document.getElementById('clear'),result=document.getElementById('result'),status=document.getElementById('lab-status'),limit=document.getElementById('model-limit');
 let last=null;
 engine.list().forEach(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=s.id+' — '+s.title;select.appendChild(o);});
 function invalidate(message){last=null;exportButton.disabled=true;result.textContent='No model result. Record a prediction before running.';status.textContent=message;}
 function update(){const m=engine.summary(select.value);limit.textContent=m.limit+' Basis: '+m.source;}
 select.addEventListener('change',()=>{prediction.value='';invalidate('Scenario changed; previous result cleared.');update();});
 prediction.addEventListener('input',()=>invalidate('Prediction edited; run again before exporting.'));
 run.addEventListener('click',()=>{
  const text=prediction.value.trim();if(!text){status.textContent='Write a prediction first. No model was run.';prediction.focus();return;}
  if(text.length>4000){status.textContent='Prediction exceeds 4,000 characters. Shorten it before running.';last=null;exportButton.disabled=true;return;}
  try{const outcome=engine.run(select.value);last={prediction:text,outcome};result.textContent=JSON.stringify(outcome,null,2);exportButton.disabled=false;status.textContent='Model executed locally. This is not an actual application observation.';}
  catch(e){invalidate('Model error; no result exported. '+String(e.message||e));}
 });
 clear.addEventListener('click',()=>{prediction.value='';invalidate('Prediction and result cleared. No history was stored.');});
 exportButton.addEventListener('click',()=>{
  if(!last){status.textContent='Run a model after a prediction before requesting export.';return;}
  try{
   const text='C10 — SYNTHETIC MODEL OUTPUT, NOT STUDENT OR APPLICATION EVIDENCE\n\nPrediction: '+last.prediction+'\n\n'+JSON.stringify(last.outcome,null,2)+'\n\nNo React, Redux Toolkit, Immer or browser qualification is established.\n';
   const blob=new Blob([text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='C10_'+last.outcome.scenario+'_MODEL_ONLY.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Download requested. Verify the actual file yourself; no saved-file claim is made.';
  }catch(e){status.textContent='Export request failed: '+String(e.message||e);}
 });
 update();invalidate('No data is loaded or automatically saved.');window.C10Lab=Object.freeze({hasResult:()=>last!==null});
})();
