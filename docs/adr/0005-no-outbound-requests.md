# The site makes no outbound requests

Every Tool runs entirely in the browser and the homepage promises "No accounts, no uploads." That promise is enforced by a `Content-Security-Policy` with `connect-src 'self'` rather than left to review discipline: a future analytics script, telemetry beacon or third-party error reporter fails in the browser instead of quietly shipping. Nothing a Tool does needs to talk to a server after the page has loaded, so the policy costs nothing today.

## Consequences

- Browser-side analytics, session replay, remote error reporting, and third-party script/font/image hosts are all out of scope by construction. If usage numbers are ever wanted, read them from the host's server logs — the server sees requests; the page does not phone home.
- The policy is **static, not nonce-based**, so `script-src` keeps `'unsafe-inline'`: Next inlines the RSC payload and bootstrapping scripts, and trading static rendering for a nonce would buy XSS hardening this site does not otherwise claim. A reader who "fixes" this by adding a nonce is changing the decision, not tidying it.
- `worker-src 'self' blob:`, `img-src 'self' blob: data:` and `'wasm-unsafe-eval'` stay: the image Tool's Worker, its blob URLs and its WebAssembly codecs are all same-origin and are the reason the Tool can exist at all.
- A Tool that genuinely needs a server call reopens this decision; it does not add an exception to the header.

## Considered Options

- **Rely on discipline, ship no CSP**: rejected — "no uploads" would remain a claim in a README rather than a property of the running site, and the first convenience analytics snippet would silently invalidate it.
- **Nonce-based strict CSP via `proxy.ts`** (Next's documented default): rejected for now — it forces dynamic rendering of every page, and the thing it protects against (XSS) is not what the policy is here for. This is the option to pick if the site ever handles untrusted input it renders.
- **Hash-based CSP with SRI**: rejected — still experimental in this Next version, and it solves the same problem the nonce does.
