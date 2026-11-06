import { test } from './my-test';

test.use({ storageState: { cookies: [], origins: [] } });

test('Register should show submitted email on success screen', async ({ registerPage }) => {
    const email = `test.user.${Date.now()}@example.com`;

    await registerPage.navigateTo();
    await registerPage.register('Test', 'User', email, 'Test1234!');

    await registerPage.assertSuccessEmailVisible(email);
});
