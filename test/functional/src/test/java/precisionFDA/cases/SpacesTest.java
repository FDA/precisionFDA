package precisionFDA.cases;

import org.testng.annotations.Test;
import precisionFDA.data.TestUserData;
import precisionFDA.model.SpaceProfile;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.overview.OverviewPage;
import precisionFDA.pages.spaces.EditSpacePage;
import precisionFDA.pages.spaces.SpacesPage;
import ru.yandex.qatools.htmlelements.annotations.Name;

import static precisionFDA.data.TestSpacesData.getMainSpaceProfile;
import static precisionFDA.utils.Utils.printTestHeader;

@Name("Spaces management test suite")
public class SpacesTest extends AbstractTest {

    @Test
    public void loginAsAdminUser() {
        printTestHeader(" -- Successful Login as an admin user -- ");

        UserProfile user = TestUserData.getAdminUser();

        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();

        SoftAssert.assertThat(
                overviewPage.isNavigationPanelDisplayed())
                .as("navigation panel is displayed")
                .isTrue();

        SoftAssert.assertThat(
                overviewPage.getUsernameLinkText())
                .as("logged username")
                .isEqualTo(user.getApplUserFullName());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"loginAsAdminUser"})
    public void createAndSaveSpace() {
        printTestHeader("Test Case: create and save a space");

        SpaceProfile spaceProfile = getMainSpaceProfile();

        SpacesPage spacesPage = openOverviewPage().openSpacesPage();
        EditSpacePage editSpacePage = spacesPage.clickProvisionSpace();
        editSpacePage.fillSpaceForm(spaceProfile);
        spacesPage = editSpacePage.clickCreate();

        SoftAssert.assertThat(
                spacesPage.isProvisionButtonDisplayed())
                .as("Provision Space button is displayed")
                .isTrue();

        SoftAssert.assertThat(
                spacesPage.isCreatedSpaceNameDisplayed(spaceProfile.getSpaceName()))
                .as("Created space name is displayed")
                .isTrue();

        SoftAssert.assertThat(
                spacesPage.isCreatedSpaceDescrDisplayed(spaceProfile.getSpaceDescription()))
                .as("Created space description is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }


}