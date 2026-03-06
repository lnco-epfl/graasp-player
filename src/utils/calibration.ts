type CalibrationData = {
  scale?: number;
  fontSize?: CalibrationFontSize;
  timestamp: number;
  memberId?: string;
  calibrationAppId?: string;
};

export type CalibrationFontSize =
  | 'small'
  | 'medium'
  | 'large'
  | 'extra-large';

const calibrationFontSizeValues: CalibrationFontSize[] = [
  'small',
  'medium',
  'large',
  'extra-large',
];

const buildCalibrationKey = (): string => `lnco_screen_calibration`;

export const saveCalibrationScale = (
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
  fontSize: CalibrationFontSize,
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

export const getCalibrationFontSize = (): CalibrationFontSize | null => {
  const stored = localStorage.getItem(buildCalibrationKey());

  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as CalibrationData;

    if (
      typeof parsed.fontSize === 'string' &&
      calibrationFontSizeValues.includes(parsed.fontSize as CalibrationFontSize)
    ) {
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
