package precisionFDA.cases;

import org.testng.annotations.Test;
import precisionFDA.data.TestUserData;
import precisionFDA.model.FileProfile;
import precisionFDA.model.FolderProfile;
import precisionFDA.model.SpaceProfile;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.overview.OverviewPage;
import precisionFDA.pages.spaces.EditSpacePage;
import precisionFDA.pages.spaces.SpaceDetailsPage;
import precisionFDA.pages.spaces.SpacesPage;
import ru.yandex.qatools.htmlelements.annotations.Name;

import static org.assertj.core.api.Assertions.assertThat;
import static precisionFDA.data.TestDict.getDictActive;
import static precisionFDA.data.TestDict.getDictUnactivated;
import static precisionFDA.data.TestFilesData.getMainSpaceFile;
import static precisionFDA.data.TestFilesData.getMainSpaceFolder;
import static precisionFDA.data.TestSpacesData.getMainSpaceProfile;
import static precisionFDA.utils.Utils.generateExpectedBreadcrumbsFiles;
import static precisionFDA.utils.Utils.generateExpectedBreadcrumbsSpaces;
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

    @Test(dependsOnMethods = {"loginAsAdminUser"}, priority = 0)
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

        logoutFromAll();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"loginAsAdminUser", "createAndSaveSpace"}, priority = 1)
    public void activateSpaceByHostLead() {
        printTestHeader("Test Case: activate space by host lead");

        SpaceProfile spaceProfile = getMainSpaceProfile();
        UserProfile user = TestUserData.getTestUser();

        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        SpacesPage spacesPage = overviewPage.openSpacesPage();

        SoftAssert.assertThat(
                spacesPage.getSpaceStatusOnGrid(spaceProfile.getSpaceName()))
                .as("Status is Unactivated")
                .isEqualToIgnoringCase(getDictUnactivated());

        SpaceDetailsPage spaceDetailsPage = spacesPage.openSpace(spaceProfile.getSpaceName());

        SoftAssert.assertThat(
                spaceDetailsPage.isAcceptByHostLeadDisplayed())
                .as("'Accept' link for Host Lead is displayed")
                .isTrue();

        SoftAssert.assertThat(
                spaceDetailsPage.isAcceptByGuestLeadDisplayed())
                .as("'Accept' link for Guest Lead is displayed")
                .isFalse();

        spaceDetailsPage = spaceDetailsPage.acceptByHostLead();

        SoftAssert.assertThat(
                spaceDetailsPage.isAcceptByHostLeadDisplayed())
                .as("'Accept' link for Host Lead is displayed")
                .isFalse();

        SoftAssert.assertThat(
                spaceDetailsPage.isAcceptByGuestLeadDisplayed())
                .as("'Accept' link for Guest Lead is displayed")
                .isFalse();

        logoutFromAll();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"loginAsAdminUser", "createAndSaveSpace"}, priority = 2)
    public void activateSpaceByGuestLead() {
        printTestHeader("Test Case: activate space by guest lead");

        SpaceProfile spaceProfile = getMainSpaceProfile();
        UserProfile user = TestUserData.getAnotherTestUser();

        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        SpacesPage spacesPage = overviewPage.openSpacesPage();

        SoftAssert.assertThat(
                spacesPage.getSpaceStatusOnGrid(spaceProfile.getSpaceName()))
                .as("Status is Unactivated")
                .isEqualToIgnoringCase(getDictUnactivated());

        SpaceDetailsPage spaceDetailsPage = spacesPage.openSpace(spaceProfile.getSpaceName());

        SoftAssert.assertThat(
                spaceDetailsPage.isAcceptByGuestLeadDisplayed())
                .as("'Accept' link for Guest Lead is displayed")
                .isTrue();

        SoftAssert.assertThat(
                spaceDetailsPage.isAcceptByHostLeadDisplayed())
                .as("'Accept' link for Host Lead is displayed")
                .isFalse();

        spaceDetailsPage = spaceDetailsPage.acceptByGuestLead();

        SoftAssert.assertThat(
                spaceDetailsPage.isAcceptByHostLeadDisplayed())
                .as("'Accept' link for Host Lead is displayed")
                .isFalse();

        SoftAssert.assertThat(
                spaceDetailsPage.isAcceptByGuestLeadDisplayed())
                .as("'Accept' link for Guest Lead is displayed")
                .isFalse();

        logoutFromAll();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"loginAsAdminUser", "createAndSaveSpace"}, priority = 3)
    public void createFolderByHostLead() {
        printTestHeader("Test Case: create a folder by host lead");

        SpaceProfile spaceProfile = getMainSpaceProfile();
        UserProfile user = TestUserData.getTestUser();
        FolderProfile spaceFolder = getMainSpaceFolder();

        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        SpacesPage spacesPage = overviewPage.openSpacesPage();

        SoftAssert.assertThat(
                spacesPage.getSpaceStatusOnGrid(spaceProfile.getSpaceName()))
                .as("Status is Active")
                .isEqualToIgnoringCase(getDictActive());

        SpaceDetailsPage spaceDetailsPage = spacesPage.openSpace(spaceProfile.getSpaceName());

        SoftAssert.assertThat(
                spaceDetailsPage.isAcceptByHostLeadDisplayed())
                .as("'Accept' link for Host Lead is displayed")
                .isFalse();

        SoftAssert.assertThat(
                spaceDetailsPage.isAcceptByGuestLeadDisplayed())
                .as("'Accept' link for Guest Lead is displayed")
                .isFalse();

        spaceDetailsPage = spaceDetailsPage.createFolder(spaceFolder.getFolderName());

        SoftAssert.assertThat(
                spaceDetailsPage.isLinkToCreatedFolderDisplayed(spaceFolder.getFolderName()))
                .as("Created folder is displayed")
                .isTrue();

        spaceDetailsPage = spaceDetailsPage.openFolder(spaceFolder.getFolderName());

        assertThat(
                spaceDetailsPage.isBreadcrumbDisplayed())
                .as("Breadcrumbs are displayed")
                .isTrue();

        SoftAssert.assertThat(
                spaceDetailsPage.getDisplayedBreadcrumbsText())
                .as("Breadcrumbs")
                .isEqualTo(generateExpectedBreadcrumbsSpaces(spaceFolder.getFolderName(), "", ""));

        spaceDetailsPage = spaceDetailsPage.clickBreadcrumbSpaceFiles();

        SoftAssert.assertThat(
                spaceDetailsPage.isLinkToCreatedFolderDisplayed(spaceFolder.getFolderName()))
                .as("Created folder is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"loginAsAdminUser", "createAndSaveSpace"}, priority = 4, enabled = false)
    public void addFileByHostLead() {
        printTestHeader("Test Case: add a file by host lead");

        SpaceProfile spaceProfile = getMainSpaceProfile();
        UserProfile user = TestUserData.getTestUser();
        FolderProfile spaceFolder = getMainSpaceFolder();
        FileProfile spaceFile = getMainSpaceFile();

        SpacesPage spacesPage = openOverviewPage().openSpacesPage();
        SpaceDetailsPage spaceDetailsPage = spacesPage.openSpace(spaceProfile.getSpaceName());

        SoftAssert.assertAll();
    }




}