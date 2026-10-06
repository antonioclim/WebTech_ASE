"""RC10 course documentation derivatives from the authenticated frozen RC9.

Only explanatory documents change. Executable sources, pins, locks, fixtures and
checks remain byte-identical. Old full-application obligations are reclassified
at their local clause/table, rather than merely overridden by a distant banner.
Word changes are text-only XML derivatives; no native Word qualification follows.
"""
from __future__ import annotations

from html.parser import HTMLParser
import hashlib
import html
import io
import posixpath
import re
import zipfile

# Generated from the frozen published RC9 inputs, never from mutable carriers.
EXPECTED_INPUTS = {'C02': {'00_START_HERE/README_STUDENT.txt': '5c5dd8bd854702ec1cc4ae289e884f6c7bb9440a19b379cb5beb914b8a9b52e8',
         '01_PRESENTATION/COURSE_02_SEMANTIC_HTML_CSS_RESPONSIVE_UI_AND_ACCESSIBILITY_60_MIN_INTERACTIVE_v1.1_EN_GB.html': 'cd681841fd073b7a9b3e3d0af2b7ab204765e1f8adc2e477d8fc3a328438a8b7',
         '02_STUDENT_MATERIALS/PREPARATION_AND_TRANSFER_COURSE_02_v1.1_EN_GB.docx': '387ac5b6c5af85aa7c37fc31f5adfe474c68fc732295167485a554f0f9cb7af5',
         '02_STUDENT_MATERIALS/STUDENT_HANDOUT_COURSE_02_v1.1_EN_GB.docx': 'dc14eb118b5723f1e57ce9ef963ef6cadbf768aee7810f0d29b1c3d91d178f95',
         '04_CANONICAL_EXAMPLES_EN_GB/02-cascade-layer-order/README.md': '31681890f8e924cec0802fdeb914a344f8a11e1d10741a0830ff68ea8daaa82c',
         '04_CANONICAL_EXAMPLES_EN_GB/03-box-model-sizing/README.md': '64d0f14505528db597be98bbd13d03f4c68e4d9b5d6d0213c787e7876023429a',
         '04_CANONICAL_EXAMPLES_EN_GB/04-intrinsic-card-grid/README.md': '4a6bff48c182c8b415690d2e2f5bfa12e8d998d7c3e7adc193c9c5e31ef2b99b',
         '04_CANONICAL_EXAMPLES_EN_GB/05-focus-and-motion-preferences/README.md': '4e08e88a6c58c54711eec31d37fe1a0d65859f6e534f353cb5d9fcc1e62aaaf4',
         '04_CANONICAL_EXAMPLES_EN_GB/06-flex-positioned-container/README.md': '07304f9f0cfb766b399c4f27a9e8f6dfbb67563063cd28a4d68bc74541d8c857',
         'README_FIRST_STEPS.txt': '5c5dd8bd854702ec1cc4ae289e884f6c7bb9440a19b379cb5beb914b8a9b52e8'},
 'C03': {'README.md': '797c08e54420490dc63b4c368a6c43069056adb28beaca4537f4a478a45b8264',
         'SOURCES.md': 'f7a29ee9ec0f7ec44f19883576407eb7c04f912e60545ed1362c868bb92a795a',
         'course.html': 'a67d85d0f177b70996b865d9d2298744f9a64d673921de937b1efd8d7e4911f0',
         'documents/C03_HANDOUT.docx': 'a502ca2aa17e0bb433d4e4f7a9efd2863bc34ecf97956a700090b55d7aa481b9',
         'documents/C03_HANDOUT.md': 'f33b7f5e536a12594c8a80a573c527164c14e27752338f34a66af22e41c9229e',
         'documents/C03_PREPARATION_TRANSFER.docx': '4e5ccfac84be4678c26d02435092a77e3a25461e63b4a5916772cffd0f1ba164',
         'documents/C03_PREPARATION_TRANSFER.md': 'cf4a8f062c96a00378836b62cca43f2e638330f519e4e43178196b489960881a',
         'index.html': 'b3b5eabdf5cf93bb856d6d8648aa83095d6cbbf97af9891ad6d8348028c362da',
         'reading.html': '2225b0fcdfc7946d79fdc73ac6833f3bf39644c3b12b58169f021ef2da7a116b',
         'readme.html': 'ee592044ddf8540998964b650ff563499b88540567bc9d20ba8d9ba26f47c42c',
         'sources.html': 'cec8368c60a6f57d9eb72a2b03ee3058e186edc5d21418a8e9f75d9efaad8cda'},
 'C04': {'README.md': '6cda4429ad02a775a36c1e36ba7069e91165dbdde7f551c92dee1fb5232e78e1',
         'course.html': '1db7aef378b508ace63d96623bc756823aeb9e551f9e2af1a26bc7a1a6b12170',
         'documents/C04_HANDOUT.docx': 'e2231b4e8891d4c827f245c64e8105f3e8c2ff2ea5a9aa6547e3a62eb32ff7c8',
         'documents/C04_HANDOUT.md': '1ec15dfe82e8a323042199f09b512b1797147193dca87e8c0709bfd2e2a56345',
         'documents/C04_PREPARATION_TRANSFER.docx': '0927244ccd840ec339a067d21e537944d861db3900eb3156d9d9c26fd2dbeb22',
         'documents/C04_PREPARATION_TRANSFER.md': '795609947e1acfbe1fbe2136e60395428754838032efe7210505bc805fe698ee',
         'index.html': '1bb27111474971d9e316abd03a7125f9611bc0745c4caf46d20fde556771a221',
         'lab.html': 'a88d8cdb0635631a500392627a0f14737383c3a0df31a7e333b7d3116f397efa',
         'preparation.html': 'cb2c4f1e8c2a7b6dbe33012414f334f28d468c4f013d2965758a8e35aeeb245a',
         'reading.html': 'b2bd0c622e9668cb6163ad0e5dc9406e6e922e3ac3bfd89986c4e98d6ddd2df1'},
 'C05': {'README.md': '73decc760dc3153246a1d83d0744d9dcfac21c4d065e9b9e6f6ed6c28dd22a08',
         'RUN_EXAMPLES.md': '1f59e36e997eed369678140d028d565bba375a699c70ccf6de946d465148041a',
         'SOURCES.md': 'f129b2883e1285869561223a014b7640351aa33c9fde6e2c714f2ec9f0b113af',
         'course.html': '51be3ca2a86dc73465a8227c52a9647a9af31f11c3b42823530fc03525266626',
         'documents/C05_HANDOUT.docx': '9629d42a56c87f4663a706466e3815b21db4df2990f2581792734f30b05bc287',
         'documents/C05_HANDOUT.md': '172d5ca6e83d029e6ae15374e04784c99c7c4e35a4b85270950431f292a715e5',
         'documents/C05_PREPARATION_TRANSFER.docx': 'dfcc365d69b4cd98766ade088be696cd0f9f6a810b4cd23d32b2b086d972618c',
         'documents/C05_PREPARATION_TRANSFER.md': 'f3ab00ae5f8e61954d0f58ded015c303d92abd3e8b44b0605765d99730e2f814',
         'guide.html': '552431c1ec5c6403c7d3098318e12a71edf93527338e5e1120889d0002b682c8',
         'guided.html': 'ff54484480c7505769f207ddfab217c83570d4e9a9c0cdafd4815a1a37ffb4a6',
         'index.html': '36ec4be6f4df1a694ea4a317ff4b8daf6a2d0b7967069dbbabafba079f5d0f87',
         'lab.html': '70658e9e04e34358e6ecee16cc30d541d2f29b68e6f76a64a256f8204aa76a41',
         'preparation.html': '1611c2227329c33eddd4d59c89fb0f8f29e56f7e37d7983c205b117436d004c5',
         'reading.html': '8beeff1ad40d7c6336f299238cc3b2c7a34f92d3cbb2433908dd9a1192b676ff',
         'sources.html': '8b1ea9a445d205febb192df7547cbe57caf4e45d9d97d791490180d59199c19c'},
 'C06': {'README.md': 'ca38253e7d895a35781de8a8fd861d3ca58f7ef4530200e8c433667b0b32450e',
         'RUN_EXAMPLES.md': 'd8207d64e3d30e2c1d49cbbf3460ada0d3b04101afc5fc89acd51770249278f4',
         'SOURCES.md': '66f2b346ac26c5011018e76c145360c42a9fd0837154c0095c304eeec7daa7af',
         'course.html': '2276ad2ed0106972c83a48b2dd0819e60d89df3671a82c93e0575fe3b2454eac',
         'documents/C06_HANDOUT.docx': '712e4381b652fb665046e256a9f35efa044c250f3561d709b55cff98071bead4',
         'documents/C06_HANDOUT.md': '481e705e890cb20808e28b697478b2d02c938d3c0342533273d6ea017fb19ee8',
         'documents/C06_PREPARATION_TRANSFER.docx': '6abd1d0af4cec52cb6376982460de8f8fe71235f4f58ccd32e5b92957e5428f3',
         'documents/C06_PREPARATION_TRANSFER.md': '9b81e32cebdd32d9e2a9b56eafd02cfb73dbbfb262f40ddfbcb154e9f146bc60',
         'guide.html': 'f4e0ede3ef4e7bd3220d2b72ff25951b2fa67a723088d255ae280aac8bb252ca',
         'index.html': 'b92ca9e5dee8a04838937cfd289b77c30a46e562a0774f64b76f29f6b5f555ea',
         'preparation.html': '5fb72bc684457dcd1a3de9024612f51eefbb1da4e1353f61a0e6cb75768f06cc',
         'reading.html': '2732e3d5f7f83c9bc4256155ca9e262741793a60ab71b7e21a3b26e1c085dbc1',
         'sources.html': '34ab9b50e34ff8da5ec654f3d7dbce059e314ea03533d9b0c75672c986942704'},
 'C07': {'GEMINI_PROMPT.txt': 'ca445c9ec3000e56a52422c852fecd1dc8ef17da2e1527c35497c2f978789a5d',
         'MACOS_LINUX.md': '902dd1e25f5cbdd670843ffbb3bad8c6f8dbc95f311bcc504e287a91424aaaaf',
         'README.md': '6ae73f678d2ec9a452f3743b4615366e1c0672ffa25167a675e72cf6ff8baae0',
         'RUN_EXAMPLES.md': '4149ce92ab1b698bf4f6d430ba2dc6b4cd7eae2c6ae29bf3d4b55351e2feec3b',
         'SOURCE_NOTES.md': '3e740c941a81cd50cedf0a08f9c45b8f013a1e2c20013b38f022914b9dbcd48e',
         'WINDOWS.md': '301e3686670c89398cf1f08ef03dccdad2deddb7880414ab021dc54f7eb6547a',
         'course.html': 'b72ff63beaca94b60bbea32943473a594786f0d229d5a811d865e7b519ee0ca7',
         'documents/C07_HANDOUT.docx': 'e1fcc984ac189ff29cf3e8c6532ae4ecdcb1980e73bf2db5e29d872d7159de77',
         'documents/C07_HANDOUT.md': '74d1710028e93e765c21d28376227f9127e123a29056a59653da744d7671fc43',
         'documents/C07_PREPARATION_TRANSFER.docx': '2b4185bd8263ef2e032f171f698d54db41c22b8e426a27dc3ee89d61672266a8',
         'documents/C07_PREPARATION_TRANSFER.md': 'f508170babf011617c2d6575a3958b4e9116b7d8138d74b12956564c91cfba12',
         'guide.html': '1e9cab538752ba533d326b1018c365407bf2c9c3f7a15090b06e218bd2e02c0e',
         'index.html': '450adb0bb556a9037f7c659a43cdbfaf699dd2d55fe0e2ee404d77b3d4f407d8',
         'preparation.html': 'e3dd47ce2c4e2be2ba8056e679ef7c2751067850e35164db81495e156c5ebcf1',
         'reading.html': '70acfea68ee489728d67ce27a85d46d24d41581277932bef8f6a7d262c6ecbf3',
         'sources.html': 'f377fb29e6da895f313477377a3b261f0e1d1383639d1a776ff79ecfadcc9b79'},
 'C08': {'GEMINI_PROMPT.txt': '59bccb1e38932e799310d945288fc5b21f73ff985eaf3197e28b0b405602fd2a',
         'GUIDE.md': 'bae52be3fe545bd0c7edb1d08cbe9e58879d66af6cd628fcf99a3d4b84b5c123',
         'README.md': '2e3070f3b63bc4ea8a33b4a2f34df89073516608d5e87779561e7aaccc1111e9',
         'SOURCES.md': '02d948bf15c7a41bd1c8490c73333ddb783a7bd5628caca71ecab711acba872d',
         'SOURCE_NOTES.md': '3064041ae4fa1f7a7e56a7e9a149f8cd3ac4f7de5da2ee6a78d823f65793fec7',
         'course.html': 'cea71bcb11cdd71281b0afbcf3aa668aac6ef0e497aa0f2ff914e53aa03fd608',
         'documents/C08_HANDOUT.docx': '27abb4f36c06cf376517e2e7336f32505d2978daef80ba3ce9c40e14cfa0769f',
         'documents/C08_HANDOUT.md': 'd4fd7000aba08d6a2f4ce136c50bc9d0ad75516b8eba810b8e992282a032daef',
         'documents/C08_PREPARATION_TRANSFER.docx': '8e028c1a1f9b5de09e2bd87b23672f7b7e55dbfe8eedcb53696feb1ce3518a7a',
         'documents/C08_PREPARATION_TRANSFER.md': 'bc2924d5eb074c3293c9ccb5c39341d15ad5465bbf7363e73d368360da2c693c',
         'guide.html': '010996656f3ccc9c9eb38d69bde7e30b6c34a690126d61425dca06fe10dc2de2',
         'index.html': 'bf09d1127597f6ce913d8ff1178e8ed53709cd82d7805e718abe52c2a39eaa5b',
         'preparation.html': '77c6859a407f58271716f8ba54df1f657e3cbdd0916d7650964d1d8b018a3a29',
         'reading.html': '5a44e274355ce1b84459b9fe88f5f26c16d485a7b325a150f858c9831f64e62a',
         'sources.html': '3f8524a6fef7921f08c85a1620a0e7fb38e43cfad118ac49a3c4060adf033a7c'},
 'C09': {'GUIDE.md': 'b9f64eb2535f2d0dd50e2949d007f23cd8c8a717b6f303694a7479addd42513b',
         'README.md': '8021078c5c4fdf86aab88d50c98dd8272470b8ed1c03030f7395e74eb33be9f2',
         'SOURCES.md': '847e945693d7c0927215c1f233122ab2c17058d6cf03f0098333b0464519ff1a',
         'SOURCE_NOTES.md': '2241dcdbd2bc246b84a58c62a12c84ae3604804adfd94e4475e3949ff5f42964',
         'course.html': '34ddb62e56e79d55d1af4b82774abd3d30cf30a8d2f44a0984ea12580b54bf76',
         'documents/C09_HANDOUT.docx': '41d4869aaf9be49c16e63cef61517e2413c8e8caad20e84a509305b8a13fa147',
         'documents/C09_HANDOUT.md': '91bdc41fd85647fc91281b6e803aca7355f816fdae45d5a4adb5086159532ea5',
         'documents/C09_PREPARATION_TRANSFER.docx': '26572051747cbf8efebed66e7377d6ab98c3ff076250312404f235b6d9fa4a8b',
         'documents/C09_PREPARATION_TRANSFER.md': '02a74af7e2ed301e3878eafb153e2e0142194e556a4e44b07e3b9d14f03328e5',
         'guide.html': '4e58a8041b8fb000962880ca91a645a96dfc5f3c7f9a17701b51747131bd3fff',
         'index.html': 'de66c27386d818a4c8777e91301369ca9526ad245500713a2c78dd445de85c06',
         'preparation.html': '7a37869ec92a2fc5db06163c1abac6df090b4e2eba51dd3ff9ab13e370f20487',
         'reading.html': '69e154a20ff464fae8a8629c838f878836d40c5a4e1bfece2a24aa77526c3111',
         'sources.html': '8abd8325c507e394c29ceeb6cbce94718a0499f61b8e258928f2c02e8bb0425c'},
 'C10': {'GUIDE.md': '71426614408f5eec62242642c9437068b7281b81719a6ddabe6ab3d39d16c399',
         'README.md': '0d8a48bd557fba6f1f9bb18d47a962329ebaddf98cb8d71159856545aa94f059',
         'SOURCE_NOTES.md': 'c348c3d031c3812a99d2426cf641aa016c7b5aba6e4b5d5e739e0d754ca3d05e',
         'course.html': '43072d82453462654319f950bcf0e7e28478fe8163ead2862ffe25a2650c69c8',
         'documents/C10_HANDOUT.docx': '526dac8be1d79afb246cf776951afd39087a71f0fe92fc4cdfe963c03f2562e9',
         'documents/C10_HANDOUT.md': '1260da12f64dec0a3960b0d332f09cd4cb5c23958f68463951dbf21c7ec72183',
         'documents/C10_PREPARATION_TRANSFER.docx': '2bff7e638998378d7d15d7df63176d2fe499580333b17d5aa48762bbe165b56f',
         'documents/C10_PREPARATION_TRANSFER.md': '0ab8c118b93f6fbe104a7c896fa7f7421f47a20628e3e1a74cda0adfe146a475',
         'index.html': 'ef2912c38b5966ebeb161cb15b36f0a5b137440965d383febdc592560ee5922d',
         'preparation.html': '48bf2e8daadb48f77d83fb3c8a4ab0f1952048fc3bf90516ff8cd829f7b32fef',
         'reading.html': 'bcd2f7d926d4b9e2015cb5941764be8efc855b79cd88c4ccea416d1ff30815ea',
         'sources.html': '9b5a41aa14a58c7f8d6feaafa970ca89eefbc302fe856d5ae747a10223f21243'},
 'C11': {'GUIDE.md': '0c248069002c0cf73fc7e32d9674f607e7edaaf9b57a4e5235fbda71169ae953',
         'README.md': '8289f82dc4e29d4d496376111a028c1ed6983187ae23db87196e0038de0441a3',
         'SOURCES.md': 'e16b7b53ab15120573e2aea0ffac061d11d383407473bed9c179f30e64451258',
         'SOURCE_NOTES.md': '8039bcabf4bc9d033d6cec837f1caa7ebd5b20c438498ef93b256530b1d678e3',
         'course.html': '16ec40125410840bb3108fff39eac39e3b0a9fc9706a5f915c2d3b232d1f29c9',
         'documents/C11_HANDOUT.docx': '75dcdc215bc95e7f3779cd6bf3cf5ece7421e979ba0a64a727c877661057c94f',
         'documents/C11_HANDOUT.md': 'c204ac1f69be3bda8baa2e355de4c3e35538a8e6a633848e9abdea213efbffc5',
         'documents/C11_PREPARATION_TRANSFER.docx': 'c9c1c46bb2858e8f5429930614a76c5e6939f3f651d9d454c7d13403e0d95aa4',
         'documents/C11_PREPARATION_TRANSFER.md': 'c8b11ed45cbb7130af5241c4b9e18a467bad83a12f710026ffefb8e80b3ecd7c',
         'guide.html': 'd322222ff953f5ac39870875b84f522e901f4ea8d96e8f6c61543933c3a36c64',
         'index.html': '37ca95bd7ff7b939aefe725c78a67355144eb33566a5aaa302ee82eaa5500ef0',
         'preparation.html': 'f5c4b806bbac3b5a876d14708b055f561cdebef2d63c338fa6362b2184372d89',
         'reading.html': 'd29377df6b002dea3479c8f30914aa93b3d453701864129c9919ef9b176f8a10',
         'sources.html': '7bc75bfae7eb3b2c48630185f77bd692ee9930cf704f73276878211e414c2486'},
 'C12': {'README.md': '543b7ce8325820ee9cebed3c4dc88bd065f78eea3e42e0003f741560ee5b336c',
         'SOURCE_NOTES.md': '936c4f17d843c25ab69d0af4a26c8e00f7ed3037a77f112ab4413dc19404041f',
         'course.html': 'ddcaf9acf928d5effc3a4212b0c57781ee8e68aad5b2aa54b2f2a5b0cd7f4727',
         'documents/C12_HANDOUT.docx': 'dd64faedafe480f4d12dad9731b44b6585d865649cfee7441ce082a585dd0bd7',
         'documents/C12_HANDOUT.md': '3aca71f9ce7305dcd2b8a13dfbc5a04142f2a268a1d44bda6f3f0fd673b8189c',
         'documents/C12_PREPARATION_TRANSFER.docx': '1af820fe0c5c5515f13ac764f8db9ca7a1e1e0c1d99722a9a31aec1df8a406b1',
         'documents/C12_PREPARATION_TRANSFER.md': 'ae1ad690b9fccdce6a201f783578cec350b34dccd9380e6ce67058aaccce8f0e',
         'guide.html': '6cfa02150d11831d6f733faa474a7ba45e23b44b709a5fb191f00212a2e86de2',
         'index.html': 'a2b2ce337ddf16e2b815f6d338e31539ecb175048504b2866523c4c4abefce16',
         'preparation.html': '56723a4544aae6ef25f78e1b977f569526f7e5719a5bfe012f6437e545c5bfab',
         'reading.html': '92ef03aa6b3328137aafc7b8a6b6917f0929063fb78f154e1dba25faa441ac8d'},
 'C13': {'GUIDE.md': 'cbec477215cf3a99bec29ca35277c18e7fa7905830c837ba26d67f42e9e29b90',
         'SOURCES.md': '4f30647db7f54772192ec1d578927fecae39417010508bfb48e10edae7da23e6',
         'SOURCE_NOTES.md': '4f30647db7f54772192ec1d578927fecae39417010508bfb48e10edae7da23e6',
         'course.html': 'ef737797bfd9799b097a6c5d2aa9a5dc1afd44d18875440c8749f662bda5a877',
         'documents/C13_HANDOUT.docx': 'fb4d11f337b17faf1ab6dc3fc41391ed9ff5ae983372f9359bfb4799536dc705',
         'documents/C13_HANDOUT.md': '0905c1fb7dc0cb0263eab995ba2cfe9206a544b00ea735a1e6fd5c7a962fe576',
         'documents/C13_PREPARATION_TRANSFER.docx': '7b918374e2e1f9caf4e8095105fee258474f818e15cd8d5713ae138a5adf53ca',
         'documents/C13_PREPARATION_TRANSFER.md': 'd5deec78d18eeaf48d63054905f586352edae464ca8db8239ad10b0c60265fa0',
         'guide.html': '3f90249aa82ef1879f69bd960214280d81d0145ddf097d7e5e9acf40a422a213',
         'index.html': '3d81ea7847aa0a68769a0f66277652ca0feb1581123eac4ac814a994739dfcc8',
         'preparation.html': '460c02a9b0a7db7ab1cf9b74d8cad4139f79019b7b33a9cd01a890b7298141fe',
         'reading.html': 'f458aff55419a743e5c7241db3a9a397649226edd742868b3f9f8e54c09d2921',
         'sources.html': '9fa9a9c9b1824c678a290cd1f054efa9d57ed05e30b444c9595bd31b9930e699',
         'worked-mechanisms.html': 'efa59fa6a17e483b814ae08a1a6a6f5aeaf37478697bc6cd0f5fb494cedab69d'},
 'C14': {'SOURCE_NOTES.md': '8b03a2a5427c3e14ef957134fd9fc825d2a38e0a8bcd4f510f3294521db084df',
         'course.html': 'e593f6d76501ac6d264ef6e5374525f0de95bf7eed5a55bef90aab188afedaa9',
         'documents/C14_HANDOUT.docx': '69daa052707cdf83143e8b01bfd97cbb888a750fe6eadf8299c8053a3de4cb96',
         'documents/C14_HANDOUT.md': '185a21d3b3fb5bfccf6e2c957fe6d1f89f2ea345eec91ff6ee5a5d2cef3229c8',
         'documents/C14_PREPARATION_TRANSFER.docx': 'f7e35f6c14bd080bd277e3bfc76a0e95138dd2e50fa199519d14438dbe753fdf',
         'documents/C14_PREPARATION_TRANSFER.md': 'ed1492c6e38152dee745ac71159c516ee1f19cd8e78fe711c40db84453e3fcdb',
         'index.html': 'c09e6c4e7743fcdd3c3e965a50730240801165d6a2f37db78cb8bb560bd23fc3',
         'preparation.html': '2d81440269b79d6f87c93ae75ad5ff06477f54b2792037d6e33b1666a98a9603',
         'reading.html': 'd65743eb107912b8fe8c72e2bb56da3b23c172b46af71301d83462fd83e4c468',
         'sources.html': 'b10bfb2e80e85b26d82849ecd1fbd20da35433939f2c20830f892ce7374d2cce',
         'worked-mechanisms.html': '059f23ae35bacb9f227b0954ba7b27e8258a222c2a2fa3983ccded883ba81af8'}}

