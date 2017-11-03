package staging.cases;

import org.testng.annotations.Test;
import ru.yandex.qatools.htmlelements.annotations.Name;
import staging.model.ExpertProfile;
import staging.model.User;
import staging.pages.experts.ExpertsCreateExpertPage;
import staging.pages.experts.ExpertsPage;
import staging.pages.overview.OverviewPage;

import static org.assertj.core.api.Assertions.assertThat;
import static staging.data.TestExpertsData.getMainProfile;

@Name("Experts test suite")
public class ExpertsTest extends AbstractTest {

    @Test
    public void successfulLoginAsAdmin() {
        printTestHeader(" -- Successful Login as an Admin-- ");

        User user = User.getAdminUser();

        OverviewPage overviewPage = openLoginPage(user).correctLogin(user).grantAccess();

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

    @Test(dependsOnMethods = "successfulLoginAsAdmin")
    public void createExpert() {
        printTestHeader("Test Case: check it is possible to create an expert");

        ExpertProfile expertProfile = getMainProfile();

        ExpertsPage expertsPage = getCommonPage().openExpertsPage();

        assertThat(
                expertsPage.isCreateExpertButtonDisplayed())
                .as("Create Expert button is displayed")
                .isTrue();

        ExpertsCreateExpertPage expertsCreateExpertPage = expertsPage.clickCreateExpertButton();
        expertsCreateExpertPage = expertsCreateExpertPage.fillNewExpertForm(expertProfile);
        expertsPage = expertsCreateExpertPage.clickCreateExpert();

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

        SoftAssert.assertAll();
    }


}