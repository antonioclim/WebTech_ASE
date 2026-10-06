#!/usr/bin/env python3
"""RC9 form derivation and bounded synthetic-DOM regression tests.

These tests intentionally do not claim real-browser/PDF/accessibility coverage.
Run: python -m unittest discover -s 00_TOOLS/qa -p test_rc9_forms.py -v
"""
from __future__ import annotations

import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

PUBLISHING = Path(__file__).resolve().parents[1] / "publishing"
sys.path.insert(0, str(PUBLISHING))
import classroom_form
from rc9_forms import derive_form


def source_form(seminar):
    projects = [{"id": pid, "title": "Contract " + pid}
                for pid in classroom_form.PROJECT_IDS[seminar]]
    return classroom_form.render(seminar, projects, "../original-form.html").encode("utf-8")


class DerivationTests(unittest.TestCase):
    def test_all_fourteen_derivations_are_deterministic_and_preserve_contract(self):
        for seminar in classroom_form.PROJECT_IDS:
            with self.subTest(seminar=seminar):
                original = source_form(seminar)
                derivative = derive_form(original, seminar)
                self.assertEqual(derive_form(original, seminar), derivative)
                old_meta = re.search(rb"^const META=(.*);$", original, re.M).group(1)
                new_meta = re.search(rb"^const META=(.*);$", derivative, re.M).group(1)
                self.assertEqual(old_meta, new_meta)
                self.assertIn(b"const SCHEMA='webtech-classroom-evidence/v1'", derivative)
                self.assertIn(b"function strictParse(source)", derivative)
                self.assertNotIn(b"localStorage", derivative)
                self.assertNotIn(b"sessionStorage", derivative)
                self.assertIn(b"Copy PDF filename", derivative)
                self.assertIn(b"UTF-8: 0 / 2048 bytes maximum.", derivative)
                self.assertNotIn(b"printText(section,key", derivative)
                self.assertNotIn(b"printText(out,key", derivative)

    def test_unknown_changed_wrong_seminar_and_repeated_sources_are_rejected(self):
        original = source_form("S01")
        for payload, seminar in [(original.replace(b"Required individual", b"Optional individual"), "S01"),
                                 (original, "S02"), (original, "S15"),
                                 (derive_form(original, "S01"), "S01"),
                                 (b"<html>unknown</html>", "S01")]:
            with self.subTest(seminar=seminar, length=len(payload)):
                with self.assertRaises(ValueError):
                    derive_form(payload, seminar)

    def test_nonbytes_are_rejected(self):
        with self.assertRaises(TypeError):
            derive_form("not bytes", "S01")

    @unittest.skipUnless(shutil.which("node"), "Node is needed for synthetic JS logic tests")
    def test_synthetic_dom_logic_all_fourteen_forms(self):
        with tempfile.TemporaryDirectory(prefix="rc9_forms_logic_") as temporary:
            work = Path(temporary)
            forms = []
            for seminar in classroom_form.PROJECT_IDS:
                destination = work / (seminar + ".html")
                destination.write_bytes(derive_form(source_form(seminar), seminar))
                forms.append(str(destination))
            harness = work / "logic.mjs"
            harness.write_text(_NODE_HARNESS, encoding="utf-8")
            result = subprocess.run([shutil.which("node"), str(harness), json.dumps(forms)],
                                    capture_output=True, text=True, timeout=30)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            report = json.loads(result.stdout)
            self.assertEqual(report["forms"], 14)
            self.assertEqual(report["failures"], 0)
            self.assertTrue(report["synthetic_dom_only"])
            self.assertGreaterEqual(report["assertion_groups"], 200)


