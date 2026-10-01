# Service Worker Request Dispatcher — Reference

```sh
npm install
npm test
npm start
```

Open `http://127.0.0.1:3000/?selftest=1`. The first uncontrolled page uses direct fetch, then reloads after registration; the controlled page completes through the versioned Service Worker protocol and sets `data-selftest="pass"`. This demonstrates one scoped request intermediary, not complete offline/PWA support.

Run `npm run test:browser` with Chrome/Chromium available for the real lifecycle gate. Set `CHROME_BIN` if the executable is not named `google-chrome`.
