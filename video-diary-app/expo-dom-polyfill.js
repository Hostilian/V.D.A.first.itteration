// Complete polyfill for expo/dom and expo/dom/global
export const IS_DOM = true;
export const isEnabled = true;

// Gesture events
export const GestureState = {
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5,
};

// Navigator events
export const addGlobalDomEventListener = () => () => {};
export const addEventListener = () => ({ remove: () => {} });
export const removeEventListener = () => {};
export const openBrowserAsync = async () => true;
export const openLinkAsync = async () => true;
export const canOpenURLAsync = async () => true;

// Additional exports
export const setHistoryAction = () => {};
export const RoutingType = { BROWSER: 'browser', HASH: 'hash' };
export const search = '';
export const href = '';
export const pathname = '';
export const location = { search: '', pathname: '', href: '' };
export const addEventListener_unstable = () => ({ remove: () => {} });
export const openURL = async () => true;
