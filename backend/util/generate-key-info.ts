import { generateKeyPairSync, createPublicKey, randomUUID } from "crypto";

export interface IJWK {
  alg: string;
  use: string;
  kid: string;
  kty: string;
  n: string;
  e: string;
}

export function generateKeyInfo() {
  // create the key pair
  const keyPair = generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  // create the jwk entry
  const jwk = {
    alg: "RS256",
    use: "sig",
    kid: randomUUID(),
    ...createPublicKey(keyPair.publicKey).export({ format: "jwk" }),
  } as IJWK;

  return {
    public_key: keyPair.publicKey,
    private_key: keyPair.privateKey,
    jwk: jwk,
  };
}
