import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const canonical=readFileSync(resolve(root,'00_TOOLS/runtime/environment.mjs'));
export const carriers=[
 '01_WEEKS/WEEK_01/S01_SEMINAR/EN_GB/CLASSROOM_RC6/environment.mjs',
 '01_WEEKS/WEEK_02/S02_SEMINAR/EN_GB/CLASSROOM_RC6/environment.mjs',
 '01_WEEKS/WEEK_01/C01_COURSE/EN_GB/tools/environment.mjs',
 '00_SETUP/MACOS_LINUX/EN_GB/02_PREFLIGHT/environment.mjs',
 '00_SETUP/WINDOWS/EN_GB/02_PREFLIGHT/environment.mjs',
 '01_WEEKS/WEEK_03/S03_SEMINAR/EN_GB/CLASSROOM_RC6/environment.mjs',
 '01_WEEKS/WEEK_04/S04_SEMINAR/EN_GB/CLASSROOM_RC6/environment.mjs',
 '01_WEEKS/WEEK_03/C03_COURSE/EN_GB/tools/environment.mjs',
 '01_WEEKS/WEEK_04/C04_COURSE/EN_GB/tools/environment.mjs',
 '01_WEEKS/WEEK_05/S05_SEMINAR/EN_GB/CLASSROOM_RC6/environment.mjs',
 '01_WEEKS/WEEK_05/C05_COURSE/EN_GB/tools/environment.mjs',
 '01_WEEKS/WEEK_06/S06_SEMINAR/EN_GB/CLASSROOM_RC6/environment.mjs',
 '01_WEEKS/WEEK_06/C06_COURSE/EN_GB/tools/environment.mjs',
 '01_WEEKS/WEEK_07/S07_SEMINAR/EN_GB/CLASSROOM_RC6/environment.mjs',
 '01_WEEKS/WEEK_07/C07_COURSE/EN_GB/tools/environment.mjs',
 '01_WEEKS/WEEK_08/S08_SEMINAR/EN_GB/CLASSROOM_RC6/environment.mjs',
 '01_WEEKS/WEEK_08/C08_COURSE/EN_GB/tools/environment.mjs'
];
export function verifyCarriers(){for(const path of carriers)if(!readFileSync(resolve(root,path)).equals(canonical))throw Error('ENVIRONMENT_CARRIER_DRIFT '+path);return carriers.length;}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify({status:'PASS_ENVIRONMENT_CARRIERS',copies:verifyCarriers()}));}catch(error){console.error(error.message);process.exitCode=1;}}
