import { MenuItem } from '../enums/MenuItem';
import { test } from './my-test';

test('Menu should navigate to the correct pages', async ({ menuPage }) => {
    await menuPage.navigateTo();

    await menuPage.navigateToByMenu(MenuItem.MyAppointments);
    await menuPage.assertUrlAndTitle(MenuItem.MyAppointments);

    await menuPage.navigateToByMenu(MenuItem.MedicalHistory);
    await menuPage.assertUrlAndTitle(MenuItem.MedicalHistory);

    await menuPage.navigateToByMenu(MenuItem.Prescriptions);
    await menuPage.assertUrlAndTitle(MenuItem.Prescriptions);

    await menuPage.navigateToByMenu(MenuItem.OurDoctors);
    await menuPage.assertUrlAndTitle(MenuItem.OurDoctors);

    await menuPage.navigateToByMenu(MenuItem.Profile);
    await menuPage.assertUrlAndTitle(MenuItem.Profile);
});
