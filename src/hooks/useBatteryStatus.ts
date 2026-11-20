import { useState, useEffect } from 'react';

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: ((this: BatteryManager, ev: Event) => any) | null;
  onlevelchange: ((this: BatteryManager, ev: Event) => any) | null;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

export interface BatteryStatus {
  isSupported: boolean;
  level: number; // 0 to 100
  charging: boolean;
  isLow: boolean; // level <= 20
}

export function useBatteryStatus(): BatteryStatus {
  const [batteryState, setBatteryState] = useState<BatteryStatus>({
    isSupported: false,
    level: 100,
    charging: false,
    isLow: false,
  });

  useEffect(() => {
    const nav = typeof window !== 'undefined' ? (window.navigator as NavigatorWithBattery) : null;
    if (!nav || typeof nav.getBattery !== 'function') {
      return;
    }

    let batteryManager: BatteryManager | null = null;

    const updateBatteryInfo = (bm: BatteryManager) => {
      const levelPercent = Math.round(bm.level * 100);
      setBatteryState({
        isSupported: true,
        level: levelPercent,
        charging: bm.charging,
        isLow: levelPercent <= 20,
      });
    };

    nav.getBattery().then((bm) => {
      batteryManager = bm;
      updateBatteryInfo(bm);

      const handleChange = () => updateBatteryInfo(bm);
      bm.addEventListener('levelchange', handleChange);
      bm.addEventListener('chargingchange', handleChange);
    }).catch(() => {
      // Ignore if browser restricts permission
    });

    return () => {
      if (batteryManager) {
        // cleanup listeners if available
      }
    };
  }, []);

  return batteryState;
}
