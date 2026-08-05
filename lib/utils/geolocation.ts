import { GeolocationCoords } from '../types';
import { GEOLOCATION_TIMEOUT_MS } from '../constants';

export const getCurrentLocation = (): Promise<GeolocationCoords> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        timeout: GEOLOCATION_TIMEOUT_MS,
        enableHighAccuracy: true,
      }
    );
  });
};

export const watchLocation = (
  callback: (coords: GeolocationCoords) => void,
  onError?: (error: Error) => void
): number => {
  if (!navigator.geolocation) {
    const error = new Error('Geolocation is not supported by this browser');
    if (onError) onError(error);
    return -1;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
    },
    (error) => {
      if (onError) onError(new Error(`Geolocation error: ${error.message}`));
    },
    {
      enableHighAccuracy: true,
      timeout: GEOLOCATION_TIMEOUT_MS,
    }
  );
};

export const stopWatchingLocation = (watchId: number): void => {
  if (watchId !== -1) {
    navigator.geolocation.clearWatch(watchId);
  }
};
