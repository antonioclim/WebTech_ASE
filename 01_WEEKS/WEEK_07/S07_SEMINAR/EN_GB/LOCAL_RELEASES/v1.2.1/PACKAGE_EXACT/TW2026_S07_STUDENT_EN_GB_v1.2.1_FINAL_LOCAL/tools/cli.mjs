/** New local S07 CLI. No project is imported by help, verify, boundary, preflight or synthetic. */
import {fileURLToPath} from 'node:url';
import {realpath} from 'node:fs/promises';
import {ROOT,boundary,verifyPackage} from './integrity.mjs';
import {preflight} from './environment.mjs';
import {syntheticDemonstration} from './synthetic.mjs';
import {loadNative,serve,observeP02,canonicalTests} from './worker.mjs';
export const HELP=`S07 Transactional Booking v1.2.1 CANDIDATE
Run from this kit root. No command installs dependencies.
  node tools/cli.mjs help
  node tools/cli.mjs verify                     clean extraction only
  node tools/cli.mjs boundary p02               only P02 learner target may change
  node tools/cli.mjs preflight p02              versions, byte boundary and local metadata
  node tools/cli.mjs synthetic                  newly authored SYNTHETIC_PRACTICE only
Separately prepared genuine environment and exact runtime required:
  node tools/cli.mjs native p02 --allow-native-load
  node tools/cli.mjs observe p02 --allow-memory-database
  node tools/cli.mjs test p02 --allow-memory-database
  node tools/cli.mjs serve p02 --allow-memory-database [--port INTEGER]
Use the READY actual loopback URL. Ctrl+C requests owned HTTP then database closure.
Fresh volatile data every start. No automatic POST retry and no supplied GET booking member.
P01/P03 are optional; use their project IDs for preflight, boundary, native, test or serve.
The required P03-informed ADR does not require full P03 implementation.
Current production has not run the canonical code, tests, native driver or real browser.
`;
export async function isEntrypoint(argvPath,moduleUrl=import.meta.url){if(!argvPath)return false;try{return await realpath(argvPath)===await realpath(fileURLToPath(moduleUrl));}catch{return false;}}
export async function main(args=process.argv.slice(2)){const [command='help',id='p02',...flags]=args;const output=value=>console.log(JSON.stringify(value,null,2));if(command==='help'){if(args.length>1)throw Error('help takes no arguments');console.log(HELP);return;}if(['verify','synthetic'].includes(command)){if(args.length>1)throw Error(command+' takes no arguments');output(command==='verify'?await verifyPackage(ROOT):await syntheticDemonstration());return;}if(!['boundary','preflight','native','observe','test','serve'].includes(command))throw Error('Unknown command; use help');const allowed=command==='native'?['--allow-native-load']:command==='serve'?['--allow-memory-database','--port']:['observe','test'].includes(command)?['--allow-memory-database']:[];let port=0;const seen=new Set();for(let index=0;index<flags.length;index++){const flag=flags[index];if(!allowed.includes(flag)||seen.has(flag))throw Error('Unknown or duplicate flag: '+flag);seen.add(flag);if(flag==='--port'){const value=flags[++index];if(!/^\d+$/.test(value??'')||Number(value)>65535)throw Error('Invalid --port');port=Number(value);}}if(command==='boundary'){output(await boundary(id));return;}if(command==='preflight'){output(await preflight(id));return;}if(command==='native'){if(!seen.has('--allow-native-load'))throw Error('Native module load requires --allow-native-load');output(await loadNative(id));return;}const options={allowMemory:seen.has('--allow-memory-database'),port};if(command==='observe'){if(id!=='p02')throw Error('observe supports P02 only');output(await observeP02(options));return;}if(command==='test'){output(await canonicalTests(id,options));return;}const owned=await serve(id,options);output({status:'READY',project:id,origin:owned.origin,evidenceClass:'LOCAL_HTTP',database:'FRESH_VOLATILE_MEMORY_EACH_START',stop:'Ctrl+C requests owned closure; STOPPED confirms adapter closure',qualification:'LISTENER_START_ONLY_NOT_APPLICATION_COMPLETION'});let stopping=false;const shutdown=async()=>{if(stopping)return;stopping=true;const timeout=setTimeout(()=>{console.error(JSON.stringify({status:'CLOSE_TIMEOUT',cleanup:'UNKNOWN',scope:'OWNED_RESOURCES_ONLY'}));process.exit(1);},5000);try{const cleanup=await owned.close();clearTimeout(timeout);output({status:'STOPPED',cleanup});}catch(error){clearTimeout(timeout);console.error(JSON.stringify({status:'CLOSE_FAILED',cleanup:'NOT_CONFIRMED',message:error.message}));process.exitCode=1;}};process.once('SIGINT',shutdown);process.once('SIGTERM',shutdown);}
if(await isEntrypoint(process.argv[1]))main().catch(error=>{console.error(JSON.stringify({status:'BLOCKED_OR_FAILED',message:error.message,canonicalExecutionClaim:'NONE_ON_GUARD_FAILURE'}));process.exitCode=1;});
