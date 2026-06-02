export const APP_NAME = 'Tinubu Support Group';

export const APP_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://tinubusupportgroup.com'
    : 'http://localhost:3000';

export const SESSION_TTL_SECONDS = 60 * 60 * 24;
export const BCRYPT_ROUNDS = 12;
export const OTP_TTL_SECONDS = 15 * 60;
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export const ROLES = [
  'member',
  'leader',
  'admin',
  'super admin',
  'secretary',
  'zonal exco',
  'state exco',
  'lga exco',
] as const;
export type Role = (typeof ROLES)[number];

export const ADMIN_ROLES: Role[] = ['admin', 'super admin'];
export const ELEVATED_ROLES: Role[] = [
  'admin',
  'super admin',
  'leader',
  'secretary',
  'zonal exco',
  'state exco',
  'lga exco',
];

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
] as const;

export const NORTHERN_STATES = [
  'Adamawa', 'Bauchi', 'Benue', 'Borno', 'Gombe', 'Jigawa', 'Kaduna', 'Kano',
  'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Plateau',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT',
] as const;

export const SOUTHERN_STATES = [
  'Abia', 'Akwa Ibom', 'Anambra', 'Bayelsa', 'Cross River', 'Delta', 'Ebonyi',
  'Edo', 'Ekiti', 'Enugu', 'Imo', 'Lagos', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Rivers',
] as const;

export const REGIONS = [
  'North Central', 'North East', 'North West',
  'South East', 'South South', 'South West',
] as const;

export const ROUTES = {
  home: '/',
  about: '/about',
  contact: '/contact',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  secureOtp: '/secure-otp',
  newPassword: '/new-password',
  dashboard: '/dashboard',
  blog: '/blog',
  events: '/events',
  faq: '/faq',
  search: '/search',
  pbat: '/pbat',
  nationals: '/nationals',
  subNationals: '/sub-nationals',
  region: '/region',
  fgMinistries: '/fg-ministries',
  groupReg: '/group-reg',
  individualReg: '/register',
} as const;
