# Optional owner metadata — plain-language completion guide

The repository is publishable without the fields below. Complete only a field
that you deliberately want to make public.

## Public email

Leave it blank when no public contact address is wanted. Never copy a private
Moodle address or an address used only for account recovery.

When you choose to publish an email:

1. open `CITATION.cff`;
2. under the Antonio Clim author entry, add `email: your-address`;
3. open `codemeta.json`;
4. add the same value as `email` in the author object;
5. run the repository validator.

## ORCID

Use the full public ORCID URL, for example `https://orcid.org/0000-...`.
Do not invent one. Add it to `CITATION.cff` as `orcid` and to `codemeta.json`
as `@id` only after verifying the public profile.

## Faculty or department wording

Use the exact official English wording selected by the owner. The safe current
wording is only `Bucharest University of Economic Studies (ASE)`.

## Licence

The repository currently uses an all-rights-reserved notice and intentionally
has no open-source licence file. Do not add MIT, Creative Commons or another
licence merely because GitHub suggests one. A licence is a legal permission,
not decorative metadata.
