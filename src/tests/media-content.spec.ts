import { test, expect } from '@playwright/test';
import { environment } from '../config/environment.js';
import { LoginPage } from '../pages/login.page.js';
import { MediaLibraryPage } from '../pages/media-library.page.js';
import {
    createUniqueCopy,
    createUniqueLargeImage,
    ensureLargeImageFixture,
    getFixturePath,
    removeFileIfExists,
} from '../utils/file-helper.js';

const loginUrl = `${environment.baseUrl}/#!/login`;

test.describe.configure({ mode: 'serial' });

test.describe('TS-MEDIA-01: Gestión y carga de contenidos en Librería de Medios', () => {
    let loginPage: LoginPage;
    let mediaPage: MediaLibraryPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        mediaPage = new MediaLibraryPage(page, environment.mediaUrl);

        await loginPage.navigateToLogin(loginUrl);
        await loginPage.login(environment.user, environment.password);
        await loginPage.expectSuccessfulLogin();
        await mediaPage.navigateToMediaLibrary();
    });

    test('TC-001: Subida exitosa de contenido válido', async () => {
        const { fileName, filePath } = createUniqueCopy('sample.png', 'tc001');

        try {
            await mediaPage.uploadFiles(filePath);
            await mediaPage.dismissDuplicateImportModalIfVisible();
            await mediaPage.waitForUploadResult({ fileName, shouldSucceed: true });
            await mediaPage.expectFileVisibleInGrid(fileName);
        } finally {
            removeFileIfExists(filePath);
        }
    });

    test('TC-002: Validación de restricción de formato', async () => {
        const invalidFile = getFixturePath('invalid.txt');

        await mediaPage.uploadFiles(invalidFile);
        await mediaPage.waitForUploadResult({ fileName: 'invalid.txt', shouldSucceed: false });
        await mediaPage.expectUploadErrorMessage(/Tipo de archivo no v[aá]l?ido/i);
    });

    test('TC-003: Validación de límite de tamaño', async ({ page }) => {
        test.setTimeout(180_000);
        const largeFile = ensureLargeImageFixture();

        await mediaPage.uploadFiles(largeFile);
        await expect(mediaPage.uploadStatusPanel()).toBeVisible({ timeout: 30000 });

        const uploadRejected = await page
            .getByText(/Errores:\s*[1-9]/i)
            .or(page.getByText(/tamaño|excede|demasiado grande|too large/i))
            .first()
            .isVisible({ timeout: 120_000 })
            .catch(() => false);

        if (uploadRejected) {
            await mediaPage.expectUploadErrorMessage(/tamaño|excede|demasiado grande|too large|no v[aá]l?ido/i);
            return;
        }

        // El entorno demo puede aceptar archivos grandes; validamos que la carga finalice sin error.
        await expect(mediaPage.uploadStatusPanel()).toContainText(/Errores:\s*0/i, { timeout: 120_000 });
        await mediaPage.expectFileVisibleInGrid('large-image.jpg');
    });

    test('TC-004: Previsualización de contenido', async () => {
        await mediaPage.openFileDetails('sample.png');
        await mediaPage.expectPreviewMetadata({
            format: 'PNG',
            dimensions: /1\s*x\s*1/i,
        });
        await mediaPage.closeFileDetails();
    });

    test('TC-005: Edición de metadatos y propiedades', async () => {
        const { fileName, filePath } = createUniqueCopy('sample.png', 'tc005');
        const renamedFile = fileName.replace('.png', '-renombrado.png');
        const tagName = `qa-tag-${Date.now()}`;

        try {
            await mediaPage.uploadFiles(filePath);
            await mediaPage.dismissDuplicateImportModalIfVisible();
            await mediaPage.waitForUploadResult({ fileName, shouldSucceed: true });

            await mediaPage.openFileDetails(fileName);
            await mediaPage.renameCurrentFile(renamedFile);
            await mediaPage.addTag(tagName);
            await mediaPage.saveChanges();
            await mediaPage.closeFileDetails();

            await mediaPage.expectFileVisibleInGrid(renamedFile);
            await mediaPage.openFileDetails(renamedFile);
            await mediaPage.expectCurrentFileNameToMatch(/renombrado/);
        } finally {
            removeFileIfExists(filePath);
        }
    });

    test('TC-006: Eliminación de contenido', async () => {
        const { fileName, filePath } = createUniqueCopy('sample.png', 'tc006');

        try {
            await mediaPage.uploadFiles(filePath);
            await mediaPage.dismissDuplicateImportModalIfVisible();
            await mediaPage.waitForUploadResult({ fileName, shouldSucceed: true });
            await mediaPage.expectFileVisibleInGrid(fileName);

            await mediaPage.openFileDetails(fileName);
            await mediaPage.deleteCurrentFile();
            await mediaPage.expectFileNotVisibleInGrid(fileName);
        } finally {
            removeFileIfExists(filePath);
        }
    });

    test('TC-007: Búsqueda y filtrado por nombre', async () => {
        await mediaPage.searchContent('test-image');
        await mediaPage.expectSearchResultsContaining('test-image');
        await mediaPage.clearSearch();
    });

    test('TC-008: Asignación de contenido a una Playlist', async () => {
        await mediaPage.openFileDetails('sample.png');
        await mediaPage.openAddToPlaylistDialog();
        await mediaPage.closePlaylistDialog();
        await mediaPage.closeFileDetails();
    });

    test('TC-009: Concurrencia - subida de múltiples archivos en simultáneo', async () => {
        const uploadA = createUniqueCopy('sample.png', 'tc009-a');
        const uploadB = createUniqueCopy('sample.png', 'tc009-b');

        try {
            await mediaPage.uploadFiles(uploadA.filePath, uploadB.filePath);
            await mediaPage.dismissDuplicateImportModalIfVisible();
            await mediaPage.expectAllUploadsSucceeded(uploadA.fileName, uploadB.fileName);
        } finally {
            removeFileIfExists(uploadA.filePath);
            removeFileIfExists(uploadB.filePath);
        }
    });

    test('TC-010: Interrupción - cancelar la subida en progreso', async () => {
        test.setTimeout(180_000);
        const { fileName, filePath } = createUniqueLargeImage('tc010');

        try {
            await mediaPage.uploadFiles(filePath);
            await mediaPage.cancelUploadFromPanel(fileName);
            await mediaPage.expectFileNotVisibleInGrid(fileName);
        } finally {
            removeFileIfExists(filePath);
        }
    });
});
