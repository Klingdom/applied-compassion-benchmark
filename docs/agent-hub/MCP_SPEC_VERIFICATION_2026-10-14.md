# MCP specification verification for `cb-hub` (open item O-1)

| Field | Value |
|---|---|
| Date | 2026-10-14 |
| Scope | Every Model Context Protocol statement in `docs/AGENT_HUB_CB_HUB_ARCHITECTURE.md` §3 (rows marked UNVERIFIED, open item O-1), plus the protocol behaviour in §6 and §7 that relies on them |
| Method | Pages fetched with WebFetch from the primary source, `modelcontextprotocol.io/specification/...`, and the spec repository's GitHub releases page. Quotes are verbatim from the fetched text. Every URL below was accessed on **2026-10-14**. |
| Architecture doc | Not edited. This file is the record that probe P-H22 asks for. The implementer should copy the version and date into §3 at HB-5. |

---

## 1. Current specification version

**The latest revision is `2026-07-28`, not `2025-11-25`.** The architecture doc's §3 assumption is **CORRECTED**.

| Evidence | Quote | URL |
|---|---|---|
| Versioning page | "The **current** protocol version is [**2026-07-28**](/specification/2026-07-28/)." | https://modelcontextprotocol.io/specification/versioning |
| GitHub releases | `2026-07-28` (28 Jul 2026) is tagged **Latest**, stable. It was preceded by `2026-07-28 RC` (29 May 2026, pre-release), then `2025-11-25`, `2025-06-18`, `2025-03-26` and `2024-11-05`. Nothing newer than 2026-07-28 is published. | https://github.com/modelcontextprotocol/modelcontextprotocol/releases |

No revision newer than 2026-07-28 exists as of 2026-10-14. A future `draft` may be open on the site, but it is not a published revision.

### 1.1 Why it matters: 2026-07-28 is a different protocol era

