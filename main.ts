import { format, isValid } from "date-fns";


/**
 * Helper method to safely get error message
 * @param {unknown} error - The caught error
 * @returns {string} Error message
 */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};


/**
 * Creates a URL-friendly slug from a given title string.
 * @param {string} title - The string to convert into a slug
 * @param {string} [replace="-"] - Character to use for replacing spaces and special characters
 * @returns {string} A lowercase string with special characters removed and spaces replaced
 * @throws {Error} If title is empty or not a string
 * @example
 * createSlug("Hello World!") // returns "hello-world"
 * createSlug("This Is A Test", "_") // returns "this_is_a_test"
 */
export function createSlug(title: string, replace: string = "-"): string {
  if (!title || typeof title !== 'string') {
    throw new Error('Title must be a non-empty string');
  }
  
  // Ensure replace character is valid
  const safeReplace = replace.replace(/[^a-z0-9-_]/gi, '-');
  
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove all non-word chars (better than previous regex)
    .replace(/\s+/g, safeReplace) // Replace spaces with replacement char
    .replace(new RegExp(`\\${safeReplace}+`, 'g'), safeReplace) // Replace multiple instances of replacement char
    .replace(new RegExp(`^\\${safeReplace}|\\${safeReplace}$`, 'g'), ''); // Remove leading/trailing replacement chars
}

/**
 * Converts a string to Title Case format.
 * @param {string} str - The input string to convert
 * @returns {string} A string with the first letter of each word capitalized
 * @throws {Error} If input is empty or not a string
 * @example
 * toTitleCase("hello world") // returns "Hello World"
 * toTitleCase("THE QUICK BROWN FOX") // returns "The Quick Brown Fox"
 */
export function toTitleCase(str: string): string {
  if (!str || typeof str !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  return str
    .toLowerCase()
    .split(' ')
    .filter(word => word.length > 0) // Filter out empty strings
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Converts a slug (URL-friendly string) to Title Case format.
 * @param {string} slug - The slug string to convert
 * @returns {string} A string with hyphens/underscores removed and first letter of each word capitalized
 * @throws {Error} If slug is empty or not a string
 * @example
 * slugToTitleCase("hello-world") // returns "Hello World"
 * slugToTitleCase("this_is_a_test") // returns "This Is A Test"
 */
export function slugToTitleCase(slug: string): string {
  if (!slug || typeof slug !== 'string') {
    throw new Error('Slug must be a non-empty string');
  }

  return slug
    .split(/[-_\s]+/)
    .filter(word => word.length > 0) // Filter out empty strings
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Generates a new AES-GCM encryption key using the Web Crypto API.
 * @returns {Promise<CryptoKey>} A Promise that resolves to a CryptoKey object
 * @throws {Error} If Web Crypto API is not supported in the environment
 * @example
 * const key = await generateKey();
 */
export const generateKey = async (): Promise<CryptoKey> => {
  if (!window?.crypto?.subtle) {
    throw new Error('Web Crypto API is not supported in this environment');
  }

  try {
    const key = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"],
    );
    return key;
  } catch (error) {
    throw new Error(`Failed to generate encryption key: ${getErrorMessage(error)}`);
  }
};

/**
 * Encrypts text using AES-GCM encryption.
 * @param {string} text - The string to encrypt
 * @param {CryptoKey} key - The CryptoKey to use for encryption
 * @returns {Promise<string>} A Promise that resolves to a JSON string containing the encrypted data and IV
 * @throws {Error} If encryption fails or if invalid parameters are provided
 * @example
 * const key = await generateKey();
 * const encrypted = await encryptText("Secret message", key);
 */
export const encryptText = async (text: string, key: CryptoKey): Promise<string> => {
  if (!text || typeof text !== 'string') {
    throw new Error('Text must be a non-empty string');
  }

  if (!key) {
    throw new Error('A valid CryptoKey is required');
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      data,
    );

    return JSON.stringify({
      iv: Array.from(iv),
      encrypted: Array.from(new Uint8Array(encrypted)),
    });
  } catch (error) {
    throw new Error(`Encryption failed: ${getErrorMessage(error)}`);
  }
};

/**
 * Decrypts previously encrypted text.
 * @param {string} str - The encrypted JSON string
 * @param {CryptoKey} key - The CryptoKey used for encryption
 * @returns {Promise<string>} A Promise that resolves to the decrypted string
 * @throws {Error} If decryption fails or if invalid parameters are provided
 * @example
 * const decrypted = await decryptText(encrypted, key);
 */
export const decryptText = async (str: string, key: CryptoKey): Promise<string> => {
  if (!str || typeof str !== 'string') {
    throw new Error('Encrypted string must be a non-empty string');
  }

  if (!key) {
    throw new Error('A valid CryptoKey is required');
  }

  try {
    const encryptedData = JSON.parse(str) as {
      iv: number[];
      encrypted: number[];
    };

    if (!encryptedData.iv || !encryptedData.encrypted) {
      throw new Error('Invalid encrypted data format');
    }

    const { iv, encrypted } = encryptedData;

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(iv),
      },
      key,
      new Uint8Array(encrypted),
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    throw new Error(`Decryption failed: ${getErrorMessage(error)}`);
  }
};

