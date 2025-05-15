



export const getURL = (path: string = '') => {
  let url = process?.env?.NEXT_PUBLIC_SITE_URL ?? 
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? 
    'http://localhost:3000/';
  url = url.includes('http') ? url : `https://${url}`;
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  
  // Remove leading slash from path if it exists
  path = path.startsWith('/') ? path.slice(1) : path;
  
  return url + path;
};


export const toDateTime = (secs: number) => {
  var t = new Date('1970-01-01T00:30:00Z');
  t.setSeconds(secs);
  return t;
};

export const calculateTrialEndUnixTimestamp = (
  trialPeriodDays: number | null | undefined
) => {
  // Check if trialPeriodDays is null, undefined, or less than 2 days
  if (
    trialPeriodDays === null ||
    trialPeriodDays === undefined ||
    trialPeriodDays < 2
  ) {
    return undefined;
  }

  const currentDate = new Date(); // Current date and time
  const trialEnd = new Date(
    currentDate.getTime() + (trialPeriodDays + 1) * 24 * 60 * 60 * 1000
  ); // Add trial days
  return Math.floor(trialEnd.getTime() / 1000); // Convert to Unix timestamp in seconds
};

const toastKeyMap: { [key: string]: string[] } = {
  status: ['status', 'status_description'],
  error: ['error', 'error_description']
};

const getToastRedirect = (
  path: string,
  toastType: string,
  toastName: string,
  toastDescription: string = '',
  disableButton: boolean = false,
  arbitraryParams: string = ''
): string => {
  const [nameKey, descriptionKey] = toastKeyMap[toastType];

  let redirectPath = `${path}?${nameKey}=${encodeURIComponent(toastName)}`;

  if (toastDescription) {
    redirectPath += `&${descriptionKey}=${encodeURIComponent(toastDescription)}`;
  }

  if (disableButton) {
    redirectPath += `&disable_button=true`;
  }

  if (arbitraryParams) {
    redirectPath += `&${arbitraryParams}`;
  }

  return redirectPath;
};

export const getStatusRedirect = (
  path: string,
  statusName: string,
  statusDescription: string = '',
  disableButton: boolean = false,
  arbitraryParams: string = ''
) =>
  getToastRedirect(
    path,
    'status',
    statusName,
    statusDescription,
    disableButton,
    arbitraryParams
  );

export const getErrorRedirect = (
  path: string,
  errorName: string,
  errorDescription: string = '',
  disableButton: boolean = false,
  arbitraryParams: string = ''
) =>
  getToastRedirect(
    path,
    'error',
    errorName,
    errorDescription,
    disableButton,
    arbitraryParams
  );

export const getMaxLimits = (tier: 'free' | 'standard' | 'premium') => {
  const limits = {
    free: {
      exports: 5,
      slides: 8,
      aiVideos: 5,
      fileSize: 6 * 1024 * 1024, // 6MB in bytes
      videoDuration: 5 * 60, // 5 minutes in seconds
      hasWatermark: true,
      hasAvatar: false
    },
    standard: {
      exports: 10,
      slides: 15,
      aiVideos: 10,
      fileSize: 10 * 1024 * 1024, // 10MB
      videoDuration: 10 * 60, // 10 minutes
      hasWatermark: false,
      hasAvatar: true
    },
    premium: {
      exports: 25,
      slides: 25,
      aiVideos: 25,
      fileSize: 25 * 1024 * 1024, // 25MB
      videoDuration: 25 * 60, // 25 minutes
      hasWatermark: false,
      hasAvatar: true
    }
  };

  return limits[tier];
};
