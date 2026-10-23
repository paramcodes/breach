const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const SALT = "breach-stream-key";

interface NodeCrypto {
  createCipheriv: (...args: unknown[]) => {
    update: (data: string, enc: string) => Buffer;
    final: () => Buffer;
    getAuthTag: () => Buffer;
  };
  createDecipheriv: (...args: unknown[]) => {
    update: (data: Buffer) => Buffer;
    final: () => Buffer;
    setAuthTag: (tag: Buffer) => void;
  };
  randomBytes: (size: number) => Buffer;
  scryptSync: (secret: string, salt: string, keylen: number) => Buffer;
}

function getNodeCrypto(): NodeCrypto | null {
  try {
    const dynamicRequire = new Function("id", "return require(id)") as (id: string) => unknown;
    return dynamicRequire("node:crypto") as NodeCrypto;
  } catch {
    return null;
  }
}

function getKey(secret: string, nodeCrypto: NodeCrypto): Buffer {
  return nodeCrypto.scryptSync(secret, SALT, 32);
}

export function encryptStreamKey(
  plaintext: string,
  secret: string = process.env.STREAM_KEY_SECRET ?? "dev-stream-key-secret",
): string {
  const nodeCrypto = getNodeCrypto();
  if (nodeCrypto) {
    const iv = nodeCrypto.randomBytes(IV_LENGTH);
    const cipher = nodeCrypto.createCipheriv(ALGORITHM, getKey(secret, nodeCrypto), iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [iv, tag, encrypted].map((part) => part.toString("base64")).join(":");
  }
  return btoa(unescape(encodeURIComponent(plaintext)));
}

export function decryptStreamKey(
  ciphertext: string,
  secret: string = process.env.STREAM_KEY_SECRET ?? "dev-stream-key-secret",
): string {
  const nodeCrypto = getNodeCrypto();
  if (nodeCrypto && ciphertext.includes(":")) {
    const [ivB64, tagB64, dataB64] = ciphertext.split(":");
    if (!ivB64 || !tagB64 || !dataB64) throw new Error("Invalid ciphertext");
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const data = Buffer.from(dataB64, "base64");
    const decipher = nodeCrypto.createDecipheriv(ALGORITHM, getKey(secret, nodeCrypto), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  }
  return decodeURIComponent(escape(atob(ciphertext)));
}
