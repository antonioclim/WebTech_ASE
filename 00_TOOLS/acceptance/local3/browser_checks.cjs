#!/usr/bin/env node
'use strict';
// Finite automated observations. Synthetic records are never student evidence.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {pathToFileURL} = require('node:url');
const {spawn} = require('node:child_process');
const REQUIRED_NODE = 'v24.21.0';
const REQUIRED_PLAYWRIGHT = '1.62.1';
const MAX_SCHEDULE_MS = 20 * 60 * 1000;
const SCHEMA = 'webtech-local3-automated-browser-checks/v1';
const PROJECT_KEYS = ['prediction', 'change', 'command', 'actualResult', 'negativeCase', 'evidence', 'reflection'];
const SCOPE = 'Print UI requests are instrumented without opening an OS dialogue. Finite headless browser checks of published starter bytes and synthetic form records. No student completion, native platform, manual browser acceptance or grade is inferred.';
const SYNTHETIC = 'SYNTHETIC_AUTOMATED_UI_TEST_NOT_STUDENT_EVIDENCE';
function args(values) {
  const allowed = new Set(['--input-root', '--output', '--playwright-module']), parsed = {};
  for (let i = 0; i < values.length; i += 2) {
    if (!allowed.has(values[i]) || !values[i + 1] || parsed[values[i]]) throw Error('Use --input-root ABSOLUTE_ROOT --output ABSOLUTE_NEW_REPORT_DIRECTORY');
    parsed[values[i]] = values[i + 1];
  }
  if (!parsed['--input-root'] || !parsed['--output'] || !Object.values(parsed).every(path.isAbsolute)) throw Error('Both paths must be absolute.');
  return {input: fs.realpathSync(parsed['--input-root']), output: path.resolve(parsed['--output']), playwrightModule: parsed['--playwright-module'] ? fs.realpathSync(parsed['--playwright-module']) : null};
}
function contains(root, candidate) { const rel = path.relative(root, candidate); return rel === '' || (!rel.startsWith('..' + path.sep) && rel !== '..' && !path.isAbsolute(rel)); }
function regularWithin(root, rel) {
  if (typeof rel !== 'string' || path.isAbsolute(rel) || rel.includes('\\')) throw Error('Invalid collection path');
  const full = path.resolve(root, rel);
  if (!contains(root, full) || fs.realpathSync(full) !== full || !fs.lstatSync(full).isFile()) throw Error('Nonregular or escaping collection path: ' + rel);
  return full;
}
function inventory(root) {
  const rows = [];
  function walk(directory) {
    for (const item of fs.readdirSync(directory, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(directory, item.name);
      if (item.isSymbolicLink()) throw Error('Symbolic link in extracted collection: ' + full);
      if (item.isDirectory()) walk(full);
      else if (item.isFile()) rows.push({path: path.relative(root, full).split(path.sep).join('/'), bytes: fs.statSync(full).size, sha256: sha(full)});
      else throw Error('Nonregular entry in extracted collection: ' + full);
    }
  }
  walk(root); rows.sort((a, b) => a.path.localeCompare(b.path));
  return {fileCount: rows.length, digest: crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex'), rows};
}
function sha(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function writeJSON(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', {flag: 'wx'}); }
function requireTrue(value, message) { if (!value) throw Error(message); }
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function normalisedImport(record) {
  const result = structuredClone(record);
  for (const project of result.projects) project.confirmed = false;
  result.ai.confirmed = false;
  for (const key of Object.keys(result.declarations)) result.declarations[key] = false;
  result.status = result.projects.some(p => p.status === 'blocked') || result.ai.access === 'blocked' ? 'blocked' : 'draft';
  return result;
}
function syntheticRecord(blank, packageId) {
  const result = structuredClone(blank);
  result.student = {givenName: 'Synthetic', surname: 'BrowserAudit', group: 'AUDIT_NOT_STUDENT', date: '2000-01-01', packageId};
  result.environment = SYNTHETIC + '; isolated headless browser fixture only.';
  for (const project of result.projects) {
    project.status = 'completed'; project.confirmed = true;
    for (const key of PROJECT_KEYS) project[key] = SYNTHETIC + ' / ' + project.id + ' / ' + key + ' / <not markup> & text';
  }
  result.ai = {access: 'available', tool: 'Synthetic audit fixture only', date: '2000-01-01', prompt: SYNTHETIC, claim: SYNTHETIC, independentCheck: SYNTHETIC, outcome: 'unknown', evidence: SYNTHETIC, reflection: SYNTHETIC, confirmed: true};
  for (const key of Object.keys(result.declarations)) result.declarations[key] = true;
  result.blockers = SYNTHETIC + ': no actual student or AI exchange is asserted.';
  result.status = 'completed';
  return result;
}
async function withContext(browser, allowedOrigin, work) {
  const context = await browser.newContext({acceptDownloads: true, viewport: {width: 1280, height: 900}, locale: 'en-GB', timezoneId: 'UTC', reducedMotion: 'reduce'});
  const rejectedNetwork = [], failedRequests = [], pageErrors = [];
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (['file:', 'data:', 'blob:', 'about:'].includes(url.protocol) || (allowedOrigin && url.origin === allowedOrigin)) await route.continue();
    else { rejectedNetwork.push(route.request().url()); await route.abort('blockedbyclient'); }
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000); page.setDefaultNavigationTimeout(15000);
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('requestfailed', request => failedRequests.push({url: request.url(), error: request.failure()?.errorText}));
  page.on('dialog', async dialog => { await dialog.dismiss(); });
  try { return await work(page, {rejectedNetwork, failedRequests, pageErrors}); }
  finally { await context.close(); }
}
async function formCase(browser, name, root, output, object) {
  const directory = path.join(output, name, object.object_id); fs.mkdirSync(directory, {recursive: true});
  const checks = [], result = {schema: SCHEMA, kind: 'FORM_UI', browser: name, seminar: object.object_id, source: object.form, sourceSha256: sha(regularWithin(root, object.form)), evidenceClass: SYNTHETIC, scope: SCOPE, checks};
  async function probe(id, run) {
    try { const actual = await run(); checks.push({id, status: 'PASS', actual: actual ?? null}); return true; }
    catch (error) { checks.push({id, status: 'FAIL', reason: error.message}); return false; }
  }
  try {
    await withContext(browser, null, async (page, diagnostics) => {
      await page.addInitScript(() => { window.__auditPrintRequests = 0; window.print = () => { window.__auditPrintRequests++; }; });
      await page.goto(pathToFileURL(regularWithin(root, object.form)).href, {waitUntil: 'load'});
      await page.waitForFunction(() => !!window.WEBTECH_CLASSROOM_FORM);
      const snapshot = () => page.evaluate(() => window.WEBTECH_CLASSROOM_FORM.snapshot());
      const blank = await snapshot();
      await probe('initial_draft_and_unchecked_confirmations', async () => {
        requireTrue(blank.seminar === object.object_id && blank.status === 'draft', 'Wrong seminar or initial status');
        requireTrue(blank.projects.length >= 2 && blank.projects.length <= 3, 'Required microproject count outside contract');
        requireTrue(await page.locator('[data-confirm]:checked').count() === 0, 'Initial confirmations prefilled');
        requireTrue(blank.projects.every(p => PROJECT_KEYS.every(key => p[key] === '')), 'Initial project evidence prefilled');
        return {seminar: blank.seminar, requiredProjects: blank.projects.map(p => p.id), recordStatus: blank.status};
      });
      await probe('incomplete_completed_print_refused', async () => {
        await page.locator('#print-complete').click();
        requireTrue(await page.evaluate(() => window.__auditPrintRequests) === 0, 'Completed print called for empty draft');
        requireTrue(await page.locator('#givenName').getAttribute('aria-invalid') === 'true', 'Required identity error missing');
        requireTrue((await page.locator('#feedback').innerText()).includes('refused'), 'Refusal feedback missing');
        return {feedback: await page.locator('#feedback').innerText(), printRequests: 0};
      });
      await probe('draft_print_banner_and_full_print_tree', async () => {
        await page.locator('#print-draft').click();
        const banner = await page.locator('#print-output .print-banner').innerText();
        requireTrue(banner === 'DRAFT FOR REVIEW — NOT COMPLETE', 'Draft banner differs');
        requireTrue(await page.evaluate(() => window.__auditPrintRequests) === 1, 'Draft print request not recorded');
        const expected = blank.projects.map(p => p.id + ':');
        const headings = await page.locator('#print-output h2').allTextContents();
        requireTrue(expected.every(prefix => headings.some(h => h.startsWith(prefix))), 'Required project absent from printable tree');
        await page.screenshot({path: path.join(directory, 'empty-draft-screen.png'), fullPage: true});
        await page.emulateMedia({media: 'print'});
        requireTrue(await page.locator('#print-output').isVisible(), 'Print tree is hidden in print media');
        requireTrue(!(await page.locator('main.screen').isVisible()), 'Screen editor appears in print media');
        await page.screenshot({path: path.join(directory, 'empty-draft-print-media.png'), fullPage: true});
        if (name === 'chromium') {
          const pdf = path.join(directory, 'draft-headless-print-layout.pdf');
          await page.pdf({path: pdf, format: 'A4', printBackground: true, preferCSSPageSize: true});
          requireTrue(fs.readFileSync(pdf).subarray(0, 5).toString() === '%PDF-', 'PDF header invalid');
          result.pdf = {path: path.relative(output, pdf).split(path.sep).join('/'), sha256: sha(pdf), evidenceClass: 'CHROMIUM_HEADLESS_PRINT_LAYOUT_ONLY', nativeSaveAsDialogueTested: false, humanLegibilityReview: false};
        }
        await page.emulateMedia({media: 'screen'});
        return {banner, requiredProjectHeadings: headings};
      });
      const packageId = fs.readFileSync(regularWithin(root, object.package_id_path), 'utf8').trim();
      requireTrue(/^[a-f0-9]{64}$/.test(packageId), 'Bad current unit PACKAGE_ID');
      const fixture = syntheticRecord(blank, packageId), fixturePath = path.join(directory, 'synthetic-import.json');
      writeJSON(fixturePath, fixture);
      await probe('valid_file_import_retains_text_resets_confirmations', async () => {
        await page.locator('#import-json').setInputFiles(fixturePath);
        await page.waitForFunction(() => document.getElementById('feedback').textContent.startsWith('Imported valid text'));
        const actual = await snapshot();
        requireTrue(same(actual, normalisedImport(fixture)), 'Import did not retain text/statuses with confirmations reset');
        return {recordStatus: actual.status, confirmationsReset: true, synthetic: true};
      });
      await probe('completion_requires_renewed_manual_checks_and_no_grade', async () => {
        const confirms = page.locator('[data-confirm]');
        for (let i = 0; i < await confirms.count(); i++) await confirms.nth(i).check();
        requireTrue((await snapshot()).status === 'completed', 'Fully populated synthetic test record did not complete');
        requireTrue((await page.locator('#record-status').innerText()).includes('not a grade'), 'No-grade qualifier missing');
        await page.locator('#print-complete').click();
        const banner = await page.locator('#print-output .print-banner').innerText();
        requireTrue(banner === 'COMPLETED SCOPED CLASSROOM RECORD — STUDENT DECLARATION; NOT A GRADE', 'Completed scope banner differs');
        requireTrue(await page.locator('#print-output script').count() === 0, 'Synthetic text interpreted as executable markup');
        await page.screenshot({path: path.join(directory, 'synthetic-scoped-record.png'), fullPage: true});
        return {banner, syntheticRecordOnly: true, noActualStudentCompletion: true};
      });
      await probe('material_edit_invalidates_all_confirmations', async () => {
        await page.locator('#environment').fill(SYNTHETIC + '; material edit to invalidate review.');
        requireTrue(await page.locator('[data-confirm]:checked').count() === 0, 'Material edit left confirmations checked');
        requireTrue((await snapshot()).status === 'draft', 'Material edit left completed record');
        return {allConfirmationsCleared: true, recordStatus: 'draft'};
      });
      const exported = path.join(directory, 'synthetic-exported-draft.json');
      await probe('actual_json_download_matches_current_snapshot', async () => {
        const before = await snapshot();
        const downloadPromise = page.waitForEvent('download'); await page.locator('#export-json').click();
        const download = await downloadPromise; await download.saveAs(exported);
        requireTrue(same(JSON.parse(fs.readFileSync(exported, 'utf8')), before), 'Downloaded draft differs from UI snapshot');
        requireTrue(download.suggestedFilename().endsWith('_Classroom_Draft.json'), 'Unexpected JSON download name');
        return {filename: download.suggestedFilename(), sha256: sha(exported), bytes: fs.statSync(exported).size};
      });
      await probe('exported_json_file_round_trip', async () => {
        const expected = normalisedImport(JSON.parse(fs.readFileSync(exported, 'utf8')));
        await page.locator('#surname').fill('Material change before round-trip');
        await page.locator('#import-json').setInputFiles(exported);
        await page.waitForFunction(() => document.getElementById('feedback').textContent.startsWith('Imported valid text'));
        requireTrue(same(await snapshot(), expected), 'Exported draft round-trip lost fields');
        return {restoredExactlyWithConfirmationReset: true};
      });
      await probe('malformed_duplicate_key_import_is_nondestructive', async () => {
        const before = await snapshot();
        const duplicate = JSON.stringify(before).replace('{', '{"schema":"webtech-classroom-evidence/v1",');
        await page.locator('#import-json').setInputFiles({name: 'synthetic-duplicate-key.json', mimeType: 'application/json', buffer: Buffer.from(duplicate)});
        await page.waitForFunction(() => document.getElementById('feedback').textContent.startsWith('Import refused'));
        requireTrue(same(await snapshot(), before), 'Refused duplicate-key import mutated current answers');
        return {feedback: await page.locator('#feedback').innerText(), answersPreserved: true};
      });
      await probe('oversized_import_is_nondestructive', async () => {
        const before = await snapshot();
        await page.locator('#import-json').setInputFiles({name: 'synthetic-oversized.json', mimeType: 'application/json', buffer: Buffer.alloc(65537, 32)});
        await page.waitForFunction(() => document.getElementById('feedback').textContent.includes('no larger than 64 KiB'));
        requireTrue(same(await snapshot(), before), 'Oversized import mutated current answers');
        return {answersPreserved: true, refusedBytes: 65537};
      });
      await probe('overlong_field_reports_error_and_preserves_input', async () => {
        const overlong = 'é'.repeat(129); await page.locator('#givenName').fill(overlong);
        requireTrue(await page.locator('#givenName').getAttribute('aria-invalid') === 'true', 'UTF-8 overlong field was not marked invalid');
        requireTrue(await page.locator('#givenName').inputValue() === overlong, 'Overlong input was silently truncated');
        return {observedBytes: Buffer.byteLength(overlong), maximumBytes: 256, inputPreserved: true};
      });
      await probe('no_page_errors_or_unexpected_network', async () => {
        requireTrue(diagnostics.pageErrors.length === 0, 'Page script errors: ' + diagnostics.pageErrors.join('; '));
        requireTrue(diagnostics.rejectedNetwork.length === 0, 'Unexpected external network requests');
        requireTrue(diagnostics.failedRequests.length === 0, 'Failed browser requests');
        return diagnostics;
      });
      result.diagnostics = diagnostics;
    });
  } catch (error) { checks.push({id: 'form_case_setup_or_cleanup', status: 'FAIL', reason: error.message}); }
  result.status = checks.every(c => c.status === 'PASS') ? 'PASS_FINITE_FORM_UI_CHECKS' : 'FAIL_FORM_UI_CHECKS';
  writeJSON(path.join(directory, 'form.json'), result);
  return result;
}
async function c02Case(browser, name, root, output, object) {
  const directory = path.join(output, name, 'C02'); fs.mkdirSync(directory, {recursive: true});
  const checks = [], result = {kind: 'C02_PRESENTATION_UI', browser: name, source: object.guide, sourceSha256: sha(regularWithin(root, object.guide)), scope: SCOPE, checks};
  async function probe(id, run) { try { checks.push({id, status: 'PASS', actual: await run() ?? null}); } catch (error) { checks.push({id, status: 'FAIL', reason: error.message}); } }
  try { await withContext(browser, null, async (page, diagnostics) => {
    await page.goto(pathToFileURL(regularWithin(root, object.guide)).href, {waitUntil: 'load'});
    await probe('single_active_slide_and_navigation', async () => {
      requireTrue(await page.locator('.slide.active').count() === 1, 'More than one active slide');
      requireTrue(await page.locator('.slide.active').getAttribute('data-id') === 'C02-01', 'Unexpected starting slide');
      await page.locator('#next').click(); requireTrue(await page.locator('.slide.active').getAttribute('data-id') === 'C02-02', 'Next navigation failed');
      await page.locator('#prev').click(); requireTrue(await page.locator('.slide.active').getAttribute('data-id') === 'C02-01', 'Back navigation failed');
      return {activeSlides: 1, start: 'C02-01', next: 'C02-02'};
    });
    await probe('emergency_modal_focus_trap_and_escape_return', async () => {
      await page.locator('#emg').click();
      requireTrue(await page.locator('#emergency').getAttribute('aria-hidden') === 'false', 'Emergency panel hidden');
      requireTrue(await page.evaluate(() => document.activeElement.id) === 'close-emergency', 'Initial emergency focus incorrect');
      await page.keyboard.press('Tab'); requireTrue(await page.evaluate(() => document.activeElement.id) === 'close-emergency', 'Emergency Tab escaped');
      await page.keyboard.press('Shift+Tab'); requireTrue(await page.evaluate(() => document.activeElement.id) === 'close-emergency', 'Emergency Shift+Tab escaped');
      requireTrue(await page.locator('main.deck').getAttribute('inert') !== null, 'Background not inert');
      await page.keyboard.press('Escape'); requireTrue(await page.locator('#emergency').getAttribute('aria-hidden') === 'true', 'Escape did not close modal');
      requireTrue(await page.evaluate(() => document.activeElement.id) === 'emg', 'Focus not returned to emergency control');
      requireTrue(await page.locator('main.deck').getAttribute('inert') === null, 'Background inert not restored');
      return {tabTrap: true, escapeClosed: true, focusReturned: 'emg'};
    });
    await probe('actual_keyboard_native_control_activation', async () => {
      await page.locator('#mode').focus(); const before = await page.locator('#mode').innerText();
      await page.keyboard.press('Enter'); const after = await page.locator('#mode').innerText();
      requireTrue(before !== after, 'Enter did not activate native mode button');
      await page.keyboard.press('Space'); requireTrue(await page.locator('#mode').innerText() === before, 'Space did not activate native mode button');
      return {before, after, enterAndSpaceWorked: true};
    });
    await probe('interactive_widget_feedback_and_narrow_render', async () => {
      // Navigate through actual presentation controls, not a private internal show function.
      for (let clicks = 0; clicks < 40 && await page.locator('.slide.active').getAttribute('data-id') !== 'C02-16'; clicks++) await page.locator('#next').click();
      requireTrue(await page.locator('.slide.active').getAttribute('data-id') === 'C02-16', 'C02-16 was not reached within 40 control clicks');
      await page.locator('.slide.active [data-widget="layout"] button[data-value="grid"]').click();
      const feedback = await page.locator('.slide.active .result').innerText(); requireTrue(feedback.trim().length > 0, 'Layout widget feedback empty');
      await page.screenshot({path: path.join(directory, 'layout-widget-desktop.png'), fullPage: true});
      await page.setViewportSize({width: 320, height: 900});
      requireTrue(await page.locator('.slide.active h2').isVisible(), 'Slide heading absent at narrow width');
      await page.screenshot({path: path.join(directory, 'layout-widget-320.png'), fullPage: true});
      return {feedback, narrowWidth: 320, visualHumanReview: false};
    });
    await probe('no_page_errors_or_network', async () => { requireTrue(!diagnostics.pageErrors.length && !diagnostics.rejectedNetwork.length && !diagnostics.failedRequests.length, 'Browser diagnostics contain failures'); return diagnostics; });
    result.diagnostics = diagnostics;
  }); } catch (error) { checks.push({id: 'c02_setup_or_cleanup', status: 'FAIL', reason: error.message}); }
  result.status = checks.every(c => c.status === 'PASS') ? 'PASS_FINITE_C02_UI_CHECKS' : 'FAIL_C02_UI_CHECKS'; writeJSON(path.join(directory, 'presentation.json'), result); return result;
}
async function ownedS02Server(root, object, output) {
  const cwd = regularWithin(root, object.form), kit = path.join(path.dirname(cwd), 'kit.mjs');
  const env = {...process.env}; delete env.WEBTECH_RC6_ALLOW_COMPATIBILITY; delete env.NODE_OPTIONS; delete env.NODE_PATH;
  const child = spawn(process.execPath, [kit, 'serve'], {cwd: path.resolve(root, object.payload_root), env, stdio: ['ignore', 'pipe', 'pipe']});
  let log = '', origin = null, ended = false; const started = Date.now();
  child.stdout.on('data', chunk => { log += chunk.toString(); }); child.stderr.on('data', chunk => { log += chunk.toString(); });
  const exit = new Promise(resolve => { child.on('error', error => { log += error.message; ended = true; resolve({error: error.message}); }); child.on('exit', (code, signal) => { ended = true; resolve({code, signal}); }); });
  while (!ended && Date.now() - started < 15000) {
    const match = log.match(/^READY (http:\/\/127\.0\.0\.1:\d+)$/m); if (match) { origin = match[1]; break; }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  let stopped = false;
  async function stop() {
    if (stopped) return; stopped = true;
    if (!ended) child.kill('SIGINT');
    let timer; const outcome = await Promise.race([exit, new Promise(resolve => { timer = setTimeout(() => resolve({timedOut: true}), 10000); })]); clearTimeout(timer);
    if (outcome.timedOut && !ended) { child.kill('SIGKILL'); await exit; }
    fs.writeFileSync(path.join(output, 'S02_OWNED_SERVER.log'), log, {flag: 'wx'});
    const report = {kind: 'OWNED_S02_BROWSER_LISTENER', actualNode: process.version, origin, ended, outcome, stoppedNormally: outcome.code === 0 && (log.match(/^STOPPED_OWNED_LISTENER$/gm) || []).length === 1, startupReady: !!origin};
    writeJSON(path.join(output, 'S02_OWNED_SERVER.json'), report);
    if (!report.stoppedNormally) throw Error('Owned S02 listener did not confirm normal shutdown');
  }
  if (!origin) { try { await stop(); } catch {} throw Error('S02 listener READY timeout or early failure: ' + log); }
  return {origin, stop};
}
async function s02Case(browser, name, root, output, object, origin) {
  const directory = path.join(output, name, 'S02-browser-observations'); fs.mkdirSync(directory, {recursive: true});
  const checks = [], result = {kind: 'S02_STARTER_BROWSER_OBSERVATIONS', browser: name, scope: 'Retained unfinished student starter. Its expected finite FAIL is not a completed project or a general pass.', checks};
  async function probe(id, run) { try { checks.push({id, status: 'PASS', actual: await run() ?? null}); } catch (error) { checks.push({id, status: 'FAIL', reason: error.message}); } }
  try { await withContext(browser, origin, async (page, diagnostics) => {
    const browserPage = path.join(path.dirname(regularWithin(root, object.form)), 'BROWSER_CHECKS.html');
    await probe('direct_file_access_truthfully_blocked', async () => {
      await page.goto(pathToFileURL(browserPage).href, {waitUntil: 'load'});
      const source = await page.locator('#report').textContent(), report = JSON.parse(source);
      requireTrue(report.status === 'BLOCKED_BROWSER_OBSERVATIONS' && report.qualification === false && report.grade === null, 'Direct file guard did not preserve scope');
      requireTrue(report.manual.keyboardFocus.status === 'NOT_EXECUTED' && report.manual.reducedMotion.status === 'NOT_EXECUTED', 'Manual observations prefilled');
      return report;
    });
    await page.goto(origin + '/browser-checks.html', {waitUntil: 'load'});
    await page.waitForFunction(() => { try { return !!JSON.parse(document.getElementById('report').textContent).subject; } catch { return false; } });
    for (const width of [320, 768, 1280]) await probe('starter_rendered_observations_' + width, async () => {
      if (await page.locator('#width').inputValue() === String(width)) await page.locator('#run').click();
      else await page.locator('#width').selectOption(String(width));
      await page.waitForFunction(expected => {
        try { const r = JSON.parse(document.getElementById('report').textContent); return r.requestedWidth === expected && !!r.subject; } catch { return false; }
      }, width);
      const report = JSON.parse(await page.locator('#report').textContent());
      requireTrue(report.status === 'FAIL_FINITE_BROWSER_OBSERVATIONS', 'Unfinished starter unexpectedly claims complete finite observations');
      requireTrue(report.subject.innerWidth === width && report.qualification === false && report.grade === null, 'Width or observation scope differs');
      requireTrue(report.automatic.length === 11, 'Expected finite observation set differs');
      const rows = new Map(report.automatic.map(row => [row.id, row]));
      for (const id of ['grid', 'header-flex', 'cards-flex', 'media-ratio', 'identifier-wrap']) requireTrue(rows.get(id)?.status === 'FAIL', 'Missing expected unfinished-target failure: ' + id);
      for (const id of ['viewport', 'body-visible', 'text-and-links', 'unconcealed-content']) requireTrue(rows.get(id)?.status === 'PASS', 'Unexpected protected starter failure: ' + id);
      requireTrue(report.manual.keyboardFocus.status === 'NOT_EXECUTED' && report.manual.reducedMotion.status === 'NOT_EXECUTED', 'Automatic observations changed manual state');
      writeJSON(path.join(directory, 'starter-' + width + '.json'), report);
      await page.screenshot({path: path.join(directory, 'starter-' + width + '.png'), fullPage: true});
      return {width, retainedStarterStatus: report.status, failedRows: report.automatic.filter(r => r.status === 'FAIL').map(r => r.id), manualStatesUnchanged: true};
    });
    await probe('no_unexpected_network_or_page_errors', async () => {
      requireTrue(!diagnostics.rejectedNetwork.length && !diagnostics.pageErrors.length && !diagnostics.failedRequests.length, 'Unexpected browser diagnostics'); return diagnostics;
    }); result.diagnostics = diagnostics;
  }); } catch (error) { checks.push({id: 's02_setup_or_cleanup', status: 'FAIL', reason: error.message}); }
  result.status = checks.every(c => c.status === 'PASS') ? 'PASS_FINITE_S02_STARTER_CHECKS' : 'FAIL_S02_STARTER_CHECKS'; writeJSON(path.join(directory, 'browser-observations.json'), result); return result;
}
async function main() {
  const options = args(process.argv.slice(2));
  const existingAncestor = (() => { let item = options.output; while (!fs.existsSync(item)) item = path.dirname(item); return fs.realpathSync(item); })();
  requireTrue(!contains(options.input, options.output) && !contains(options.input, existingAncestor), 'Report directory must be outside the entire extracted collection');
  requireTrue(!fs.existsSync(options.output), 'Use a new report directory; existing evidence is not overwritten');
  fs.mkdirSync(options.output, {recursive: true});
  const summary = {schema: SCHEMA, startedAt: new Date().toISOString(), actualNode: process.version, expectedNode: REQUIRED_NODE, expectedPlaywright: REQUIRED_PLAYWRIGHT, inputRoot: options.input, scope: SCOPE, qualification: 'NOT_FINAL', qualificationGatesUpdated: false, nativePlatformsQualified: false, manualBrowserQualified: false, pdfScope: 'Chromium headless print-layout only; no native Save as PDF dialogue or human legibility acceptance', browsers: [], results: [], status: 'INCOMPLETE', failures: []};
  let exitCode = 1, owned = null, beforeInventory = null;
  const deadline = Date.now() + MAX_SCHEDULE_MS;
  const requireBudget = () => requireTrue(Date.now() < deadline, 'BROWSER_STAGE_TIME_BUDGET_EXHAUSTED: further cases were not scheduled');
  summary.schedulingBudgetMilliseconds = MAX_SCHEDULE_MS;
  try {
    requireTrue(process.version === REQUIRED_NODE, 'STOP_REFERENCE_NODE: expected ' + REQUIRED_NODE + ', observed ' + process.version);
    const moduleLocation = options.playwrightModule || 'playwright';
    const pw = require(moduleLocation); const packageVersion = require(options.playwrightModule ? path.join(options.playwrightModule, 'package.json') : 'playwright/package.json').version;
    summary.playwrightModuleLocation = options.playwrightModule || 'local package dependency';
    requireTrue(packageVersion === REQUIRED_PLAYWRIGHT, 'STOP_PLAYWRIGHT_VERSION: observed ' + packageVersion); summary.actualPlaywright = packageVersion;
    const collectionPath = regularWithin(options.input, 'CLASSROOM_COLLECTION.json'), collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
    beforeInventory = inventory(options.input); writeJSON(path.join(options.output, 'INPUT_INVENTORY_BEFORE.json'), beforeInventory);
    requireTrue(collection.distribution_version === '3.0.0-rc.10-local.3', 'Wrong collection version'); summary.collectionSha256 = sha(collectionPath);
    const forms = collection.objects.filter(object => /^S(?:0[1-9]|1[0-4])$/.test(object.object_id)).sort((a, b) => a.object_id.localeCompare(b.object_id));
    requireTrue(forms.length === 14 && new Set(forms.map(o => o.object_id)).size === 14, 'Expected exactly S01-S14');
    const s02 = forms.find(o => o.object_id === 'S02'), c02 = collection.objects.find(o => o.object_id === 'C02');
    requireTrue(!!c02, 'C02 missing'); owned = await ownedS02Server(options.input, s02, options.output); summary.ownedS02Origin = owned.origin;
    for (const name of ['chromium', 'firefox']) {
      let browser;
      try {
        requireBudget();
        browser = await pw[name].launch({headless: true, timeout: 30000}); summary.browsers.push({name, version: browser.version(), launched: true});
        for (const form of forms) { requireBudget(); console.log(name + ' ' + form.object_id); summary.results.push(await formCase(browser, name, options.input, options.output, form)); }
        requireBudget(); summary.results.push(await c02Case(browser, name, options.input, options.output, c02));
        requireBudget(); summary.results.push(await s02Case(browser, name, options.input, options.output, s02, owned.origin));
      } catch (error) { summary.failures.push({browser: name, reason: error.message}); summary.browsers.push({name, launched: false, reason: error.message}); }
      finally { if (browser) await browser.close(); }
    }
    requireTrue(summary.results.length === 32 && summary.results.every(r => r.status.startsWith('PASS_')) && summary.failures.length === 0, 'One or more finite automated browser cases failed or did not execute');
    summary.status = 'PASS_FINITE_AUTOMATED_BROWSER_CHECKS'; exitCode = 0;
  } catch (error) { summary.failures.push({reason: error.message}); summary.status = 'FAIL_AUTOMATED_BROWSER_CHECKS'; if (process.version !== REQUIRED_NODE || !summary.actualPlaywright) exitCode = 2; }
  finally {
    if (owned) try { await owned.stop(); } catch (error) { summary.failures.push({reason: error.message}); summary.status = 'FAIL_AUTOMATED_BROWSER_CHECKS'; exitCode = 1; }
    if (beforeInventory) {
      try {
        const afterInventory = inventory(options.input); writeJSON(path.join(options.output, 'INPUT_INVENTORY_AFTER.json'), afterInventory);
        summary.inputPreservation = {beforeDigest: beforeInventory.digest, afterDigest: afterInventory.digest, fileCount: afterInventory.fileCount, exact: same(beforeInventory, afterInventory)};
        if (!summary.inputPreservation.exact) throw Error('Extracted collection changed during browser stage');
      } catch (error) { summary.failures.push({reason: error.message}); summary.status = 'FAIL_AUTOMATED_BROWSER_CHECKS'; exitCode = 1; }
    }
    summary.endedAt = new Date().toISOString(); summary.exitCode = exitCode; summary.passedChecks = summary.results.reduce((n, r) => n + r.checks.filter(c => c.status === 'PASS').length, 0); summary.failedChecks = summary.results.reduce((n, r) => n + r.checks.filter(c => c.status === 'FAIL').length, 0);
    writeJSON(path.join(options.output, 'BROWSER_CHECKS.json'), summary);
    console.log(summary.status + '; qualification NOT_FINAL; no gates updated.');
  }
  process.exitCode = exitCode;
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 2; });
module.exports = {args, contains, normalisedImport, syntheticRecord};
