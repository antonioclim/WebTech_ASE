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
const PREPARED_TRANCHE = 7;
const FINAL_PHASE_SCOPE = 'T07_GLOBAL_INTEGRATION_AND_PUBLICATION';
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

const WINDOWS_DISTRIBUTION_STATUS = 'QUALIFIED_WINDOWS_SOURCE_NOT_PUBLISHED';
const WINDOWS_TECHNICAL_QUALIFICATION = 'PASS_DECLARED_WINDOWS_PROFILE_WITH_LIMITS';
const PUBLICATION_PROFILE = 'metadata/PUBLICATION_PROFILE.json';
const WINDOWS_PROFILE_ID = 'windows-observed-v4.0.0';
const PUBLISHED_RELEASE = 'metadata/PUBLISHED_RELEASE.json';
const PORTAL_MARKERS = {"published_release":"metadata/PUBLISHED_RELEASE.json","portal_state":"POSTPUBLICATION_PORTAL_SOURCE","portal_commit":"RECORDED_EXTERNALLY_AFTER_OWNER_COMMIT"};
const PORTAL_QUALIFICATION_SCOPE = "Postpublication portal source only. The separately verified offline release record identifies published v4.0.0 at its fixed source; this later source is not a replacement archive or publication-eligible copy. This check verifies bytes and retained record facts, performs no live GitHub query and does not reexecute browser, native, learner or human acceptance.";
const PORTAL_PUBLICATION_SCOPE = "published=false describes this current source copy, not availability of the separately recorded published v4.0.0 release.";
// Fixed publication observations retained offline; no live GitHub request is made.
const PUBLISHED_RELEASE_CONTRACT = {"schema":"webtech-published-release/v1","status":"PUBLISHED_V4_0_0_DECLARED_WINDOWS_PROFILE","version":"4.0.0","release_id":409107590,"tag":"v4.0.0","release_url":"https://github.com/antonioclim/WebTech_ASE/releases/tag/v4.0.0","draft":false,"prerelease":false,"published":true,"published_at_utc":"2026-10-10T17:56:35Z","source_commit":"f86668d6784e1b97b9057ae2e2080113efce45e3","source_tree":"773ef0725c7b4d7f01888ed2b7a95784d2b4d8c1","source_repository_package_id":"f7a74a10b456134a45fd1e306c0ee2e660a9871e0ff23be7874abaf1a82d6e97","source_files":1728,"distribution_package_id":"e1eae003ec1bbebec36f59e6885af69086722788893d65e638a02e305489063e","distribution_files":1719,"archive_sha256":"3fe88aa7d4c033110fc7e2aade270e3ebeac8c48a5668f057ee4dc93250c51e5","build_receipt_sha256":"a3a031a366a27579cd7fa538aaed66ecd5d360c93257a4e4c3dd75a9db3ec503","profile_id":"windows-observed-v4.0.0","technical_qualification":"PASS_DECLARED_WINDOWS_PROFILE_WITH_LIMITS","qualificationVerdict":"NOT_FINAL","native_acceptance":false,"macOS":"NOT_EXECUTED_NOT_QUALIFIED","publication_performed_by_owner":true,"latest_observed":true,"GitHub_immutable_observed":false,"observed_at_utc":"2026-10-10T18:11:17.765Z","assets":[{"id":628606228,"name":"BUILD_RECEIPT.json","state":"uploaded","size":22669,"digest":"sha256:a3a031a366a27579cd7fa538aaed66ecd5d360c93257a4e4c3dd75a9db3ec503","browser_download_url":"https://github.com/antonioclim/WebTech_ASE/releases/download/v4.0.0/BUILD_RECEIPT.json"},{"id":628606259,"name":"FILES_MANIFEST.txt","state":"uploaded","size":220031,"digest":"sha256:e1eae003ec1bbebec36f59e6885af69086722788893d65e638a02e305489063e","browser_download_url":"https://github.com/antonioclim/WebTech_ASE/releases/download/v4.0.0/FILES_MANIFEST.txt"},{"id":628606322,"name":"WEBTECH_ASE_EN_GB_CLASSROOM_v4.0.0.zip","state":"uploaded","size":5131965,"digest":"sha256:3fe88aa7d4c033110fc7e2aade270e3ebeac8c48a5668f057ee4dc93250c51e5","browser_download_url":"https://github.com/antonioclim/WebTech_ASE/releases/download/v4.0.0/WEBTECH_ASE_EN_GB_CLASSROOM_v4.0.0.zip"},{"id":628606377,"name":"WEBTECH_ASE_EN_GB_CLASSROOM_v4.0.0.zip.sha256","state":"uploaded","size":105,"digest":"sha256:b158b1795a3a5f7eeef1631264e1585f4752077b16bc08edb39d258c7dfe6057","browser_download_url":"https://github.com/antonioclim/WebTech_ASE/releases/download/v4.0.0/WEBTECH_ASE_EN_GB_CLASSROOM_v4.0.0.zip.sha256"}],"verification":{"scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__","binary_redownload":false,"notes_match_after_line_ending_normalisation":true,"local_classroom_builds":2,"four_assets_byte_identical_across_builds":true,"fresh_extraction_checks":"PASS_STRICT_PYTHON_AND_NODE_INITIAL_BYTES_STATIC_ROUTES_ONLY","fresh_extraction_receipt_sha256":"092dcd5818886a46395debf1c5b99d9a423c7d68f4e08df5add49638f5d0214b","publication_audit_sha256":"726f005570ccfa4c02d794d78a71e8b9e5148968e5ef15824e1038ac58a51db4","limits":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"frozen_RC1":{"tag":"v4.0.0-rc.1","release_id":408264000,"source_commit":"23803fdaf5987384b86104bbaf0a8d293654aa0e","four_original_asset_identities_preserved":true,"scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"portal_relationship":{"state":"POSTPUBLICATION_PORTAL_SOURCE","release_source_is_fixed":true,"portal_commit":"RECORDED_EXTERNALLY_AFTER_OWNER_COMMIT","scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"preservation_policy":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"};
// Approved retained observation contracts; this verifier does not reexecute them.
const WINDOWS_PROFILE_CONTRACT = {"schema":"webtech-publication-profile/v1","profile_id":"windows-observed-v4.0.0","final_target_version":"4.0.0","distribution_status":"QUALIFIED_WINDOWS_SOURCE_NOT_PUBLISHED","technical_qualification":"PASS_DECLARED_WINDOWS_PROFILE_WITH_LIMITS","qualificationVerdict":"NOT_FINAL","native_acceptance":false,"publication_qualified":true,"publication_qualification_scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__","published":false,"owner_decision":{"timestamp":"2026-10-10T18:54:13+03:00","scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__","commits_and_Actions":"Owner only","support_decision_basis":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"observed_environment":{"platform":"Windows","architecture":"x64","PowerShell":"5.1.26100.9549","Node":"v24.21.0","browser":"Edge 155.0.4283.45","scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"source_reuse_binding":{"committed_base":"f6bfd409b50560db6e3e63bb9b127488f4bfb67c","committed_base_tree":"1206fcc2f5e5ba18ff0d69fae451f37678cee35a","committed_base_repository_package_id":"b98413caba38a59a2364ed79d695777d5b8e8cfdcc3b16e04309e6a9b844799f","browser_tested_repository_package_id":"75877f364e5c9573cd3c220af938c8450a4561c3a70b582c6dec307eb5d90fb2","browser_candidate_base_commit":"6803fbab10219c2880453a3be0744fb2f204c1a6","all_30_unit_bytes_preserved":true,"preserved_unit_identities":{"C01":"a8f44b39dfac234c515e61d816288b09a1c7154368cf5ad2e5f62ce2e7abc3f1","C02":"7d690c0ee941eaed04de3504292f5992d7e5b65ba6ecfe87bee4650bbcf8eb20","C03":"5eafff82c8a67efa50a56edc6bfc239ac8fe699bb69129c5e19788386fc64f9f","C04":"24cd969c706fd29a910b4c68c18acc8c8ec1cad1dd1da230c6813560249d3dc3","C05":"72973f044d1b031761a96295f53f9dd328e557f6017169a8266f75727d553161","C06":"049e79a294d2150b760f18f28cd95e0565b37b2cec2e06e121719821edfa4e5b","C07":"d37a3f3c0546827aa14975020d2444ab5411b81f95d86115372686dc3852a664","C08":"8e48122304b7ec01c107aeae8d811d16f6cd9e5a2136afdc8c446f0b4bfdfaea","C09":"d9b61059cef316b17c043261dca78b911a5e94de5933fff00dd85662a6578d10","C10":"858f8cf474bbafd41e3f080092b43c9fa2708780c9211795363ecbdf21db438a","C11":"d2149be7e231ac6268a5b071cd2a09e35e2ddcffc0bb1af794681a8bdb61991b","C12":"4b5ff44f870a01b4204f2bfcd89f55607e542b829d5c0eca8d664ad62b4641b7","C13":"b6ba730e54e30a9ffb3c460b3806f68b8412946710daf727474b98e0258f3b3d","C14":"3d41db187790fd768f288a8d11b394db5f749ba02a6094002676b606310f49be","S01":"4889e64304b49b27ffde1e027c726a34cb4227783c7bc085348f406a796e524f","S02":"13f1ae7cee1e12b386982044359811eb44c76f5ee2b94e9170c89b5061121b18","S03":"fbdfcdddb3515cc91a5d246618079f91688a7bc62c5e5ff00d9b40376f485044","S04":"b64b458aabd8d847132e40007a319197d6f458d055e959a794981a48cbd19f1e","S05":"c6972379b0f9e0951e30f14c9538a046f1dd3732c65ace0ca9be281d08f02870","S06":"f8e1d3c663288761a69f28b57ddad3cb3179803f920741eec6b284a57d790086","S07":"4579bf280e5ee766c1595a0b4025488292705c29327f1fcd4fe174245c7accaf","S08":"16b6ca06fb8812b92f6b61ff8bfa2705a66fada036fa0a5d3821e7226c76a40d","S09":"b039b19c616c749e9c6bbe028275a207205f3b29774fa1143772cdd1914380ce","S10":"94e2c5c308eb311014384a426063027c5ac71f7d0a9c37d8ebe927992d5b1784","S11":"01c2a471c3a86fe79446c09567038ea96af26cabfb3cf19803a5e04b9a4dfc6a","S12":"40609bf1a86653676bdeb0412aff3ee90d38185047500f6f6994116f84a530c5","S13":"51fb29db5a9d21ae4886b80fd1ab5c484ab5b02858d9f78885596c5787c89c70","S14":"957c61416e0928cdae592314835958245daf859c890bcfd755523a04a1aa8c2c","SETUP_MACOS_LINUX":"a5327a1a753495494f83ef848453a8d62377b932ee133525d14323a1e6b003d1","SETUP_WINDOWS":"dc3b41f3722be6dd7bec20ba7bdc15d50a41ba1b6faf4bd9da384b7f4cfd7ae7"},"reuse_scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__","current_source_identity":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"evidence_identities":{"browser_archive_sha256":"3bc103349b8a3276cd8004fe0008b0142a9fa7b97038056eff812f025be63890","browser_receipt_sha256":"913402335578f1daf52230cfd6423e272ed6344635eef2442595b1447b4411a5","committed_source_audit_sha256":"1c283f1621b264d6321aca5cb0d50550c228a90bc1c7aa4d035b1acccc55b468","independent_portal_diagnostics_audit_sha256":"b19fecd2d3f0f89441b8010bf3752f686ff27bd236c1a89290fc40236fa1a2f6","independent_forms_and_mechanisms_audit_sha256":"9a1edab8305f20f1ff0d92680ac34442f7d2ff61aa01c9c355173811d7b644a7","independent_pdf_text_geometry_audit_sha256":"e2bb994d1c1b0e994bf0700e291350fde8869ea2c8e7fb23ed1f8d9697bc4cdd","independent_pdf_visual_audit_sha256":"869ae6b827774b48b0fcb8b1a4928bb41259fe57b286b31cc95114f174356b88"},"declared_technical_observations":{"committed_source_integrity":{"state":"PASS_EXACT_COMMITTED_BASE","source_files":1726,"units":30,"required_projects":40,"unfinished_learner_targets":38},"windows_preflight":{"state":"PASS_SELECTED_WITH_WARNINGS","profiles":["node","http","sqlite"],"outer_status":"ENV_WARN","exit_codes":[0,0,0],"inner_status":"ENV_OK","windows_setup_package_id":"dc3b41f3722be6dd7bec20ba7bdc15d50a41ba1b6faf4bd9da384b7f4cfd7ae7"},"windows_course_runtime":{"state":"PASS_SELECTED_WITH_OUTPUT_ENCODING_LIMIT","canonical_examples":57,"courses":13,"outer_exit_zero_checks":17,"owned_cleanups":21},"headless_browser":{"state":"PASS_SCOPED_AUTOMATED_BROWSER_BATCH","checks":334,"passed":334,"failed":0,"portal_checks":88,"form_checks":233,"native_browser_mechanism_cases":6},"json_drafts":{"state":"PASS_SELECTED_DOWNLOAD_IMPORT_VALIDATION","actual_downloaded_records":14},"headless_pdf":{"state":"PASS_SCOPED_HEADLESS_SYNTHETIC_DRAFTS","files":15,"pages":201},"owner_saved_native_pdf":{"state":"PASS_SELECTED_SHORT_MARKER_DRAFTS","units":["S01","S03","S14"],"distinct_pages":36}},"retained_limits":{"environmentAcceptance":false,"known_environment_blocked_requests":127,"unexpected_v2_errors":0,"CSP_v2_diagnostics":0,"environment_interference":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__","native_print":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__","accessibility":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__","runtime":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__","learner_evidence":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"unqualified_scopes":{"macOS":{"state":"NOT_EXECUTED_NOT_QUALIFIED","scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"Linux":{"state":"SCOPED_OBSERVATIONS_ONLY_NOT_PLATFORM_QUALIFIED","scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"other_Windows_architectures_and_versions":{"state":"NOT_QUALIFIED_BY_THIS_PROFILE","scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"native_Microsoft_Word":{"state":"NOT_EXECUTED","scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"live_Moodle":{"state":"PENDING_EXTERNAL","scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"novice_pilot":{"state":"PENDING_HUMAN","scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"owner_pedagogic_acceptance":{"state":"PENDING_HUMAN","scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"}},"final_bindings":{"status":"PENDING_EXACT_BINDING","source_commit":null,"source_tree":null,"source_repository_package_id":null,"distribution_package_id":null,"build_receipt_sha256":null,"archive_sha256":null,"fresh_extraction_receipt_sha256":null,"tag":"v4.0.0","tag_commit":null,"asset_digests":null,"publication_performed":false,"required_process":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"broad_gate_scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__","frozen_RC1":{"tag":"v4.0.0-rc.1","source_commit":"23803fdaf5987384b86104bbaf0a8d293654aa0e","assets":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"}};
const CURRENT_QUALIFICATION_CONTRACT = {"schema":"webtech-current-scoped-qualification/v1","recorded_utc":"2026-10-10T15:32:52.164309+00:00","final_target_version":"4.0.0","qualificationVerdict":"NOT_FINAL","native_acceptance":false,"publication_qualified":true,"published":false,"status_scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__","record_scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__","source_binding":{"committed_base":"f6bfd409b50560db6e3e63bb9b127488f4bfb67c","committed_base_tree":"1206fcc2f5e5ba18ff0d69fae451f37678cee35a","committed_base_repository_package_id":"b98413caba38a59a2364ed79d695777d5b8e8cfdcc3b16e04309e6a9b844799f","committed_base_files":1726,"browser_tested_repository_package_id":"75877f364e5c9573cd3c220af938c8450a4561c3a70b582c6dec307eb5d90fb2","browser_candidate_source_commit":null,"browser_candidate_base_commit":"6803fbab10219c2880453a3be0744fb2f204c1a6","browser_tested_copy_state":"UNCOMMITTED_LOCAL_CANDIDATE","committed_post_browser_differences":["00_START_HERE/QUALIFICATION.html","CHANGELOG.md","metadata/current-integrity/REPOSITORY_PACKAGE_ID.txt","metadata/current-integrity/REPOSITORY_SHA256SUMS.txt"],"this_record_state":"UNCOMMITTED_WINDOWS_PUBLICATION_PROFILE_SOURCE_CANDIDATE","current_copy_identity":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__","binding_limit":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"evidence_identities":{"browser_archive_sha256":"3bc103349b8a3276cd8004fe0008b0142a9fa7b97038056eff812f025be63890","browser_receipt_sha256":"913402335578f1daf52230cfd6423e272ed6344635eef2442595b1447b4411a5","committed_source_audit_sha256":"1c283f1621b264d6321aca5cb0d50550c228a90bc1c7aa4d035b1acccc55b468","independent_portal_diagnostics_audit_sha256":"b19fecd2d3f0f89441b8010bf3752f686ff27bd236c1a89290fc40236fa1a2f6","independent_forms_and_mechanisms_audit_sha256":"9a1edab8305f20f1ff0d92680ac34442f7d2ff61aa01c9c355173811d7b644a7","independent_pdf_text_geometry_audit_sha256":"e2bb994d1c1b0e994bf0700e291350fde8869ea2c8e7fb23ed1f8d9697bc4cdd","independent_pdf_visual_audit_sha256":"869ae6b827774b48b0fcb8b1a4928bb41259fe57b286b31cc95114f174356b88"},"scoped_checks":{"committed_source_integrity":{"state":"PASS_EXACT_COMMITTED_SOURCE","units":30,"required_microprojects":40,"editable_unfinished_targets":38,"method":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"native_windows_preflight":{"state":"PASS_SELECTED_WITH_WARNINGS","PowerShell":"5.1.26100.9549","Node":"v24.21.0","observed_source_repository_package_id":"46b65b3c864ef34d867abd88606838100f6edcfd7b0e32b91b0df18c97c52de3","profiles":["node","http","sqlite"],"outer_status":"ENV_WARN","outer_exit_codes":[0,0,0],"inner_capability_status":"ENV_OK","windows_setup_package_id":"dc3b41f3722be6dd7bec20ba7bdc15d50a41ba1b6faf4bd9da384b7f4cfd7ae7","windows_setup_bytes_preserved_in_committed_base":true,"limits":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"native_windows_course_runtime":{"state":"PASS_SELECTED_WITH_OUTPUT_ENCODING_LIMIT","Node":"v24.21.0","canonical_examples":57,"courses":13,"outer_exit_zero_checks":17,"owned_temporary_cleanups":21,"limits":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"owner_headless_browser_v2":{"state":"PASS_SCOPED_AUTOMATED_BROWSER_BATCH","platform":"Windows","browser":"Edge 155.0.4283.45","Node":"v24.21.0","checks":334,"passed":334,"failed":0,"portal_checks":88,"form_checks":233,"actual_downloaded_json_records":14,"native_browser_mechanism_cases":["C02_NATIVE_KEYBOARD_ROUTE","C02_ACTUAL_REDUCED_MOTION_TWO_STATES","C13_NATIVE_STORAGE_VALID_AND_MALFORMED","C13_NATIVE_WORKER_STRUCTURED_CLONE_REPLY","C13_NATIVE_SERVICE_WORKER_LIFECYCLE_AND_MESSAGES","C13_OWNED_SERVICE_WORKER_REGISTRATION_CLEANUP"],"unexpected_errors":0,"CSP_diagnostics":0,"known_environment_blocked_requests":127,"environment_interference":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__","environmentAcceptance":false,"cleanup":{"tested_source_unchanged":true,"owned_browser_exited":true,"owned_profile_removed":true},"limits":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"owner_headless_pdf_v2":{"state":"PASS_SCOPED_HEADLESS_SYNTHETIC_DRAFTS","files":15,"pages":201,"glyphs":136809,"out_of_page_glyphs":0,"missing_page_clipping_or_overlap_observed":false,"review":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__","limits":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"owner_saved_native_draft_pdfs":{"state":"PASS_SELECTED_SHORT_MARKER_DRAFTS","units":["S01","S03","S14"],"pages_by_unit":{"S01":4,"S03":15,"S14":17},"distinct_pages":36,"pdf_sha256_by_unit":{"S01":"b39dba9354fc0f2bf7ccee544d81aaf8220bdb8ce58af92fd0cb419c1d25eaca","S03":"4ad34d362db5af004b9e8243e135cd17510aa736780bfed0bdba14f430012c4c","S14":"8f03f6a49561fbf7d229c7059c4bf285f2bf9fefda79eda5568fe6f79d65e0c8"},"limits":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"optional_word_references":{"state":"PASS_LINUX_RENDER_QA_WITH_PRESENTATION_WARNINGS_AND_NATIVE_LIMIT","files":30,"pages":187,"presentation_warnings":38,"renderer":"LibreOffice on Linux","native_Microsoft_Word_execution":"NOT_EXECUTED","limits":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"}},"remaining_observations":{"native_macos":{"state":"NOT_EXECUTED_NOT_QUALIFIED","macos_linux_setup_package_id":"a5327a1a753495494f83ef848453a8d62377b932ee133525d14323a1e6b003d1","scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"live_moodle":{"state":"PENDING_EXTERNAL","scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"novice_teaching_pilot":{"state":"PENDING_HUMAN","scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"owner_pedagogic_acceptance":{"state":"PENDING_HUMAN","scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"},"final_distribution_and_publication":{"state":"PENDING_SEPARATE_EXACT_RECEIPTS","scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"}},"broad_gate_interpretation":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__","history_preservation":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__","assistant_operations":{"commits_created":false,"Actions_started":false,"remote_publication_performed":false,"software_installed":false},"distribution_status":"QUALIFIED_WINDOWS_SOURCE_NOT_PUBLISHED","technical_qualification":"PASS_DECLARED_WINDOWS_PROFILE_WITH_LIMITS","publication_profile":"metadata/PUBLICATION_PROFILE.json","publication_qualification_scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__","profile_decision":{"timestamp":"2026-10-10T18:54:13+03:00","profile_id":"windows-observed-v4.0.0","scope":"__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__"}};
const ACCEPTED_UNIT_IDENTITIES = {"C01":"a8f44b39dfac234c515e61d816288b09a1c7154368cf5ad2e5f62ce2e7abc3f1","C02":"7d690c0ee941eaed04de3504292f5992d7e5b65ba6ecfe87bee4650bbcf8eb20","C03":"5eafff82c8a67efa50a56edc6bfc239ac8fe699bb69129c5e19788386fc64f9f","C04":"24cd969c706fd29a910b4c68c18acc8c8ec1cad1dd1da230c6813560249d3dc3","C05":"72973f044d1b031761a96295f53f9dd328e557f6017169a8266f75727d553161","C06":"049e79a294d2150b760f18f28cd95e0565b37b2cec2e06e121719821edfa4e5b","C07":"d37a3f3c0546827aa14975020d2444ab5411b81f95d86115372686dc3852a664","C08":"8e48122304b7ec01c107aeae8d811d16f6cd9e5a2136afdc8c446f0b4bfdfaea","C09":"d9b61059cef316b17c043261dca78b911a5e94de5933fff00dd85662a6578d10","C10":"858f8cf474bbafd41e3f080092b43c9fa2708780c9211795363ecbdf21db438a","C11":"d2149be7e231ac6268a5b071cd2a09e35e2ddcffc0bb1af794681a8bdb61991b","C12":"4b5ff44f870a01b4204f2bfcd89f55607e542b829d5c0eca8d664ad62b4641b7","C13":"b6ba730e54e30a9ffb3c460b3806f68b8412946710daf727474b98e0258f3b3d","C14":"3d41db187790fd768f288a8d11b394db5f749ba02a6094002676b606310f49be","S01":"4889e64304b49b27ffde1e027c726a34cb4227783c7bc085348f406a796e524f","S02":"13f1ae7cee1e12b386982044359811eb44c76f5ee2b94e9170c89b5061121b18","S03":"fbdfcdddb3515cc91a5d246618079f91688a7bc62c5e5ff00d9b40376f485044","S04":"b64b458aabd8d847132e40007a319197d6f458d055e959a794981a48cbd19f1e","S05":"c6972379b0f9e0951e30f14c9538a046f1dd3732c65ace0ca9be281d08f02870","S06":"f8e1d3c663288761a69f28b57ddad3cb3179803f920741eec6b284a57d790086","S07":"4579bf280e5ee766c1595a0b4025488292705c29327f1fcd4fe174245c7accaf","S08":"16b6ca06fb8812b92f6b61ff8bfa2705a66fada036fa0a5d3821e7226c76a40d","S09":"b039b19c616c749e9c6bbe028275a207205f3b29774fa1143772cdd1914380ce","S10":"94e2c5c308eb311014384a426063027c5ac71f7d0a9c37d8ebe927992d5b1784","S11":"01c2a471c3a86fe79446c09567038ea96af26cabfb3cf19803a5e04b9a4dfc6a","S12":"40609bf1a86653676bdeb0412aff3ee90d38185047500f6f6994116f84a530c5","S13":"51fb29db5a9d21ae4886b80fd1ab5c484ab5b02858d9f78885596c5787c89c70","S14":"957c61416e0928cdae592314835958245daf859c890bcfd755523a04a1aa8c2c","SETUP_MACOS_LINUX":"a5327a1a753495494f83ef848453a8d62377b932ee133525d14323a1e6b003d1","SETUP_WINDOWS":"dc3b41f3722be6dd7bec20ba7bdc15d50a41ba1b6faf4bd9da384b7f4cfd7ae7"};
// Full per-code-point case folding preserves the original Python namespace guard.
const CASE_FOLDS = {"\u00b5":"\u03bc","\u00df":"ss","\u0149":"\u02bcn","\u017f":"s","\u01f0":"j\u030c","\u0345":"\u03b9","\u0390":"\u03b9\u0308\u0301","\u03b0":"\u03c5\u0308\u0301","\u03c2":"\u03c3","\u03d0":"\u03b2","\u03d1":"\u03b8","\u03d5":"\u03c6","\u03d6":"\u03c0","\u03f0":"\u03ba","\u03f1":"\u03c1","\u03f5":"\u03b5","\u0587":"\u0565\u0582","\u13a0":"\u13a0","\u13a1":"\u13a1","\u13a2":"\u13a2","\u13a3":"\u13a3","\u13a4":"\u13a4","\u13a5":"\u13a5","\u13a6":"\u13a6","\u13a7":"\u13a7","\u13a8":"\u13a8","\u13a9":"\u13a9","\u13aa":"\u13aa","\u13ab":"\u13ab","\u13ac":"\u13ac","\u13ad":"\u13ad","\u13ae":"\u13ae","\u13af":"\u13af","\u13b0":"\u13b0","\u13b1":"\u13b1","\u13b2":"\u13b2","\u13b3":"\u13b3","\u13b4":"\u13b4","\u13b5":"\u13b5","\u13b6":"\u13b6","\u13b7":"\u13b7","\u13b8":"\u13b8","\u13b9":"\u13b9","\u13ba":"\u13ba","\u13bb":"\u13bb","\u13bc":"\u13bc","\u13bd":"\u13bd","\u13be":"\u13be","\u13bf":"\u13bf","\u13c0":"\u13c0","\u13c1":"\u13c1","\u13c2":"\u13c2","\u13c3":"\u13c3","\u13c4":"\u13c4","\u13c5":"\u13c5","\u13c6":"\u13c6","\u13c7":"\u13c7","\u13c8":"\u13c8","\u13c9":"\u13c9","\u13ca":"\u13ca","\u13cb":"\u13cb","\u13cc":"\u13cc","\u13cd":"\u13cd","\u13ce":"\u13ce","\u13cf":"\u13cf","\u13d0":"\u13d0","\u13d1":"\u13d1","\u13d2":"\u13d2","\u13d3":"\u13d3","\u13d4":"\u13d4","\u13d5":"\u13d5","\u13d6":"\u13d6","\u13d7":"\u13d7","\u13d8":"\u13d8","\u13d9":"\u13d9","\u13da":"\u13da","\u13db":"\u13db","\u13dc":"\u13dc","\u13dd":"\u13dd","\u13de":"\u13de","\u13df":"\u13df","\u13e0":"\u13e0","\u13e1":"\u13e1","\u13e2":"\u13e2","\u13e3":"\u13e3","\u13e4":"\u13e4","\u13e5":"\u13e5","\u13e6":"\u13e6","\u13e7":"\u13e7","\u13e8":"\u13e8","\u13e9":"\u13e9","\u13ea":"\u13ea","\u13eb":"\u13eb","\u13ec":"\u13ec","\u13ed":"\u13ed","\u13ee":"\u13ee","\u13ef":"\u13ef","\u13f0":"\u13f0","\u13f1":"\u13f1","\u13f2":"\u13f2","\u13f3":"\u13f3","\u13f4":"\u13f4","\u13f5":"\u13f5","\u13f8":"\u13f0","\u13f9":"\u13f1","\u13fa":"\u13f2","\u13fb":"\u13f3","\u13fc":"\u13f4","\u13fd":"\u13f5","\u1c80":"\u0432","\u1c81":"\u0434","\u1c82":"\u043e","\u1c83":"\u0441","\u1c84":"\u0442","\u1c85":"\u0442","\u1c86":"\u044a","\u1c87":"\u0463","\u1c88":"\ua64b","\u1e96":"h\u0331","\u1e97":"t\u0308","\u1e98":"w\u030a","\u1e99":"y\u030a","\u1e9a":"a\u02be","\u1e9b":"\u1e61","\u1e9e":"ss","\u1f50":"\u03c5\u0313","\u1f52":"\u03c5\u0313\u0300","\u1f54":"\u03c5\u0313\u0301","\u1f56":"\u03c5\u0313\u0342","\u1f80":"\u1f00\u03b9","\u1f81":"\u1f01\u03b9","\u1f82":"\u1f02\u03b9","\u1f83":"\u1f03\u03b9","\u1f84":"\u1f04\u03b9","\u1f85":"\u1f05\u03b9","\u1f86":"\u1f06\u03b9","\u1f87":"\u1f07\u03b9","\u1f88":"\u1f00\u03b9","\u1f89":"\u1f01\u03b9","\u1f8a":"\u1f02\u03b9","\u1f8b":"\u1f03\u03b9","\u1f8c":"\u1f04\u03b9","\u1f8d":"\u1f05\u03b9","\u1f8e":"\u1f06\u03b9","\u1f8f":"\u1f07\u03b9","\u1f90":"\u1f20\u03b9","\u1f91":"\u1f21\u03b9","\u1f92":"\u1f22\u03b9","\u1f93":"\u1f23\u03b9","\u1f94":"\u1f24\u03b9","\u1f95":"\u1f25\u03b9","\u1f96":"\u1f26\u03b9","\u1f97":"\u1f27\u03b9","\u1f98":"\u1f20\u03b9","\u1f99":"\u1f21\u03b9","\u1f9a":"\u1f22\u03b9","\u1f9b":"\u1f23\u03b9","\u1f9c":"\u1f24\u03b9","\u1f9d":"\u1f25\u03b9","\u1f9e":"\u1f26\u03b9","\u1f9f":"\u1f27\u03b9","\u1fa0":"\u1f60\u03b9","\u1fa1":"\u1f61\u03b9","\u1fa2":"\u1f62\u03b9","\u1fa3":"\u1f63\u03b9","\u1fa4":"\u1f64\u03b9","\u1fa5":"\u1f65\u03b9","\u1fa6":"\u1f66\u03b9","\u1fa7":"\u1f67\u03b9","\u1fa8":"\u1f60\u03b9","\u1fa9":"\u1f61\u03b9","\u1faa":"\u1f62\u03b9","\u1fab":"\u1f63\u03b9","\u1fac":"\u1f64\u03b9","\u1fad":"\u1f65\u03b9","\u1fae":"\u1f66\u03b9","\u1faf":"\u1f67\u03b9","\u1fb2":"\u1f70\u03b9","\u1fb3":"\u03b1\u03b9","\u1fb4":"\u03ac\u03b9","\u1fb6":"\u03b1\u0342","\u1fb7":"\u03b1\u0342\u03b9","\u1fbc":"\u03b1\u03b9","\u1fbe":"\u03b9","\u1fc2":"\u1f74\u03b9","\u1fc3":"\u03b7\u03b9","\u1fc4":"\u03ae\u03b9","\u1fc6":"\u03b7\u0342","\u1fc7":"\u03b7\u0342\u03b9","\u1fcc":"\u03b7\u03b9","\u1fd2":"\u03b9\u0308\u0300","\u1fd3":"\u03b9\u0308\u0301","\u1fd6":"\u03b9\u0342","\u1fd7":"\u03b9\u0308\u0342","\u1fe2":"\u03c5\u0308\u0300","\u1fe3":"\u03c5\u0308\u0301","\u1fe4":"\u03c1\u0313","\u1fe6":"\u03c5\u0342","\u1fe7":"\u03c5\u0308\u0342","\u1ff2":"\u1f7c\u03b9","\u1ff3":"\u03c9\u03b9","\u1ff4":"\u03ce\u03b9","\u1ff6":"\u03c9\u0342","\u1ff7":"\u03c9\u0342\u03b9","\u1ffc":"\u03c9\u03b9","\uab70":"\u13a0","\uab71":"\u13a1","\uab72":"\u13a2","\uab73":"\u13a3","\uab74":"\u13a4","\uab75":"\u13a5","\uab76":"\u13a6","\uab77":"\u13a7","\uab78":"\u13a8","\uab79":"\u13a9","\uab7a":"\u13aa","\uab7b":"\u13ab","\uab7c":"\u13ac","\uab7d":"\u13ad","\uab7e":"\u13ae","\uab7f":"\u13af","\uab80":"\u13b0","\uab81":"\u13b1","\uab82":"\u13b2","\uab83":"\u13b3","\uab84":"\u13b4","\uab85":"\u13b5","\uab86":"\u13b6","\uab87":"\u13b7","\uab88":"\u13b8","\uab89":"\u13b9","\uab8a":"\u13ba","\uab8b":"\u13bb","\uab8c":"\u13bc","\uab8d":"\u13bd","\uab8e":"\u13be","\uab8f":"\u13bf","\uab90":"\u13c0","\uab91":"\u13c1","\uab92":"\u13c2","\uab93":"\u13c3","\uab94":"\u13c4","\uab95":"\u13c5","\uab96":"\u13c6","\uab97":"\u13c7","\uab98":"\u13c8","\uab99":"\u13c9","\uab9a":"\u13ca","\uab9b":"\u13cb","\uab9c":"\u13cc","\uab9d":"\u13cd","\uab9e":"\u13ce","\uab9f":"\u13cf","\uaba0":"\u13d0","\uaba1":"\u13d1","\uaba2":"\u13d2","\uaba3":"\u13d3","\uaba4":"\u13d4","\uaba5":"\u13d5","\uaba6":"\u13d6","\uaba7":"\u13d7","\uaba8":"\u13d8","\uaba9":"\u13d9","\uabaa":"\u13da","\uabab":"\u13db","\uabac":"\u13dc","\uabad":"\u13dd","\uabae":"\u13de","\uabaf":"\u13df","\uabb0":"\u13e0","\uabb1":"\u13e1","\uabb2":"\u13e2","\uabb3":"\u13e3","\uabb4":"\u13e4","\uabb5":"\u13e5","\uabb6":"\u13e6","\uabb7":"\u13e7","\uabb8":"\u13e8","\uabb9":"\u13e9","\uabba":"\u13ea","\uabbb":"\u13eb","\uabbc":"\u13ec","\uabbd":"\u13ed","\uabbe":"\u13ee","\uabbf":"\u13ef","\ufb00":"ff","\ufb01":"fi","\ufb02":"fl","\ufb03":"ffi","\ufb04":"ffl","\ufb05":"st","\ufb06":"st","\ufb13":"\u0574\u0576","\ufb14":"\u0574\u0565","\ufb15":"\u0574\u056b","\ufb16":"\u057e\u0576","\ufb17":"\u0574\u056d"};
const namespaceKey = name => Array.from(name.normalize("NFC"), char => CASE_FOLDS[char] ?? char.toLowerCase()).join("");

const utf8 = bytes => {
  const value = bytes.toString('utf8');
  if (!Buffer.from(value,'utf8').equals(bytes)) throw Error('invalid-utf8');
  return value;
};
const JSON_FLOAT_FIELDS = new WeakMap();
const strictJSON = bytes => {
  const text = utf8(bytes), parsed = JSON.parse(text);
  let offset = 0;
  const ws = () => { while (/[\t\n\r ]/.test(text[offset] ?? '') && offset < text.length) offset++; };
  const string = () => {
    const start = offset++;
    while (offset < text.length) {
      const char = text[offset++];
      if (char === '\\') offset++;
      else if (char === '"') return JSON.parse(text.slice(start,offset));
    }
    throw Error('json-string');
  };
  const value = (depth=0, container=null, key=null) => {
    if (depth > 256) throw Error('json-depth-limit');
    ws(); const char = text[offset];
    const current = container === null ? parsed : container[key];
    if (char === '{') {
      offset++; ws(); const keys = new Set();
      if (text[offset] === '}') { offset++; return; }
      while (true) {
        ws(); const key = string();
        if (keys.has(key)) throw Error('duplicate-json-key:'+key);
        keys.add(key); ws(); offset++; value(depth+1,current,key); ws();
        if (text[offset++] === '}') return;
      }
    } else if (char === '[') {
      offset++; ws(); if (text[offset] === ']') { offset++; return; }
      let index=0;
      while (true) { value(depth+1,current,index++); ws(); if (text[offset++] === ']') return; }
    } else if (char === '"') string();
    else {
      const match = /^(?:true|false|null|-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?)/.exec(text.slice(offset));
      if (!match) throw Error('json-value');
      if (!['true','false','null'].includes(match[0]) && !Number.isFinite(Number(match[0]))) throw Error('non-finite-json-number');
      if(container!==null && /[.eE]/.test(match[0]) && !['true','false','null'].includes(match[0])) {
        if(!JSON_FLOAT_FIELDS.has(container))JSON_FLOAT_FIELDS.set(container,new Set());
        JSON_FLOAT_FIELDS.get(container).add(String(key));
      }
      offset += match[0].length;
    }
  };
  value(); ws(); if (offset !== text.length) throw Error('json-trailing-data');
  return parsed;
};
const matchIntegerForm = (container,key,expected,label) => {
  if(typeof expected==='number' && Number.isInteger(expected) && JSON_FLOAT_FIELDS.get(container)?.has(String(key)))throw Error('profile-evidence-integer-token:'+label);
};
const matchContract = (actual, expected, label) => {
  if (expected === '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__') {
    if (typeof actual !== 'string' || !actual.trim()) throw Error('missing-explanatory-scope:'+label);
  } else if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length) throw Error('profile-evidence-sequence:'+label);
    expected.forEach((item,index)=>{matchIntegerForm(actual,index,item,label+'/'+index);matchContract(actual[index],item,label+'/'+index);});
  } else if (expected !== null && typeof expected === 'object') {
    if (!actual || Array.isArray(actual) || typeof actual !== 'object' || Object.keys(actual).length !== Object.keys(expected).length || Object.keys(expected).some(key=>!Object.hasOwn(actual,key))) throw Error('profile-evidence-key-inventory:'+label);
    for (const [key,value] of Object.entries(expected)) {matchIntegerForm(actual,key,value,label+'/'+key);matchContract(actual[key],value,label+'/'+key);}
  } else if (typeof actual !== typeof expected || actual !== expected) throw Error('profile-evidence-value:'+label);
};
const qualificationContract = (record, meta=null, verdict='qualificationVerdict') => {
  const windows = record.distribution_status === WINDOWS_DISTRIBUTION_STATUS;
  if (record[verdict] !== 'NOT_FINAL' || record.native_acceptance !== false || record.published !== false) throw Error('broad-qualification-or-publication');
  if (windows) {
    if (record.publication_qualified !== true || record.technical_qualification !== WINDOWS_TECHNICAL_QUALIFICATION || record.publication_profile !== PUBLICATION_PROFILE) throw Error('declared-windows-source-eligibility');
  } else if (record.distribution_status !== 'LOCAL_CANDIDATE_NOT_PUBLISHED' || record.publication_qualified !== false || Object.hasOwn(record,'technical_qualification') || Object.hasOwn(record,'publication_profile')) throw Error('historical-preparatory-qualification');
  if (meta && record.distribution_status !== meta.distribution_status) throw Error('cross-record-qualification-branches');
  return windows;
};
const postpublicationPortal = record => {
  if (!record || Array.isArray(record) || typeof record !== 'object') throw Error('expected-portal-record');
  const portal = Object.keys(PORTAL_MARKERS).some(key=>Object.hasOwn(record,key));
  if (portal && (Object.entries(PORTAL_MARKERS).some(([key,value])=>record[key]!==value) || record.latest_published_version!==VERSION || record.distribution_status!==WINDOWS_DISTRIBUTION_STATUS)) throw Error('postpublication-portal-markers');
  return portal;
};
const qualificationReport = (meta, currentCopyEligible=false) => {
  const portal=postpublicationPortal(meta);
  return {
    distribution_status:meta.distribution_status,
    technical_qualification:meta.technical_qualification ?? null,
    publication_profile:meta.publication_profile ?? null,
    publication_profile_id:meta.distribution_status===WINDOWS_DISTRIBUTION_STATUS?WINDOWS_PROFILE_ID:null,
    publication_qualified:meta.publication_qualified,
    current_copy_publication_eligible:meta.distribution_status===WINDOWS_DISTRIBUTION_STATUS && currentCopyEligible && !portal,
    qualification_scope:portal?PORTAL_QUALIFICATION_SCOPE:(meta.distribution_status===WINDOWS_DISTRIBUTION_STATUS?'Declared observed Windows source eligibility only; exact final commit/build/tag/assets and publication remain pending. This check verifies bytes, contracts and retained evidence identities; it does not reexecute browser, native, learner or human acceptance.':'Historical preparatory source only; no publication qualification.'),
    qualificationVerdict:'NOT_FINAL',native_acceptance:false,published:false,
    ...(portal?{published_release:PUBLISHED_RELEASE,portal_state:PORTAL_MARKERS.portal_state,current_copy_is_published_release_bytes:false,referenced_release_published:true,referenced_release_tag:PUBLISHED_RELEASE_CONTRACT.tag,referenced_release_source_commit:PUBLISHED_RELEASE_CONTRACT.source_commit,referenced_release_latest_observed:true,referenced_release_observed_at_utc:PUBLISHED_RELEASE_CONTRACT.observed_at_utc,publication_observation_live_query:false,published_scope:PORTAL_PUBLICATION_SCOPE}:{})
  };
};
const parseManifest = bytes => {
  const text = utf8(bytes), rows = new Map();
  if (!text.endsWith('\n') || text.includes('\r')) throw Error('manifest-format');
  for (const line of text.slice(0,-1).split('\n')) {
    const match = /^([0-9a-f]{64})  (.+)$/.exec(line);
    if (!match) throw Error('manifest-format');
    const name = safe(match[2]);
    if (rows.has(name)) throw Error('manifest-duplicate');
    rows.set(name,match[1]);
  }
  const names = [...rows.keys()];
  // Repository path order is Unicode code-point order, as in Python's sorted().
  const compare = (a,b) => {
    const aa=Array.from(a,char=>char.codePointAt(0)),bb=Array.from(b,char=>char.codePointAt(0));
    for(let i=0;i<Math.min(aa.length,bb.length);i++) if(aa[i]!==bb[i])return aa[i]-bb[i];
    return aa.length-bb.length;
  };
  const sortedNames=[...names].sort(compare);
  if (names.some((name,index)=>name!==sortedNames[index])) throw Error('manifest-path-order');
  return rows;
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
  const rows = parseManifest(bytes);
  if ([MANIFEST,PACKAGE_ID].some(name=>rows.has(name))) throw Error('manifest-control-cycle');
  const metadataBytes = read('metadata/CLASSROOM_COLLECTION.json');
  if (hash(metadataBytes) !== rows.get('metadata/CLASSROOM_COLLECTION.json')) throw Error('metadata-mismatch');
  const meta = strictJSON(metadataBytes);
  const windows = qualificationContract(meta);
  const portal = postpublicationPortal(meta);
  if(fs.existsSync(path.join(root,PUBLISHED_RELEASE))!==portal)throw Error('published-record-portal-markers-pair');
  if(portal)matchContract(strictJSON(read(PUBLISHED_RELEASE)),PUBLISHED_RELEASE_CONTRACT,'PUBLISHED_RELEASE');
  const latestVersion = portal ? VERSION : LATEST_PUBLISHED_VERSION;
  if (meta.schema !== 'webtech-classroom-collection/v1' || meta.distribution_version !== VERSION || meta.final_target_version !== VERSION || meta.latest_published_version !== latestVersion || meta.candidate_progress !== PROGRESS || meta.final_phase_scope !== FINAL_PHASE_SCOPE || meta.qualificationVerdict !== 'NOT_FINAL' || meta.native_acceptance !== false || meta.published !== false) throw Error('metadata-scope');
  if(meta.status!==(windows?'WINDOWS_PROFILE_V4_0_0_SOURCE_PREPARED_NOT_PUBLISHED':`CANDIDATE_V4_0_0_T${String(PREPARED_TRANCHE).padStart(2,'0')}_PREPARED_NOT_FINAL_NOT_PUBLISHED`))throw Error('metadata-prepared-tranche');
  const objectIDs=['SETUP_WINDOWS','SETUP_MACOS_LINUX',...Array.from({length:14},(_,n)=>['C'+String(n+1).padStart(2,'0'),'S'+String(n+1).padStart(2,'0')]).flat()];
  if(!Array.isArray(meta.objects)||meta.objects.length!==30||new Set(meta.objects.map(obj=>obj.object_id)).size!==30||meta.objects.some(obj=>!objectIDs.includes(obj.object_id)))throw Error('metadata-current-objects');
  for(const obj of meta.objects){const tranche=obj.object_id.startsWith('SETUP_')?1:Math.ceil(Number(obj.object_id.slice(1))/2),expected=tranche<=PREPARED_TRANCHE?`T${String(tranche).padStart(2,'0')}_COMPLETE_WITH_EXPLICIT_LIMITS`:'INHERITED_SOURCE_PENDING_LATER_TRANCHE_REVIEW';if(obj.candidate_revision_status!==expected)throw Error('metadata-object-prepared-tranche:'+obj.object_id);}
  if (windows) {
    matchContract(strictJSON(read(PUBLICATION_PROFILE)), WINDOWS_PROFILE_CONTRACT, 'PUBLICATION_PROFILE');
    matchContract(strictJSON(read('metadata/CURRENT_QUALIFICATION.json')), CURRENT_QUALIFICATION_CONTRACT, 'CURRENT_QUALIFICATION');
    const scope = strictJSON(read('metadata/COLLECTION_SCOPE.json'));
    qualificationContract(scope,meta);
    if(postpublicationPortal(scope)!==portal)throw Error('collection-scope-portal-branch');
    if(scope.schema!=='webtech-current-repository-scope/v1'||scope.version!==VERSION||scope.candidate_progress!=='CANDIDATE_PROGRESS.json'||scope.final_phase_scope!==FINAL_PHASE_SCOPE)throw Error('windows-collection-scope');
    matchContract(Object.fromEntries(meta.objects.map(obj=>[obj.object_id,obj.package_id])),ACCEPTED_UNIT_IDENTITIES,'accepted-unit-identities');
  } else {
    if(fs.existsSync(path.join(root,PUBLICATION_PROFILE)))throw Error('historical-preparatory-retained-publication-profile');
    if(fs.existsSync(path.join(root,'metadata/CURRENT_QUALIFICATION.json'))){
      const record=strictJSON(read('metadata/CURRENT_QUALIFICATION.json'));
      if(record.schema!=='webtech-current-scoped-qualification/v1'||record.final_target_version!==VERSION||record.qualificationVerdict!=='NOT_FINAL'||record.native_acceptance!==false||record.publication_qualified!==false||record.published!==false||(record.distribution_status??'LOCAL_CANDIDATE_NOT_PUBLISHED')!=='LOCAL_CANDIDATE_NOT_PUBLISHED'||Object.hasOwn(record,'technical_qualification')||Object.hasOwn(record,'publication_profile'))throw Error('historical-preparatory-evidence-qualified');
    }
    if(fs.existsSync(path.join(root,'metadata/COLLECTION_SCOPE.json'))){
      const scope=strictJSON(read('metadata/COLLECTION_SCOPE.json'));
      if(postpublicationPortal(scope)!==portal)throw Error('collection-scope-portal-branch');
      if(scope.distribution_status!=='LOCAL_CANDIDATE_NOT_PUBLISHED'||scope.qualificationVerdict!=='NOT_FINAL'||['native_acceptance','publication_qualified','published'].some(key=>Object.hasOwn(scope,key)&&scope[key]!==false)||Object.hasOwn(scope,'technical_qualification')||Object.hasOwn(scope,'publication_profile'))throw Error('historical-preparatory-collection-scope-qualified');
    }
  }
  if (!meta.qualificationGates || Object.keys(meta.qualificationGates).length !== GATES.length || GATES.some(gate=>meta.qualificationGates[gate]!=='pending')) throw Error('metadata-global-gates');
  const progressBytes=read(PROGRESS);
  if(hash(progressBytes)!==rows.get(PROGRESS))throw Error('candidate-progress-mismatch');
  const progress=strictJSON(progressBytes);
  qualificationContract(progress,meta);
  if(postpublicationPortal(progress)!==portal)throw Error('progress-portal-branch');
  if(progress.schema!=='webtech-candidate-progress/v1'||progress.candidate_version!==VERSION||progress.final_target_version!==VERSION||progress.latest_published_version!==latestVersion||progress.qualificationVerdict!=='NOT_FINAL'||progress.native_acceptance!==false||progress.published!==false||progress.phase!==(windows?'T07_WINDOWS_PROFILE_SOURCE_PREPARED':`T${String(PREPARED_TRANCHE).padStart(2,'0')}_CANDIDATE_PREPARED`)||!Object.prototype.hasOwnProperty.call(progress,'next_phase')||progress.next_phase!==null||progress.final_phase_scope!==FINAL_PHASE_SCOPE||JSON.stringify(progress.prepared_tranches)!==JSON.stringify(Array.from({length:PREPARED_TRANCHE},(_,n)=>`T${String(n+1).padStart(2,'0')}`))||!progress.qualificationGates||Object.keys(progress.qualificationGates).length!==GATES.length||GATES.some(gate=>progress.qualificationGates[gate]!=='pending'))throw Error('candidate-progress-scope');
  if(!Array.isArray(progress.tranches)||progress.tranches.length!==7)throw Error('candidate-tranches');
  for(let i=1;i<=7;i++){
    const tranche=progress.tranches[i-1],units=[`C${String(i*2-1).padStart(2,'0')}`,`S${String(i*2-1).padStart(2,'0')}`,`C${String(i*2).padStart(2,'0')}`,`S${String(i*2).padStart(2,'0')}`];
    if(tranche.id!==`T${String(i).padStart(2,'0')}`||JSON.stringify(tranche.units)!==JSON.stringify(units)||tranche.acceptance_status!=='PENDING'||tranche.implementation_status!==(i<=PREPARED_TRANCHE?'COMPLETE_WITH_EXPLICIT_LIMITS':'PENDING'))throw Error('candidate-tranche-scope');
  }
  const courseBytes=read('metadata/course-map.json');
  if(hash(courseBytes)!==rows.get('metadata/course-map.json'))throw Error('course-map-mismatch');
  const course=strictJSON(courseBytes);
  qualificationContract(course,meta,'qualification');
  if(postpublicationPortal(course)!==portal)throw Error('course-map-portal-branch');
  if(course.schema!=='webtech-classroom-course-map/v1'||course.distribution_version!==VERSION||course.final_target_version!==VERSION||course.latest_published_version!==latestVersion||course.candidate_progress!==PROGRESS||course.qualification!=='NOT_FINAL'||course.native_acceptance!==false||course.published!==false||course.required_project_count!==40||meta.required_microprojects!==40||!Array.isArray(course.weeks)||course.weeks.length!==14||new Set(course.weeks.map(week=>week.week)).size!==14)throw Error('course-map-scope');
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
  if (!Array.isArray(meta.editable_files) || meta.editable_files.length !== 38 || new Set(meta.editable_files).size !== 38 || !Array.isArray(meta.generated_directories) || meta.generated_directories.length !== 83 || new Set(meta.generated_directories).size !== 83) throw Error('metadata-edit-policy');
  const allowed = new Set(meta.editable_files.map(safe));
  if ([...allowed].some(name => !rows.has(name) || !/^01_WEEKS\/WEEK_([0-9]{2})\/S\1_SEMINAR\/EN_GB\/CLASSROOM_RC6\/(targets|student)\/.+\.(mjs|js|json|css)$/.test(name))) throw Error('metadata-edit-policy');
  const generated = new Set(meta.generated_directories.map(safe));
  if ([...generated].some(name=>name!=='STUDENT_EVIDENCE'&&!name.startsWith('01_WEEKS/')&&!name.startsWith('00_SETUP/'))) throw Error('runtime-directory-boundary');
  const actual = new Set();
  const nodes = new Map();
  let visited = 0, totalBytes = 0;
  const walk = (directory, prefix='') => {
    for (const entry of fs.readdirSync(directory,{withFileTypes:true})) {
      const name = safe(prefix + entry.name);
      const item = path.join(directory,entry.name);
      const stat = fs.lstatSync(item);
      if (stat.isSymbolicLink()) throw Error('symlink');
      const key = namespaceKey(name);
      if (nodes.has(key) && nodes.get(key)!==name) throw Error('case-or-unicode-collision');
      nodes.set(key,name);
      if (name === '.git') continue;
      if (++visited > 20000) throw Error('inventory-limit');
      if (stat.isDirectory()) {
        if (edited && generated.has(name)) continue;
        walk(item,name+'/');
      } else if (stat.isFile()) {
        actual.add(name); totalBytes += stat.size;
        if(totalBytes>1024*1024*1024)throw Error('inventory-byte-limit');
      }
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

  const unitRoot = ident => ident==='SETUP_WINDOWS'?'00_SETUP/WINDOWS/EN_GB/':ident==='SETUP_MACOS_LINUX'?'00_SETUP/MACOS_LINUX/EN_GB/':`01_WEEKS/WEEK_${ident.slice(1)}/${ident}_${ident.startsWith('C')?'COURSE':'SEMINAR'}/EN_GB/`;
  const unitReports=[];
  for(const obj of meta.objects){
    const ident=obj.object_id,base=unitRoot(ident);
    if(obj.payload_root!==base||obj.included_in_collection_version!==VERSION)throw Error('unit-boundary:'+ident);
    for(const field of ['entry','start','guide','package_id_path']){
      const name=obj[field];
      if(typeof name!=='string'||!actual.has(name)||(field!=='entry'&&!name.startsWith(base)))throw Error('unit-route:'+ident+'/'+field);
    }
    if((obj.form!=null&&(!actual.has(obj.form)||!obj.form.startsWith(base)))||(ident.startsWith('S')&&!ident.startsWith('SETUP_')&&obj.form==null))throw Error('unit-form:'+ident);
    const unitManifest=ident==='C01'?'90_AUDIT/PAYLOAD_SHA256SUMS.txt':ident==='C02'?'06_AUDIT/SHA256SUMS.txt':'SHA256SUMS.txt';
    const unitID=ident==='C01'?'90_AUDIT/PACKAGE_ID.txt':ident==='C02'?'06_AUDIT/PACKAGE_ID.txt':'PACKAGE_ID.txt';
    if(obj.package_id_path!==base+unitID)throw Error('unit-id-path:'+ident);
    const unitNames=[...actual].filter(name=>name.startsWith(base)).map(name=>name.slice(base.length));
    const unitBytes=read(base+unitManifest),unitRows=parseManifest(unitBytes);
    const excluded=new Set(ident==='C02'?[unitManifest]:[unitManifest,unitID]);
    const unitExpected=unitNames.filter(name=>!excluded.has(name));
    if(unitRows.size!==unitExpected.length||unitExpected.some(name=>!unitRows.has(name)))throw Error('unit-manifest-inventory:'+ident);
    for(const [name,digest] of unitRows)if(hash(read(base+name))!==digest&&(!edited||!allowed.has(base+name)))throw Error('protected-unit-bytes:'+ident+'/'+name);
    const identity=ident==='C02'?hash(Buffer.from([...unitRows].filter(([name])=>name!==unitID).map(([name,digest])=>digest+'  '+name+'\n').join(''),'utf8')):hash(unitBytes);
    if(obj.package_id!==identity||utf8(read(base+unitID))!==identity+'\n')throw Error('unit-identity:'+ident);
    unitReports.push({object_id:ident,files:unitNames.length,package_id:identity});
  }
  const targets=new Set();let projectCount=0;
  for(const week of course.weeks){
    if(!actual.has(week.tutorial))throw Error('current-tutorial-missing');
    for(const project of week.required_projects){
      const target=unitRoot(week.seminar_id)+safe(project.editable_file);
      if(!actual.has(target))throw Error('required-project-target-missing');
      targets.add(target);projectCount++;
    }
  }
  if(projectCount!==40||targets.size!==38||[...targets].some(name=>!allowed.has(name)))throw Error('required-project-target-inventory');
  console.log(JSON.stringify({schema:'webtech-classroom-local-integrity/v1',status:edited?'PASS_PROTECTED_FILES_ONLY':'PASS_INITIAL_BYTES_ONLY',distribution_version:VERSION,...qualificationReport(meta,!edited&&changed.length===0),files:actual.size,repository_package_id:hash(bytes),observedNode:process.version,allowedStudentChanges:changed,generatedDirectoriesExcluded:edited?[...generated]:[],candidate_progress:{phase:progress.phase,next_phase:progress.next_phase,final_phase_scope:progress.final_phase_scope},requiredProjectIDsChecked:true,studentProjectsQualified:false,units:unitReports,applications_executed:false,rendered_browser_executed:false,actionsStarted:false},null,2));
} catch (error) {
  console.error('STOP_COLLECTION_INTEGRITY: '+error.message);
  process.exitCode=2;
}
