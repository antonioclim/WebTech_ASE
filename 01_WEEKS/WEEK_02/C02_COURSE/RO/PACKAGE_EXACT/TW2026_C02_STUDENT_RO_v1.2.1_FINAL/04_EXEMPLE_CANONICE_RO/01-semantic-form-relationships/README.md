# Exemplu de curs — Relații semantice într-un formular

## Concept demonstrat

Elementele native ale formularului expun nume, instrucțiuni, grupare și starea obligatorie prin relații HTML explicite.

## De ce este inclus acest exemplu

Prezintă cel mai mic formular de înregistrare util, fără ca aranjarea CSS sau validarea personalizată să îi ascundă semantica.

## Ce trebuie observat

- Fiecare câmp are o etichetă asociată programatic.
- Instrucțiunea pentru e-mail este conectată prin `aria-describedby`.
- Butoanele radio înrudite sunt grupate prin `fieldset` și `legend`.
- Butonul trimite formularul fără o cale JavaScript disponibilă doar prin clic.

## Rulare și examinare

```bash
node validate.js
```

Deschide `index.html` într-un browser și navighează folosind doar Tab, Shift+Tab, săgețile și Enter.

## Explicație

HTML exprimă direct relațiile controalelor. CSS sau JavaScript pot îmbunătăți ulterior formularul, dar nu trebuie să înlocuiască numele, gruparea, tastatura și trimiterea native.

## Variante

- Elimină o pereche `for`/`id` și examinează eșecul validatorului.
- Compară textul placeholder cu instrucțiunea persistentă.

## Validare

Validat cu `node validate.js`; verifică etichetele, legătura descrierii, gruparea câmpurilor, tipurile intrărilor și trimiterea nativă.
