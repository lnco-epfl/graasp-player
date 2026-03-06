# Screen Calibration Protocol

## Overview

Implement a device-local screen scaling calibration that:

- is captured once during a calibration app,
- is persisted to `localStorage` (device-specific, survives page refresh),
- is broadcast to all subsequently-loaded apps in the session,
- is optional/graceful (apps work without it).

## Architecture

### Storage (localStorage)

**Key:** `lnco_screen_calibration_<rootId>`  
**Value:** JSON object with calibration metadata

```json
{
  "scale": 1.25,
  "timestamp": 1708110000000,
  "memberId": "user-id-optional",
  "calibrationAppId": "app-id-that-calibrated"
}
```

**Rationale:** keyed by `rootId` so different experiments can have independent calibrations; includes timestamp for debugging/expiry rules if needed later.

### Message Protocol

#### 1. Calibration App → Player: Send calibration

**Message Type:** `POST_CALIBRATION_SCALE_<itemId>`  
**Channel:** MessagePort (port2 from initial context handshake)  
**Payload Schema:**

```json
{
  "type": "POST_CALIBRATION_SCALE_<itemId>",
  "payload": {
    "scale": 1.25,
    "unit": "pixels_per_reference_unit"
  }
}
```

**Validation:**

- `scale` is a number > 0.5 and < 3 (reasonable bounds).
- Called once per session (or overwrite allowed).

#### 2. Player: Store in localStorage

In `src/config/` or new `src/utils/calibration.ts`:

```typescript
export const saveCalibrationScale = (rootId: string, scale: number): void => {
  const data = {
    scale,
    timestamp: Date.now(),
    memberId: undefined, // optional
    calibrationAppId: undefined, // optional
  };
  localStorage.setItem(
    `lnco_screen_calibration_${rootId}`,
    JSON.stringify(data),
  );
};

export const getCalibrationScale = (rootId: string): number | null => {
  const stored = localStorage.getItem(`lnco_screen_calibration_${rootId}`);
  if (!stored) return null;
  try {
    return JSON.parse(stored).scale;
  } catch {
    return null;
  }
};

export const clearCalibrationScale = (rootId: string): void => {
  localStorage.removeItem(`lnco_screen_calibration_${rootId}`);
};
```

#### 3. Player: Include in app context on load

In `src/modules/item/Item.tsx`, when building `contextPayload`:

```typescript
const calibrationScale = getCalibrationScale(rootId);

return (
  <AppItem
    ...
    contextPayload={{
      apiHost: API_HOST,
      settings: item.settings,
      lang: item.lang ?? memberLang,
      permission: PermissionLevel.Read,
      context: Context.Player,
      accountId: member?.id,
      itemId: item.id,
      calibrationScale, // ← NEW
    }}
    ...
  />
);
```

## Implementation Checklist

### Phase 1: Message Handler (appItemHooks)

- [ ] Add `POST_CALIBRATION_SCALE_<itemId>` case to `setupOnMessage`.
- [ ] Validate payload (number, bounds).
- [ ] Call `saveCalibrationScale(rootId, payload.scale)`.
- [ ] Log on success for debugging.

### Phase 2: Storage Utility

- [ ] Create `src/utils/calibration.ts` with save/get/clear helpers.
- [ ] Add null-safe retrieval in Player startup.

### Phase 3: Context Propagation

- [ ] Extract `rootId` from route params in `Item.tsx`.
- [ ] Load calibration scale on render.
- [ ] Include in `contextPayload`.

### Phase 4: UI Control (optional, for MVP)

- [ ] Add a simple "Clear Calibration" button in settings or side panel (links to `clearCalibrationScale`).
- [ ] Provide quick way for user to reset if needed.

### Phase 5: Testing

- [ ] Test calibration app sends valid message.
- [ ] Verify localStorage key is set correctly.
- [ ] Confirm next app receives scale in context.
- [ ] Verify clear function works.

## Code Footprint

| File                                                 | Change                         | Nature    |
| ---------------------------------------------------- | ------------------------------ | --------- |
| `src/utils/calibration.ts`                           | Create new                     | ~20 lines |
| `src/modules/item/Item.tsx`                          | Add import + load + pass scale | ~5 lines  |
| `node_modules/@graasp/ui/dist/items/appItemHooks.js` | Add message case               | ~15 lines |
| `src/@types/i18next.d.ts` (or types)                 | Extend ContextPayload type     | ~2 lines  |

**Total: ~42 lines** (excluding tests and comments).

## Edge Cases & Fallback

- **No calibration stored:** scale defaults to `1.0` (100%) = no scaling.
- **Invalid JSON in localStorage:** caught by try/catch, returns `null`, treated as "no calibration".
- **Multiple calibration apps:** last one wins (simple overwrite).
- **Cross-device:** each device has own localStorage, so each gets calibrated independently. ✓
- **Session persistence:** localStorage survives tab reload but is cleared on browser cache clear (acceptable for "per device, per session" use case).

## Future Enhancements

- Tie calibration to `memberId` so returning user gets their prior calibration.
- Add UI for manual scale input if auto-calibration is unavailable.
- Implement decay/expiry (e.g., recalibrate if older than 24 hours).
- Store calibration history for debugging/reporting.

## Minimal App Integration Example

```javascript
// In calibration app, after user completes calibration:
const scale = 1.25; // e.g., derived from reference object measurement

port.postMessage(
  JSON.stringify({
    type: `POST_CALIBRATION_SCALE_${itemId}`,
    payload: { scale, unit: 'pixels_per_reference_unit' },
  }),
);
```

```javascript
// In consumer app, on context receipt:
window.addEventListener('message', (e) => {
  const { payload } = JSON.parse(e.data);
  if (payload.calibrationScale) {
    document.body.style.fontSize = `${16 * payload.calibrationScale}px`;
    // or any other scaling logic
  }
});
```

## Summary

This is a **minimal, non-breaking change** that:

- uses localStorage for device locality,
- extends existing message channel (no new network round-trip),
- degrades gracefully (scale defaults to 1.0 if absent),
- fits naturally into current app context flow.

Ready to implement when you have app-side calibration logic ready.
