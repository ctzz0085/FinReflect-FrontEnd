const ENCRYPT_MARKER = '/Encrypt';

// Encrypted PDFs name an /Encrypt dictionary in their trailer, which is never compressed,
// so a byte search is enough. It does not prove a password is needed: a PDF can be encrypted
// and still open without one, so the backend has the final say.
// Returns true or false, or null if the file could not be read.
export const isPdfEncrypted = async (asset) => {
  try {
    const source = asset.file || (await fetch(asset.uri));
    const bytes = new Uint8Array(await source.arrayBuffer());
    const marker = Array.from(ENCRYPT_MARKER, (char) => char.charCodeAt(0));

    for (let i = 0; i <= bytes.length - marker.length; i++) {
      if (marker.every((code, offset) => bytes[i + offset] === code)) {
        return true;
      }
    }
    return false;
  } catch {
    return null;
  }
};
