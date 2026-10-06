#!/usr/bin/env python3
"""Finite Day 0 source-boundary tests and optional actual local browser checks.

Unittest discovery needs only Python's standard library. The explicit browser
CLI additionally requires a supplied exact Node v24.21.0, existing Playwright
module and Firefox executable. It installs nothing, sends no network requests
and does not exercise a native PDF Save dialogue or Moodle.
"""
from __future__ import annotations

import argparse
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO / '00_TOOLS/publishing'))
import rc10_day0_form

SOURCE = REPO / '00_SETUP/WINDOWS/RELEASES/collection-3.0.0-rc.5/SOURCE_EXACT/11_DAY0_MOODLE/FORMULAR_DAY0_EN_GB.html'


class Controls(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.controls, self.external = [], [], []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if 'id' in attributes:
            self.ids.append(attributes['id'])
        if tag in ('input', 'textarea', 'select'):
            self.controls.append((tag, attributes))
        if (tag == 'script' and 'src' in attributes) or tag in ('iframe', 'img', 'link'):
            self.external.append((tag, attributes))


class Day0SourceBoundary(unittest.TestCase):
    def test_authentication_and_repeat_refusal(self):
        source = SOURCE.read_bytes()
        derivative = rc10_day0_form.derive(source, 'SETUP_WINDOWS')
        for changed in (source + b' ', derivative, source.replace(b'Kit integrity', b'Other activity')):
            with self.assertRaises(ValueError):
                rc10_day0_form.derive(changed, 'SETUP_WINDOWS')
        with self.assertRaises(ValueError):
            rc10_day0_form.derive(source, 'S01')
        with self.assertRaises(TypeError):
            rc10_day0_form.derive(source.decode(), 'SETUP_WINDOWS')

    def test_unfilled_self_contained_forms_and_exact_task_scope(self):
        source = SOURCE.read_bytes()
        original_digest = hashlib.sha256(source).hexdigest()
        for ident in rc10_day0_form.SETUP_IDS:
            rendered = rc10_day0_form.derive(source, ident)
            self.assertEqual(rendered, rc10_day0_form.derive(source, ident))
            parser = Controls()
            parser.feed(rendered.decode())
            self.assertEqual(len(parser.ids), len(set(parser.ids)), 'Duplicate control/output identifiers')
            self.assertFalse(parser.external, 'Unexpected external content or asset dependency')
            self.assertFalse(any('checked' in attrs for _, attrs in parser.controls))
            self.assertFalse(any(attrs.get('value') for _, attrs in parser.controls))
            meta = json.loads(rendered.decode().split('const META=', 1)[1].split(';\n', 1)[0])
            self.assertEqual(meta['setup'], ident)
            self.assertEqual(meta['original_form_sha256'], original_digest)
            self.assertEqual(meta['tasks'], ['Kit integrity', 'Preflight without acknowledgements',
                                            'Preflight with acknowledgements', 'Localhost test', 'S01 launch'])
            self.assertEqual(len([name for name in meta['fields'] if name.startswith('state_')]), 5)
            self.assertIn('ai_state', meta['fields'])
        self.assertEqual(hashlib.sha256(SOURCE.read_bytes()).hexdigest(), original_digest)


BROWSER_SCRIPT = r'''
'use strict';
const fs=require('fs'),assert=require('assert/strict'),{pathToFileURL}=require('url');
const config=JSON.parse(process.argv[2]);
const {firefox}=require(config.playwright);
const checks=[],errors=[],network=[];
function check(name,fn){fn();checks.push(name);}
async function main(){
 const browser=await firefox.launch({headless:true,executablePath:config.firefox,timeout:30000,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});
 awaitBrowserVersion=browser.version();
 try{
  for(const fixture of config.fixtures){
   const context=await browser.newContext();const page=await context.newPage();
   page.on('pageerror',error=>errors.push(String(error)));
   page.on('request',request=>{if(/^https?:/.test(request.url()))network.push(request.url());});
   await page.goto(pathToFileURL(fixture.path).href);
   await page.evaluate(()=>{window.__prints=0;window.print=()=>{window.__prints++;window.dispatchEvent(new Event('beforeprint'));};});
   const observed=await page.evaluate(async()=>{
    const api=window.WebTechDay0,$=id=>document.getElementById(id),out={};
    const declarations=['truth','privacy','experiments_owned','ai_used','ai_checked'];
    const set=(id,value)=>{$(id).value=value;$(id).dispatchEvent(new Event('input',{bubbles:true}));};
    const renew=(all=false)=>{for(const id of declarations)$(id).checked=all||id==='truth'||id==='privacy';};
    out.blank={declarations:declarations.every(id=>!$(id).checked),complete:api.printRecord('complete'),prints:window.__prints,filename:api.filename()};
    for(const [id,value] of [['family','Van der Meer'],['given','Anne Marie'],['group','1101'],['date','2026-10-06'],['evidence','No executed action is claimed. The blockers below are the recorded evidence.'],['limitations','No environment readiness or genuine AI exchange has been observed.'],['reflection','I will request the missing access before running the named activities.']])set(id,value);
    for(let i=1;i<=5;i++){set('state_'+i,i===5?'NOT_EXECUTED':'BLOCKED');set('blocker_'+i,'Missing prerequisite; request approved access and repeat the named check.');}
    set('ai_state','BLOCKED');set('ai_blocker','Gemini access unavailable; contact the lecturer and do not invent an exchange.');renew();
    out.blocked={draftIssues:api.validate('draft').length,completeIssues:api.validate('complete').length,draftPrinted:api.printRecord('draft'),prints:window.__prints,banner:$('print-banner').textContent,emptyResults:Array.from({length:5},(_,i)=>$('observed_'+(i+1)).value).every(value=>value===''),extraDeclarations:declarations.slice(2).every(id=>!$(id).checked),filename:api.filename()};
    const backup=JSON.stringify(api.snapshot());renew(true);api.importText(backup);
    out.imported={reset:declarations.every(id=>!$(id).checked),state:$('ai_state').value,family:$('family').value,observed:$('observed_1').value};
    set('ai_state','FAILED');set('ai_blocker','The actual request failed before a response; retry only after approved access is restored.');set('ai_prompt','Actual partial prompt retained in this synthetic case');renew();
    out.failedAI={draftIssues:api.validate('draft').length,completeIssues:api.validate('complete').length,printed:api.printRecord('draft'),response:$('ai_claim').value,check:$('ai_verified').value,banner:$('print-banner').textContent};api.importText(backup);
    const preserved=JSON.stringify(api.snapshot()),bad=[];
    function refusal(name,text){let refused=false;try{api.importText(text);}catch{refused=true;}bad.push({name,refused,preserved:JSON.stringify(api.snapshot())===preserved});}
    const obj=JSON.parse(backup);
    refusal('extra envelope key',JSON.stringify({...obj,grade:100}));
    refusal('different setup',JSON.stringify({...obj,setup:obj.setup==='SETUP_WINDOWS'?'SETUP_MACOS_LINUX':'SETUP_WINDOWS'}));
    refusal('wrong field type',JSON.stringify({...obj,fields:{...obj.fields,family:true}}));
    refusal('unknown state',JSON.stringify({...obj,fields:{...obj.fields,ai_state:'COMPLETE'}}));
    refusal('nonexistent calendar date',JSON.stringify({...obj,fields:{...obj.fields,date:'2026-02-30'}}));
    refusal('invalid nonempty package identity',JSON.stringify({...obj,fields:{...obj.fields,pid:'not an identity'}}));
    refusal('oversized field',JSON.stringify({...obj,fields:{...obj.fields,family:'x'.repeat(20001)}}));
    refusal('unknown injected field',JSON.stringify({...obj,fields:{...obj.fields,html:'<script>alert(1)</script>'}}));
    refusal('duplicate plain key',backup.replace('"family":','"family":"forged","family":'));
    refusal('duplicate escaped key',backup.replace('"family":','"\\u0066amily":"forged","family":'));
    refusal('prototype envelope key',backup.slice(0,-1)+',"__proto__":{}}');
    refusal('oversized whole backup',' '.repeat(1048577));out.bad=bad;
    const attack={...obj,fields:{...obj.fields,family:'<img src="https://invalid.example/" onerror="window.__injected=1">'}};api.importText(JSON.stringify(attack));api.buildPrintable('draft');
    out.injection={imageElements:$('print-output').querySelectorAll('img').length,executed:window.__injected===1,text:$('print-output').textContent.includes(attack.fields.family)};
    api.importText(backup);
    for(const [id,value] of [['os','Synthetic browser test environment'],['kit','Synthetic declared version'],['pid','a'.repeat(64)]])set(id,value);
    for(let i=1;i<=5;i++){set('state_'+i,i===4?'FAILED':'OBSERVED');set('blocker_'+i,'');for(const key of ['pred','falsify','action','expected','observed','explain'])set(key+'_'+i,key==='observed'&&i===4?'Synthetic case: the actual attempted command returned an error.':'Synthetic semantic test entry '+key+' '+i);}
    for(const [id,value] of [['ai_state','OBSERVED'],['ai_blocker',''],['ai_prompt','Synthetic semantic fixture prompt'],['ai_claim','Synthetic fixture response'],['ai_verified','Synthetic independent-check fixture and observed result'],['ai_verdict','REJECTED'],['ai_correction','Synthetic correction fixture']])set(id,value);
    renew(true);out.complete={issues:api.validate('complete').length,printed:api.printRecord('complete'),banner:$('print-banner').textContent,text:$('print-output').textContent,prints:window.__prints};
    set('observed_1',' \n\t ');renew(true);out.whitespace={issues:api.validate('complete').filter(item=>item.id==='observed_1').length,printed:api.printRecord('complete'),prints:window.__prints};
    window.dispatchEvent(new Event('beforeprint'));out.nativeDraft=$('print-banner').textContent;
    set('observed_1','One actual result\nSecond output line\nFinal output line');renew(true);api.buildPrintable('complete');
    out.lines=$('print-output').textContent.includes('One actual result\nSecond output line\nFinal output line');
    set('ai_verified','');renew(true);out.missingCheck={issues:api.validate('complete').filter(item=>item.id==='ai_verified').length,printed:api.printRecord('complete')};
    set('ai_verified','Actual independently checked result');renew(true);$('ai_used').checked=false;out.undeclaredExchange={printed:api.printRecord('complete'),issues:api.validate('complete').some(item=>item.id==='ai_used')};
    api.reset();out.reset={allBlank:Object.values(api.snapshot().fields).every(value=>value===''),checks:declarations.every(id=>!$(id).checked),complete:api.buildPrintable('complete').complete};
    return out;
   });
   const prefix=fixture.setup+' — ';
   check(prefix+'blank form cannot request completed export',()=>{assert.equal(observed.blank.complete,false);assert.equal(observed.blank.prints,0);assert.equal(observed.blank.declarations,true);assert.equal(observed.blank.filename,'TW2026_DAY0_GROUP_Family_Given.pdf');});
   check(prefix+'legitimate blockers export honest incomplete record',()=>{assert.equal(observed.blocked.draftIssues,0);assert(observed.blocked.completeIssues>0);assert.equal(observed.blocked.draftPrinted,true);assert.match(observed.blocked.banner,/INCOMPLETE/);assert.equal(observed.blocked.emptyResults,true);assert.equal(observed.blocked.extraDeclarations,true);});
   check(prefix+'compound names have an explicit mapping',()=>assert.equal(observed.blocked.filename,'TW2026_DAY0_1101_Van_der_Meer_Anne_Marie.pdf'));
   check(prefix+'backup import resets all declarations',()=>{assert.equal(observed.imported.reset,true);assert.equal(observed.imported.state,'BLOCKED');assert.equal(observed.imported.family,'Van der Meer');assert.equal(observed.imported.observed,'');});
   check(prefix+'failed AI request exports incomplete without an invented response or check',()=>{assert.equal(observed.failedAI.draftIssues,0);assert(observed.failedAI.completeIssues>0);assert.equal(observed.failedAI.printed,true);assert.equal(observed.failedAI.response,'');assert.equal(observed.failedAI.check,'');assert.match(observed.failedAI.banner,/INCOMPLETE/);});
   for(const item of observed.bad)check(prefix+'untrusted import refuses '+item.name+' atomically',()=>{assert.equal(item.refused,true);assert.equal(item.preserved,true);});
   check(prefix+'untrusted text is printed as text',()=>{assert.equal(observed.injection.imageElements,0);assert.equal(observed.injection.executed,false);assert.equal(observed.injection.text,true);});
   check(prefix+'completed evidence preserves actual failed attempt and scope limits',()=>{assert.equal(observed.complete.issues,0);assert.equal(observed.complete.printed,true);assert.match(observed.complete.banner,/COMPLETE EVIDENCE RECORD/);assert.match(observed.complete.text,/FAILED: 1/);assert.match(observed.complete.text,/not successful readiness/);assert.match(observed.complete.text,/actual attempted command returned an error/);});
   check(prefix+'whitespace does not satisfy actual result requirement',()=>{assert.equal(observed.whitespace.issues,1);assert.equal(observed.whitespace.printed,false);assert.equal(observed.whitespace.prints,observed.complete.prints);});
   check(prefix+'native print after incomplete change is downgraded',()=>assert.match(observed.nativeDraft,/INCOMPLETE|UNDECLARED/));
   check(prefix+'print snapshot preserves all textarea lines',()=>assert.equal(observed.lines,true));
   check(prefix+'actual independent check remains mandatory for completion',()=>{assert.equal(observed.missingCheck.issues,1);assert.equal(observed.missingCheck.printed,false);});
   check(prefix+'genuine AI exchange declaration remains mandatory',()=>{assert.equal(observed.undeclaredExchange.issues,true);assert.equal(observed.undeclaredExchange.printed,false);});
   check(prefix+'reset leaves no prefilled evidence or declarations',()=>{assert.equal(observed.reset.allBlank,true);assert.equal(observed.reset.checks,true);assert.equal(observed.reset.complete,false);});
   await context.close();
  }
  check('no page errors in bounded form cases',()=>assert.deepEqual(errors,[]));
  check('no HTTP or HTTPS requests from local forms',()=>assert.deepEqual(network,[]));
 }finally{await browser.close();}
 return {checks,check_count:checks.length,page_errors:errors,http_requests:network,browser_version:awaitBrowserVersion};
}
let awaitBrowserVersion='';
main().then(result=>process.stdout.write(JSON.stringify(result)+'\n')).catch(error=>{process.stderr.write(String(error.stack||error)+'\n');process.exitCode=1;});
'''


def run_browser(node: str, firefox: str, playwright: str):
    environment = dict(os.environ)
    for name in ('NODE_OPTIONS', 'NODE_PATH', 'NODE_TEST_CONTEXT'):
        environment.pop(name, None)
    version = subprocess.run([node, '--version'], env=environment, capture_output=True,
                             text=True, check=True, timeout=10).stdout.strip()
    if version != 'v24.21.0':
        raise ValueError('Exact Node v24.21.0 required; observed ' + version)
    with tempfile.TemporaryDirectory(prefix='webtech-rc10-day0-browser-') as temporary:
        root = Path(temporary)
        fixtures = []
        for ident in rc10_day0_form.SETUP_IDS:
            path = root / (ident + '.html')
            path.write_bytes(rc10_day0_form.derive(SOURCE.read_bytes(), ident))
            fixtures.append({'setup': ident, 'path': str(path)})
        script = root / 'semantic-cases.cjs'
        script.write_text(BROWSER_SCRIPT)
        config = {'firefox': firefox, 'playwright': playwright, 'fixtures': fixtures}
        result = subprocess.run([node, str(script), json.dumps(config)], capture_output=True,
                                text=True, env=environment, timeout=90)
        if result.returncode:
            raise RuntimeError(result.stdout + result.stderr)
        report = json.loads(result.stdout)
        report.update(node=version, native_pdf_save_exercised=False,
                      human_experiments_performed=False, synthetic_test_entries=True,
                      print_stub='Only window.print is replaced to count requested print scopes; actual beforeprint event and printable DOM run.',
                      network_policy='Only local file documents; zero HTTP/HTTPS requests observed',
                      source_form_sha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest())
        return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--node')
    parser.add_argument('--firefox')
    parser.add_argument('--playwright')
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(Day0SourceBoundary)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    report = {'schema': 'webtech-rc10-day0-form-qa/v1', 'static_tests_run': result.testsRun,
              'static_failures': len(result.failures), 'static_errors': len(result.errors)}
    supplied = (args.node, args.firefox, args.playwright)
    if any(supplied) and not all(supplied):
        parser.error('--node, --firefox and --playwright must be supplied together')
    browser_ok = True
    if result.wasSuccessful() and all(supplied):
        try:
            report['browser'] = run_browser(*supplied)
        except (OSError, ValueError, RuntimeError, subprocess.SubprocessError) as error:
            browser_ok = False
            report['browser'] = {'status': 'INCOMPLETE_OR_FAILED', 'error': str(error),
                                 'native_pdf_save_exercised': False}
    report['status'] = 'PASS' if result.wasSuccessful() and browser_ok else 'FAIL'
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False))
    return 0 if result.wasSuccessful() and browser_ok else 1


if __name__ == '__main__':
    raise SystemExit(main())
