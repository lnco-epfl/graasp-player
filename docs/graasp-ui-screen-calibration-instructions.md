# Graasp UI – Screen Calibration Protocol Instructions

Use this document as implementation guidance in the `graasp-ui` repository.

## Goal

Add support in app communication hooks so a calibration app can send a scaling factor to Player, and Player persists it per `rootId` in `localStorage`.

This must be:

- non-breaking,
- optional (no calibration = no failure),
- scoped per root item (`rootId`),
- validated before storage.

## Scope

Target files in `graasp-ui`:

- `dist/items/appItemHooks.js` (runtime message handling)
- `dist/items/appItemHooks.d.ts` (type updates)

If source files exist and are used to build dist (preferred), apply equivalent changes in source and regenerate dist.

## Protocol to implement

### New postMessage key

Extend `buildPostMessageKeys(itemId)` with:

- `POST_CALIBRATION_SCALE: POST_CALIBRATION_SCALE_<itemId>`

### New message handling case

In `setupOnMessage(port)` switch-case, add handling for:

- `POST_CALIBRATION_SCALE_<itemId>`

Expected payload shape:

```json
{
  "scale": 1.25,
  "unit": "pixels_per_reference_unit"
}
```

### Validation rules

Before persisting:

1. `payload.scale` must be a number.
2. It must not be `NaN`.
3. Bounds: `scale > 0.5` and `scale < 3`.
4. `contextPayload.rootId` must exist.

If any validation fails: ignore silently (do not throw).

### Persistence

Store in localStorage key:

- `lnco_screen_calibration_<rootId>`

Value JSON:

```json
{
  "scale": 1.25,
  "timestamp": 1708110000000,
  "calibrationAppId": "<item.id>"
}
```

Use current timestamp (`Date.now()`) and current app item id (`item.id`).

### Debug logging

After successful save, add a debug log:

- include `rootId`, `scale`, and `itemId`.

Use `console.debug`.

## Type update

Extend `ContextPayload` type to allow these optional fields:

- `rootId?: UUID`
- `calibrationScale?: number`

Do not remove existing fields.

## Non-goals

Do NOT:

- add UI buttons,
- add new network calls,
- change existing GET_CONTEXT / token flow,
- make calibration mandatory.

## Acceptance criteria

1. App can send `POST_CALIBRATION_SCALE_<itemId>` over MessagePort.
2. Valid payload persists in `localStorage` with root-specific key.
3. Invalid payloads are ignored without crashing.
4. Existing app communication behavior remains unchanged.
5. Type definitions compile with added optional fields.

## Suggested manual test

1. Open Player with an app inside root `R1`.
2. Send message through port:
   - type: `POST_CALIBRATION_SCALE_<itemId>`
   - payload: `{ "scale": 1.25, "unit": "pixels_per_reference_unit" }`
3. Verify localStorage contains:
   - key `lnco_screen_calibration_R1`
   - JSON with `scale`, `timestamp`, `calibrationAppId`.
4. Repeat with invalid scale (`0.3`, `3.2`, `"abc"`) and verify no overwrite / no crash.
5. Verify existing auth token request and auto-resize still work.

## Implementation notes

- Keep changes minimal and localized to app item communication.
- Prefer backward compatibility over strict runtime errors.
- If implementing from source (not dist), ensure generated dist includes equivalent updates.
