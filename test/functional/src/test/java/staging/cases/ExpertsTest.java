package staging.cases;

import org.testng.annotations.Test;
import ru.yandex.qatools.htmlelements.annotations.Name;
import staging.data.TestUserData;
import staging.model.ExpertProfile;
import staging.model.User;
import staging.pages.StartPage;
import staging.pages.experts.ExpertsCreatedExpertPage;
import staging.pages.experts.ExpertsEditExpertPage;
import staging.pages.experts.ExpertsExpertDashboardPage;
import staging.pages.experts.ExpertsPage;
import staging.pages.overview.OverviewPage;

import static org.assertj.core.api.Assertions.assertThat;
import static staging.data.TestExpertsData.getMainProfile;

@Name("Experts test suite")
public class ExpertsTest extends AbstractTest {

    @Test(priority = 1)
    public void createExpert() {
        printTestHeader("Test Case: check it is possible to create an expert as an admin user");

        User user = TestUserData.getAdminUser();

        OverviewPage overviewPage = openLoginPage(user).correctLogin(user).grantAccess();

        SoftAssert.assertThat(
                overviewPage.isNavigationPanelDisplayed())
                .as("navigation panel is displayed")
                .isTrue();

        SoftAssert.assertThat(
                overviewPage.getUsernameLinkText())
                .as("logged username")
                .isEqualTo(user.getApplUserFullName());

        ExpertProfile expertProfile = getMainProfile();

        ExpertsPage expertsPage = getCommonPage().openExpertsPage();

        assertThat(
                expertsPage.isCreateExpertButtonDisplayed())
                .as("Create Expert button is displayed")
                .isTrue();

        ExpertsEditExpertPage expertsEditExpertPage = expertsPage.clickCreateExpertButton();
        expertsEditExpertPage = expertsEditExpertPage.fillNewExpertForm(expertProfile);
        expertsPage = expertsEditExpertPage.clickCreateExpert();

        SoftAssert.assertThat(
                expertsPage.isExpertCreatedSuccessAlertDisplayed())
                .as("success alert is displayed")
                .isTrue();

        SoftAssert.assertThat(
                expertsPage.getExpertCreatedSuccessAlertText())
                .as("success alert")
                .contains(expertProfile.getExpertName());

        SoftAssert.assertThat(
                expertsPage.isCreatedExpertPrefNameDisplayed(expertProfile))
                .as("link to just created expert is displayed")
                .isTrue();

        SoftAssert.assertThat(
                expertsPage.isCreatedExpertImageDisplayed(expertProfile))
                .as("uploaded expert image is displayed")
                .isTrue();

        ExpertsCreatedExpertPage createdExpertPage = expertsPage.openExpertPage(expertProfile);

        SoftAssert.assertThat(
                createdExpertPage.getAboutDisplayedText())
                .as("About text")
                .isEqualTo(expertProfile.getExpertAbout());

        SoftAssert.assertThat(
                createdExpertPage.getOpenClosedLabelText())
                .as("open/closed label")
                .contains("Closed");

        SoftAssert.assertThat(
                createdExpertPage.getPublicPrivateLabelText())
                .as("public/private label")
                .contains("Private");

        StartPage startPage = getCommonPage().logout();

        SoftAssert.assertThat(
                startPage.isCreatedExpertPrefNameDisplayed(expertProfile))
                .as("expert's preferred name is displayed")
                .isFalse();

        SoftAssert.assertAll();
        closeBrowser();
    }

