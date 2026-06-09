import { Page, Locator, expect } from '@playwright/test';

export class MediaLibraryPage {
    private readonly page: Page;
    private readonly mediaUrl: string;
    private readonly fileInput: Locator;
    private readonly searchInput: Locator;

    constructor(page: Page, mediaUrl: string) {
        this.page = page;
        this.mediaUrl = mediaUrl;
        this.fileInput = page.locator('#fileInput').first();
        this.searchInput = page.getByPlaceholder('Búsqueda/Filtro').first();
    }

    async navigateToMediaLibrary(): Promise<void> {
        await this.page.goto(this.mediaUrl);

        if (!this.page.url().includes('/media')) {
            await this.page.getByRole('link', { name: 'Librería de Medias' }).click();
        }

        await this.page.waitForURL(/.*#!\/media/);
        await expect(this.searchInput).toBeVisible();
    }

    async uploadFiles(...filePaths: string[]): Promise<void> {
        await this.fileInput.setInputFiles(filePaths.length === 1 ? filePaths[0] : filePaths);
    }

    async dismissDuplicateImportModalIfVisible(): Promise<void> {
        const cancelButton = this.page.getByRole('button', { name: 'Cancelar', exact: true });
        if (await cancelButton.isVisible().catch(() => false)) {
            await cancelButton.click();
        }
    }

    uploadStatusPanel(): Locator {
        return this.page.getByText(/Subiendo archivos:/i);
    }

    async waitForUploadResult(options: { fileName: string; shouldSucceed: boolean }): Promise<void> {
        await expect(this.uploadStatusPanel()).toBeVisible({ timeout: 15000 });

        if (options.shouldSucceed) {
            await expect(this.uploadStatusPanel()).toContainText(/Errores:\s*0/i, { timeout: 60000 });
            await this.expectFileVisibleInGrid(options.fileName);
            return;
        }

        await expect(this.uploadStatusPanel()).toContainText(/Errores:\s*[1-9]/i, { timeout: 30000 });
        await expect(this.page.getByText(options.fileName, { exact: true })).toBeVisible();
    }

    async expectUploadErrorMessage(expectedMessage: RegExp | string): Promise<void> {
        await expect(this.page.getByText(expectedMessage)).toBeVisible({ timeout: 30000 });
    }

    private fileInGrid(fileName: string): Locator {
        return this.page.getByRole('option', { name: fileName });
    }

    async expectFileVisibleInGrid(fileName: string): Promise<void> {
        await expect(this.fileInGrid(fileName)).toBeVisible({ timeout: 60000 });
    }

    async expectFileNotVisibleInGrid(fileName: string): Promise<void> {
        await expect(this.fileInGrid(fileName)).toHaveCount(0, { timeout: 15000 });
    }

    async dismissUploadPanelIfVisible(): Promise<void> {
        if (!(await this.uploadStatusPanel().isVisible().catch(() => false))) {
            return;
        }

        const closeButton = this.page
            .locator('div')
            .filter({ has: this.uploadStatusPanel() })
            .getByRole('button')
            .last();

        if (await closeButton.isVisible().catch(() => false)) {
            await closeButton.click();
        }
    }

    async dismissBlockingOverlays(): Promise<void> {
        await this.dismissUploadPanelIfVisible();
        await this.page.keyboard.press('Escape');
    }

    async openFileDetails(fileName: string): Promise<void> {
        await this.dismissBlockingOverlays();
        const fileTile = this.fileInGrid(fileName);
        await fileTile.scrollIntoViewIfNeeded();
        // El botón flotante "+" puede interceptar el clic en la grilla inferior.
        await fileTile.click({ force: true });
        await expect(this.page.getByRole('textbox', { name: 'Nombre' })).toBeVisible();
    }

    async expectPreviewMetadata(expected: { format: string; dimensions: RegExp }): Promise<void> {
        await expect(this.page.getByRole('textbox', { name: 'Nombre' })).toBeVisible();
        await expect(this.page.locator('option, paper-icon-item').filter({ hasText: 'Formato' }).first())
            .toContainText(expected.format);
        await expect(this.page.locator('option, paper-icon-item').filter({ hasText: 'Dimensiones' }).first())
            .toContainText(expected.dimensions);
    }

    async renameCurrentFile(newName: string): Promise<void> {
        const nameInput = this.page.getByRole('textbox', { name: 'Nombre' });
        await nameInput.fill(newName);
    }

    async addTag(tagName: string): Promise<void> {
        await this.page.getByRole('textbox', { name: 'Agregar Etiqueta' }).fill(tagName);
        await this.page.getByRole('button', { name: 'Agregar', exact: true }).click();
        await expect(this.page.getByRole('button', { name: 'Guardar' })).toBeEnabled();
    }

    async saveChanges(): Promise<void> {
        const saveButton = this.page.getByRole('button', { name: 'Guardar' });
        await expect(saveButton).toBeEnabled({ timeout: 5000 });
        await saveButton.click();
    }

    async deleteCurrentFile(): Promise<void> {
        await this.page.getByRole('button', { name: 'Eliminar' }).first().click();
        const confirmButton = this.page.getByRole('button', { name: /^(Eliminar|Si|Aceptar)$/i }).last();
        await expect(confirmButton).toBeVisible();
        await confirmButton.click();
    }

    async expectCurrentFileNameToMatch(pattern: RegExp | string): Promise<void> {
        await expect(this.page.getByRole('textbox', { name: 'Nombre' })).toHaveValue(pattern);
    }

    async closeFileDetails(): Promise<void> {
        await this.page.getByRole('button', { name: 'Cerrar' }).click();
        await expect(this.searchInput).toBeVisible();
    }

    async searchContent(query: string): Promise<void> {
        await this.searchInput.fill(query);
        await this.page.waitForTimeout(1500);
    }

    async clearSearch(): Promise<void> {
        await this.searchInput.clear();
        await this.page.waitForTimeout(1000);
    }

    async expectSearchResultsContaining(query: string): Promise<void> {
        const visibleFiles = this.page.locator('text=' + query);
        await expect(visibleFiles.first()).toBeVisible();
        const count = await visibleFiles.count();
        expect(count).toBeGreaterThan(0);
        for (let index = 0; index < count; index++) {
            await expect(visibleFiles.nth(index)).toContainText(new RegExp(query, 'i'));
        }
    }

    async openAddToPlaylistDialog(): Promise<void> {
        await this.page.getByRole('button', { name: 'Agregar a Playlist' }).click();
        await expect(this.page.getByRole('button', { name: /^aceptar$/i })).toBeVisible();
    }

    async closePlaylistDialog(): Promise<void> {
        await this.page.getByRole('button', { name: /^cancelar$/i }).click();
    }

    async cancelUploadFromPanel(fileName: string): Promise<void> {
        await expect(this.uploadStatusPanel()).toBeVisible({ timeout: 15000 });
        await expect(this.page.getByText(fileName, { exact: true })).toBeVisible();
        await this.page.getByRole('button', { name: 'Cancelar subida' }).click();
    }

    async expectAllUploadsSucceeded(...fileNames: string[]): Promise<void> {
        await expect(this.uploadStatusPanel()).toBeVisible({ timeout: 15000 });
        await expect(this.uploadStatusPanel()).toContainText(/Errores:\s*0/i, { timeout: 60000 });

        for (const fileName of fileNames) {
            await this.expectFileVisibleInGrid(fileName);
        }
    }

    async expectFolderVisible(folderName: string): Promise<void> {
        await expect(this.page.getByText(folderName, { exact: true }).first()).toBeVisible();
    }

    async selectFolder(folderName: string): Promise<void> {
        await this.page.getByText(folderName, { exact: true }).first().click();
        await this.page.waitForTimeout(1000);
    }
}
