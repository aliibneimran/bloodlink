import { BloodGroup } from './types';

export const BLOOD_TYPES: BloodGroup[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
export const BLOOD_GROUPS: BloodGroup[] = BLOOD_TYPES;

export const REQUEST_TYPES = [
  { value: 'instant', label: 'Urgent - Needed ASAP' },
  { value: 'pre_booking', label: 'Pre-booking - Scheduled' },
];

export const COMPATIBLE_BLOOD_TYPES: Record<BloodGroup, BloodGroup[]> = {
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'O-': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
  'A+': ['A+', 'AB+'],
  'A-': ['A+', 'A-', 'AB+', 'AB-'],
  'B+': ['B+', 'AB+'],
  'B-': ['B+', 'B-', 'AB+', 'AB-'],
  'AB+': ['AB+'],
  'AB-': ['AB+', 'AB-'],
};

export const SEARCH_RADIUS_KM = 10;
export const GEOLOCATION_TIMEOUT_MS = 10000;
export const REALTIME_POLL_INTERVAL_MS = 2000;

export const DEFAULT_MAP_CENTER = {
  lat: 28.6139,
  lng: 77.209,
};

export const DEFAULT_MAP_ZOOM = 12;

export const REQUEST_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const DONOR_STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-100 text-green-800',
  busy: 'bg-gray-100 text-gray-800',
};
