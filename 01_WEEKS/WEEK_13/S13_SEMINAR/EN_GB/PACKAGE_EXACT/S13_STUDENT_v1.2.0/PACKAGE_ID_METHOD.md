# Package identity method

SHA256SUMS.txt lists every regular payload file, including FILE_INDEX.csv, except itself and PACKAGE_ID.txt. Its UTF-8 lines use LF, lowercase SHA-256, two spaces and a forward-slash relative path, ordered by Unicode code point. PACKAGE_ID.txt is the SHA-256 of those exact manifest bytes followed by LF.

FILE_INDEX.csv has the columns path,role,bytes,sha256 and lists ordinary files excluding itself, SHA256SUMS.txt and PACKAGE_ID.txt. The role is the package classification. The ZIP sidecar hashes the complete archive. An independent external receipt binds all identities. These values establish byte identity; they do not establish native behaviour, grading or publication.
