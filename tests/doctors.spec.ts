import { test } from './my-test';

test('Doctors page should show 3 doctors', async ({ homePage, doctorsPage }) => {
    await homePage.navigateToDoctors();

    await doctorsPage.assertDoctorCount(3);
});

test('Dr. James Smith should have General Practice specialization', async ({ homePage, doctorsPage }) => {
    await homePage.navigateToDoctors();

    await doctorsPage.assertDoctorSpecialization('James Smith', 'General Practice');
});

test('Dr. Sarah Johnson should have Cardiology specialization', async ({ homePage, doctorsPage }) => {
    await homePage.navigateToDoctors();

    await doctorsPage.assertDoctorSpecialization('Sarah Johnson', 'Cardiology');
});

test('Dr. Michael Williams should have Neurology specialization', async ({ homePage, doctorsPage }) => {
    await homePage.navigateToDoctors();

    await doctorsPage.assertDoctorSpecialization('Michael Williams', 'Neurology');
});
