import config from "config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ITokenData } from "../interfaces/token.interface";
import { TokenType } from "../enums/token.enum";
import { CompactEncrypt, compactDecrypt, importJWK } from "jose";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const JWT_SECRET = config.get("JWT_SECRET") as string;
const publicJwk = JSON.parse(config.get("PUBLIC_JWK"));
const privateJwk = JSON.parse(config.get("PRIVATE_JWK"));

export default class SecurityHelperService {
  private static aesKey: Buffer = Buffer.from(
    config.get<string>("AES_KEY"),
    "hex"
  );
  private static publicKeyPromise: Promise<any> = importJWK(
    publicJwk,
    "RSA-OAEP-256"
  );
  private static privateKeyPromise: Promise<any> = importJWK(
    privateJwk,
    "RSA-OAEP-256"
  );
  /**
   *
   * @param password
   * @returns
   */
  public static async HashPassword(password: string): Promise<string> {
    try {
      const hash = await bcrypt.hash(password, 12);
      return hash;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param enteredPassword
   * @param password
   * @returns
   */
  public static async ComparePassword(
    enteredPassword: string,
    password: string
  ): Promise<boolean> {
    try {
      const isValid = await bcrypt.compare(enteredPassword, password);
      return isValid;
    } catch (error) {
      throw error;
    }
  }

  // Define the token durations for different types of tokens
  private static tokenDurations = {
    [TokenType.AUTH]: 86400, // 24 hours for auth tokens
    [TokenType.REFRESH]: 2592000, // 30 days for refresh tokens
    [TokenType.TEMPORARY]: 1500, // 15 minutes for OTP tokens
  };

  /**
   *  * Generates a JWT token with a specific payload and type.
   * @param payload
   * @param type
   * @returns
   */
  public static async GenerateToken(
    payload: ITokenData,
    type: TokenType = TokenType.AUTH,
    customDuration?: number
  ): Promise<{ token: string; expiresIn: number; type: TokenType }> {
    // Default to 86400 (1 day) for unsupported types
    const duration = customDuration
      ? customDuration
      : this.tokenDurations[type] || 86400;

    // Create the JWT with the determined expiration
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: duration,
    });

    return {
      token,
      expiresIn: duration,
      type,
    };
  }

  /**
   *
   * @param token
   * @returns
   */
  public static async VerifyAuthToken(
    token: string
  ): Promise<ITokenData | null> {
    try {
      const isValid = jwt.verify(token, JWT_SECRET ?? "") as ITokenData;
      return isValid;
    } catch (error) {
      console.log("JWT VERIFY ERROR", error);
      return null;
    }
  }

  /**
   *
   * @returns
   */
  public static generateOtp(): string {
    const code = Math.floor(10000 + Math.random() * 90000); // 5-digit code
    return code.toString();
  }

  /**
   *
   * @param length
   * @returns
   */
  public static generateRandomPassword(length = 12) {
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!";
    return Array.from(
      { length },
      () => charset[Math.floor(Math.random() * charset.length)]
    ).join("");
  }

  /**
   * Encrypts data using RSA-OAEP-256 with A256GCM content encryption
   * Uses JWE (JSON Web Encryption) format for secure key transport
   * @param data - The string data to encrypt
   * @returns Promise<string> - The encrypted data in JWE Compact Serialization format
   */
  public static async rsaEncrypt(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const publicKey = await SecurityHelperService.publicKeyPromise;

    return await new CompactEncrypt(encoder.encode(data))
      .setProtectedHeader({ alg: "RSA-OAEP-256", enc: "A256GCM" })
      .encrypt(publicKey);
  }

  /**
   * Decrypts JWE encrypted data using RSA private key
   * @param encrypted - The JWE Compact Serialization string to decrypt
   * @returns Promise<string> - The decrypted plaintext
   */
  public static async rsaDecrypt(encrypted: string): Promise<string> {
    const privateKey = await SecurityHelperService.privateKeyPromise;
    const { plaintext } = await compactDecrypt(encrypted, privateKey);
    const decoded = new TextDecoder().decode(plaintext);
    return decoded;
  }

  /**
   * Encrypts data using AES-256-CBC with a random initialization vector (IV)
   * Used for symmetric encryption of sensitive data stored in the database
   * @param data - The string data to encrypt
   * @returns {encrypted: string, iv: string} - Base64 encoded encrypted data and IV
   */
  public static aesEncrypt(data: string): { encrypted: string; iv: string } {
    const iv = randomBytes(16);
    const cipher = createCipheriv(
      "aes-256-cbc",
      SecurityHelperService.aesKey,
      iv
    );
    let encrypted = cipher.update(data, "utf8", "base64");
    encrypted += cipher.final("base64");
    return { encrypted, iv: iv.toString("base64") };
  }

  /**
   * Decrypts AES-256-CBC encrypted data using the provided IV
   * @param encrypted - Base64 encoded encrypted data
   * @param iv - Base64 encoded initialization vector used during encryption
   * @returns string - The decrypted plaintext
   */
  public static aesDecrypt(encrypted: string, iv: string): string {
    const decipher = createDecipheriv(
      "aes-256-cbc",
      SecurityHelperService.aesKey,
      Buffer.from(iv, "base64")
    );
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  public static maskApiKey(apiKey: string | null | undefined) {
    if (!apiKey) return "";
    if (apiKey.length < 6) return apiKey;

    const firstPart = apiKey.slice(0, 4);
    const lastPart = apiKey.slice(-2);
    const maskedPart = "*".repeat(apiKey.length - 6);

    return `${firstPart}${maskedPart}${lastPart}`;
  }
}
