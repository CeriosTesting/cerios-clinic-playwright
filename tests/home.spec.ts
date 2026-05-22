import { test } from './my-test';

test('Home should show personalized greeting', async ({ homePage }) => {
    await homePage.navigateTo();

    await homePage.assertGreeting();
});

test('Home should show 2 quick action cards', async ({ homePage }) => {
    await homePage.navigateTo();

    await homePage.assertQuickActionCount(2);
});

test('Doctors page should show 3 doctors', async ({ homePage }) => {
    await homePage.navigateToDoctors();

    await homePage.doctors.assertDoctorCount(3);
});

test('Doctors Dr. James Smith should have General Practice specialization', async ({ homePage }) => {
    await homePage.navigateToDoctors();

    await homePage.doctors.assertDoctorSpecialization('James Smith', 'General Practice');
});

test('Home accessibility testing', async ({ homePage }) => {
    await homePage.navigateTo();

    await homePage.assertAccessibility();
});