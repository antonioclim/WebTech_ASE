# Exemplu de curs — Contractul reprezentării

## Concept demonstrat

Tipul media declarat determină interpretarea corpului; textul care seamănă cu JSON nu devine automat o reprezentare JSON.

## De ce folosim exemplul

Separă resursa, reprezentarea, declarația și serializarea validă fără a introduce un framework de server.

## Ce trebuie observat

- Parametrii tipului media, precum `charset`, nu schimbă tipul de bază.
- Un corp care seamănă cu JSON, dar este declarat `text/plain`, rămâne text.
- Declararea `application/json` nu transformă octeții incorecți în JSON valid.

## Rulare și inspectare

```bash
node example.js
```

## Explicație

Inspectorul citește headerul înainte de a alege parserul. Corpul și headerul trebuie să fie coerente; niciunul nu trebuie dedus din celălalt.

## Variante

- Eliminați `Content-Type` și decideți dacă clientul ar trebui să ghicească.
- Adăugați `application/problem+json` și discutați suportul explicit pentru sufixe structurate.

## Validare

Validat cu `node example.js`; rezultatele JSON, text și JSON invalid sunt verificate.
