#!/usr/bin/env node
// Integrity checks only. This program does not execute learner or course code.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const VERSION = '4.0.0';
const LATEST_PUBLISHED_VERSION = '3.0.0';
const PROGRESS = 'metadata/CANDIDATE_PROGRESS.json';
const PREPARED_TRANCHE = 2;
const GATES = ['local_integrity','reference_runtime','headless_browser','native_windows','native_macos','manual_browser','word','moodle_live','human_pilot','owner_acceptance'];
const requiredIDs = week => week === 1 ? ['P01','P02'] : week === 14 ? ['P01','P03'] : ['P01','P02','P03'];
const MANIFEST = 'metadata/current-integrity/REPOSITORY_SHA256SUMS.txt';
const PACKAGE_ID = 'metadata/current-integrity/REPOSITORY_PACKAGE_ID.txt';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const safe = name => {
  if (typeof name !== 'string' || !name || name.startsWith('/') || name.includes('\\')) throw Error('unsafe-path');
  for (const part of name.split('/')) {
    if (['', '.', '..'].includes(part) || /[\x00-\x1f\x7f<>:"|?*]/.test(part) || /[ .]$/.test(part) || /^(CON|PRN|AUX|NUL|COM[1-9¹²³]|LPT[1-9¹²³])(?:\.|$)/i.test(part)) throw Error('unsafe-path');
  }
  return name;
};
try {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length && args[0] !== '--allow-student-edits')) throw Error('unsupported-argument');
  const edited = args.length === 1;
  if (fs.lstatSync(root).isSymbolicLink()) throw Error('symlink-root');
  const read = name => {
    const item = path.join(root, safe(name));
    let parent = root;
    for (const part of name.split('/')) { parent=path.join(parent,part); if (fs.lstatSync(parent).isSymbolicLink()) throw Error('symlink'); }
    if (!fs.lstatSync(item).isFile()) throw Error('non-regular-file');
    return fs.readFileSync(item);
  };
  const bytes = read(MANIFEST);
  if (read(PACKAGE_ID).toString('utf8') !== hash(bytes) + '\n') throw Error('package-id-mismatch');
  const rows = new Map();
  const text = bytes.toString('utf8');
  if (!text.endsWith('\n')) throw Error('manifest-format');
  for (const line of text.slice(0,-1).split('\n')) {
    const match = /^([0-9a-f]{64})  (.+)$/.exec(line);
    if (!match) throw Error('manifest-format');
    const name = safe(match[2]);
    if (rows.has(name) || [MANIFEST,PACKAGE_ID].includes(name)) throw Error('manifest-duplicate-or-cycle');
    rows.set(name,match[1]);
  }
  const metadataBytes = read('metadata/CLASSROOM_COLLECTION.json');
  if (hash(metadataBytes) !== rows.get('metadata/CLASSROOM_COLLECTION.json')) throw Error('metadata-mismatch');
  const meta = JSON.parse(metadataBytes);
  if (meta.schema !== 'webtech-classroom-collection/v1' || meta.distribution_version !== VERSION || meta.final_target_version !== VERSION || meta.latest_published_version !== LATEST_PUBLISHED_VERSION || meta.distribution_status !== 'LOCAL_CANDIDATE_NOT_PUBLISHED' || meta.candidate_progress !== PROGRESS || meta.qualificationVerdict !== 'NOT_FINAL' || meta.native_acceptance !== false || meta.publication_qualified !== false || meta.published !== false) throw Error('metadata-scope');
  if(meta.status!==`CANDIDATE_V4_0_0_T${String(PREPARED_TRANCHE).padStart(2,'0')}_PREPARED_NOT_FINAL_NOT_PUBLISHED`)throw Error('metadata-prepared-tranche');
  const objectIDs=['SETUP_WINDOWS','SETUP_MACOS_LINUX',...Array.from({length:14},(_,n)=>['C'+String(n+1).padStart(2,'0'),'S'+String(n+1).padStart(2,'0')]).flat()];
  if(!Array.isArray(meta.objects)||meta.objects.length!==30||new Set(meta.objects.map(obj=>obj.object_id)).size!==30||meta.objects.some(obj=>!objectIDs.includes(obj.object_id)))throw Error('metadata-current-objects');
  for(const obj of meta.objects){const tranche=obj.object_id.startsWith('SETUP_')?1:Math.ceil(Number(obj.object_id.slice(1))/2),expected=tranche<=PREPARED_TRANCHE?`T${String(tranche).padStart(2,'0')}_COMPLETE_WITH_EXPLICIT_LIMITS`:'INHERITED_SOURCE_PENDING_LATER_TRANCHE_REVIEW';if(obj.candidate_revision_status!==expected)throw Error('metadata-object-prepared-tranche:'+obj.object_id);}
  if (!meta.qualificationGates || Object.keys(meta.qualificationGates).length !== GATES.length || GATES.some(gate=>meta.qualificationGates[gate]!=='pending')) throw Error('metadata-global-gates');
  const progressBytes=read(PROGRESS);
  if(hash(progressBytes)!==rows.get(PROGRESS))throw Error('candidate-progress-mismatch');
  const progress=JSON.parse(progressBytes);
  if(progress.schema!=='webtech-candidate-progress/v1'||progress.candidate_version!==VERSION||progress.final_target_version!==VERSION||progress.latest_published_version!==LATEST_PUBLISHED_VERSION||progress.distribution_status!=='LOCAL_CANDIDATE_NOT_PUBLISHED'||progress.qualificationVerdict!=='NOT_FINAL'||progress.native_acceptance!==false||progress.publication_qualified!==false||progress.published!==false||progress.phase!==`T${String(PREPARED_TRANCHE).padStart(2,'0')}_CANDIDATE_PREPARED`||progress.next_phase!==`T${String(PREPARED_TRANCHE+1).padStart(2,'0')}`||JSON.stringify(progress.prepared_tranches)!==JSON.stringify(Array.from({length:PREPARED_TRANCHE},(_,n)=>`T${String(n+1).padStart(2,'0')}`))||!progress.qualificationGates||Object.keys(progress.qualificationGates).length!==GATES.length||GATES.some(gate=>progress.qualificationGates[gate]!=='pending'))throw Error('candidate-progress-scope');
  if(!Array.isArray(progress.tranches)||progress.tranches.length!==7)throw Error('candidate-tranches');
  for(let i=1;i<=7;i++){
    const tranche=progress.tranches[i-1],units=[`C${String(i*2-1).padStart(2,'0')}`,`S${String(i*2-1).padStart(2,'0')}`,`C${String(i*2).padStart(2,'0')}`,`S${String(i*2).padStart(2,'0')}`];
    if(tranche.id!==`T${String(i).padStart(2,'0')}`||JSON.stringify(tranche.units)!==JSON.stringify(units)||tranche.acceptance_status!=='PENDING'||tranche.implementation_status!==(i<=PREPARED_TRANCHE?'COMPLETE_WITH_EXPLICIT_LIMITS':'PENDING'))throw Error('candidate-tranche-scope');
  }
  const courseBytes=read('metadata/course-map.json');
  if(hash(courseBytes)!==rows.get('metadata/course-map.json'))throw Error('course-map-mismatch');
  const course=JSON.parse(courseBytes);
  if(course.schema!=='webtech-classroom-course-map/v1'||course.distribution_version!==VERSION||course.final_target_version!==VERSION||course.latest_published_version!==LATEST_PUBLISHED_VERSION||course.distribution_status!=='LOCAL_CANDIDATE_NOT_PUBLISHED'||course.candidate_progress!==PROGRESS||course.qualification!=='NOT_FINAL'||course.native_acceptance!==false||course.publication_qualified!==false||course.published!==false||course.required_project_count!==40||!Array.isArray(course.weeks)||course.weeks.length!==14||new Set(course.weeks.map(week=>week.week)).size!==14)throw Error('course-map-scope');
  for(const week of course.weeks){
    if(!Number.isInteger(week.week)||week.week<1||week.week>14)throw Error('course-week');
    const number=String(week.week).padStart(2,'0'),sid='S'+number,ids=requiredIDs(week.week);
    const tranche=Math.ceil(week.week/2),expectedRevision=tranche<=PREPARED_TRANCHE?`T${String(tranche).padStart(2,'0')}_COMPLETE_WITH_EXPLICIT_LIMITS`:'PENDING_LATER_TRANCHE_REVIEW';
    if(week.candidate_revision_status!==expectedRevision)throw Error('course-map-prepared-tranche:'+sid);
    if(week.course_id!=='C'+number||week.seminar_id!==sid||week.individual_in_class!==true||!Array.isArray(week.required_projects)||JSON.stringify(week.required_projects.map(project=>project.id))!==JSON.stringify(ids))throw Error('exact-required-project-ids:'+sid);
    const selected=meta.objects?.find(obj=>obj.object_id===sid);
    if(!selected||selected.included_in_collection_version!==VERSION||!Array.isArray(selected.projects)||JSON.stringify(selected.projects.map(project=>project.id))!==JSON.stringify(ids))throw Error('exact-collection-project-ids:'+sid);
    if(JSON.stringify(week.required_projects.map(project=>[project.id,project.title,project.editable_file]))!==JSON.stringify(selected.projects.map(project=>[project.id,project.title,project.editable_path])))throw Error('project-contract-difference:'+sid);
  }
  if (!Array.isArray(meta.editable_files) || meta.editable_files.length !== 38 || new Set(meta.editable_files).size !== 38 || !Array.isArray(meta.generated_directories)) throw Error('metadata-edit-policy');
  const allowed = new Set(meta.editable_files.map(safe));
  if ([...allowed].some(name => !rows.has(name) || !/^01_WEEKS\/WEEK_([0-9]{2})\/S\1_SEMINAR\/EN_GB\/CLASSROOM_RC6\/(targets|student)\/.+\.(mjs|js|json|css)$/.test(name))) throw Error('metadata-edit-policy');
  const generated = new Set(meta.generated_directories.map(safe));
  const actual = new Set();
  const nodes = new Map();
  let visited = 0;
  const walk = (directory, prefix='') => {
    for (const entry of fs.readdirSync(directory,{withFileTypes:true})) {
      const name = safe(prefix + entry.name);
      const item = path.join(directory,entry.name);
      const stat = fs.lstatSync(item);
      if (stat.isSymbolicLink()) throw Error('symlink');
      const key = name.normalize('NFC').toLowerCase();
      if (nodes.has(key) && nodes.get(key)!==name) throw Error('case-or-unicode-collision');
      nodes.set(key,name);
      if (name === '.git') continue;
      if (++visited > 20000) throw Error('inventory-limit');
      if (stat.isDirectory()) {
        if (edited && generated.has(name)) continue;
        walk(item,name+'/');
      } else if (stat.isFile()) actual.add(name);
      else throw Error('non-regular-entry');
    }
  };
  walk(root);
  const expected = new Set([...rows.keys(),MANIFEST,PACKAGE_ID]);
  if (actual.size !== expected.size || [...actual].some(name=>!expected.has(name))) throw Error('inventory-mismatch');
  const changed=[];
  for (const [name, digest] of rows) {
    if (hash(read(name)) !== digest) {
      if (!edited || !allowed.has(name)) throw Error('protected-byte-mismatch:'+name);
      changed.push(name);
    }
  }
  console.log(JSON.stringify({schema:'webtech-classroom-local-integrity/v1',status:edited?'PASS_PROTECTED_FILES_ONLY':'PASS_INITIAL_BYTES_ONLY',distribution_version:VERSION,distribution_status:'LOCAL_CANDIDATE_NOT_PUBLISHED',files:actual.size,repository_package_id:hash(bytes),observedNode:process.version,allowedStudentChanges:changed,generatedDirectoriesExcluded:edited?[...generated]:[],requiredProjectIDsChecked:true,studentProjectsQualified:false,qualificationVerdict:'NOT_FINAL',native_acceptance:false,publication_qualified:false,published:false,actionsStarted:false},null,2));
} catch (error) {
  console.error('STOP_COLLECTION_INTEGRITY: '+error.message);
  process.exitCode=2;
}
