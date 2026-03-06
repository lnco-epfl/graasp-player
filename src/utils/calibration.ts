type CalibrationData = {
  screenCalibration?: ScreenCalibration;
  timestamp: number;
  memberId?: string;
  calibrationAppId?: string;
};

export type CalibrationFontSize = 'small' | 'normal' | 'large' | 'extra-large';

type ScreenCalibration = {
  scale?: number;
  fontSize?: CalibrationFontSize;
};

const calibrationFontSizeValues: CalibrationFontSize[] = [
  'small',
  'normal',
  'large',
  'extra-large',
];

const buildCalibrationKey = (): string => `lnco_screen_calibration`;

export const saveCalibrationScale = (
  scale: number,
  metadata?: Pick<CalibrationData, 'memberId' | 'calibrationAppId'>,
): void => {
  const data: CalibrationData = {
    screenCalibration: { scale },
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
    screenCalibration: { fontSize },
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
    return typeof parsed.screenCalibration?.scale === 'number'
      ? parsed.screenCalibration.scale
      : null;
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
    const fontSize = parsed.screenCalibration?.fontSize;

    if (
      typeof fontSize === 'string' &&
      calibrationFontSizeValues.includes(fontSize as CalibrationFontSize)
    ) {
      return fontSize;
    }
    return null;
  } catch {
    return null;
  }
};

export const clearCalibrationScale = (): void => {
  localStorage.removeItem(buildCalibrationKey());
};
