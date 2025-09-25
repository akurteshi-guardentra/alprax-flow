/**
 * Centralized copy management system
 * All user-facing text should be managed here for consistency
 */

export const COPY = {
  // Common actions
  ACTIONS: {
    CONTINUE: 'Continue',
    BACK: 'Back',
    CANCEL: 'Cancel',
    CONFIRM: 'Confirm',
    SAVE: 'Save',
    EDIT: 'Edit',
    DELETE: 'Delete',
    RETRY: 'Try Again',
    REFRESH: 'Refresh',
    CLOSE: 'Close',
    SUBMIT: 'Submit',
    LOADING: 'Loading...',
    SEND: 'Send',
    RECEIVE: 'Receive',
    ADD: 'Add',
    REMOVE: 'Remove',
    UPDATE: 'Update',
    VIEW: 'View',
    SHARE: 'Share',
    COPY: 'Copy',
    DOWNLOAD: 'Download',
    UPLOAD: 'Upload',
  },

  // Navigation
  NAVIGATION: {
    DASHBOARD: 'Dashboard',
    PAYMENTS: 'Send Money',
    RECEIVE: 'Receive',
    HISTORY: 'History',
    PROFILE: 'Profile',
    SETTINGS: 'Settings',
    HELP: 'Help & Support',
    CONTACTS: 'Contacts',
    ANALYTICS: 'Analytics',
    BACK_TO_DASHBOARD: 'Back to Dashboard',
    HOME: 'Home',
  },

  // Authentication
  AUTH: {
    LOGIN: 'Sign In',
    SIGNUP: 'Create Account',
    LOGOUT: 'Sign Out',
    FORGOT_PASSWORD: 'Forgot Password?',
    RESET_PASSWORD: 'Reset Password',
    EMAIL_PLACEHOLDER: 'Enter your email address',
    PASSWORD_PLACEHOLDER: 'Enter your password',
    CONFIRM_PASSWORD_PLACEHOLDER: 'Confirm your password',
    SIGNIN_SUCCESS: 'Welcome back!',
    SIGNUP_SUCCESS: 'Account created successfully!',
    LOGOUT_SUCCESS: 'You have been signed out',
    INVALID_CREDENTIALS: 'Invalid email or password',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
    PASSWORDS_DONT_MATCH: 'Passwords do not match',
    EMAIL_REQUIRED: 'Email address is required',
    WEAK_PASSWORD: 'Password is too weak. Please choose a stronger password.',
  },

  // Payment flow
  PAYMENTS: {
    SEND_MONEY: 'Send Money',
    REQUEST_MONEY: 'Request Money',
    ADD_FUNDS: 'Add Funds',
    PAYMENT_SUCCESSFUL: 'Payment sent successfully!',
    PAYMENT_FAILED: 'Payment failed. Please try again.',
    INSUFFICIENT_FUNDS: 'Insufficient funds for this transaction',
    INVALID_AMOUNT: 'Please enter a valid amount',
    AMOUNT_TOO_LOW: 'Amount must be greater than $0.01',
    AMOUNT_TOO_HIGH: 'Amount exceeds your available balance',
    RECIPIENT_REQUIRED: 'Please select a recipient',
    INVALID_ADDRESS: 'Invalid Stellar address',
    PROCESSING_PAYMENT: 'Processing your payment...',
    CONFIRMING_PAYMENT: 'Confirming payment details...',
    PAYMENT_SENT: 'Payment Sent',
    TRANSACTION_HASH: 'Transaction ID',
    VIEW_TRANSACTION: 'View Transaction Details',
    AMOUNT_LABEL: 'Amount',
    RECIPIENT_LABEL: 'Send to',
    DESCRIPTION_LABEL: 'Description (optional)',
    DESCRIPTION_PLACEHOLDER: 'What is this payment for?',
    SELECT_RECIPIENT: 'Select recipient',
    ENTER_AMOUNT: 'Enter amount',
    REVIEW_PAYMENT: 'Review Payment',
    CONFIRM_PAYMENT: 'Confirm Payment',
    PAYMENT_SUMMARY: 'Payment Summary',
    NETWORK_FEE: 'Network Fee',
    TOTAL_AMOUNT: 'Total Amount',
    AVAILABLE_BALANCE: 'Available Balance',
  },

  // Wallet & Balance
  WALLET: {
    BALANCE: 'Balance',
    AVAILABLE_BALANCE: 'Available Balance',
    PENDING_BALANCE: 'Pending',
    TOTAL_BALANCE: 'Total Balance',
    RECENT_ACTIVITY: 'Recent Activity',
    TRANSACTION_HISTORY: 'Transaction History',
    NO_TRANSACTIONS: 'No transactions yet',
    EMPTY_WALLET_MESSAGE: 'Your wallet is empty. Add funds to get started.',
    REFRESH_BALANCE: 'Refresh Balance',
    HIDE_BALANCE: 'Hide Balance',
    SHOW_BALANCE: 'Show Balance',
    WALLET_ADDRESS: 'Wallet Address',
    COPY_ADDRESS: 'Copy Address',
    ADDRESS_COPIED: 'Address copied to clipboard',
  },

  // Transaction statuses
  TRANSACTION_STATUS: {
    PENDING: 'Pending',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
    PROCESSING: 'Processing',
    CONFIRMED: 'Confirmed',
    SENT: 'Sent',
    RECEIVED: 'Received',
    REFUNDED: 'Refunded',
  },

  // Profile & Settings
  PROFILE: {
    PERSONAL_INFO: 'Personal Information',
    CONTACT_INFO: 'Contact Information',
    SECURITY_SETTINGS: 'Security & Privacy',
    NOTIFICATION_SETTINGS: 'Notifications',
    PREFERENCES: 'Preferences',
    ACCOUNT_STATUS: 'Account Status',
    VERIFICATION_STATUS: 'Verification Status',
    VERIFIED: 'Verified',
    UNVERIFIED: 'Not Verified',
    PENDING_VERIFICATION: 'Verification Pending',
    COMPLETE_PROFILE: 'Complete Your Profile',
    PROFILE_COMPLETION: 'Profile Completion',
    FULL_NAME: 'Full Name',
    EMAIL_ADDRESS: 'Email Address',
    PHONE_NUMBER: 'Phone Number',
    DATE_OF_BIRTH: 'Date of Birth',
    ADDRESS: 'Address',
    COUNTRY: 'Country',
    LANGUAGE: 'Language',
    CURRENCY: 'Preferred Currency',
    TIMEZONE: 'Time Zone',
  },

  // Errors
  ERRORS: {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access denied.',
    NOT_FOUND: 'The requested resource was not found.',
    TIMEOUT: 'Request timed out. Please try again.',
    INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction.',
    INVALID_RECIPIENT: 'Invalid recipient address.',
    PAYMENT_DECLINED: 'Payment was declined. Please try a different payment method.',
    RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
    MAINTENANCE_MODE: 'System is under maintenance. Please try again later.',
    OUTDATED_VERSION: 'Please update the app to continue.',
  },

  // Success messages
  SUCCESS: {
    PAYMENT_SENT: 'Payment sent successfully!',
    PAYMENT_RECEIVED: 'Payment received!',
    PROFILE_UPDATED: 'Profile updated successfully',
    SETTINGS_SAVED: 'Settings saved',
    PASSWORD_CHANGED: 'Password changed successfully',
    EMAIL_VERIFIED: 'Email verified successfully',
    PHONE_VERIFIED: 'Phone number verified successfully',
    BACKUP_CREATED: 'Backup created successfully',
    RECOVERY_SUCCESSFUL: 'Account recovered successfully',
    CONTACT_ADDED: 'Contact added successfully',
    CONTACT_UPDATED: 'Contact updated successfully',
    CONTACT_DELETED: 'Contact deleted successfully',
  },

  // Loading states
  LOADING: {
    SENDING_PAYMENT: 'Sending payment...',
    PROCESSING_REQUEST: 'Processing your request...',
    LOADING_BALANCE: 'Loading balance...',
    LOADING_TRANSACTIONS: 'Loading transactions...',
    LOADING_PROFILE: 'Loading profile...',
    UPDATING_PROFILE: 'Updating profile...',
    SAVING_SETTINGS: 'Saving settings...',
    VERIFYING_IDENTITY: 'Verifying identity...',
    CREATING_ACCOUNT: 'Creating your account...',
    SIGNING_IN: 'Signing you in...',
    REFRESHING_DATA: 'Refreshing data...',
  },

  // Empty states
  EMPTY_STATES: {
    NO_TRANSACTIONS: 'No transactions found',
    NO_CONTACTS: 'No contacts added yet',
    NO_PAYMENT_METHODS: 'No payment methods added',
    NO_NOTIFICATIONS: 'No new notifications',
    NO_SEARCH_RESULTS: 'No results found',
    NO_RECENT_ACTIVITY: 'No recent activity',
    EMPTY_WALLET: 'Your wallet is empty',
    NO_HISTORY: 'No transaction history',
  },

  // Stellar-specific
  STELLAR: {
    PUBLIC_KEY: 'Stellar Address',
    SECRET_KEY: 'Secret Key',
    ACCOUNT_ID: 'Account ID',
    NETWORK: 'Network',
    TESTNET: 'Testnet',
    MAINNET: 'Mainnet',
    INVALID_ADDRESS: 'Invalid Stellar address format',
    ADDRESS_NOT_FOUND: 'Stellar address not found on network',
    ACCOUNT_NOT_FUNDED: 'Account needs to be funded first',
    FUNDING_ACCOUNT: 'Funding account...',
    ACCOUNT_FUNDED: 'Account funded successfully',
    NETWORK_FEE: 'Network fee: 0.00001 XLM',
    MINIMUM_BALANCE: 'Minimum balance: 1 XLM',
    CREATING_ACCOUNT: 'Creating Stellar account...',
    ACCOUNT_CREATED: 'Stellar account created successfully',
  },

  // Mobile-specific
  MOBILE: {
    SCROLL_TO_REFRESH: 'Pull down to refresh',
    REFRESHING: 'Refreshing...',
    SWIPE_ACTIONS: 'Swipe for actions',
    PULL_TO_REFRESH: 'Pull to refresh',
    RELEASE_TO_REFRESH: 'Release to refresh',
    TAP_TO_RETRY: 'Tap to retry',
    DOUBLE_TAP_TO_CONFIRM: 'Double tap to confirm',
    HOLD_TO_CANCEL: 'Hold to cancel',
    BIOMETRIC_PROMPT: 'Use your fingerprint or face to authenticate',
    BIOMETRIC_FAILED: 'Biometric authentication failed',
    BIOMETRIC_SUCCESS: 'Authentication successful',
  },

  // Accessibility
  A11Y: {
    MENU_BUTTON: 'Open menu',
    CLOSE_DIALOG: 'Close dialog',
    LOADING_CONTENT: 'Loading content',
    ERROR_ALERT: 'Error alert',
    SUCCESS_ALERT: 'Success alert',
    WARNING_ALERT: 'Warning alert',
    INFO_ALERT: 'Information alert',
    SEARCH_INPUT: 'Search',
    FILTER_RESULTS: 'Filter results',
    SORT_RESULTS: 'Sort results',
    PREVIOUS_PAGE: 'Previous page',
    NEXT_PAGE: 'Next page',
    CURRENT_PAGE: 'Current page',
    PAGE_OF_TOTAL: 'Page {current} of {total}',
  },

  // Help & Support
  HELP: {
    FREQUENTLY_ASKED: 'Frequently Asked Questions',
    CONTACT_SUPPORT: 'Contact Support',
    LIVE_CHAT: 'Live Chat',
    EMAIL_SUPPORT: 'Email Support',
    PHONE_SUPPORT: 'Phone Support',
    HELP_CENTER: 'Help Center',
    USER_GUIDE: 'User Guide',
    VIDEO_TUTORIALS: 'Video Tutorials',
    COMMUNITY_FORUM: 'Community Forum',
    REPORT_ISSUE: 'Report an Issue',
    FEATURE_REQUEST: 'Request a Feature',
    SYSTEM_STATUS: 'System Status',
    KNOWN_ISSUES: 'Known Issues',
  },
} as const;

// Type helpers for type safety
export type CopyKeys = keyof typeof COPY;
export type ActionKeys = keyof typeof COPY.ACTIONS;
export type NavigationKeys = keyof typeof COPY.NAVIGATION;
export type AuthKeys = keyof typeof COPY.AUTH;
export type PaymentKeys = keyof typeof COPY.PAYMENTS;
export type ErrorKeys = keyof typeof COPY.ERRORS;
export type SuccessKeys = keyof typeof COPY.SUCCESS;

// Helper function to get copy with fallback
export function getCopy(section: CopyKeys, key: string, fallback = 'Text not found'): string {
  const sectionCopy = COPY[section] as Record<string, string>;
  return sectionCopy?.[key] || fallback;
}

// Helper for formatting dynamic copy
export function formatCopy(template: string, values: Record<string, string | number>): string {
  return template.replace(/{(\w+)}/g, (match, key) => {
    return values[key]?.toString() || match;
  });
}