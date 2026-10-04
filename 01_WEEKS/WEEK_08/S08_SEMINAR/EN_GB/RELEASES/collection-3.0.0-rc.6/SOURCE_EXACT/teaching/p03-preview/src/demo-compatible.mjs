/** Teaching-only adapter: accepts omitted options.signal from preserved weak code.
 * Cooperative transport demo, NOT a stale-settlement proof or lifecycle solution.
 */
const topics = [{id:'1',title:'React state'},{id:'2',title:'Effect cleanup'},{id:'3',title:'HTTP status'}];
export function demoSearchCompatible(query, options = {}) {
  const signal = options.signal;
  return new Promise((resolve, reject) => {
    let timer;
    const detach = () => signal?.removeEventListener('abort', abort);
    const abort = () => { clearTimeout(timer); detach(); reject(new DOMException('Aborted','AbortError')); };
    if (signal?.aborted) { abort(); return; }
    timer = setTimeout(() => {
      detach();
      if (query === 'fail') { reject(new Error('Fabricated preview diagnostic')); return; }
      resolve(topics.filter(topic=>topic.title.toLowerCase().includes(query.toLowerCase())));
    }, 200);
    signal?.addEventListener('abort', abort, {once:true});
  });
}
