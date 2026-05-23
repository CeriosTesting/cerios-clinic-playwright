import { test } from './my-test';

test('Home should show personalized greeting', async ({ homePage }) => {
    await homePage.navigateTo();

    await homePage.assertGreeting();
});

test('Home should show 2 quick action cards', async ({ homePage }) => {
    await homePage.navigateTo();

    await homePage.assertQuickActionCount(2);
});

test('Home accessibility testing', async ({ homePage }) => {
    await homePage.navigateTo();

    await homePage.assertAccessibility();
});