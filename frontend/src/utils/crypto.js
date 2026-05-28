import forge from "node-forge"; // npm install node-forge

const PBKDF2_SALT = "qlsv-fixed-salt-2024"; // đồng bộ với server khi đăng ký
const PBKDF2_ITER = 100_000;
const PBKDF2_KEYLEN = 32; // bytes, dùng làm seed cho PRNG
const RSA_BITS = 2048;

/**
 * Hash dữ liệu bằng SHA2-512
 * @returns {string} hex string
 */
export const hashSHA512 = async (data) => {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-512", encoder.encode(data));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

/**
 * Tái tạo deterministic seed từ password bằng PBKDF2
 * @returns {string} chuỗi bytes dùng làm seed cho forge PRNG
 */
const _deriveSeed = async (password) => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(PBKDF2_SALT),
      iterations: PBKDF2_ITER,
      hash: "SHA-256",
    },
    keyMaterial,
    PBKDF2_KEYLEN * 8
  );
  // Chuyển về binary string cho forge
  return String.fromCharCode(...new Uint8Array(bits));
};

/**
 * Sinh cặp RSA key từ mật khẩu (deterministic — không cần lưu private key)
 * Cùng password luôn sinh ra cùng cặp key.
 * @returns {Promise<{ publicKeyPem: string, privateKeyPem: string }>}
 */
export const generateRSAKeysFromPassword = async (password) => {
  const seed = await _deriveSeed(password);

  // Tạo PRNG từ seed cố định
  const prng = forge.random.createInstance();
  prng.seedFileSync = () => seed;

  // Sinh khóa đồng bộ để tránh lỗi Web Worker (prime.worker.js) trong môi trường Vite
  const keypair = forge.pki.rsa.generateKeyPair({
    bits: RSA_BITS,
    prng: prng
  });

  return {
    publicKeyPem: forge.pki.publicKeyToPem(keypair.publicKey),
    privateKeyPem: forge.pki.privateKeyToPem(keypair.privateKey),
  };
};

/**
 * Mã hoá dữ liệu bằng RSA public key (OAEP)
 * @param {string|number} data     - Dữ liệu plaintext
 * @param {string}        pubKeyPem - PEM public key
 * @returns {string} base64 cipher
 */
export const encryptRSA = (data, pubKeyPem) => {
  const publicKey = forge.pki.publicKeyFromPem(pubKeyPem);
  const encrypted = publicKey.encrypt(String(data), "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });
  return forge.util.encode64(encrypted);
};

/**
 * Giải mã dữ liệu bằng cách tái sinh private key từ mật khẩu
 * @param {string} encryptedBase64 - Cipher dạng base64
 * @param {string} password        - Mật khẩu để tái sinh private key
 * @returns {Promise<string>} plaintext
 */
export const decryptRSAWithPassword = async (encryptedBase64, password) => {
  const { privateKeyPem } = await generateRSAKeysFromPassword(password);
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const encryptedBytes = forge.util.decode64(encryptedBase64);
  return privateKey.decrypt(encryptedBytes, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });
};

// Đính kèm các hàm vào window để tiện test trên Console
if (typeof window !== "undefined") {
  window.hashSHA512 = hashSHA512;
  window.generateRSAKeysFromPassword = generateRSAKeysFromPassword;
  window.encryptRSA = encryptRSA;
  window.forge = forge;
}

// this is a test comment