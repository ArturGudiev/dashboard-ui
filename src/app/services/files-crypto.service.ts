import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Cipher } from '@fyears/rclone-crypt';
import { firstValueFrom } from 'rxjs';
import {
  UnlockFilesDialogComponent,
  type UnlockFilesDialogResult,
} from '../components/dialogs/unlock-files-dialog/unlock-files-dialog.component';

const SESSION_KEY = 'dashboard.files.unlock';

interface StoredFilesKey {
  password: string;
  salt: string;
}

/**
 * Browser-only rclone crypt (TNO): never sends keys to the backend.
 * Compatible with rclone crypt content encryption (filename_encryption=off, suffix=.bin).
 */
@Injectable({
  providedIn: 'root',
})
export class FilesCryptoService {
  private dialog = inject(MatDialog);
  private cipher: Cipher | null = null;
  private unlockPromise: Promise<boolean> | null = null;

  hasSessionKey(): boolean {
    return !!this.readStoredKey() || !!this.cipher;
  }

  clearSessionKey(): void {
    this.cipher = null;
    this.unlockPromise = null;
    sessionStorage.removeItem(SESSION_KEY);
  }

  /** Ensures a session key exists when storage is encrypted. Returns false if user cancels. */
  async ensureUnlocked(encrypted: boolean): Promise<boolean> {
    if (!encrypted) {
      return true;
    }
    if (this.cipher) {
      return true;
    }
    const stored = this.readStoredKey();
    if (stored) {
      await this.applyKey(stored.password, stored.salt);
      return true;
    }
    return this.promptForKey();
  }

  async promptForKey(): Promise<boolean> {
    if (this.unlockPromise) {
      return this.unlockPromise;
    }
    this.unlockPromise = this.openUnlockDialog();
    try {
      return await this.unlockPromise;
    } finally {
      this.unlockPromise = null;
    }
  }

  async decryptBytes(ciphertext: Uint8Array): Promise<Uint8Array> {
    if (!this.cipher) {
      throw new Error('Files key is not set');
    }
    try {
      return await this.cipher.decryptData(ciphertext);
    } catch (e) {
      this.clearSessionKey();
      const message = e instanceof Error ? e.message : 'Decryption failed';
      throw new Error(message.includes('password') || message.includes('authenticate')
        ? 'Wrong files key (could not decrypt)'
        : `Decryption failed: ${message}`);
    }
  }

  async encryptBytes(plaintext: Uint8Array): Promise<Uint8Array> {
    if (!this.cipher) {
      throw new Error('Files key is not set');
    }
    return this.cipher.encryptData(plaintext, undefined);
  }

  async decryptBlob(blob: Blob): Promise<Blob> {
    const buf = new Uint8Array(await blob.arrayBuffer());
    const plain = await this.decryptBytes(buf);
    // Copy into a fresh ArrayBuffer-backed view for Blob compatibility.
    const copy = new Uint8Array(plain.byteLength);
    copy.set(plain);
    return new Blob([copy]);
  }

  private async openUnlockDialog(): Promise<boolean> {
    const ref = this.dialog.open(UnlockFilesDialogComponent, {
      width: '420px',
      disableClose: true,
      autoFocus: 'first-tabbable',
    });
    const result = await firstValueFrom(ref.afterClosed()) as UnlockFilesDialogResult | undefined;
    if (!result?.password) {
      return false;
    }
    await this.applyKey(result.password, result.salt ?? '');
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ password: result.password, salt: result.salt ?? '' } satisfies StoredFilesKey),
    );
    return true;
  }

  private async applyKey(password: string, salt: string): Promise<void> {
    const cipher = new Cipher('base32');
    await cipher.key(password, salt);
    this.cipher = cipher;
  }

  private readStoredKey(): StoredFilesKey | null {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as StoredFilesKey;
      if (typeof parsed?.password === 'string') {
        return { password: parsed.password, salt: parsed.salt ?? '' };
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
    return null;
  }
}
