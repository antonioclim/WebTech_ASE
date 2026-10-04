import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";

it("route identity and list filter remain local to Router and React", async () => { const source = await readFile("src/App.jsx", "utf8"); expect(source).toMatch(/useParams/); expect(source).toMatch(/useState\("all"\)/); expect(source).not.toMatch(/dispatch\([^)]*(route|filter)/i); });
it("store factory injects the API without duplicating domain reducers", async () => { const source = await readFile("src/store/store.js", "utf8"); expect(source).toMatch(/extraArgument: \{ notificationsApi \}/); expect(source).not.toMatch(/createSlice|createEntityAdapter|fetch\(/); });
