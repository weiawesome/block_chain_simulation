import * as CryptoJS from 'crypto-js';
import * as forge from 'node-forge';
export function Hash_SHA256(value:string) {
    return CryptoJS.SHA256(value).toString();
}

export function GenerateRSAKeyPair() {
    const keys = forge.pki.rsa.generateKeyPair(2048);
    const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);
    const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);

    return { public_key: publicKeyPem, private_key: privateKeyPem };
}
export function Signature(data: string, privateKeyPem: string): string{
    try {
        const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

        const md = forge.md.sha256.create();
        md.update(data, 'utf8');

        const signature = privateKey.sign(md);

        return forge.util.encode64(signature);
    } catch (error) {
        console.error('簽名出錯:', error);
        return "Error to signature";
    }
}
export function VerifySignature(data: string, signature: string, publicKeyPem: string): boolean {
    try {
        const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

        const md = forge.md.sha256.create();
        md.update(data, 'utf8');

        const signatureBytes = forge.util.decode64(signature);

        return publicKey.verify(md.digest().getBytes(), signatureBytes);
    } catch (error) {
        console.error('驗證簽名錯誤:', error);
        return false;
    }
}