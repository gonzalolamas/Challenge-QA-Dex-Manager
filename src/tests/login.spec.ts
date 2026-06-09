import { test } from '@playwright/test';
import { environment } from '../config/environment.js';
import { LoginPage } from '../pages/login.page.js';

const loginUrl = `${environment.baseUrl}/#!/login`;

test.describe('TS-AUTH-01: Autenticación en Dex Manager', () => {
    test('TC-000: Login exitoso con credenciales válidas', async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.navigateToLogin(loginUrl);
        await loginPage.login(environment.user, environment.password);
        await loginPage.expectSuccessfulLogin();
    });
});
