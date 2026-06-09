import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../fixtures');

export function getFixturePath(fileName: string): string {
    return path.join(fixturesDir, fileName);
}

export function createUniqueCopy(sourceFileName: string, prefix: string): { fileName: string; filePath: string } {
    const extension = path.extname(sourceFileName);
    const fileName = `${prefix}-${Date.now()}${extension}`;
    const filePath = path.join(fixturesDir, fileName);
    fs.copyFileSync(getFixturePath(sourceFileName), filePath);
    return { fileName, filePath };
}

export function removeFileIfExists(filePath: string): void {
    if (!fs.existsSync(filePath)) {
        return;
    }

    try {
        fs.unlinkSync(filePath);
    } catch {
        // En Windows el archivo puede seguir bloqueado por el navegador tras la subida.
    }
}

export function ensureLargeImageFixture(): string {
    const filePath = getFixturePath('large-image.jpg');
    const sizeInBytes = 120 * 1024 * 1024;

    if (!fs.existsSync(filePath) || fs.statSync(filePath).size < sizeInBytes) {
        const buffer = Buffer.alloc(sizeInBytes, 0xff);
        buffer[0] = 0xff;
        buffer[1] = 0xd8;
        buffer[2] = 0xff;
        buffer[3] = 0xe0;
        fs.writeFileSync(filePath, buffer);
    }

    return filePath;
}

export function createUniqueLargeImage(prefix: string): { fileName: string; filePath: string } {
    const fileName = `${prefix}-${Date.now()}.jpg`;
    const filePath = path.join(fixturesDir, fileName);
    const sizeInBytes = 80 * 1024 * 1024;
    const buffer = Buffer.alloc(sizeInBytes, 0xff);
    buffer[0] = 0xff;
    buffer[1] = 0xd8;
    buffer[2] = 0xff;
    buffer[3] = 0xe0;
    fs.writeFileSync(filePath, buffer);
    return { fileName, filePath };
}