    @Test(priority = 2)
    public void checkPrivateClosedAsTheExpertFirst() {
        printTestHeader("Test Case: check behavior of the just created expert block as the expert user");

        User user = TestUserData.getTestUser();
        ExpertProfile expertProfile = getMainProfile();

        setUp();
        openLoginPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = getCommonPage().openExpertsPage();

        SoftAssert.assertThat(
                expertsPage.isCreatedExpertPrefNameDisplayed(expertProfile))
                .as("link to the created expert is displayed")
                .isTrue();

        ExpertsCreatedExpertPage createdExpertPage = expertsPage.openExpertPage(expertProfile);

        SoftAssert.assertThat(
                createdExpertPage.getOpenClosedLabelText())
                .as("open/closed label")
                .contains("Closed");

        SoftAssert.assertThat(
                createdExpertPage.getPublicPrivateLabelText())
                .as("public/private label")
                .contains("Private");

        SoftAssert.assertThat(
                createdExpertPage.getAboutDisplayedText())
                .as("About text")
                .isEqualTo(expertProfile.getExpertAbout());

        ExpertsExpertDashboardPage expertDashboardPage = createdExpertPage.openDashboard();
        ExpertsEditExpertPage editExpertPage = expertDashboardPage.clickEdit();

        SoftAssert.assertThat(
                editExpertPage.isVisibilitySelectorDisplayed())
                .as("Select Visibility element")
                .isFalse();

        SoftAssert.assertAll();
        closeBrowser();
    }

    @Test(priority = 3)
    public void checkPrivateClosedAsAnotherUserFirst() {
        printTestHeader("Test Case: check behavior of the created expert block as another user");

        User user = TestUserData.getAnotherTestUser();
        ExpertProfile expertProfile = getMainProfile();

        setUp();
        openLoginPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = getCommonPage().openExpertsPage();

        SoftAssert.assertThat(
                expertsPage.isCreatedExpertPrefNameDisplayed(expertProfile))
                .as("link to the created expert is NOT displayed")
                .isFalse();

        SoftAssert.assertAll();
        closeBrowser();
    }

    @Test(priority = 4)
    public void setPublicVisibility() {
        printTestHeader("Test Case: set visibility as Public");

        User user = TestUserData.getAdminUser();
        ExpertProfile expertProfile = getMainProfile();

        setUp();
        openLoginPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = getCommonPage().openExpertsPage();
        ExpertsCreatedExpertPage createdExpertPage = expertsPage.openExpertPage(expertProfile);
        ExpertsExpertDashboardPage expertDashboardPage = createdExpertPage.openDashboard();
        ExpertsEditExpertPage editExpertPage = expertDashboardPage.clickEdit();
        editExpertPage.setPublicVisibility();
        createdExpertPage = editExpertPage.clickUpdate();

        SoftAssert.assertThat(
                createdExpertPage.getOpenClosedLabelText())
                .as("open/closed label")
                .contains("Closed");

        SoftAssert.assertThat(
                createdExpertPage.getPublicPrivateLabelText())
                .as("public/private label")
                .contains("Public");

        StartPage startPage = getCommonPage().logout();

        SoftAssert.assertThat(
                startPage.isCreatedExpertPrefNameDisplayed(expertProfile))
                .as("the created expert is displayed")
                .isFalse();

        SoftAssert.assertAll();
        closeBrowser();
    }

    @Test(priority = 5)
    public void checkPublicClosedAsAnotherUserFirst() {
        printTestHeader("Test Case: check behavior of the public closed expert as another user");

        User user = TestUserData.getAnotherTestUser();
        ExpertProfile expertProfile = getMainProfile();

        setUp();
        openLoginPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = getCommonPage().openExpertsPage();

        SoftAssert.assertThat(
                expertsPage.isCreatedExpertPrefNameDisplayed(expertProfile))
                .as("link to the created expert is displayed")
                .isTrue();

        ExpertsCreatedExpertPage createdExpertPage = expertsPage.openExpertPage(expertProfile);

        SoftAssert.assertThat(
                createdExpertPage.getOpenClosedLabelText())
                .as("open/closed label")
                .contains("Closed");

        SoftAssert.assertThat(
                createdExpertPage.getAboutDisplayedText())
                .as("About text")
                .isEqualTo(expertProfile.getExpertAbout());

        SoftAssert.assertThat(
                createdExpertPage.isAskQuestionButtonDisplayed())
                .as("Ask Question button is displayed")
                .isFalse();

        SoftAssert.assertAll();
        closeBrowser();
    }


}