STYLE = {
    'Choose from required behavior': 'Choose from required behaviour',
    'Close queues, workers, and Redis clients': 'Close queues, workers and Redis clients',
    'Registered, ready, and controlled differ': 'Registered, ready and controlled differ',
    'Origin is not user authorization': 'Origin is not user authorisation',
    'Composition has organizational cost': 'Composition has organisational cost',
    'Minimize sensitive data': 'Minimise sensitive data',
    'Separate baseline, objective, and regression': 'Separate baseline, objective and regression',
}

HISTORICAL = ('Historical full-application source reference. Its implementation is optional '
              'advanced work in this collection; old project IDs, paths, role allocations, '
              'timings and mark statements below do not define the current seminar tasks. '
              'The conceptual explanation remains course content.')
HISTORICAL_SHORT = ('Historical full-application context; implementation is optional advanced '
                    'reference, outside the current seminar task allocation.')
OLD_SCOPE = re.compile(r'\bP0[1-4]\b|\bU14-P01\b|Regression Harness|11\.3[AB]|'
                       r'student/src/|projects/p0[1-4]/|src/(?:transform-tasks|book-seats|'
                       r'authorization-policy|note-query)\.(?:js|mjs)|'
                       r'next (?:production )?phase|when (?:it is )?(?:supplied|delivered)', re.I)


