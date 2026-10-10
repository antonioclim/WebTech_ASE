#!/usr/bin/env python3
"""Standard-library contracts for the v4 candidate repository and distribution."""
from __future__ import annotations

import hashlib
import json
import math
import os
import posixpath
import re
import stat
import unicodedata
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

VERSION = '4.0.0'
LATEST_PUBLISHED_VERSION = '3.0.0'
PROGRESS = 'metadata/CANDIDATE_PROGRESS.json'
PREPARED_TRANCHE = 7
FINAL_PHASE_SCOPE = 'T07_GLOBAL_INTEGRATION_AND_PUBLICATION'
METADATA = 'metadata/CLASSROOM_COLLECTION.json'
COURSE_MAP = 'metadata/course-map.json'
MANIFEST = 'metadata/current-integrity/REPOSITORY_SHA256SUMS.txt'
PACKAGE_ID = 'metadata/current-integrity/REPOSITORY_PACKAGE_ID.txt'
CONTROLS = {MANIFEST, PACKAGE_ID}
OBJECTS = {f'{kind}{n:02}' for kind in 'CS' for n in range(1, 15)} | {'SETUP_WINDOWS', 'SETUP_MACOS_LINUX'}
GATES = {'local_integrity', 'reference_runtime', 'headless_browser', 'native_windows', 'native_macos', 'manual_browser', 'word', 'moodle_live', 'human_pilot', 'owner_acceptance'}
REQUIRED_PROJECT_IDS = {week: ['P01', 'P02'] if week == 1 else ['P01', 'P03'] if week == 14 else ['P01', 'P02', 'P03'] for week in range(1, 15)}
MAX_NODES = 20000
MAX_BYTES = 1024 * 1024 * 1024

