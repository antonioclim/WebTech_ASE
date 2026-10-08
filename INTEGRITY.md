# Current collection integrity

Run `node VERIFY_COLLECTION.mjs` from the extracted collection or clone before editing. Run `node VERIFY_COLLECTION.mjs --allow-student-edits` after editing the 38 declared learner targets or creating the declared generated folders. The checker skips the Git control directory, refuses extra collection files, and preserves all protected teaching bytes. It does not grade projects or execute teaching code.

`SHA256SUMS.txt` contains sorted SHA-256 rows for every current file except itself and `PACKAGE_ID.txt`. `PACKAGE_ID.txt` is the SHA-256 of the exact UTF-8 manifest bytes, followed by a newline. `.gitattributes` disables checkout text conversion so those hashes work consistently. These controls detect accidental changes; they are not a digital signature.

Each unit also retains its own integrity scheme. C02 includes its package ID row in its audit manifest and derives the ID from the canonical rows excluding that row. Other affected outer units derive their ID from the manifest. Inner classroom source and boundary controls remain exact. If a maintainer changes protected files, all affected unit and collection controls must be regenerated together and reviewed; student edits do not rewrite the supplied controls.

The root collection identity describes this current checkout. The frozen v3.0.0 archives keep their separate published identities. General qualification remains NOT_FINAL; see [QUALIFICATION.html](QUALIFICATION.html).