class _Document(HTMLParser):
    """Locate original HTML slices without reserialising scripts or source code."""
    def __init__(self, text: str):
        super().__init__(convert_charrefs=False)
        self.text, self.nodes, self.stack = text, [], []
        self.lines = [0] + [m.end() for m in re.finditer('\n', text)]
        self.feed(text)

    def _source_offset(self):
        line, column = self.getpos()
        return self.lines[line - 1] + column

    def handle_starttag(self, tag, attrs):
        if tag in {'meta', 'link', 'img', 'br', 'input', 'hr', 'source', 'wbr', 'embed', 'area', 'base', 'col', 'param'}:
            return
        node = {'tag': tag, 'start': self._source_offset(), 'children': [],
                'parent': self.stack[-1] if self.stack else None}
        self.nodes.append(node)
        if self.stack:
            self.stack[-1]['children'].append(node)
        self.stack.append(node)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i]['tag'] == tag:
                self.stack[i]['end'] = self.text.find('>', self._source_offset()) + 1
                self.stack = self.stack[:i]
                return

    def raw(self, node):
        return self.text[node['start']:node['end']]


def _visible(text):
    return ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', text)).split())


def _require(test, message):
    if not test:
        raise ValueError('RC10 course derivative: ' + message)


def _rel(path, target, item):
    source = item['payload_root'].rstrip('/') + '/' + path
    return posixpath.relpath(target, posixpath.dirname(source))