/**
 * Creates a delay in code execution.
 * @param {number} ms - Number of milliseconds to delay
 * @param {Function} [cb] - Optional callback function to execute after the delay
 * @returns {Promise<boolean>} A Promise that resolves to true after the specified delay
 * @throws {Error} If ms is not a positive number
 * @example
 * await sleep(1000); // waits for 1 second
 * await sleep(2000, () => console.log("Done!")); // waits 2 seconds and logs "Done!"
 */
export const sleep = (ms: number, cb?: () => void): Promise<boolean> => {
  if (!Number.isFinite(ms) || ms < 0) {
    throw new Error('Sleep duration must be a positive number');
  }

  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        if (cb) {
          try {
            cb();
          } catch (error) {
            reject(error);
            return;
          }
        }
        resolve(true);
      }, ms);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Formats a date using the date-fns library.
 * @param {Date | string} date - Date object or date string to format
 * @param {string} [formatStr="dd/MM/yyyy"] - Format string
 * @returns {string} A formatted date string
 * @throws {Error} If date is invalid or format string is incorrect
 * @example
 * formattedDate(new Date()) // returns "09/11/2024"
 * formattedDate(new Date(), "MM/dd/yyyy") // returns "11/09/2024"
 */
export const formattedDate = (
  date: Date | string,
  formatStr: string = "dd/MM/yyyy",
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!isValid(dateObj)) {
    throw new Error('Invalid date provided');
  }

  try {
    return format(dateObj, formatStr);
  } catch (error) {
    throw new Error(`Date formatting failed: ${getErrorMessage(error)}`);
  }
};

/**
 * Formats a number as a currency string.
 * @param {number | string} price - The number or string to format
 * @param {Object} [options] - Formatting options
 * @param {('INR'|'USD'|'EUR'|'GBP'|'BDT')} [options.currency='INR'] - Currency code
 * @param {Intl.NumberFormatOptions['notation']} [options.notation='compact'] - Number notation style
 * @returns {string} A formatted currency string
 * @throws {Error} If price is invalid or options are incorrect
 * @example
 * formatPrice(1000) // returns "₹1K"
 * formatPrice(1500.50, { currency: 'USD', notation: 'standard' }) // returns "$1,500.50"
 */
export function formatPrice(
  price: number | string,
  options: {
    currency?: 'INR'|'USD' | 'EUR' | 'GBP' | 'BDT'
    notation?: Intl.NumberFormatOptions['notation']
  } = {}
): string {
  const { currency = 'INR', notation = 'compact' } = options;

  // Validate price
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (!Number.isFinite(numericPrice)) {
    throw new Error('Invalid price value provided');
  }

  if (numericPrice < 0) {
    throw new Error('Price cannot be negative');
  }

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      notation,
      maximumFractionDigits: 2,
    }).format(numericPrice);
  } catch (error) {
    throw new Error(`Price formatting failed: ${getErrorMessage(error)}`);
  }
}