WINDOWS_DISTRIBUTION_STATUS = 'QUALIFIED_WINDOWS_SOURCE_NOT_PUBLISHED'
WINDOWS_TECHNICAL_QUALIFICATION = 'PASS_DECLARED_WINDOWS_PROFILE_WITH_LIMITS'
PUBLICATION_PROFILE = 'metadata/PUBLICATION_PROFILE.json'
WINDOWS_PROFILE_ID = 'windows-observed-v4.0.0'
# These are approved, retained observation identities, not observations rerun by
# this integrity checker. All thirty unit identities come from committed f6.
WINDOWS_PROFILE_CONTRACT = {'schema': 'webtech-publication-profile/v1',
 'profile_id': 'windows-observed-v4.0.0',
 'final_target_version': '4.0.0',
 'distribution_status': 'QUALIFIED_WINDOWS_SOURCE_NOT_PUBLISHED',
 'technical_qualification': 'PASS_DECLARED_WINDOWS_PROFILE_WITH_LIMITS',
 'qualificationVerdict': 'NOT_FINAL',
 'native_acceptance': False,
 'publication_qualified': True,
 'publication_qualification_scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__',
 'published': False,
 'owner_decision': {'timestamp': '2026-10-10T18:54:13+03:00',
                    'scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__',
                    'commits_and_Actions': 'Owner only',
                    'support_decision_basis': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
 'observed_environment': {'platform': 'Windows',
                          'architecture': 'x64',
                          'PowerShell': '5.1.26100.9549',
                          'Node': 'v24.21.0',
                          'browser': 'Edge 155.0.4283.45',
                          'scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
 'source_reuse_binding': {'committed_base': 'f6bfd409b50560db6e3e63bb9b127488f4bfb67c',
                          'committed_base_tree': '1206fcc2f5e5ba18ff0d69fae451f37678cee35a',
                          'committed_base_repository_package_id': 'b98413caba38a59a2364ed79d695777d5b8e8cfdcc3b16e04309e6a9b844799f',
                          'browser_tested_repository_package_id': '75877f364e5c9573cd3c220af938c8450a4561c3a70b582c6dec307eb5d90fb2',
                          'browser_candidate_base_commit': '6803fbab10219c2880453a3be0744fb2f204c1a6',
                          'all_30_unit_bytes_preserved': True,
                          'preserved_unit_identities': {'C01': 'a8f44b39dfac234c515e61d816288b09a1c7154368cf5ad2e5f62ce2e7abc3f1',
                                                        'C02': '7d690c0ee941eaed04de3504292f5992d7e5b65ba6ecfe87bee4650bbcf8eb20',
                                                        'C03': '5eafff82c8a67efa50a56edc6bfc239ac8fe699bb69129c5e19788386fc64f9f',
                                                        'C04': '24cd969c706fd29a910b4c68c18acc8c8ec1cad1dd1da230c6813560249d3dc3',
                                                        'C05': '72973f044d1b031761a96295f53f9dd328e557f6017169a8266f75727d553161',
                                                        'C06': '049e79a294d2150b760f18f28cd95e0565b37b2cec2e06e121719821edfa4e5b',
                                                        'C07': 'd37a3f3c0546827aa14975020d2444ab5411b81f95d86115372686dc3852a664',
                                                        'C08': '8e48122304b7ec01c107aeae8d811d16f6cd9e5a2136afdc8c446f0b4bfdfaea',
                                                        'C09': 'd9b61059cef316b17c043261dca78b911a5e94de5933fff00dd85662a6578d10',
                                                        'C10': '858f8cf474bbafd41e3f080092b43c9fa2708780c9211795363ecbdf21db438a',
                                                        'C11': 'd2149be7e231ac6268a5b071cd2a09e35e2ddcffc0bb1af794681a8bdb61991b',
                                                        'C12': '4b5ff44f870a01b4204f2bfcd89f55607e542b829d5c0eca8d664ad62b4641b7',
                                                        'C13': 'b6ba730e54e30a9ffb3c460b3806f68b8412946710daf727474b98e0258f3b3d',
                                                        'C14': '3d41db187790fd768f288a8d11b394db5f749ba02a6094002676b606310f49be',
                                                        'S01': '4889e64304b49b27ffde1e027c726a34cb4227783c7bc085348f406a796e524f',
                                                        'S02': '13f1ae7cee1e12b386982044359811eb44c76f5ee2b94e9170c89b5061121b18',
                                                        'S03': 'fbdfcdddb3515cc91a5d246618079f91688a7bc62c5e5ff00d9b40376f485044',
                                                        'S04': 'b64b458aabd8d847132e40007a319197d6f458d055e959a794981a48cbd19f1e',
                                                        'S05': 'c6972379b0f9e0951e30f14c9538a046f1dd3732c65ace0ca9be281d08f02870',
                                                        'S06': 'f8e1d3c663288761a69f28b57ddad3cb3179803f920741eec6b284a57d790086',
                                                        'S07': '4579bf280e5ee766c1595a0b4025488292705c29327f1fcd4fe174245c7accaf',
                                                        'S08': '16b6ca06fb8812b92f6b61ff8bfa2705a66fada036fa0a5d3821e7226c76a40d',
                                                        'S09': 'b039b19c616c749e9c6bbe028275a207205f3b29774fa1143772cdd1914380ce',
                                                        'S10': '94e2c5c308eb311014384a426063027c5ac71f7d0a9c37d8ebe927992d5b1784',
                                                        'S11': '01c2a471c3a86fe79446c09567038ea96af26cabfb3cf19803a5e04b9a4dfc6a',
                                                        'S12': '40609bf1a86653676bdeb0412aff3ee90d38185047500f6f6994116f84a530c5',
                                                        'S13': '51fb29db5a9d21ae4886b80fd1ab5c484ab5b02858d9f78885596c5787c89c70',
                                                        'S14': '957c61416e0928cdae592314835958245daf859c890bcfd755523a04a1aa8c2c',
                                                        'SETUP_MACOS_LINUX': 'a5327a1a753495494f83ef848453a8d62377b932ee133525d14323a1e6b003d1',
                                                        'SETUP_WINDOWS': 'dc3b41f3722be6dd7bec20ba7bdc15d50a41ba1b6faf4bd9da384b7f4cfd7ae7'},
                          'reuse_scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__',
                          'current_source_identity': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
 'evidence_identities': {'browser_archive_sha256': '3bc103349b8a3276cd8004fe0008b0142a9fa7b97038056eff812f025be63890',
                         'browser_receipt_sha256': '913402335578f1daf52230cfd6423e272ed6344635eef2442595b1447b4411a5',
                         'committed_source_audit_sha256': '1c283f1621b264d6321aca5cb0d50550c228a90bc1c7aa4d035b1acccc55b468',
                         'independent_portal_diagnostics_audit_sha256': 'b19fecd2d3f0f89441b8010bf3752f686ff27bd236c1a89290fc40236fa1a2f6',
                         'independent_forms_and_mechanisms_audit_sha256': '9a1edab8305f20f1ff0d92680ac34442f7d2ff61aa01c9c355173811d7b644a7',
                         'independent_pdf_text_geometry_audit_sha256': 'e2bb994d1c1b0e994bf0700e291350fde8869ea2c8e7fb23ed1f8d9697bc4cdd',
                         'independent_pdf_visual_audit_sha256': '869ae6b827774b48b0fcb8b1a4928bb41259fe57b286b31cc95114f174356b88'},
 'declared_technical_observations': {'committed_source_integrity': {'state': 'PASS_EXACT_COMMITTED_BASE',
                                                                    'source_files': 1726,
                                                                    'units': 30,
                                                                    'required_projects': 40,
                                                                    'unfinished_learner_targets': 38},
                                     'windows_preflight': {'state': 'PASS_SELECTED_WITH_WARNINGS',
                                                           'profiles': ['node', 'http', 'sqlite'],
                                                           'outer_status': 'ENV_WARN',
                                                           'exit_codes': [0, 0, 0],
                                                           'inner_status': 'ENV_OK',
                                                           'windows_setup_package_id': 'dc3b41f3722be6dd7bec20ba7bdc15d50a41ba1b6faf4bd9da384b7f4cfd7ae7'},
                                     'windows_course_runtime': {'state': 'PASS_SELECTED_WITH_OUTPUT_ENCODING_LIMIT',
                                                                'canonical_examples': 57,
                                                                'courses': 13,
                                                                'outer_exit_zero_checks': 17,
                                                                'owned_cleanups': 21},
                                     'headless_browser': {'state': 'PASS_SCOPED_AUTOMATED_BROWSER_BATCH',
                                                          'checks': 334,
                                                          'passed': 334,
                                                          'failed': 0,
                                                          'portal_checks': 88,
                                                          'form_checks': 233,
                                                          'native_browser_mechanism_cases': 6},
                                     'json_drafts': {'state': 'PASS_SELECTED_DOWNLOAD_IMPORT_VALIDATION',
                                                     'actual_downloaded_records': 14},
                                     'headless_pdf': {'state': 'PASS_SCOPED_HEADLESS_SYNTHETIC_DRAFTS',
                                                      'files': 15,
                                                      'pages': 201},
                                     'owner_saved_native_pdf': {'state': 'PASS_SELECTED_SHORT_MARKER_DRAFTS',
                                                                'units': ['S01', 'S03', 'S14'],
                                                                'distinct_pages': 36}},
 'retained_limits': {'environmentAcceptance': False,
                     'known_environment_blocked_requests': 127,
                     'unexpected_v2_errors': 0,
                     'CSP_v2_diagnostics': 0,
                     'environment_interference': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__',
                     'native_print': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__',
                     'accessibility': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__',
                     'runtime': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__',
                     'learner_evidence': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
 'unqualified_scopes': {'macOS': {'state': 'NOT_EXECUTED_NOT_QUALIFIED',
                                  'scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
                        'Linux': {'state': 'SCOPED_OBSERVATIONS_ONLY_NOT_PLATFORM_QUALIFIED',
                                  'scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
                        'other_Windows_architectures_and_versions': {'state': 'NOT_QUALIFIED_BY_THIS_PROFILE',
                                                                     'scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
                        'native_Microsoft_Word': {'state': 'NOT_EXECUTED',
                                                  'scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
                        'live_Moodle': {'state': 'PENDING_EXTERNAL',
                                        'scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
                        'novice_pilot': {'state': 'PENDING_HUMAN',
                                         'scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
                        'owner_pedagogic_acceptance': {'state': 'PENDING_HUMAN',
                                                       'scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'}},
 'final_bindings': {'status': 'PENDING_EXACT_BINDING',
                    'source_commit': None,
                    'source_tree': None,
                    'source_repository_package_id': None,
                    'distribution_package_id': None,
                    'build_receipt_sha256': None,
                    'archive_sha256': None,
                    'fresh_extraction_receipt_sha256': None,
                    'tag': 'v4.0.0',
                    'tag_commit': None,
                    'asset_digests': None,
                    'publication_performed': False,
                    'required_process': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
 'broad_gate_scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__',
 'frozen_RC1': {'tag': 'v4.0.0-rc.1',
                'source_commit': '23803fdaf5987384b86104bbaf0a8d293654aa0e',
                'assets': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'}}
CURRENT_QUALIFICATION_CONTRACT = {'schema': 'webtech-current-scoped-qualification/v1',
 'recorded_utc': '2026-10-10T15:32:52.164309+00:00',
 'final_target_version': '4.0.0',
 'qualificationVerdict': 'NOT_FINAL',
 'native_acceptance': False,
 'publication_qualified': True,
 'published': False,
 'status_scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__',
 'record_scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__',
 'source_binding': {'committed_base': 'f6bfd409b50560db6e3e63bb9b127488f4bfb67c',
                    'committed_base_tree': '1206fcc2f5e5ba18ff0d69fae451f37678cee35a',
                    'committed_base_repository_package_id': 'b98413caba38a59a2364ed79d695777d5b8e8cfdcc3b16e04309e6a9b844799f',
                    'committed_base_files': 1726,
                    'browser_tested_repository_package_id': '75877f364e5c9573cd3c220af938c8450a4561c3a70b582c6dec307eb5d90fb2',
                    'browser_candidate_source_commit': None,
                    'browser_candidate_base_commit': '6803fbab10219c2880453a3be0744fb2f204c1a6',
                    'browser_tested_copy_state': 'UNCOMMITTED_LOCAL_CANDIDATE',
                    'committed_post_browser_differences': ['00_START_HERE/QUALIFICATION.html',
                                                           'CHANGELOG.md',
                                                           'metadata/current-integrity/REPOSITORY_PACKAGE_ID.txt',
                                                           'metadata/current-integrity/REPOSITORY_SHA256SUMS.txt'],
                    'this_record_state': 'UNCOMMITTED_WINDOWS_PUBLICATION_PROFILE_SOURCE_CANDIDATE',
                    'current_copy_identity': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__',
                    'binding_limit': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
 'evidence_identities': {'browser_archive_sha256': '3bc103349b8a3276cd8004fe0008b0142a9fa7b97038056eff812f025be63890',
                         'browser_receipt_sha256': '913402335578f1daf52230cfd6423e272ed6344635eef2442595b1447b4411a5',
                         'committed_source_audit_sha256': '1c283f1621b264d6321aca5cb0d50550c228a90bc1c7aa4d035b1acccc55b468',
                         'independent_portal_diagnostics_audit_sha256': 'b19fecd2d3f0f89441b8010bf3752f686ff27bd236c1a89290fc40236fa1a2f6',
                         'independent_forms_and_mechanisms_audit_sha256': '9a1edab8305f20f1ff0d92680ac34442f7d2ff61aa01c9c355173811d7b644a7',
                         'independent_pdf_text_geometry_audit_sha256': 'e2bb994d1c1b0e994bf0700e291350fde8869ea2c8e7fb23ed1f8d9697bc4cdd',
                         'independent_pdf_visual_audit_sha256': '869ae6b827774b48b0fcb8b1a4928bb41259fe57b286b31cc95114f174356b88'},
 'scoped_checks': {'committed_source_integrity': {'state': 'PASS_EXACT_COMMITTED_SOURCE',
                                                  'units': 30,
                                                  'required_microprojects': 40,
                                                  'editable_unfinished_targets': 38,
                                                  'method': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
                   'native_windows_preflight': {'state': 'PASS_SELECTED_WITH_WARNINGS',
                                                'PowerShell': '5.1.26100.9549',
                                                'Node': 'v24.21.0',
                                                'observed_source_repository_package_id': '46b65b3c864ef34d867abd88606838100f6edcfd7b0e32b91b0df18c97c52de3',
                                                'profiles': ['node', 'http', 'sqlite'],
                                                'outer_status': 'ENV_WARN',
                                                'outer_exit_codes': [0, 0, 0],
                                                'inner_capability_status': 'ENV_OK',
                                                'windows_setup_package_id': 'dc3b41f3722be6dd7bec20ba7bdc15d50a41ba1b6faf4bd9da384b7f4cfd7ae7',
                                                'windows_setup_bytes_preserved_in_committed_base': True,
                                                'limits': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
                   'native_windows_course_runtime': {'state': 'PASS_SELECTED_WITH_OUTPUT_ENCODING_LIMIT',
                                                     'Node': 'v24.21.0',
                                                     'canonical_examples': 57,
                                                     'courses': 13,
                                                     'outer_exit_zero_checks': 17,
                                                     'owned_temporary_cleanups': 21,
                                                     'limits': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
                   'owner_headless_browser_v2': {'state': 'PASS_SCOPED_AUTOMATED_BROWSER_BATCH',
                                                 'platform': 'Windows',
                                                 'browser': 'Edge 155.0.4283.45',
                                                 'Node': 'v24.21.0',
                                                 'checks': 334,
                                                 'passed': 334,
                                                 'failed': 0,
                                                 'portal_checks': 88,
                                                 'form_checks': 233,
                                                 'actual_downloaded_json_records': 14,
                                                 'native_browser_mechanism_cases': ['C02_NATIVE_KEYBOARD_ROUTE',
                                                                                    'C02_ACTUAL_REDUCED_MOTION_TWO_STATES',
                                                                                    'C13_NATIVE_STORAGE_VALID_AND_MALFORMED',
                                                                                    'C13_NATIVE_WORKER_STRUCTURED_CLONE_REPLY',
                                                                                    'C13_NATIVE_SERVICE_WORKER_LIFECYCLE_AND_MESSAGES',
                                                                                    'C13_OWNED_SERVICE_WORKER_REGISTRATION_CLEANUP'],
                                                 'unexpected_errors': 0,
                                                 'CSP_diagnostics': 0,
                                                 'known_environment_blocked_requests': 127,
                                                 'environment_interference': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__',
                                                 'environmentAcceptance': False,
                                                 'cleanup': {'tested_source_unchanged': True,
                                                             'owned_browser_exited': True,
                                                             'owned_profile_removed': True},
                                                 'limits': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
                   'owner_headless_pdf_v2': {'state': 'PASS_SCOPED_HEADLESS_SYNTHETIC_DRAFTS',
                                             'files': 15,
                                             'pages': 201,
                                             'glyphs': 136809,
                                             'out_of_page_glyphs': 0,
                                             'missing_page_clipping_or_overlap_observed': False,
                                             'review': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__',
                                             'limits': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
                   'owner_saved_native_draft_pdfs': {'state': 'PASS_SELECTED_SHORT_MARKER_DRAFTS',
                                                     'units': ['S01', 'S03', 'S14'],
                                                     'pages_by_unit': {'S01': 4, 'S03': 15, 'S14': 17},
                                                     'distinct_pages': 36,
                                                     'pdf_sha256_by_unit': {'S01': 'b39dba9354fc0f2bf7ccee544d81aaf8220bdb8ce58af92fd0cb419c1d25eaca',
                                                                            'S03': '4ad34d362db5af004b9e8243e135cd17510aa736780bfed0bdba14f430012c4c',
                                                                            'S14': '8f03f6a49561fbf7d229c7059c4bf285f2bf9fefda79eda5568fe6f79d65e0c8'},
                                                     'limits': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
                   'optional_word_references': {'state': 'PASS_LINUX_RENDER_QA_WITH_PRESENTATION_WARNINGS_AND_NATIVE_LIMIT',
                                                'files': 30,
                                                'pages': 187,
                                                'presentation_warnings': 38,
                                                'renderer': 'LibreOffice on Linux',
                                                'native_Microsoft_Word_execution': 'NOT_EXECUTED',
                                                'limits': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'}},
 'remaining_observations': {'native_macos': {'state': 'NOT_EXECUTED_NOT_QUALIFIED',
                                             'macos_linux_setup_package_id': 'a5327a1a753495494f83ef848453a8d62377b932ee133525d14323a1e6b003d1',
                                             'scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
                            'live_moodle': {'state': 'PENDING_EXTERNAL',
                                            'scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
                            'novice_teaching_pilot': {'state': 'PENDING_HUMAN',
                                                      'scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
                            'owner_pedagogic_acceptance': {'state': 'PENDING_HUMAN',
                                                           'scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'},
                            'final_distribution_and_publication': {'state': 'PENDING_SEPARATE_EXACT_RECEIPTS',
                                                                   'scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'}},
 'broad_gate_interpretation': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__',
 'history_preservation': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__',
 'assistant_operations': {'commits_created': False,
                          'Actions_started': False,
                          'remote_publication_performed': False,
                          'software_installed': False},
 'distribution_status': 'QUALIFIED_WINDOWS_SOURCE_NOT_PUBLISHED',
 'technical_qualification': 'PASS_DECLARED_WINDOWS_PROFILE_WITH_LIMITS',
 'publication_profile': 'metadata/PUBLICATION_PROFILE.json',
 'publication_qualification_scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__',
 'profile_decision': {'timestamp': '2026-10-10T18:54:13+03:00',
                      'profile_id': 'windows-observed-v4.0.0',
                      'scope': '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__'}}
ACCEPTED_UNIT_IDENTITIES = {'C01': 'a8f44b39dfac234c515e61d816288b09a1c7154368cf5ad2e5f62ce2e7abc3f1',
 'C02': '7d690c0ee941eaed04de3504292f5992d7e5b65ba6ecfe87bee4650bbcf8eb20',
 'C03': '5eafff82c8a67efa50a56edc6bfc239ac8fe699bb69129c5e19788386fc64f9f',
 'C04': '24cd969c706fd29a910b4c68c18acc8c8ec1cad1dd1da230c6813560249d3dc3',
 'C05': '72973f044d1b031761a96295f53f9dd328e557f6017169a8266f75727d553161',
 'C06': '049e79a294d2150b760f18f28cd95e0565b37b2cec2e06e121719821edfa4e5b',
 'C07': 'd37a3f3c0546827aa14975020d2444ab5411b81f95d86115372686dc3852a664',
 'C08': '8e48122304b7ec01c107aeae8d811d16f6cd9e5a2136afdc8c446f0b4bfdfaea',
 'C09': 'd9b61059cef316b17c043261dca78b911a5e94de5933fff00dd85662a6578d10',
 'C10': '858f8cf474bbafd41e3f080092b43c9fa2708780c9211795363ecbdf21db438a',
 'C11': 'd2149be7e231ac6268a5b071cd2a09e35e2ddcffc0bb1af794681a8bdb61991b',
 'C12': '4b5ff44f870a01b4204f2bfcd89f55607e542b829d5c0eca8d664ad62b4641b7',
 'C13': 'b6ba730e54e30a9ffb3c460b3806f68b8412946710daf727474b98e0258f3b3d',
 'C14': '3d41db187790fd768f288a8d11b394db5f749ba02a6094002676b606310f49be',
 'S01': '4889e64304b49b27ffde1e027c726a34cb4227783c7bc085348f406a796e524f',
 'S02': '13f1ae7cee1e12b386982044359811eb44c76f5ee2b94e9170c89b5061121b18',
 'S03': 'fbdfcdddb3515cc91a5d246618079f91688a7bc62c5e5ff00d9b40376f485044',
 'S04': 'b64b458aabd8d847132e40007a319197d6f458d055e959a794981a48cbd19f1e',
 'S05': 'c6972379b0f9e0951e30f14c9538a046f1dd3732c65ace0ca9be281d08f02870',
 'S06': 'f8e1d3c663288761a69f28b57ddad3cb3179803f920741eec6b284a57d790086',
 'S07': '4579bf280e5ee766c1595a0b4025488292705c29327f1fcd4fe174245c7accaf',
 'S08': '16b6ca06fb8812b92f6b61ff8bfa2705a66fada036fa0a5d3821e7226c76a40d',
 'S09': 'b039b19c616c749e9c6bbe028275a207205f3b29774fa1143772cdd1914380ce',
 'S10': '94e2c5c308eb311014384a426063027c5ac71f7d0a9c37d8ebe927992d5b1784',
 'S11': '01c2a471c3a86fe79446c09567038ea96af26cabfb3cf19803a5e04b9a4dfc6a',
 'S12': '40609bf1a86653676bdeb0412aff3ee90d38185047500f6f6994116f84a530c5',
 'S13': '51fb29db5a9d21ae4886b80fd1ab5c484ab5b02858d9f78885596c5787c89c70',
 'S14': '957c61416e0928cdae592314835958245daf859c890bcfd755523a04a1aa8c2c',
 'SETUP_MACOS_LINUX': 'a5327a1a753495494f83ef848453a8d62377b932ee133525d14323a1e6b003d1',
 'SETUP_WINDOWS': 'dc3b41f3722be6dd7bec20ba7bdc15d50a41ba1b6faf4bd9da384b7f4cfd7ae7'}


def match_contract(actual, expected, label):
    if expected == '__REQUIRED_NONEMPTY_EXPLANATORY_TEXT__':
        if not isinstance(actual, str) or not actual.strip():
            raise ValueError('Missing explanatory scope: ' + label)
    elif isinstance(expected, dict):
        if not isinstance(actual, dict) or set(actual) != set(expected):
            raise ValueError('Profile/evidence machine key inventory differs: ' + label)
        for key, value in expected.items():
            match_contract(actual[key], value, label + '/' + key)
    elif isinstance(expected, list):
        if not isinstance(actual, list) or len(actual) != len(expected):
            raise ValueError('Profile/evidence sequence differs: ' + label)
        for index, value in enumerate(expected):
            match_contract(actual[index], value, label + '/' + str(index))
    elif type(actual) is not type(expected) or actual != expected:
        raise ValueError('Profile/evidence machine value differs: ' + label)


def qualification_contract(record, meta=None, verdict='qualificationVerdict'):
    if not isinstance(record, dict):
        raise ValueError('Expected qualification record')
    windows = record.get('distribution_status') == WINDOWS_DISTRIBUTION_STATUS
    if (record.get(verdict) != 'NOT_FINAL' or record.get('native_acceptance') is not False
            or record.get('published') is not False):
        raise ValueError('Broad qualification or publication must remain unaccepted')
    if windows:
        if (record.get('publication_qualified') is not True
                or record.get('technical_qualification') != WINDOWS_TECHNICAL_QUALIFICATION
                or record.get('publication_profile') != PUBLICATION_PROFILE):
            raise ValueError('Declared Windows source eligibility differs')
    elif (record.get('distribution_status') != 'LOCAL_CANDIDATE_NOT_PUBLISHED'
            or record.get('publication_qualified') is not False
            or 'technical_qualification' in record or 'publication_profile' in record):
        raise ValueError('Historical preparatory qualification differs')
    if meta is not None and record.get('distribution_status') != meta['distribution_status']:
        raise ValueError('Cross-record qualification branches differ')
    return windows


def verify_publication_profile(root, meta):
    if not qualification_contract(meta):
        if checked_path(root, PUBLICATION_PROFILE).exists():
            raise ValueError('Historical preparatory source must not retain a publication profile')
        current = checked_path(root, 'metadata/CURRENT_QUALIFICATION.json')
        if current.exists():
            record = strict_json(current.read_bytes())
            if (record.get('schema') != 'webtech-current-scoped-qualification/v1'
                    or record.get('final_target_version') != VERSION
                    or record.get('qualificationVerdict') != 'NOT_FINAL'
                    or record.get('native_acceptance') is not False
                    or record.get('publication_qualified') is not False
                    or record.get('published') is not False
                    or record.get('distribution_status', 'LOCAL_CANDIDATE_NOT_PUBLISHED') != 'LOCAL_CANDIDATE_NOT_PUBLISHED'
                    or 'technical_qualification' in record or 'publication_profile' in record):
                raise ValueError('Historical preparatory evidence must remain unqualified')
        scope_path = checked_path(root, 'metadata/COLLECTION_SCOPE.json')
        if scope_path.exists():
            scope = strict_json(scope_path.read_bytes())
            if (scope.get('distribution_status') != 'LOCAL_CANDIDATE_NOT_PUBLISHED'
                    or scope.get('qualificationVerdict') != 'NOT_FINAL'
                    or any(key in scope and scope[key] is not False for key in ('native_acceptance', 'publication_qualified', 'published'))
                    or 'technical_qualification' in scope or 'publication_profile' in scope):
                raise ValueError('Historical preparatory collection scope must remain unqualified')
        return
    profile = strict_json(checked_path(root, PUBLICATION_PROFILE).read_bytes())
    match_contract(profile, WINDOWS_PROFILE_CONTRACT, 'PUBLICATION_PROFILE')
    evidence = strict_json(checked_path(root, 'metadata/CURRENT_QUALIFICATION.json').read_bytes())
    match_contract(evidence, CURRENT_QUALIFICATION_CONTRACT, 'CURRENT_QUALIFICATION')
    scope = strict_json(checked_path(root, 'metadata/COLLECTION_SCOPE.json').read_bytes())
    qualification_contract(scope, meta)
    if (scope.get('schema') != 'webtech-current-repository-scope/v1'
            or scope.get('version') != VERSION
            or scope.get('candidate_progress') != 'CANDIDATE_PROGRESS.json'
            or scope.get('final_phase_scope') != FINAL_PHASE_SCOPE):
        raise ValueError('Windows collection scope identity differs')
    identities = {obj['object_id']: obj.get('package_id') for obj in meta['objects']}
    if identities != ACCEPTED_UNIT_IDENTITIES:
        raise ValueError('Windows observations require the thirty accepted unchanged unit identities')


def qualification_report(meta, current_copy_eligible=False):
    windows = qualification_contract(meta)
    return {'distribution_status': meta['distribution_status'],
            'technical_qualification': meta.get('technical_qualification'),
            'publication_profile': meta.get('publication_profile'),
            'publication_profile_id': WINDOWS_PROFILE_ID if windows else None,
            'publication_qualified': meta['publication_qualified'],
            'current_copy_publication_eligible': bool(windows and current_copy_eligible),
            'qualification_scope': 'Declared observed Windows source eligibility only; exact final commit/build/tag/assets and publication remain pending. This check verifies bytes, contracts and retained evidence identities; it does not reexecute browser, native, learner or human acceptance.' if windows else 'Historical preparatory source only; no publication qualification.',
            'qualificationVerdict': 'NOT_FINAL', 'native_acceptance': False, 'published': False}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def strict_json(data):
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise ValueError('Duplicate JSON key: ' + key)
            result[key] = value
        return result
    def constant(value):
        raise ValueError('Nonstandard JSON constant: ' + value)
    if isinstance(data, bytes):
        data = data.decode('utf-8')
    result = json.loads(data, object_pairs_hook=pairs, parse_constant=constant)
    def finite(value):
        if isinstance(value, float) and not math.isfinite(value):
            raise ValueError('Non-finite JSON number')
        if isinstance(value, dict):
            for item in value.values():
                finite(item)
        elif isinstance(value, list):
            for item in value:
                finite(item)
    finite(result)
    return result


def safe_name(name):
    if not isinstance(name, str) or not name or name.startswith('/') or '\\' in name:
        raise ValueError('Unsafe relative path')
    for part in name.split('/'):
        if (part in ('', '.', '..') or part[-1:] in (' ', '.')
                or re.search(r'[\x00-\x1f\x7f<>:"|?*]', part)
                or re.match(r'^(CON|PRN|AUX|NUL|COM[1-9¹²³]|LPT[1-9¹²³])(?:\.|$)', part, re.I)):
            raise ValueError('Unsafe path component: ' + name)
    return name


def checked_path(root, name):
    safe_name(name)
    root = Path(root).absolute()
    item = root / name
    for part in [item, *item.parents]:
        if part.is_symlink():
            raise ValueError('Symlink in path: ' + str(part))
    if not item.resolve().is_relative_to(root.resolve()):
        raise ValueError('Path escapes repository')
    return item


def inventory(root, generated=()):
    root = Path(root).absolute()
    if root.is_symlink() or not root.is_dir():
        raise ValueError('Expected a real repository directory')
    generated = set(generated)
    result = {}
    names = {}
    visited = 0
    total = 0
    for current, dirs, files in os.walk(root, followlinks=False):
        base = Path(current)
        retain = []
        for name in sorted(dirs + files):
            item = base / name
            relative = safe_name(item.relative_to(root).as_posix())
            mode = item.lstat().st_mode
            if stat.S_ISLNK(mode) or not (stat.S_ISREG(mode) or stat.S_ISDIR(mode)):
                raise ValueError('Non-regular source entry: ' + relative)
            if relative == '.git':
                continue
            key = unicodedata.normalize('NFC', relative).casefold()
            if key in names and names[key] != relative:
                raise ValueError('Case/Unicode namespace collision: ' + relative)
            names[key] = relative
            visited += 1
            if visited > MAX_NODES:
                raise ValueError('Source inventory node limit')
            if stat.S_ISDIR(mode):
                if relative not in generated:
                    retain.append(name)
            else:
                result[relative] = item
                total += item.stat().st_size
                if total > MAX_BYTES:
                    raise ValueError('Source inventory byte limit')
        dirs[:] = retain
    return result


def parse_manifest(data):
    text = data.decode('utf-8')
    if not text.endswith('\n') or '\r' in text:
        raise ValueError('Manifest must use UTF-8 and LF')
    rows = {}
    for line in text[:-1].split('\n'):
        match = re.fullmatch(r'([0-9a-f]{64})  (.+)', line)
        if not match:
            raise ValueError('Malformed manifest row')
        digest, name = match.groups()
        safe_name(name)
        if name in rows:
            raise ValueError('Duplicate manifest path: ' + name)
        rows[name] = digest
    if list(rows) != sorted(rows):
        raise ValueError('Manifest path order differs')
    return rows


def manifest_from_hashes(hashes):
    return ''.join(digest + '  ' + name + '\n' for name, digest in sorted(hashes.items())).encode('utf-8')


def read_metadata(root):
    meta = strict_json(checked_path(root, METADATA).read_bytes())
    windows = qualification_contract(meta)
    if (meta.get('schema') != 'webtech-classroom-collection/v1'
            or meta.get('distribution_version') != VERSION
            or meta.get('final_target_version') != VERSION
            or meta.get('latest_published_version') != LATEST_PUBLISHED_VERSION
            or meta.get('candidate_progress') != PROGRESS
            or meta.get('final_phase_scope') != FINAL_PHASE_SCOPE
            or meta.get('qualificationVerdict') != 'NOT_FINAL'
            or meta.get('native_acceptance') is not False
            or meta.get('published') is not False):
        raise ValueError('Current collection identity or qualification differs')
    expected_status = 'WINDOWS_PROFILE_V4_0_0_SOURCE_PREPARED_NOT_PUBLISHED' if windows else f'CANDIDATE_V4_0_0_T{PREPARED_TRANCHE:02}_PREPARED_NOT_FINAL_NOT_PUBLISHED'
    if meta.get('status') != expected_status:
        raise ValueError('Collection status differs from the prepared tranche')
    objects = meta.get('objects')
    if not isinstance(objects, list) or len(objects) != 30 or {obj.get('object_id') for obj in objects} != OBJECTS:
        raise ValueError('Exactly thirty distinct current objects required')
    for obj in objects:
        ident = obj['object_id']
        tranche = 1 if ident.startswith('SETUP_') else (int(ident[1:]) + 1) // 2
        expected = f'T{tranche:02}_COMPLETE_WITH_EXPLICIT_LIMITS' if tranche <= PREPARED_TRANCHE else 'INHERITED_SOURCE_PENDING_LATER_TRANCHE_REVIEW'
        if obj.get('candidate_revision_status') != expected:
            raise ValueError('Object revision exceeds or contradicts prepared tranche: ' + ident)
    gates = meta.get('qualificationGates')
    if not isinstance(gates, dict) or set(gates) != GATES or any(value != 'pending' for value in gates.values()):
        raise ValueError('All ten general qualification gates must remain pending')
    edits = meta.get('editable_files')
    generated = meta.get('generated_directories')
    if not isinstance(edits, list) or len(edits) != 38 or len(set(edits)) != 38:
        raise ValueError('Exactly thirty-eight distinct learner targets required')
    pattern = r'01_WEEKS/WEEK_([0-9]{2})/S\1_SEMINAR/EN_GB/CLASSROOM_RC6/(targets|student)/.+\.(mjs|js|json|css)'
    for name in edits:
        if not re.fullmatch(pattern, safe_name(name)):
            raise ValueError('Learner target boundary differs: ' + name)
    if not isinstance(generated, list) or len(generated) != 83 or len(set(generated)) != 83:
        raise ValueError('Declared runtime directory inventory differs')
    for name in generated:
        safe_name(name)
        if name != 'STUDENT_EVIDENCE' and not name.startswith(('01_WEEKS/', '00_SETUP/')):
            raise ValueError('Runtime directory escapes unit roots')
    verify_publication_profile(root, meta)
    return meta


def verify_progress(root, meta):
    progress = strict_json(checked_path(root, PROGRESS).read_bytes())
    windows = qualification_contract(progress, meta)
    if (progress.get('schema') != 'webtech-candidate-progress/v1'
            or progress.get('candidate_version') != VERSION
            or progress.get('final_target_version') != VERSION
            or progress.get('latest_published_version') != LATEST_PUBLISHED_VERSION
            or progress.get('qualificationVerdict') != 'NOT_FINAL'
            or progress.get('native_acceptance') is not False
            or progress.get('published') is not False
            or progress.get('qualificationGates') != meta['qualificationGates']
            or progress.get('phase') != ('T07_WINDOWS_PROFILE_SOURCE_PREPARED' if windows else f'T{PREPARED_TRANCHE:02}_CANDIDATE_PREPARED')
            or 'next_phase' not in progress
            or progress['next_phase'] is not None
            or progress.get('final_phase_scope') != FINAL_PHASE_SCOPE
            or progress.get('prepared_tranches') != [f'T{number:02}' for number in range(1, PREPARED_TRANCHE + 1)]):
        raise ValueError('Candidate progress identity, distribution or qualification differs')
    tranches = progress.get('tranches')
    if not isinstance(tranches, list) or len(tranches) != 7:
        raise ValueError('Exactly seven candidate tranches required')
    for number, tranche in enumerate(tranches, 1):
        expected_units = [f'{kind}{week:02}' for week in range(number * 2 - 1, number * 2 + 1) for kind in ('C', 'S')]
        if (tranche.get('id') != f'T{number:02}' or tranche.get('units') != expected_units
                or tranche.get('acceptance_status') != 'PENDING'
                or tranche.get('implementation_status') != ('COMPLETE_WITH_EXPLICIT_LIMITS' if number <= PREPARED_TRANCHE else 'PENDING')):
            raise ValueError('Prepared tranche boundary differs: ' + f'T{number:02}')
    return {'phase': progress.get('phase'), 'next_phase': progress.get('next_phase'),
            'final_phase_scope': progress.get('final_phase_scope'),
            'implementation_scope': progress.get('implementation_scope'),
            'global_qualification': 'NOT_FINAL', **qualification_report(meta)}


def verify_source(root, allow_edits=False):
    root = Path(root).absolute()
    meta = read_metadata(root)
    paths = inventory(root, meta['generated_directories'] if allow_edits else ())
    manifest = checked_path(root, MANIFEST).read_bytes()
    rows = parse_manifest(manifest)
    if set(rows) != set(paths) - CONTROLS:
        raise ValueError('Whole-repository manifest inventory differs')
    identity = sha(manifest)
    if checked_path(root, PACKAGE_ID).read_bytes() != (identity + '\n').encode('ascii'):
        raise ValueError('Whole-repository identity differs')
    allowed = set(meta['editable_files']) if allow_edits else set()
    changes = []
    for name, digest in rows.items():
        if sha(paths[name].read_bytes()) != digest:
            if name not in allowed:
                raise ValueError('Protected source bytes differ: ' + name)
            changes.append(name)
    # Source eligibility inherits observations only after recomputing the actual
    # protected unit bytes, not merely checking a resealed outer inventory.
    if meta['publication_qualified']:
        verify_units(root, meta, paths, allow_edits)
    return meta, paths, {'status': 'PASS_PROTECTED_FILES_ONLY' if allow_edits else 'PASS_INITIAL_BYTES_ONLY',
                         'repository_package_id': identity, 'files': len(paths),
                         'allowedStudentChanges': changes, **qualification_report(meta, not allow_edits and not changes)}


def object_root(ident):
    if ident == 'SETUP_WINDOWS':
        return '00_SETUP/WINDOWS/EN_GB/'
    if ident == 'SETUP_MACOS_LINUX':
        return '00_SETUP/MACOS_LINUX/EN_GB/'
    return f'01_WEEKS/WEEK_{ident[1:]}/{ident}_{"COURSE" if ident[0] == "C" else "SEMINAR"}/EN_GB/'


def verify_units(root, meta, paths, allow_edits=False):
    objects = meta.get('objects')
    if not isinstance(objects, list) or len(objects) != 30 or {o.get('object_id') for o in objects} != OBJECTS:
        raise ValueError('Exactly thirty distinct current objects required')
    allowed = set(meta['editable_files']) if allow_edits else set()
    reports = []
    for obj in objects:
        ident = obj['object_id']
        base = object_root(ident)
        if obj.get('payload_root') != base:
            raise ValueError('Current object root differs: ' + ident)
        if obj.get('included_in_collection_version') != VERSION:
            raise ValueError('Current object candidate version differs: ' + ident)
        for field in ('entry', 'start', 'guide', 'package_id_path'):
            name = obj.get(field)
            if not isinstance(name, str) or name not in paths:
                raise ValueError('Current object route missing: ' + ident + '/' + field)
            if field != 'entry' and not name.startswith(base):
                raise ValueError('Current object route leaves its unit: ' + ident)
        form = obj.get('form')
        if form is not None and (form not in paths or not form.startswith(base)):
            raise ValueError('Current evidence form missing: ' + ident)
        if re.fullmatch('S[0-9]{2}', ident) and form is None:
            raise ValueError('Seminar evidence form required: ' + ident)
        if ident == 'C01':
            unit_manifest = '90_AUDIT/PAYLOAD_SHA256SUMS.txt'
            unit_id = '90_AUDIT/PACKAGE_ID.txt'
        elif ident == 'C02':
            unit_manifest = '06_AUDIT/SHA256SUMS.txt'
            unit_id = '06_AUDIT/PACKAGE_ID.txt'
        else:
            unit_manifest = 'SHA256SUMS.txt'
            unit_id = 'PACKAGE_ID.txt'
        if obj['package_id_path'] != base + unit_id:
            raise ValueError('Current unit ID location differs: ' + ident)
        unit = {name[len(base):]: item for name, item in paths.items() if name.startswith(base)}
        rows = parse_manifest(unit[unit_manifest].read_bytes())
        exclusions = {unit_manifest} if ident == 'C02' else {unit_manifest, unit_id}
        if set(rows) != set(unit) - exclusions:
            raise ValueError('Unit manifest inventory differs: ' + ident)
        for name, digest in rows.items():
            if sha(unit[name].read_bytes()) != digest and base + name not in allowed:
                raise ValueError('Protected unit bytes differ: ' + ident + '/' + name)
        if ident == 'C02':
            identity = sha(manifest_from_hashes({name: digest for name, digest in rows.items() if name != unit_id}))
        else:
            identity = sha(unit[unit_manifest].read_bytes())
        if obj.get('package_id') != identity or unit[unit_id].read_bytes() != (identity + '\n').encode('ascii'):
            raise ValueError('Unit identity differs: ' + ident)
        reports.append({'object_id': ident, 'files': len(unit), 'package_id': identity})
    return reports


def verify_course_map(root, meta, paths):
    course = strict_json(checked_path(root, COURSE_MAP).read_bytes())
    qualification_contract(course, meta, 'qualification')
    weeks = course.get('weeks')
    if (course.get('schema') != 'webtech-classroom-course-map/v1'
            or course.get('distribution_version') != VERSION
            or course.get('final_target_version') != VERSION
            or course.get('latest_published_version') != LATEST_PUBLISHED_VERSION
            or course.get('candidate_progress') != PROGRESS
            or course.get('qualification') != 'NOT_FINAL'
            or course.get('native_acceptance') is not False
            or course.get('published') is not False
            or course.get('required_project_count') != 40
            or not isinstance(weeks, list) or len(weeks) != 14
            or {week.get('week') for week in weeks} != set(range(1, 15))):
        raise ValueError('Current fourteen-week course map differs')
    targets = set()
    count = 0
    for week in weeks:
        number = str(week['week']).zfill(2)
        sid = 'S' + number
        if week.get('course_id') != 'C' + number or week.get('seminar_id') != sid or week.get('individual_in_class') is not True:
            raise ValueError('Individual current week requirements differ')
        tranche = (week['week'] + 1) // 2
        expected_revision = f'T{tranche:02}_COMPLETE_WITH_EXPLICIT_LIMITS' if tranche <= PREPARED_TRANCHE else 'PENDING_LATER_TRANCHE_REVIEW'
        if week.get('candidate_revision_status') != expected_revision:
            raise ValueError('Course-map revision exceeds or contradicts prepared tranche: ' + sid)
        if week.get('tutorial') not in paths:
            raise ValueError('Current tutorial missing: ' + sid)
        projects = week.get('required_projects')
        expected_ids = REQUIRED_PROJECT_IDS[week['week']]
        if not isinstance(projects, list) or [project.get('id') for project in projects] != expected_ids:
            raise ValueError('Exact required project IDs/order differ: ' + sid)
        selected = next((obj for obj in meta['objects'] if obj.get('object_id') == sid), None)
        selected_projects = selected.get('projects') if selected else None
        if not isinstance(selected_projects, list) or [project.get('id') for project in selected_projects] != expected_ids:
            raise ValueError('Exact collection project IDs/order differ: ' + sid)
        if [(project.get('id'), project.get('title'), project.get('editable_file')) for project in projects] != [(project.get('id'), project.get('title'), project.get('editable_path')) for project in selected_projects]:
            raise ValueError('Course map and collection project contracts differ: ' + sid)
        for project in projects:
            target = object_root(sid) + safe_name(project['editable_file'])
            if target not in paths:
                raise ValueError('Required project target missing: ' + target)
            targets.add(target)
            count += 1
    if count != 40 or len(targets) != 38 or targets != set(meta['editable_files']) or meta.get('required_microprojects') != 40:
        raise ValueError('Forty required projects or thirty-eight learner targets differ')
    return course, {'weeks': 14, 'required_projects': count, 'editable_targets': len(targets)}


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
        self.langs = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == 'html':
            self.langs.append(values.get('lang'))
        attribute = 'href' if tag in ('a', 'link') else 'src' if tag in ('img', 'script', 'iframe') else None
        if attribute and attribute in values:
            self.urls.append(values[attribute])


def verify_links(root, meta, course, paths):
    scope = {'README.md', '00_START_HERE/README.md'}
    for obj in meta['objects']:
        scope.update(name for name in (obj.get('entry'), obj.get('start'), obj.get('guide'), obj.get('form')) if name)
    scope.update(week['tutorial'] for week in course['weeks'])
    scope.update(name for name in paths if name.startswith('00_START_HERE/') and name.endswith(('.html', '.md')))
    count = 0
    skipped = 0
    for name in sorted(scope):
        text = paths[name].read_text(encoding='utf-8')
        if name.endswith('.html'):
            parser = Links()
            parser.feed(text)
            if parser.langs != ['en-GB']:
                raise ValueError('Current HTML navigation language differs: ' + name)
            urls = parser.urls
        elif name.endswith('.md'):
            text = re.sub(r'```[^\n]*\n.*?```', '', text, flags=re.S)
            urls = re.findall(r'\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)', text)
        else:
            continue
        for url in urls:
            value = urlsplit(url.strip('<>'))
            if value.scheme or value.netloc or not value.path:
                continue
            decoded = unquote(value.path)
            if '${' in decoded or '{{' in decoded:
                skipped += 1
                continue
            if decoded.startswith('/') or '\\' in decoded or '\x00' in decoded:
                raise ValueError('Unsafe current document URL: ' + name)
            target = posixpath.normpath(posixpath.join(posixpath.dirname(name), decoded))
            item = checked_path(root, target)
            folder = target.rstrip('/') + '/'
            directory_link = item.is_dir() and (folder + 'index.html' in paths or (name.endswith('.md') and any(path.startswith(folder) for path in paths)))
            if target not in paths and not directory_link:
                raise ValueError('Missing local document target: ' + name + ' -> ' + url)
            count += 1
    return {'documents': len(scope), 'local_links': count, 'dynamic_targets_not_asserted': skipped,
            'scope': 'Current frontdoors, selected unit start/guide/form pages and fourteen tutorials; external links and dynamic application routes are not network-tested.'}