def _seminar(ident, seminar_item):
    _require(seminar_item is not None, ident + ': missing authenticated seminar item')
    sid = 'S' + ident[1:]
    _require(seminar_item.get('object_id') == sid, ident + ': seminar identity mismatch')
    projects = seminar_item.get('projects')
    _require(isinstance(projects, list) and 2 <= len(projects) <= 3, ident + ': unexpected project count')
    _require(len({p['id'] for p in projects}) == len(projects), ident + ': duplicate project ID')
    for project in projects:
        _require(re.fullmatch(r'P0[1-3]', project['id']) is not None and
                 all(isinstance(project.get(k), str) and project[k] for k in ('title', 'editable_path')),
                 ident + ': invalid current project')
    for key in ('payload_root', 'entry', 'tutorial', 'form'):
        _require(isinstance(seminar_item.get(key), str) and seminar_item[key], ident + ': missing ' + key)
    return sid, projects


def _mapping_html(ident, path, item, seminar):
    sid, projects = _seminar(ident, seminar)
    esc = html.escape
    rows = ''.join('<tr><td>' + esc(p['id']) + '</td><td>' + esc(p['title']) + '</td><td><code>' +
                   esc(p['editable_path']) + '</code></td></tr>' for p in projects)
    links = ' · '.join('<a href="' + esc(_rel(path, seminar[key], item), quote=True) + '">' + label + '</a>'
                       for key, label in [('entry', 'Current ' + sid + ' entry'), ('tutorial', 'Step-by-step tutorial'),
                                          ('form', 'Current evidence form')])
    return ('<section class="rc10-current-transfer" id="rc10-current-transfer" aria-labelledby="rc10-transfer-title">'
            '<h2 id="rc10-transfer-title">Current ' + sid + ' classroom transfer</h2>'
            '<p>Each student completes all ' + str(len(projects)) + ' listed microprojects individually in class. '
            'Each project is a bounded task with its own editable target, rather than completion of the retained full application.</p>'
            '<table><thead><tr><th scope="col">ID</th><th scope="col">Current project</th>'
            '<th scope="col">Editable path from the seminar package root</th></tr></thead><tbody>' + rows + '</tbody></table>'
            '<p>' + links + '</p><p>Open the current entry, follow the tutorial, preserve the protected support files and run '
            'the stated target checks. Record actual starting and repaired outcomes, including any blocked or unexecuted check. '
            'Use the current evidence form for all listed projects, export one PDF, review the saved pages and filename '
            'and upload that reviewed PDF to the corresponding private Moodle Assignment. A failed or blocked check is not a PASS.</p>'
            '<p>Historical full applications below remain optional advanced references. Reused IDs do not make their old '
            'contracts, paths, portfolios, timing estimates or mark statements current assessment rules. '
            'The actual Assignment supplies dates and assessment policy; this course makes no completion-time or mark guarantee.</p></section>')


