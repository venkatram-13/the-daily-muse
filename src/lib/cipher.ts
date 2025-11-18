const KEY = import.meta.env.VITE_CIPHER_KEY;

export const xorCipher = (text: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length));
  }
  return result;
};
