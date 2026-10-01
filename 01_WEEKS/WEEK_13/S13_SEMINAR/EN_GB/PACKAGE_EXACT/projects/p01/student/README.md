# Worker Offload — Reference

```sh
npm install
npm test
npm start
```

Open `http://127.0.0.1:3000/`. The page performs number analysis in a module Worker. For the automated browser probe, open `/?selftest=1`; completion sets `data-selftest="pass"` only when the worker result matches the synchronous oracle and a main-thread heartbeat advances during work.

Run `npm run test:browser` with Chrome/Chromium available for the real lifecycle gate. Set `CHROME_BIN` if the executable is not named `google-chrome`.