def _mapping_text(ident, path, item, seminar):
    sid, projects = _seminar(ident, seminar)
    lines = ['Current ' + sid + ' classroom transfer',
             'Complete every listed microproject individually in class. These are bounded tasks, not completion of the historical full applications.']
    lines += [p['id'] + ' — ' + p['title'] + ' — editable path from the seminar package root: ' + p['editable_path']
              for p in projects]
    lines += ['Current entry: ' + _rel(path, seminar['entry'], item),
              'Step-by-step tutorial: ' + _rel(path, seminar['tutorial'], item),
              'Current evidence form: ' + _rel(path, seminar['form'], item),
              'Preserve support files, run the stated target checks and record actual results, including blocked or unexecuted checks. '
              'Complete the current form for all projects and export one PDF. Review its saved pages and filename before uploading '
              'it to the corresponding private Moodle Assignment. A blocked check is not a PASS.',
              'The old full applications are optional advanced references. Their reused IDs, paths, allocations, portfolio '
              'requirements, timings and mark statements do not define these current microprojects. '
              'The actual Assignment supplies dates and assessment policy. No completion-time or mark guarantee is made here.']
    return lines


def _historical_match(text, ident):
    # Availability-only C09/C11 clauses and non-ID transfer obligations are covered too.
    return bool(OLD_SCOPE.search(text) or re.search(r'\bS' + ident[1:] + r'\b.*(?:required|central|assessed|core|'
                r'portfolio|form|suppl|deliver|produc|complete|implement)', text, re.I))