The 2026-07-28 changelog (https://modelcontextprotocol.io/specification/2026-07-28/changelog) states:

> "Remove protocol-level sessions and the `Mcp-Session-Id` header from the Streamable HTTP transport."

> "Make MCP stateless: remove the `initialize`/`notifications/initialized` handshake. Every request now carries its protocol version and client capabilities in `_meta` (`io.modelcontextprotocol/protocolVersion`, `io.modelcontextprotocol/clientCapabilities`). [...] Version mismatches return `UnsupportedProtocolVersionError`"

> "Add `server/discover`: servers MUST implement this RPC to advertise their supported protocol versions, capabilities, and identity."

> "Replace the HTTP GET endpoint and `resources/subscribe`/`resources/unsubscribe` with `subscriptions/listen`"

> "Remove `ping`, `logging/setLevel`, and `notifications/roots/list_changed`."

> "All results now carry a required `resultType` field"

> "Require standard MCP request headers (`Mcp-Method`, `Mcp-Name`) on Streamable HTTP POST requests"

> "Require `ttlMs` and `cacheScope` fields on results returned by `tools/list` [...] via a new `CacheableResult` interface."

The versioning page (https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning) defines the eras:

> "**Modern**: protocol versions that convey version, identity, and capabilities as per-request metadata (revision `2026-07-28` and later)."
> "**Legacy**: protocol versions that establish a session with an `initialize` handshake (`2025-11-25` and earlier)."

The design's `SUPPORTED_VERSIONS = ["2025-11-25", "2025-06-18"]` makes cb-hub a **legacy-only** server under this terminology. §5 explains the effect.

---

## 2. Statement-by-statement record (architecture doc §3)

Each row gives the claim, the verdict, the exact quote and the source. All accessed 2026-10-14.

### V-01 Source table: "2025-11-25 ... believed to be the current revision at cutoff"
- **Verdict: CORRECTED.** The current revision is 2026-07-28 (see §1).
- Quote: "The **current** protocol version is [**2026-07-28**](/specification/2026-07-28/)."
- URL: https://modelcontextprotocol.io/specification/versioning

### V-02 Endpoint: "One endpoint that accepts POST, and GET for an optional server-to-client stream."
- **Verdict: VERIFIED for 2025-06-18 and 2025-11-25.** It no longer holds for 2026-07-28, which removes GET.
- Quote (2025-11-25): "The server **MUST** provide a single HTTP endpoint path (hereafter referred to as the **MCP endpoint**) that supports both POST and GET methods."
- Quote (2026-07-28): "The server **MUST** provide a single HTTP endpoint path (hereafter referred to as the **MCP endpoint**) that supports POST."
- URLs: https://modelcontextprotocol.io/specification/2025-11-25/basic/transports ; https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http

### V-03 POST body: "One JSON-RPC request, notification or response. Batching was removed in 2025-06-18; the 2025-03-26 revision required servers to accept batches."
- **Verdict: VERIFIED.** Batching has **not** been re-added. The text is the same in 2025-11-25, and 2026-07-28 is stricter: the client may no longer POST responses at all.
- Quote (2025-06-18 changelog): "Remove support for JSON-RPC **batching** (PR #416)"
- Quote (2025-03-26 transports): "The body of the POST request **MUST** be one of the following: A single JSON-RPC *request*, *notification*, or *response*; An array batching one or more *requests and/or notifications*; An array batching one or more *responses*". The 2025-03-26 changelog: "Added support for JSON-RPC **batching** (PR #228)".
- Quote (2025-06-18 and 2025-11-25 transports): "The body of the POST request **MUST** be a single JSON-RPC *request*, *notification*, or *response*."
- Quote (2026-07-28): "The body of the HTTP POST **MUST** be a single JSON-RPC *request* or *notification*. The client **MUST NOT** send JSON-RPC *responses*."
- URLs: https://modelcontextprotocol.io/specification/2025-06-18/changelog ; https://modelcontextprotocol.io/specification/2025-03-26/basic/transports ; https://modelcontextprotocol.io/specification/2025-03-26/changelog ; https://modelcontextprotocol.io/specification/2025-11-25/basic/transports ; https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http
- Note: no revision specifies a status code for a batch array. cb-hub's 400 / -32600 is consistent with "MUST be a single".

### V-04 Response to a request: "The server returns either `Content-Type: application/json` (one JSON object) or `text/event-stream`. The client must accept both."
- **Verdict: VERIFIED in every revision from 2025-03-26 to 2026-07-28.** A single JSON response with no SSE is explicitly allowed.
- Quote (2025-11-25): "If the input is a JSON-RPC *request*, the server **MUST** either return `Content-Type: text/event-stream`, to initiate an SSE stream, or `Content-Type: application/json`, to return one JSON object. The client **MUST** support both these cases."
- Quote (2026-07-28): "If the body is a JSON-RPC *request*, the server **MUST** return either `Content-Type: application/json` (a single JSON object) or `Content-Type: text/event-stream` (an SSE response stream). The client **MUST** support both."
- URLs: as V-02.

### V-05 Notification or response from the client: "`202 Accepted` with no body if accepted; otherwise an HTTP error."
- **Verdict: VERIFIED.**
- Quote (2025-06-18 and 2025-11-25): "If the input is a JSON-RPC *response* or *notification*: If the server accepts the input, the server **MUST** return HTTP status code 202 Accepted with no body. If the server cannot accept the input, it **MUST** return an HTTP error status code (e.g., 400 Bad Request). The HTTP response body **MAY** comprise a JSON-RPC *error response* that has no `id`."
- URLs: https://modelcontextprotocol.io/specification/2025-06-18/basic/transports ; https://modelcontextprotocol.io/specification/2025-11-25/basic/transports
- cb-hub's 400 for a client-sent response falls under "cannot accept the input". Conformant.

### V-06 GET: "The server returns an SSE stream or `405 Method Not Allowed`."
- **Verdict: VERIFIED.**
- Quote (2025-06-18 and 2025-11-25): "The server **MUST** either return `Content-Type: text/event-stream` in response to this HTTP GET, or else return HTTP 405 Method Not Allowed, indicating that the server does not offer an SSE stream at this endpoint."
- Quote (2026-07-28, backward compatibility): "HTTP GET or DELETE to the MCP endpoint: respond with `405 Method Not Allowed`."
- URLs: as V-02.

### V-07 Sessions: "`Mcp-Session-Id` is optional. A server may be stateless."
- **Verdict: VERIFIED.** 2026-07-28 removes sessions entirely and prescribes cb-hub's exact handling of a stray header.
- Quote (2025-06-18 and 2025-11-25): "A server using the Streamable HTTP transport **MAY** assign a session ID at initialization time, by including it in an `Mcp-Session-Id` header on the HTTP response containing the `InitializeResult`." And: "If an `Mcp-Session-Id` is returned by the server during initialization, clients [...] **MUST** include it". So the obligation exists only if the server issues one.
- Quote (DELETE): "The server **MAY** respond to this request with HTTP 405 Method Not Allowed, indicating that the server does not allow clients to terminate sessions."
- Quote (2026-07-28): "An `Mcp-Session-Id` header on a request: ignore it, and do not mint or echo session IDs."
- URLs: as V-02. The 2025-11-25 page spells the header `MCP-Session-Id`. Header names are case-insensitive, so this has no effect.

### V-08 Protocol version header: "After initialization the client sends `MCP-Protocol-Version`. If it is missing, the server SHOULD assume 2025-03-26. An unsupported value MUST get 400."
- **Verdict: VERIFIED for 2025-06-18 and 2025-11-25 (verbatim match).** In 2026-07-28 the header is required on every POST, and a 2026-07-28 server that does not support pre-2025-06-18 clients **MUST** reject a missing header.
- Quote (2025-11-25): "If using HTTP, the client **MUST** include the `MCP-Protocol-Version: <protocol-version>` HTTP header on all subsequent requests to the MCP server". And: "For backwards compatibility, if the server does *not* receive an `MCP-Protocol-Version` header, and has no other way to identify the version - for example, by relying on the protocol version negotiated during initialization - the server **SHOULD** assume protocol version `2025-03-26`." And: "If the server receives a request with an invalid or unsupported `MCP-Protocol-Version`, it **MUST** respond with `400 Bad Request`."
- Quote (2025-06-18 changelog): "Require negotiated protocol version to be specified via `MCP-Protocol-Version` header in subsequent requests when using HTTP (PR #548)."
- Quote (2026-07-28): "Every POST request to the MCP endpoint **MUST** include an `MCP-Protocol-Version` header." And: "A server that does not support such clients **MUST** reject a request without the header per Server Validation."
- URLs: https://modelcontextprotocol.io/specification/2025-11-25/basic/transports ; https://modelcontextprotocol.io/specification/2025-06-18/changelog ; https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http
- Required on subsequent requests? Yes. It is a client **MUST** in 2025-06-18 and later. The server's obligations are the SHOULD fallback and the MUST-400 for an unsupported value. DV-3 (accept a missing header) remains a documented deviation from a SHOULD for the legacy versions cb-hub claims.

### V-09 Version negotiation: "The client sends the latest version it supports. If the server supports it, it MUST reply with the same version. Otherwise it replies with a version it supports, which SHOULD be its latest."
- **Verdict: VERIFIED for 2025-06-18 and 2025-11-25 (identical text).**
- Quote: "In the `initialize` request, the client **MUST** send a protocol version it supports. This **SHOULD** be the *latest* version supported by the client. If the server supports the requested protocol version, it **MUST** respond with the same version. Otherwise, the server **MUST** respond with another protocol version it supports. This **SHOULD** be the *latest* version supported by the server. If the client does not support the version in the server's response, it **SHOULD** disconnect."
- What happens when the client's version is unsupported: the server counter-offers, and the client decides whether to disconnect. The lifecycle "Error Handling" section also shows an error form as an example: `{"code": -32602, "message": "Unsupported protocol version", "data": {"supported": ["2024-11-05"], "requested": "1.0.0"}}`.
- URLs: https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle ; https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle
- In 2026-07-28 there is no handshake. Quote: "If the server does not implement the requested version [...] it **MUST** respond with an `UnsupportedProtocolVersionError` listing the versions it does support" (code `-32022`, HTTP 400, `data.supported` and `data.requested`). URL: https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning

### V-10 Origin and DNS rebinding: "Servers MUST validate `Origin` on all incoming connections. The 2025-11-25 revision states that a present, invalid `Origin` MUST get 403 (UNVERIFIED wording). Local servers should bind to localhost."
- **Verdict: VERIFIED, including the 403 wording.** The 403 rule is new in 2025-11-25. 2025-06-18 has only "MUST validate". 2026-07-28 keeps the 403 rule unchanged.
- Quote (2025-11-25 and 2026-07-28): "Servers **MUST** validate the `Origin` header on all incoming connections to prevent DNS rebinding attacks. If the `Origin` header is present and invalid, servers **MUST** respond with HTTP 403 Forbidden. The HTTP response body **MAY** comprise a JSON-RPC *error response* that has no `id`." And: "When running locally, servers **SHOULD** bind only to localhost (127.0.0.1) rather than all network interfaces (0.0.0.0)". And: "Servers **SHOULD** implement proper authentication for all connections".
- Quote (2025-11-25 changelog): "Clarify that servers must respond with HTTP 403 Forbidden for invalid Origin headers in Streamable HTTP transport. (PR #1439)"
- Quote (2025-06-18): "Servers **MUST** validate the `Origin` header on all incoming connections to prevent DNS rebinding attacks". It does not mention 403.
- URLs: https://modelcontextprotocol.io/specification/2025-11-25/basic/transports ; https://modelcontextprotocol.io/specification/2025-11-25/changelog ; https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
- cb-hub's 403 for a bad Origin, its acceptance of an absent Origin, and its rejection of `Origin: null` (a present value that is not on the allow-list) all conform. The spec does not address the `Host` allow-list or `Sec-Fetch-Site` checks. They are additional defences and nothing in the spec contradicts them. The spec says "SHOULD implement proper authentication". cb-hub is an unauthenticated public read-only endpoint, so it deviates from that SHOULD. The design does not record this deviation; see C-3.

### V-11 Accept: "The client MUST list `application/json` and `text/event-stream`."
- **Verdict: VERIFIED.** It is a client obligation in every revision. The spec defines no server status code for a non-conforming `Accept`, so cb-hub's 406 and its lenient "admits `application/json`" rule are implementation choices that the spec allows.
- Quote (2025-11-25): "The client **MUST** include an `Accept` header, listing both `application/json` and `text/event-stream` as supported content types."
- URL: https://modelcontextprotocol.io/specification/2025-11-25/basic/transports

### V-12 Tool annotations: "`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint` (since 2025-03-26)."
- **Verdict: VERIFIED for the introduction date.** The four hint names were not quoted from a page fetched in this session; the tools page only says `annotations` is optional. They should be confirmed against `schema.ts` at HB-5. They are the known `ToolAnnotations` fields.
- Quote (2025-03-26 changelog): "Added comprehensive **tool annotations** for better describing tool behavior, like whether it is read-only or destructive (PR #185)".
- Quote (2025-11-25 tools): "`annotations`: Optional properties describing tool behavior" and "clients **MUST** consider tool annotations to be untrusted unless they come from trusted servers."
- URLs: https://modelcontextprotocol.io/specification/2025-03-26/changelog ; https://modelcontextprotocol.io/specification/2025-11-25/server/tools

### V-13 `ping`: "The receiver must answer with an empty result."
- **Verdict: VERIFIED for 2025-11-25 and earlier.** `ping` is **removed** in 2026-07-28.
- Quote (2025-11-25): "The receiver **MUST** respond promptly with an empty response: `{"jsonrpc": "2.0", "id": "123", "result": {}}`"
- Quote (2026-07-28 changelog): "Remove `ping`, `logging/setLevel`, and `notifications/roots/list_changed`."
- URLs: https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/ping ; https://modelcontextprotocol.io/specification/2026-07-28/changelog

---

## 3. CORRECTED and additional findings

| ID | Finding | Verdict | Effect on design |
|---|---|---|---|
| C-1 | Latest revision is **2026-07-28** (stable, 28 Jul 2026), not 2025-11-25. | CORRECTED (V-01) | §3 source table and P-H22 record must say 2026-07-28. Whether cb-hub supports it is a design decision; see §5. |
| C-2 | Under 2026-07-28, `ping` no longer exists, GET is gone, sessions are gone, and `initialize` is gone. | Clarification (V-02, V-08, V-13) | No conflict while `SUPPORTED_VERSIONS` stays legacy. If 2026-07-28 is added, the `ping`-based health check (DV-8, §11.5) works only as a legacy-era call. |
| C-3 | "Servers **SHOULD** implement proper authentication for all connections" (2025-11-25 and 2026-07-28 security list). | New, not in the doc | cb-hub is deliberately unauthenticated and read-only. Record it as a deviation (DV-9) with the rationale (public read-only data, no per-user state), so that the deviations table is complete. |
| C-4 | 2025-11-25 changelog: "Clarify that input validation errors should be returned as Tool Execution Errors rather than Protocol Errors to enable model self-correction". The tools page lists "Input validation errors (e.g., date in wrong format, value out of range)" under Tool Execution Errors (`isError: true`). Protocol errors are for "Malformed requests (requests that fail to satisfy CallToolRequest schema)" and "Unknown tools". | New, not in the doc | §7.3 maps "Invalid arguments" to JSON-RPC **-32602** (HTTP 200). That diverges from a SHOULD in 2025-11-25, the newest version cb-hub claims. "Unknown tool → -32602" is fine; it matches the spec's own example. Options: return argument-validation failures as `{content:[…], isError:true}`, or record DV-10 citing local/remote parity (P-H32, P-H08). URL: https://modelcontextprotocol.io/specification/2025-11-25/server/tools |
| C-5 | `initialize` with an over-long version string: the design returns a bare -32602. The spec's example error carries `data.supported` and `data.requested`. 2026-07-28 says a modern-only server "**SHOULD** name the protocol versions it supports in any error it returns to an `initialize` request". | Refinement | Optional. Add `data: { supported: SUPPORTED_VERSIONS }` to the -32602 body. Do not echo `requested`, because H-F10 forbids an unbounded echo. |

No VERIFIED row needed its spec quote corrected except V-01. V-08's statement is exact for the claimed versions.

---

## 4. Check of the design's four chosen behaviours against the spec

| Design choice | Spec position (2025-06-18 / 2025-11-25) | Spec position (2026-07-28) | Contradiction? |
|---|---|---|---|
| Stateless, `application/json` only, never SSE, no `Mcp-Session-Id` | Allowed: JSON or SSE is the server's choice (V-04); sessions are MAY (V-07). | Mandatory: the protocol is stateless; JSON or SSE is per request. | **None.** The 2026-07-28 backward-compatibility text prescribes cb-hub's handling of GET, DELETE and `Mcp-Session-Id` word for word. |
| Batches rejected (400, -32600) | Batching removed in 2025-06-18; body "MUST be a single" message (V-03). | Same, and client responses are banned too. | **None**, provided 2025-03-26 is never claimed. The design already excludes it (DV-3). |
| Fixed `SUPPORTED_VERSIONS = ["2025-11-25","2025-06-18"]`, echo if supported, else counter-offer the newest | Exactly the lifecycle rule (V-09). | Not applicable: no `initialize`. A 2026-07-28 request carries `MCP-Protocol-Version: 2026-07-28`, which cb-hub rejects with 400 at §6 step 6. | **None for the claimed versions.** cb-hub is *legacy-only*, so modern-only clients cannot use it; see §5. |
| 403 for a bad Origin | MUST in 2025-11-25 (V-10); "MUST validate" in 2025-06-18. | MUST, unchanged. | **None.** |

**One interaction to fix (no contradiction, but it would break fallback).** The 2026-07-28 Streamable HTTP backward-compatibility rule tells a dual-era client to inspect the body of a `400`: "If the body contains a recognized modern JSON-RPC error, the server speaks a modern version of MCP — retry [...] rather than falling back. If the body is empty or is not a recognized modern JSON-RPC error, fall back to `initialize`". A dual-era client will first send a modern request with `MCP-Protocol-Version: 2026-07-28`. cb-hub rejects it at step 6 with 400. For that client to fall back to `initialize`, the 400 body **must not** use the modern codes `-32020`, `-32021` or `-32022`. Use an empty body, or a legacy code such as `-32600`. The design says only "400" for step 6. Pin the body, and add it to P-H22. URL: https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http

---

## 5. Does any correction change the design?

**The four core choices hold.** Stateless JSON-only responses, the batch ban, version negotiation with a fixed list, and 403 for a bad Origin are all conformant for 2025-06-18 and 2025-11-25. They also agree with the direction of 2026-07-28.

**C-1 forces one founder or architect decision: legacy-only at launch, or dual-era.**

- **Option A, legacy-only (the design as written).** The design is unchanged apart from the step-6 body pin (§4), C-3, C-4 and C-5. Effect: clients that implement only 2026-07-28 fail ("Modern | Legacy | Fails", versioning compatibility matrix). Dual-era clients and legacy clients work.
- **Option B, dual-era: add `"2026-07-28"` to `SUPPORTED_VERSIONS`.** cb-hub is already stateless, so this is additive. The 2026-07-28 spec then requires:
  - `server/discover` (MUST), returning `supportedVersions`, `capabilities`, `resultType`, `ttlMs` and `cacheScope`.
  - Per-request `_meta` validation: `io.modelcontextprotocol/protocolVersion` and `clientCapabilities` are required, else -32602 with HTTP 400.
  - Header-to-body validation of `MCP-Protocol-Version`, `Mcp-Method` and `Mcp-Name`, else 400 and `-32020`. A missing header MUST be rejected.
  - `UnsupportedProtocolVersionError` (`-32022`, HTTP 400, `data.supported`).
  - Unknown method returns **HTTP 404** with -32601. The design currently returns 200.
  - `resultType: "complete"` on every result.
  - `ttlMs` and `cacheScope` on `tools/list`.
  - No `ping` on the modern path.
  - Change the lexical pre-scan: `_meta` adds keys up to 42 characters (under the 64 cap) and one or two nesting levels. Re-measure the depth-8 cap against `_meta.clientCapabilities.extensions.*`.
  - Change §6 step 13, which allows only the four top-level envelope keys. That is still fine, because `_meta` lives inside `params`.
  - Version-conditional behaviour, which means DV-3 must flip for the modern path.

  This is a non-trivial slice and should not be folded silently into HB-5.

**Recommendation:** ship Option A for HB-5. It is conformant to 2025-11-25 and makes no claim beyond that. Record 2026-07-28 support as a tracked follow-up slice with the checklist above, and make the founder or architect decision explicit. Before HB-5 merges, apply the step-6 400-body pin, C-3 (DV-9), C-4 (fix or DV-10) and C-5.

---

## 6. Sources (all accessed 2026-10-14)

- https://modelcontextprotocol.io/specification/versioning
- https://github.com/modelcontextprotocol/modelcontextprotocol/releases
- https://modelcontextprotocol.io/specification/2026-07-28/changelog
- https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http
- https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning
- https://modelcontextprotocol.io/specification/2026-07-28/basic/index
- https://modelcontextprotocol.io/specification/2026-07-28/server/discover
- https://modelcontextprotocol.io/specification/2025-11-25/basic/transports
- https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle
- https://modelcontextprotocol.io/specification/2025-11-25/basic/index
- https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/ping
- https://modelcontextprotocol.io/specification/2025-11-25/server/tools
- https://modelcontextprotocol.io/specification/2025-11-25/changelog
- https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
- https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle
- https://modelcontextprotocol.io/specification/2025-06-18/changelog
- https://modelcontextprotocol.io/specification/2025-03-26/basic/transports
- https://modelcontextprotocol.io/specification/2025-03-26/changelog