_NODE_HARNESS = r'''import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
let groups=0;
class Element{
 constructor(tag,attrs={},initial=''){this.tagName=tag.toUpperCase();this.attrs=attrs;this.id=attrs.id||'';this.value=initial;this.initial=initial;this.checked=false;this.listeners={};this.children=[];this.textContent='';this.files=[];this.className='';this.focused=false;this.selected=false;}
 getAttribute(k){return this.attrs[k]??null;} hasAttribute(k){return Object.hasOwn(this.attrs,k);} setAttribute(k,v){this.attrs[k]=String(v);}
 addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);} dispatch(k){for(const fn of this.listeners[k]??[])fn({preventDefault(){}});}
 append(...children){this.children.push(...children);} appendChild(child){this.append(child);return child;} replaceChildren(...children){this.children=[...children];}
 focus(){this.focused=true;} select(){this.selected=true;} click(){this.dispatch('click');} remove(){}
}
for(const file of JSON.parse(process.argv[2])){
 const html=fs.readFileSync(file,'utf8'),nodes=new Map();
 for(const m of html.matchAll(/<([a-z]+)\b([^>]*\bid="([^"]+)"[^>]*)>/g)){
  const attrs={};for(const a of m[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g))attrs[a[1]]=a[2]??'';
  const initial=m[1]==='select'?html.slice(m.index).match(/<option value="([^"]*)"/)[1]:'';
  assert.ok(!nodes.has(m[3]),'Duplicate ID '+m[3]);nodes.set(m[3],new Element(m[1],attrs,initial));
 }
 const materials=[...nodes.values()].filter(e=>e.hasAttribute('data-material')),confirmations=[...nodes.values()].filter(e=>e.hasAttribute('data-confirm'));
 const document={title:html.match(/<title>(.*?)<\/title>/)[1],body:new Element('body'),getElementById:id=>{assert.ok(nodes.has(id),'Unknown DOM ID '+id);return nodes.get(id);},querySelectorAll:q=>q==='[data-confirm]'?confirmations:[...materials,...confirmations],createElement:tag=>new Element(tag)};
 const genericTitle=document.title;nodes.get('evidence-form').reset=()=>{for(const e of [...materials,...confirmations]){e.value=e.initial;e.checked=false;}};
 const listeners={},window={print(){},confirm:()=>true,addEventListener(k,fn){(listeners[k]??=[]).push(fn);}};
 const downloads=[],urls=[];document.body.appendChild=e=>{downloads.push(e);return e;};
 const context={document,window,TextEncoder,Blob,navigator:{},setTimeout,URL:{createObjectURL(blob){urls.push(blob);return 'blob:synthetic';},revokeObjectURL(){}}};
 vm.createContext(context);vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context,{timeout:2000});
 const api=window.WEBTECH_CLASSROOM_FORM,baseline=JSON.stringify(api.snapshot()),sem=api.metadata.seminar;
 const check=fn=>{fn();groups++;},set=(id,value)=>{nodes.get(id).value=value;nodes.get(id).dispatch('input');};
 const reset=()=>{assert.equal(api.reset(),true);};
 const beforeUnload=()=>{let prevented=false;const event={preventDefault(){prevented=true;}};for(const fn of listeners.beforeunload)fn(event);return prevented;};
 const flatten=e=>[e,...e.children.flatMap(flatten)];
 check(()=>{assert.equal(api.snapshot().status,'draft');assert.ok(confirmations.every(c=>!c.checked));assert.equal(api.hasUnsavedChanges(),false);assert.equal(beforeUnload(),false);});
 check(()=>{assert.match(nodes.get('ai-prompt-count').textContent,/0 \/ 2048/);assert.match(nodes.get('record-size').textContent,new RegExp(String(new TextEncoder().encode(JSON.stringify(api.snapshot(),null,2)+'\n').length)));});
 check(()=>{set('givenName','Éva');set('surname','Ștefan');set('group','G01');assert.equal(api.pdfFilename(),'TW2026_'+sem+'_G01_Stefan_Eva.pdf');assert.equal(nodes.get('pdf-filename').value,api.pdfFilename());assert.equal(beforeUnload(),true);});
 nodes.get('copy-pdf-name').dispatch('click');await Promise.resolve();
 check(()=>{assert.equal(nodes.get('pdf-filename').selected,true);assert.match(nodes.get('feedback').textContent,/Ctrl\+C/);});
 check(()=>{api.saveJSON();assert.equal(api.hasUnsavedChanges(),false);assert.equal(beforeUnload(),false);assert.equal(downloads.at(-1).download,'TW2026_'+sem+'_G01_Stefan_Eva_Classroom_Draft.json');});
 check(()=>{set('ai-prompt','é'.repeat(1025));const before=JSON.stringify(api.snapshot());api.saveJSON();assert.equal(JSON.stringify(api.snapshot()),before);assert.equal(nodes.get('ai-prompt').getAttribute('aria-invalid'),'true');assert.equal(nodes.get('ai-prompt').focused,true);assert.match(nodes.get('ai-prompt-error').textContent,/Sanitised prompt you actually sent/);assert.equal(api.hasUnsavedChanges(),true);});
 check(()=>{reset();assert.equal(api.hasUnsavedChanges(),false);assert.equal(document.title,genericTitle);assert.equal(JSON.stringify(api.snapshot()),baseline);});
 check(()=>{nodes.get('truthfulEvidence').checked=true;nodes.get('truthfulEvidence').dispatch('change');assert.equal(beforeUnload(),false);set('environment','SYNTHETIC ONLY');assert.ok(confirmations.every(c=>!c.checked));assert.equal(beforeUnload(),true);});
 reset();
 check(()=>{set('studentDate','2099-01-01');api.saveJSON();assert.equal(nodes.get('studentDate').getAttribute('aria-invalid'),'true');assert.equal(nodes.get('studentDate').focused,true);assert.match(nodes.get('studentDate-error').textContent,/nonfuture date/);});
 reset();
 check(()=>{assert.equal(api.printRecord(true),false);assert.equal(nodes.get('givenName').focused,true);assert.equal(nodes.get('givenName').getAttribute('aria-invalid'),'true');assert.match(nodes.get('givenName-error').textContent,/given name/);});
 reset();
 const completed=JSON.parse(baseline);completed.student={givenName:'Example',surname:'Synthetic',group:'TEST',date:'2026-10-05',packageId:'a'.repeat(64)};completed.environment='SYNTHETIC DOM TEST; NOT ACTUAL EVIDENCE';
 for(const p of completed.projects){p.status='completed';p.confirmed=true;for(const k of ['prediction','change','command','actualResult','negativeCase','evidence','reflection'])p[k]='SYNTHETIC TEXT';}
 completed.ai={access:'available',tool:'SYNTHETIC',date:'2026-10-05',prompt:'SYNTHETIC',claim:'SYNTHETIC',independentCheck:'SYNTHETIC',outcome:'accepted',evidence:'SYNTHETIC',reflection:'SYNTHETIC',confirmed:true};for(const k of Object.keys(completed.declarations))completed.declarations[k]=true;completed.status='completed';
 check(()=>{api.importText(JSON.stringify(completed));assert.ok(confirmations.every(c=>!c.checked));assert.equal(api.snapshot().status,'draft');assert.equal(beforeUnload(),false);});
 for(const c of confirmations)c.checked=true;api.refresh();
 check(()=>{assert.equal(api.printRecord(true),true);const rendered=flatten(nodes.get('print-output'));assert.ok(rendered.some(n=>n.textContent==='Actual result and copied output'));assert.ok(rendered.some(n=>n.textContent==='Individual work and declared assistance'));assert.ok(!rendered.some(n=>n.tagName==='H3'&&['actualResult','negativeCase','independentCheck','individualWork','truthfulEvidence','scopeUnderstood'].includes(n.textContent)));assert.equal(document.title,'TW2026_'+sem+'_TEST_Synthetic_Example');});
 check(()=>{for(const fn of listeners.afterprint)fn();assert.equal(document.title,genericTitle);});
 check(()=>{set(completed.projects[0].id+'-reflection','<img src=x onerror=alert(1)>');assert.equal(api.snapshot().status,'draft');assert.ok(confirmations.every(c=>!c.checked));assert.equal(api.printRecord(false),true);const rendered=flatten(nodes.get('print-output'));assert.ok(rendered.some(n=>n.tagName==='P'&&n.textContent==='<img src=x onerror=alert(1)>'));assert.ok(!rendered.some(n=>n.tagName==='IMG'));});
 check(()=>{const before=JSON.stringify(api.snapshot());assert.throws(()=>api.importText('{"schema":"bad"}'));assert.equal(JSON.stringify(api.snapshot()),before);assert.throws(()=>api.strictParse('{"x":1,"x":2}'));assert.throws(()=>api.strictParse('{"__proto__":{}}'));});
 let resolve;const delayed=api.importFile({size:100,text:()=>new Promise(r=>{resolve=r;})});set('environment','SYNTHETIC CHANGED DURING IMPORT');resolve(JSON.stringify(completed));
 assert.equal(await delayed,false);assert.equal(api.snapshot().environment,'SYNTHETIC CHANGED DURING IMPORT');groups++;
 check(()=>{const before=JSON.stringify(api.snapshot());window.confirm=()=>false;assert.equal(api.reset(),false);assert.equal(JSON.stringify(api.snapshot()),before);assert.equal(api.hasUnsavedChanges(),true);window.confirm=()=>true;reset();assert.equal(document.title,genericTitle);assert.equal(beforeUnload(),false);});
 check(()=>{for(const p of api.metadata.projects)for(const [k,size]of Object.entries({prediction:1024,change:1536,command:1536,actualResult:3072,negativeCase:1536,evidence:1536,reflection:1536}))set(p.id+'-'+k,'\\'.repeat(size));for(const [id,size]of Object.entries({'ai-prompt':2048,'ai-claim':2048,'ai-independentCheck':2048,'ai-evidence':1536,'ai-reflection':1536,environment:1536,blockers:3072}))set(id,'\\'.repeat(size));const before=JSON.stringify(api.snapshot());assert.match(nodes.get('record-size-warning').textContent,/too large/);api.saveJSON();assert.equal(JSON.stringify(api.snapshot()),before);assert.equal(nodes.get('record-size').focused,true);assert.equal(api.hasUnsavedChanges(),true);});
 reset();
 check(()=>{set('givenName','é'.repeat(128));assert.equal(nodes.get('givenName').getAttribute('aria-invalid'),'false');assert.match(nodes.get('givenName-count').textContent,/256 \/ 256/);set('givenName','é'.repeat(129));assert.equal(nodes.get('givenName').getAttribute('aria-invalid'),'true');});
}
process.stdout.write(JSON.stringify({forms:JSON.parse(process.argv[2]).length,assertion_groups:groups,failures:0,synthetic_dom_only:true}));
'''


if __name__ == "__main__":
    unittest.main()