def _html_derivative(text, ident, path, item, seminar):
    _require('rc10-current-transfer' not in text, path + ': already derived')
    doc = _Document(text)
    edits, covered = [], []
    # A whole historical allocation table is labelled outside the table, avoiding invalid tbody children.
    candidates = []
    for node in doc.nodes:
        if 'end' not in node or node['tag'] not in {'table', 'p', 'pre', 'li', 'div'}:
            continue
        if node['tag'] == 'div' and any(c['tag'] in {'div', 'p', 'pre', 'table', 'ul', 'ol', 'section'} for c in node['children']):
            continue
        ancestors, p = [], node['parent']
        while p:
            ancestors.append(p['tag']); p = p['parent']
        if any(t in {'script', 'style', 'select', 'button'} for t in ancestors):
            continue
        if _historical_match(_visible(doc.raw(node)), ident):
            candidates.append(node)
    # Prefer enclosing table or pre to its inline descendants; no overlapping splice.
    candidates.sort(key=lambda n: (n['start'], -n['end']))
    for node in candidates:
        if any(a <= node['start'] and node['end'] <= b for a, b in covered):
            continue
        raw = doc.raw(node)
        current_link = '<a href="#rc10-current-transfer">Current ' + 'S' + ident[1:] + ' task list and evidence route</a>.'
        label = '<p class="rc10-historical-scope"><strong>' + HISTORICAL_SHORT + '</strong> ' + current_link + '</p>'
        if node['tag'] == 'li':
            opening_end = raw.index('>') + 1
            replacement = raw[:opening_end] + '<strong>' + HISTORICAL_SHORT + '</strong> ' + current_link + ' ' + raw[opening_end:]
        else:
            replacement = '<div class="rc10-historical-reference">' + label + raw + '</div>'
        edits.append((node['start'], node['end'], replacement)); covered.append((node['start'], node['end']))
    # Derived display headings only; no source snippets or quoted/code titles are normalised.
    for node in doc.nodes:
        if 'end' not in node or node['tag'] not in {'h1', 'h2', 'h3', 'h4'}:
            continue
        raw = doc.raw(node)
        if '<code' in raw or '<q' in raw:
            continue
        changed = raw
        for old, new in STYLE.items():
            changed = changed.replace(old, new)
        if changed != raw:
            _require(not any(a <= node['start'] < b for a, b in covered), path + ': overlapping heading')
            edits.append((node['start'], node['end'], changed))
    _require(len(edits) > 0 or path == 'lab.html', path + ': no old scope anchors found')
    for start, end, replacement in sorted(edits, reverse=True):
        text = text[:start] + replacement + text[end:]
    current = _mapping_html(ident, path, item, seminar)
    # Current route is visible within the main content and outside any individual slide.
    match = re.search(r'<main\b[^>]*>', text, re.I)
    _require(match is not None, path + ': main opening missing')
    text = text[:match.end()] + current + text[match.end():]
    return text


def _text_derivative(text, ident, path, item, seminar):
    _require('RC10 CURRENT CLASSROOM TRANSFER' not in text, path + ': already derived')
    # Fences are atomic: insert scope labels outside them and leave the quoted code exact.
    lines, blocks, i = text.splitlines(keepends=True), [], 0
    while i < len(lines):
        if not lines[i].strip():
            blocks.append(lines[i]); i += 1; continue
        fence = re.match(r"^\s*(`{3,}|~{3,})", lines[i])
        if fence:
            token, block = fence[1][0], [lines[i]]
            i += 1
            while i < len(lines):
                block.append(lines[i]); end = bool(re.match(r"^\s*" + re.escape(token) + r"{3,}\s*$", lines[i]))
                i += 1
                if end:
                    break
            blocks.append(''.join(block)); continue
        block = []
        while i < len(lines) and lines[i].strip() and not re.match(r"^\s*(`{3,}|~{3,})", lines[i]):
            line = lines[i]
            if re.match(r"^#{1,6}\s", line):
                for old, new in STYLE.items():
                    line = line.replace(old, new)
            block.append(line); i += 1
        blocks.append(''.join(block))
    for i, block in enumerate(blocks):
        if _historical_match(block, ident):
            blocks[i] = '> ' + HISTORICAL + '\n\n' + block
    header = '# RC10 CURRENT CLASSROOM TRANSFER\n\n' + '\n\n'.join(_mapping_text(ident, path, item, seminar)) + '\n\n'
    return header + ''.join(blocks)


def _paragraph_text(raw):
    return ''.join(html.unescape(t) for t in re.findall(r'<w:t(?:\s[^>]*)?>(.*?)</w:t>', raw, re.S))


