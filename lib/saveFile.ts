// Minimal typings for the File System Access API (not yet in lib.dom.d.ts).
interface FileSystemDirectoryHandle {
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
}
interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
}
interface FileSystemWritableFileStream {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
}

declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
  }
}

export function isFolderPickerSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function';
}

export async function pickFolder(): Promise<FileSystemDirectoryHandle | null> {
  if (!isFolderPickerSupported()) return null;
  try {
    return await window.showDirectoryPicker!();
  } catch (err) {
    // User cancelled the picker.
    if ((err as DOMException)?.name === 'AbortError') return null;
    throw err;
  }
}

export async function saveIntoFolder(
  folder: FileSystemDirectoryHandle,
  blob: Blob,
  filename: string,
): Promise<void> {
  const fileHandle = await folder.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

export function downloadFallback(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
