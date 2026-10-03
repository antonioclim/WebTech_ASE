# Offline witnesses · source and prediction only

These are teaching witnesses derived from the sealed contract. They are not captures, completed student answers, actual Gemini replies or runtime results. Record `SOURCE_ONLY` or `MODEL_ONLY` when appropriate and keep practical execution pending.

| Witness | Fixed conditions | Prediction to check independently |
| --- | --- | --- |
| P01 filter | HTTP/a/unread and SQLite/b/read; named mount complete; complete array stored under the selected preview namespace | Changing only the active filter changes visible items, without a new post-mount persistence write or a filtered stored subset |
| P01 rejected input | Controlled title with whitespace-only input | Blank trimmed input leaves the complete item collection unchanged |
| P01 identity | Persisted IDs and the separately labelled allocator | Shape validity does not establish uniqueness; a reset canonical counter exposes a bounded collision risk |
| P03 ownership | A starts; cleanup/abort A; B starts and settles; fake A ignores abort and settles afterwards | Old A must have no right to replace current B |
| P03 guard comparison | Same non-cooperative settlement order in variants A, B and C | Active retained in B may still block A. Abort-only C does not establish publication ownership |

An unobserved practical result remains UNKNOWN. An offline fallback does not automatically replace the actual bounded Gemini claim or institutional submission confirmation.