def _replace_paragraph_text(raw, new):
    found = False
    def change(m):
        nonlocal found
        value = html.escape(new, quote=False) if not found else ''
        found = True
        return '<w:t xml:space="preserve">' + value + '</w:t>'
    changed = re.sub(r'<w:t(?:\s[^>]*)?>.*?</w:t>', change, raw, flags=re.S)
    _require(found, 'Word paragraph contains no text')
    return changed


def _xml_paragraph(text):
    return '<w:p><w:r><w:t xml:space="preserve">' + html.escape(text, quote=False) + '</w:t></w:r></w:p>'


def _docx_derivative(data, ident, path, item, seminar, c02=False):
    source = io.BytesIO(data)
    with zipfile.ZipFile(source) as archive:
        _require(archive.testzip() is None, path + ': invalid Word ZIP')
        infos = archive.infolist()
        _require(len({i.filename for i in infos}) == len(infos), path + ': duplicate Word ZIP member')
        original = archive.read('word/document.xml').decode('utf-8')
        _require('RC10 current classroom transfer' not in original and 'RC10 variation method' not in original,
                 path + ': already derived Word document')
        paragraphs = list(re.finditer(r'<w:p(?:\s[^>]*)?>.*?</w:p>', original, re.S))
        _require(paragraphs, path + ': no Word paragraphs')
        edits = []
        for paragraph in paragraphs:
            raw, value = paragraph[0], _paragraph_text(paragraph[0])
            new = value
            if ident == 'C07' and 'The README describes two sessions; the script does not create them.' in new:
                new = new.replace('The README describes two sessions; the script does not create them. Both original files remain unchanged in canonical/.',
                                  'The predecessor README described two sessions; the script creates one session. '
                                  'The current canonical README correctly identifies one conference, one session, one attendee and one registration. '
                                  'The executable example remains unchanged; the predecessor text remains in the frozen predecessor.')
            if c02:
                if re.search(r'(swap the layer|remove the layers|remove position:relative)', value, re.I):
                    new = 'Use the RC10 variation method below: a disposable external copy for layer edits, or temporary DevTools for the position declaration. ' + new
            elif _historical_match(value, ident):
                new = HISTORICAL_SHORT + ' Current task IDs, titles and editable paths appear in the RC10 transfer section of this document. ' + new
            # Only paragraph headings (Word style Heading*) are editorial display labels.
            if re.search(r'<w:pStyle\b[^>]*w:val="Heading', raw):
                for old, replacement in STYLE.items():
                    new = new.replace(old, replacement)
            if new != value:
                edits.append((paragraph.start(), paragraph.end(), _replace_paragraph_text(raw, new)))
        if ident == 'C07' and path.endswith('C07_HANDOUT.docx'):
            _require('The README describes two sessions; the script does not create them.' in original,
                     path + ': expected C07 predecessor paragraph missing')
        insertion = ['RC10 variation method'] + C02_VARIATION_LINES if c02 else ['RC10 current classroom transfer'] + _mapping_text(ident, path, item, seminar)
        # Keep the title first and all existing runs/relationships/styles elsewhere.
        edits.append((paragraphs[0].end(), paragraphs[0].end(), ''.join(_xml_paragraph(v) for v in insertion)))
        edited = original
        for start, end, replacement in sorted(edits, reverse=True):
            edited = edited[:start] + replacement + edited[end:]
        out = io.BytesIO()
        with zipfile.ZipFile(out, 'w') as destination:
            for info in infos:
                destination.writestr(info, edited.encode('utf-8') if info.filename == 'word/document.xml' else archive.read(info.filename))
        result = out.getvalue()
    # The derivative changes only document.xml uncompressed bytes.
    with zipfile.ZipFile(io.BytesIO(data)) as old, zipfile.ZipFile(io.BytesIO(result)) as new:
        _require(old.namelist() == new.namelist() and new.testzip() is None, path + ': Word structure changed')
        for name in old.namelist():
            if name != 'word/document.xml':
                _require(old.read(name) == new.read(name), path + ': changed non-document XML part ' + name)
    return result


C02_VARIATION_LINES = [
    'Current collection identity: use PACKAGE_ID.txt at the top of the entire RC10 collection and its declared verification route. The C02 package identity is 06_AUDIT/PACKAGE_ID.txt, with 06_AUDIT/SHA256SUMS.txt, relative to the C02 package root; its unchanged package verifier uses those resealed controls. Retained source-copy indices and predecessor identities describe their frozen source snapshots. The C02 READMEs are explicit documentation derivatives; canonical example HTML, CSS and JavaScript remain protected original source. Do not repair a verification failure by editing manifests yourself.',
    'Preserve the extracted classroom collection and its canonical examples. Open examples in an ordinary browser; the historical headless command is outside the supported student route. Do not change browser security settings.',
    'For layer-order or layer-removal experiments: (1) use your file manager to create a separate WebTech_Work/C02_Variants folder outside the extracted collection; '
    '(2) copy the complete 02-cascade-layer-order example folder into it; (3) open only that copied folder in VS Code and edit its index.html; '
    '(4) open the copied index.html in an ordinary browser, inspect matched rules and computed values and compare with the untouched original; '
    '(5) keep or delete the disposable working copy without altering collection manifests or original files. Record that this is a variant, with the original source path and your actual change.',
    'The supplied canonical layer example initially reports color=rgb(23, 32, 51) and background=rgb(220, 233, 255). '
    'Reversing the named layer order makes the legacy declarations win; removing layers makes the more specific legacy selector win. '
    'Predict first and record the actual computed result. The presentation and handout use a separate illustrative colour fixture; do not substitute their colours for the canonical page.',
    'For a temporary position experiment, open the unchanged 06-flex-positioned-container page, open browser DevTools and select the .card element. '
    'In Styles, untick position:relative and inspect the badge. This change lasts only in the inspected page; reload to restore the original. '
    'Do not enable Local Overrides, save DevTools changes to disk or edit the protected collection. '
    'Use the same temporary checkbox method for single declarations such as flex-wrap or a focus rule. '
    'A missing declaration may be experimented with only in the separate disposable copy.',
    'An unavailable browser or unperformed variation stays blocked or unexecuted in your observation record. These steps do not claim native browser acceptance.'
]


