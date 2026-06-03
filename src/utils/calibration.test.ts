import { beforeEach, describe, expect, it } from 'vitest';

import {
  type CalibrationFontSize,
  clearCalibrationScale,
  getCalibrationFontSize,
  getCalibrationScale,
  saveCalibrationFontSize,
  saveCalibrationScale,
} from '@/utils/calibration';

const calibrationKey = 'lnco_screen_calibration';

const createLocalStorageMock = (): Storage => {
  let store: Record<string, string> = {};

  return {
    get length() {
      return Object.keys(store).length;
    },
    clear() {
      store = {};
    },
    getItem(key: string) {
      return store[key] ?? null;
    },
    key(index: number) {
      return Object.keys(store)[index] ?? null;
    },
    removeItem(key: string) {
      delete store[key];
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
  };
};

describe('calibration utils', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
      writable: true,
    });
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and reads calibration scale with metadata', () => {
    saveCalibrationScale(1.25, {
      memberId: 'member-1',
      calibrationAppId: 'app-1',
    });

    const stored = localStorage.getItem(calibrationKey);

    expect(stored).to.be.a('string');
    expect(getCalibrationScale()).to.equal(1.25);

    const parsed = JSON.parse(stored as string) as {
      screenCalibration: {
        scale: number;
      };
      timestamp: number;
      memberId: string;
      calibrationAppId: string;
    };
    expect(parsed.screenCalibration.scale).to.equal(1.25);
    expect(parsed.memberId).to.equal('member-1');
    expect(parsed.calibrationAppId).to.equal('app-1');
    expect(parsed.timestamp).to.be.a('number');
  });

  it('returns null for missing, malformed, or invalid scale payloads', () => {
    expect(getCalibrationScale()).to.equal(null);

    localStorage.setItem(calibrationKey, '{broken-json');
    expect(getCalibrationScale()).to.equal(null);

    localStorage.setItem(
      calibrationKey,
      JSON.stringify({ screenCalibration: { scale: '1.5' } }),
    );
    expect(getCalibrationScale()).to.equal(null);
  });

  it('saves and reads calibration font size', () => {
    const fontSize: CalibrationFontSize = 'large';

    saveCalibrationFontSize(fontSize, {
      memberId: 'member-1',
      calibrationAppId: 'app-1',
    });

    expect(getCalibrationFontSize()).to.deep.equal(fontSize);

    const stored = localStorage.getItem(calibrationKey);
    const parsed = JSON.parse(stored as string) as {
      screenCalibration: {
        fontSize: CalibrationFontSize;
      };
      timestamp: number;
      memberId: string;
      calibrationAppId: string;
    };
    expect(parsed.screenCalibration.fontSize).to.deep.equal(fontSize);
    expect(parsed.memberId).to.equal('member-1');
    expect(parsed.calibrationAppId).to.equal('app-1');
    expect(parsed.timestamp).to.be.a('number');
  });

  it('returns null for missing, malformed, or out-of-range font-size payloads', () => {
    expect(getCalibrationFontSize()).to.equal(null);

    localStorage.setItem(calibrationKey, '{broken-json');
    expect(getCalibrationFontSize()).to.equal(null);

    localStorage.setItem(
      calibrationKey,
      JSON.stringify({ screenCalibration: { fontSize: 'xxl' } }),
    );
    expect(getCalibrationFontSize()).to.equal(null);
  });

  it('clears calibration storage', () => {
    saveCalibrationScale(1.5);

    expect(getCalibrationScale()).to.equal(1.5);

    clearCalibrationScale();

    expect(localStorage.getItem(calibrationKey)).to.equal(null);
    expect(getCalibrationScale()).to.equal(null);
    expect(getCalibrationFontSize()).to.equal(null);
  });
});
