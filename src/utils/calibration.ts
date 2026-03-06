type CalibrationData = {
  scale?: number;
  fontSize?: Record<string, unknown>;
  timestamp: number;
  memberId?: string;
  calibrationAppId?: string;
};

const buildCalibrationKey = (): string => `lnco_screen_calibration`;

export const saveCalibrationScale = (
  rootId: string,
  scale: number,
  metadata?: Pick<CalibrationData, 'memberId' | 'calibrationAppId'>,
): void => {
  const data: CalibrationData = {
    scale,
    timestamp: Date.now(),
    ...metadata,
  };

  localStorage.setItem(buildCalibrationKey(), JSON.stringify(data));
};

export const saveCalibrationFontSize = (
  fontSize: Record<string, unknown>,
  metadata?: Pick<CalibrationData, 'memberId' | 'calibrationAppId'>,
): void => {
  const data: CalibrationData = {
    fontSize,
    timestamp: Date.now(),
    ...metadata,
  };

  localStorage.setItem(buildCalibrationKey(), JSON.stringify(data));
};

export const getCalibrationScale = (): number | null => {
  const stored = localStorage.getItem(buildCalibrationKey());

  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as CalibrationData;
    return typeof parsed.scale === 'number' ? parsed.scale : null;
  } catch {
    return null;
  }
};

export const getCalibrationFontSize = (): Record<string, unknown> | null => {
  const stored = localStorage.getItem(buildCalibrationKey());

  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as CalibrationData;

    if (parsed.fontSize && typeof parsed.fontSize === 'string') {
      return parsed.fontSize;
    }
    return null;
  } catch {
    return null;
  }
};

export const clearCalibrationScale = (): void => {
  localStorage.removeItem(buildCalibrationKey());
};