def _c02(files, item):
    result = dict(files)
    for path, digest in EXPECTED_INPUTS['C02'].items():
        _require(path in files and hashlib.sha256(files[path]).hexdigest() == digest, 'C02 authenticated anchor missing/changed: ' + path)
    route = '\n\n'.join(C02_VARIATION_LINES)
    result['C02_VARIATION_METHOD.md'] = ('# C02 — protected sources and disposable variations\n\n' + route + '\n').encode()
    for path in EXPECTED_INPUTS['C02']:
        data = files[path]
        if path.endswith('.docx'):
            result[path] = _docx_derivative(data, 'C02', path, item, None, c02=True)
        elif path.endswith('.html'):
            text = data.decode()
            doc = _Document(text)
            edits = []
            for node in doc.nodes:
                if node['tag'] != 'p' or 'end' not in node:
                    continue
                value = _visible(doc.raw(node))
                if re.search(r'reverse.*layer|remove.*layer|remove.*position|layer order is reversed', value, re.I):
                    end_open = doc.raw(node).index('>') + 1
                    raw = doc.raw(node)
                    replacement = raw[:end_open] + '<strong>Variation method:</strong> layer edits use a disposable external copy; single-declaration checks may use temporary DevTools changes, restored by reload. Read <a href="' + html.escape(posixpath.relpath('C02_VARIATION_METHOD.md', posixpath.dirname(path))) + '">the protected-source variation method</a> before changing anything. ' + raw[end_open:]
                    edits.append((node['start'], node['end'], replacement))
            for start, end, replacement in sorted(edits, reverse=True):
                text = text[:start] + replacement + text[end:]
            result[path] = text.encode()
        else:
            text = data.decode()
            if path.endswith('02-cascade-layer-order/README.md'):
                old = 'Open `index.html` in a browser, or run the documented headless check:'
                _require(text.count(old) == 1, path + ': headless instruction anchor missing')
                text = text.replace(old, 'Open `index.html` in an ordinary browser and inspect its matched rules and computed values. '
                                    'This is the supported student route.\n\n### Historical provenance — do not execute\n\n'
                                    'The following predecessor command is retained as exact source provenance. '
                                    'It is outside the current student route; do not run it or change browser security settings:', 1)
                text = text.replace('## Variations\n', '## Variations\n\nFollow the [protected-source variation method](' +
                                    posixpath.relpath('C02_VARIATION_METHOD.md', posixpath.dirname(path)) +
                                    ') first. Perform layer edits only in the disposable copy outside the collection.\n', 1)
                text = text.replace('Validated in headless Chromium;', 'Historical predecessor validation statement, not a new RC10 execution: validated in headless Chromium;', 1)
            elif path.startswith('04_CANONICAL_EXAMPLES_EN_GB/'):
                _require('## Variations' in text, path + ': variations heading missing')
                text = text.replace('## Variations\n', '## Variations\n\nFollow the [protected-source variation method](' +
                                    posixpath.relpath('C02_VARIATION_METHOD.md', posixpath.dirname(path)) +
                                    ') first: temporary DevTools changes are restored by reload, or use a disposable external copy. '
                                    'Do not save changes into the protected collection.\n', 1)
            else:
                text += '\n\n## Protected examples and variations\n\n' + route + '\n'
            result[path] = text.encode()
    return result


def derive(ident: str, files: dict[str, bytes], item: dict, seminar_item: dict | None) -> dict[str, bytes]:
    """Return a new explanatory unit; input keys are unit-relative frozen RC9 paths."""
    result = dict(files)
    if ident not in EXPECTED_INPUTS:
        return result
    _require(item.get('object_id') == ident and isinstance(item.get('payload_root'), str), 'invalid course item')
    if ident == 'C02':
        return _c02(files, item)
    _seminar(ident, seminar_item)
    for path, digest in EXPECTED_INPUTS[ident].items():
        _require(path in files and hashlib.sha256(files[path]).hexdigest() == digest,
                 ident + ': authenticated old documentation anchor missing/changed: ' + path)
    for path in EXPECTED_INPUTS[ident]:
        data = files[path]
        if path.endswith('.docx'):
            result[path] = _docx_derivative(data, ident, path, item, seminar_item)
        elif path.endswith('.html'):
            result[path] = _html_derivative(data.decode('utf-8'), ident, path, item, seminar_item).encode('utf-8')
        else:
            result[path] = _text_derivative(data.decode('utf-8'), ident, path, item, seminar_item).encode('utf-8')
    path = 'RC10_CURRENT_TRANSFER.md'
    _require(path not in files, ident + ': existing transfer derivative')
    result[path] = ('# RC10 current classroom transfer\n\n' + '\n\n'.join(_mapping_text(ident, path, item, seminar_item)) + '\n').encode('utf-8')
    return result


def editorial_reasons(ident: str) -> dict[str, str]:
    """Explain changed-path intent; root records actual hashes and reseals controls."""
    if ident not in EXPECTED_INPUTS:
        return {}
    if ident == 'C02':
        return {path: ('C02_VARIATION_METHOD_AND_HISTORICAL_HEADLESS_SCOPE') for path in EXPECTED_INPUTS[ident]} | {
            'C02_VARIATION_METHOD.md': 'C02_DISPOSABLE_EXTERNAL_COPY_AND_TEMPORARY_DEVTOOLS_INSTRUCTIONS'}
    return {path: ('CURRENT_BOUNDED_SEMINAR_TRANSFER_AND_LOCAL_HISTORICAL_FULL_APPLICATION_SCOPE'
                   + ('; C07_CURRENT_PREDECESSOR_README_DISTINCTION' if ident == 'C07' and path.endswith('C07_HANDOUT.docx') else '')
                   + ('; DERIVED_EN_GB_DISPLAY_HEADING_ALIGNMENT' if ident in {'C12', 'C13', 'C14'} else ''))
            for path in EXPECTED_INPUTS[ident]} | {'RC10_CURRENT_TRANSFER.md': 'CURRENT_AUTHENTICATED_SEMINAR_PROJECTS_AND_EVIDENCE_ROUTE'}
