export async function loadSummary(fetchImpl){
 // TODO: start /data/profile.json, /data/tasks.json, /data/notices.json before
 // awaiting any. Check ok, await json, return {name,openTasks,notices}.
 // Reject non-ok with Error('http:<status>'); no serial request waterfall.
 void fetchImpl;return {name:'',openTasks:0,notices:0};
}
