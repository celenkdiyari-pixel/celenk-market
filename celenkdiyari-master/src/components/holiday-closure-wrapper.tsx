'use client';

import { useState, useEffect } from 'react';
import HolidayClosure from './holiday-closure';

interface HolidayClosureSettings {
  isEnabled: boolean;
  startDate: string;
  endDate: string;
  message: string;
  showCountdown: boolean;
}

export default function HolidayClosureWrapper() {
  const [holidaySettings, setHolidaySettings] = useState<HolidayClosureSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHolidaySettings();
  }, []);

  const loadHolidaySettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        const settings = data.settings;
        
        if (settings?.holidayClosure) {
          setHolidaySettings(settings.holidayClosure);
        }
      }
    } catch (error) {
      console.error('Error loading holiday settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !holidaySettings) {
    return null;
  }

  return (
    <HolidayClosure
      isEnabled={holidaySettings.isEnabled}
      startDate={holidaySettings.startDate}
      endDate={holidaySettings.endDate}
      message={holidaySettings.message}
      showCountdown={holidaySettings.showCountdown}
    />
  );
}
