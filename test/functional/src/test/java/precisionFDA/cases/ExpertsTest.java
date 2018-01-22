package precisionFDA.cases;

import org.testng.annotations.Test;
import ru.yandex.qatools.htmlelements.annotations.Name;
import precisionFDA.data.TestUserData;
import precisionFDA.model.ExpertProfile;
import precisionFDA.model.QuestionProfile;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.StartPage;
import precisionFDA.pages.experts.*;

import static org.assertj.core.api.Assertions.assertThat;
import static precisionFDA.data.TestExpertsData.getMainExpertProfile;
import static precisionFDA.data.TestQuestionsData.getMainQAProfile;
import static precisionFDA.utils.Utils.printTestHeader;

@Name("Experts test suite")
public class ExpertsTest extends AbstractTest {

    @Test(priority = 1)
    public void createExpert() {
        printTestHeader("Test Case: check it is possible to create an expert as an admin user");

        UserProfile user = TestUserData.getAdminUser();
        ExpertProfile expertProfile = getMainExpertProfile();

        openLoginPrecisionPage(user).correctLogin(user).grantAccess();

        ExpertsPage expertsPage = openOverviewPage().openExpertsPage();

        assertThat(
                expertsPage.isCreateExpertButtonDisplayed())
                .as("Create Expert button is displayed")
                .isTrue();

        ExpertsEditExpertPage expertsEditExpertPage = expertsPage.clickCreateExpertButton();
        expertsEditExpertPage = expertsEditExpertPage.fillNewExpertForm(expertProfile);
        expertsPage = expertsEditExpertPage.clickCreateExpert();

        assertThat(
                expertsPage.isExpertCreatedSuccessAlertDisplayed())
                .as("success alert is displayed")
                .isTrue();

        assertThat(
                expertsPage.getExpertCreatedSuccessAlertText())
                .as("success alert")
                .contains(expertProfile.getExpertName());

        assertThat(
                expertsPage.isCreatedExpertPrefNameDisplayed(expertProfile))
                .as("link to just created expert is displayed")
                .isTrue();

        assertThat(
                expertsPage.isCreatedExpertImageDisplayed(expertProfile))
                .as("uploaded expert image is displayed")
                .isTrue();

        ExpertsCreatedExpertPage createdExpertPage = expertsPage.openExpertPage(expertProfile);

        assertThat(
                createdExpertPage.getAboutDisplayedText())
                .as("About text")
                .isEqualTo(expertProfile.getExpertAbout());

        assertThat(
                createdExpertPage.getOpenClosedLabelText())
                .as("open/closed label")
                .contains("Closed");

        assertThat(
                createdExpertPage.getPublicPrivateLabelText())
                .as("public/private label")
                .contains("Private");

        StartPage startPage = openOverviewPage().logout();

        assertThat(
                startPage.isCreatedExpertBlogTitleDisplayed(expertProfile))
                .as("expert's blog title is displayed on start page")
                .isFalse();
    }

    @Test(priority = 2, dependsOnMethods = "createExpert")
    public void checkPrivateClosedAsTheExpertFirst() {
        printTestHeader("Test Case: check behavior of the just created expert block as the expert user");

        UserProfile user = TestUserData.getTestUserOne();
        ExpertProfile expertProfile = getMainExpertProfile();

        logoutFromAll();
        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = openOverviewPage().openExpertsPage();

        assertThat(
                expertsPage.isCreatedExpertPrefNameDisplayed(expertProfile))
                .as("link to the created expert is displayed")
                .isTrue();

        ExpertsCreatedExpertPage createdExpertPage = expertsPage.openExpertPage(expertProfile);

        assertThat(
                createdExpertPage.getOpenClosedLabelText())
                .as("open/closed label")
                .contains("Closed");

        assertThat(
                createdExpertPage.getPublicPrivateLabelText())
                .as("public/private label")
                .contains("Private");

        assertThat(
                createdExpertPage.getAboutDisplayedText())
                .as("About text")
                .isEqualTo(expertProfile.getExpertAbout());

        ExpertsExpertDashboardPage expertDashboardPage = createdExpertPage.openDashboard();
        ExpertsEditExpertPage editExpertPage = expertDashboardPage.clickEdit();

        assertThat(
                editExpertPage.isVisibilitySelectorDisplayed())
                .as("Select Visibility element")
                .isFalse();
    }

    @Test(priority = 3, dependsOnMethods = "createExpert")
    public void checkPrivateClosedAsAnotherUserFirst() {
        printTestHeader("Test Case: check behavior of the created expert block as another user");

        UserProfile user = TestUserData.getTestUserTwo();
        ExpertProfile expertProfile = getMainExpertProfile();

        logoutFromAll();
        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = openOverviewPage().openExpertsPage();

        assertThat(
                expertsPage.isCreatedExpertPrefNameDisplayed(expertProfile))
                .as("link to the created expert is NOT displayed")
                .isFalse();
    }

    @Test(priority = 4, dependsOnMethods = "createExpert")
    public void setPublicVisibility() {
        printTestHeader("Test Case: set visibility as Public");

        UserProfile user = TestUserData.getAdminUser();
        ExpertProfile expertProfile = getMainExpertProfile();

        logoutFromAll();
        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
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

        SoftAssert.assertAll();
    }

    @Test(priority = 5, dependsOnMethods = "createExpert")
    public void checkPublicClosedAsAnotherUserFirst() {
        printTestHeader("Test Case: check behavior of the public closed expert as another user");

        UserProfile user = TestUserData.getTestUserTwo();
        ExpertProfile expertProfile = getMainExpertProfile();

        logoutFromAll();
        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = openOverviewPage().openExpertsPage();

        assertThat(
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
    }

    @Test(priority = 6, dependsOnMethods = "createExpert")
    public void setStatusOpen() {
        printTestHeader("Test Case: set status as Open");

        UserProfile user = TestUserData.getTestUserOne();
        ExpertProfile expertProfile = getMainExpertProfile();

        logoutFromAll();
        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = openOverviewPage().openExpertsPage();
        ExpertsCreatedExpertPage createdExpertPage = expertsPage.openExpertPage(expertProfile);

        assertThat(
                createdExpertPage.getOpenClosedLabelText())
                .as("open/closed label")
                .contains("Closed");

        assertThat(
                createdExpertPage.getPublicPrivateLabelText())
                .as("public/private label")
                .contains("Public");

        ExpertsExpertDashboardPage expertDashboardPage = createdExpertPage.openDashboard();
        expertDashboardPage.setStatusOpen();

        SoftAssert.assertThat(
                createdExpertPage.getOpenClosedLabelText())
                .as("open/closed label")
                .contains("Open");

        SoftAssert.assertThat(
                createdExpertPage.getPublicPrivateLabelText())
                .as("public/private label")
                .contains("Public");

        SoftAssert.assertAll();
    }

    @Test(priority = 7, dependsOnMethods = "createExpert")
    public void checkPublicOpenAsAnotherUser() {
        printTestHeader("Test Case: check behavior of the public open expert as another user");

        UserProfile user = TestUserData.getTestUserTwo();
        ExpertProfile expertProfile = getMainExpertProfile();

        logoutFromAll();
        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = openOverviewPage().openExpertsPage();

        assertThat(
                expertsPage.isCreatedExpertPrefNameDisplayed(expertProfile))
                .as("link to the created expert is displayed")
                .isTrue();

        ExpertsCreatedExpertPage createdExpertPage = expertsPage.openExpertPage(expertProfile);

        SoftAssert.assertThat(
                createdExpertPage.getOpenClosedLabelText())
                .as("open/closed label")
                .contains("Open");

        SoftAssert.assertThat(
                createdExpertPage.isAskQuestionButtonDisplayed())
                .as("Ask Question button is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(priority = 8, dependsOnMethods = "createExpert")
    public void askQuestionAsAnotherUser() {
        printTestHeader("Test Case: submit a question to expert");

        UserProfile user = TestUserData.getTestUserTwo();
        ExpertProfile expertProfile = getMainExpertProfile();
        QuestionProfile questionProfile = getMainQAProfile();

        logoutFromAll();
        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = openOverviewPage().openExpertsPage();
        ExpertsCreatedExpertPage createdExpertPage = expertsPage.openExpertPage(expertProfile);
        createdExpertPage = createdExpertPage.submitQuestion(questionProfile.getExpertQuestion1());
        createdExpertPage = createdExpertPage.submitQuestion(questionProfile.getExpertQuestion2());

        SoftAssert.assertThat(
                createdExpertPage.isYourQuestionDisplayed(questionProfile.getExpertQuestion1()))
                .as("question #1 is displayed in Your Questions list")
                .isTrue();

        SoftAssert.assertThat(
                createdExpertPage.isYourQuestionDisplayed(questionProfile.getExpertQuestion2()))
                .as("question #2 is displayed in Your Questions list")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(priority = 9, dependsOnMethods = "createExpert")
    public void answerQuestionAsExpert() {
        printTestHeader("Test Case: answer the question as the expert");

        UserProfile user = TestUserData.getTestUserOne();
        ExpertProfile expertProfile = getMainExpertProfile();
        QuestionProfile questionProfile = getMainQAProfile();

        logoutFromAll();
        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = openOverviewPage().openExpertsPage();
        ExpertsCreatedExpertPage createdExpertPage = expertsPage.openExpertPage(expertProfile);
        ExpertsExpertDashboardPage expertDashboardPage = createdExpertPage.openDashboard();

        assertThat(
                expertDashboardPage.isAnsweredQuestionsTitleDisplayed())
                .as("Answered Questions title is displayed")
                .isFalse();

        assertThat(
                expertDashboardPage.isOpenQuestionLinkDisplayed(questionProfile.getExpertQuestion1()))
                .as("question #1 is displayed in Open Questions list")
                .isTrue();

        assertThat(
                expertDashboardPage.isOpenQuestionLinkDisplayed(questionProfile.getExpertQuestion2()))
                .as("question #2 is displayed in Open Questions list")
                .isTrue();

        expertDashboardPage = expertDashboardPage.openQuestion(questionProfile.getExpertQuestion1());
        expertDashboardPage = expertDashboardPage.answerQuestion(questionProfile.getExpertAnswer1());

        SoftAssert.assertThat(
                expertDashboardPage.isAnsweredQuestionsTitleDisplayed())
                .as("Answered Questions title is displayed")
                .isTrue();

        SoftAssert.assertThat(
                expertDashboardPage.isAnsweredQuestionLinkDisplayed(questionProfile.getExpertQuestion1()))
                .as("question #1 is displayed in Answered Questions list")
                .isTrue();

        SoftAssert.assertThat(
                expertDashboardPage.isOpenQuestionLinkDisplayed(questionProfile.getExpertQuestion2()))
                .as("question #2 is displayed in Open Questions list")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(priority = 10, dependsOnMethods = "createExpert")
    public void checkAnswerAsAnotherUser() {
        printTestHeader("Test Case: check the answer as the question author");

        UserProfile user = TestUserData.getTestUserTwo();
        ExpertProfile expertProfile = getMainExpertProfile();
        QuestionProfile questionProfile = getMainQAProfile();

        logoutFromAll();
        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = openOverviewPage().openExpertsPage();
        ExpertsCreatedExpertPage createdExpertPage = expertsPage.openExpertPage(expertProfile);

        assertThat(
                createdExpertPage.isQuestionAnswered(questionProfile.getExpertQuestion1()))
                .as("question #1 is displayed as answered")
                .isTrue();

        ExpertsQAPage expertsQAPage = createdExpertPage.openQAPage(questionProfile.getExpertQuestion1());

        assertThat(
                expertsQAPage.getAnswerText())
                .as("answer #1 is displayed correctly")
                .isEqualTo(questionProfile.getExpertAnswer1());
    }

    @Test(priority = 11, dependsOnMethods = "createExpert")
    public void setStatusClosed() {
        printTestHeader("Test Case: set status as Closed");

        UserProfile user = TestUserData.getTestUserOne();
        ExpertProfile expertProfile = getMainExpertProfile();

        logoutFromAll();
        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = openOverviewPage().openExpertsPage();
        ExpertsCreatedExpertPage createdExpertPage = expertsPage.openExpertPage(expertProfile);
        ExpertsExpertDashboardPage expertDashboardPage = createdExpertPage.openDashboard();
        expertDashboardPage.setStatusClosed();

        SoftAssert.assertThat(
                createdExpertPage.getOpenClosedLabelText())
                .as("open/closed label")
                .contains("Closed");

        SoftAssert.assertThat(
                createdExpertPage.getPublicPrivateLabelText())
                .as("public/private label")
                .contains("Public");

        SoftAssert.assertAll();
    }

    @Test(priority = 12, dependsOnMethods = "createExpert")
    public void checkPublicClosedAsAnotherUserSecond() {
        printTestHeader("Test Case: check behavior of the public closed expert as another user second time");

        UserProfile user = TestUserData.getTestUserTwo();
        ExpertProfile expertProfile = getMainExpertProfile();
        QuestionProfile questionProfile = getMainQAProfile();

        logoutFromAll();
        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = openOverviewPage().openExpertsPage();

        assertThat(
                expertsPage.isCreatedExpertPrefNameDisplayed(expertProfile))
                .as("link to the created expert is displayed")
                .isTrue();

        ExpertsCreatedExpertPage createdExpertPage = expertsPage.openExpertPage(expertProfile);

        assertThat(
                createdExpertPage.getOpenClosedLabelText())
                .as("open/closed label")
                .contains("Closed");

        assertThat(
                createdExpertPage.getAboutDisplayedText())
                .as("About text")
                .isEqualTo(expertProfile.getExpertAbout());

        assertThat(
                createdExpertPage.isAskQuestionButtonDisplayed())
                .as("Ask Question button is displayed")
                .isFalse();

        assertThat(
                createdExpertPage.isQuestionAnswered(questionProfile.getExpertQuestion1()))
                .as("question #1 is displayed as answered")
                .isTrue();

        assertThat(
                createdExpertPage.isYourQuestionDisplayed(questionProfile.getExpertQuestion1()))
                .as("question #1 is displayed in Your questions list")
                .isTrue();

        assertThat(
                createdExpertPage.isYourQuestionDisplayed(questionProfile.getExpertQuestion2()))
                .as("question #2 is displayed in Your questions list")
                .isTrue();

        ExpertsQAPage expertsQAPage = createdExpertPage.openQAPage(questionProfile.getExpertQuestion1());

        assertThat(
                expertsQAPage.getAnswerText())
                .as("answer #1 is displayed correctly")
                .isEqualTo(questionProfile.getExpertAnswer1());
    }

    @Test(priority = 13, dependsOnMethods = "createExpert")
    public void setPrivateVisibility() {
        printTestHeader("Test Case: set visibility as Private");

        UserProfile user = TestUserData.getAdminUser();
        ExpertProfile expertProfile = getMainExpertProfile();

        logoutFromAll();
        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = openOverviewPage().openExpertsPage();
        ExpertsCreatedExpertPage createdExpertPage = expertsPage.openExpertPage(expertProfile);
        ExpertsExpertDashboardPage expertDashboardPage = createdExpertPage.openDashboard();
        ExpertsEditExpertPage editExpertPage = expertDashboardPage.clickEdit();
        editExpertPage.setPrivateVisibility();
        createdExpertPage = editExpertPage.clickUpdate();

        SoftAssert.assertThat(
                createdExpertPage.getOpenClosedLabelText())
                .as("open/closed label")
                .contains("Closed");

        SoftAssert.assertThat(
                createdExpertPage.getPublicPrivateLabelText())
                .as("public/private label")
                .contains("Private");

        SoftAssert.assertAll();
    }

    @Test(priority = 14, dependsOnMethods = "createExpert")
    public void checkPrivateClosedAsAnotherUserSecond() {
        printTestHeader("Test Case: check behavior of the created expert block as another user second time");

        UserProfile user = TestUserData.getTestUserTwo();
        ExpertProfile expertProfile = getMainExpertProfile();

        logoutFromAll();
        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = openOverviewPage().openExpertsPage();

        assertThat(
                expertsPage.isCreatedExpertPrefNameDisplayed(expertProfile))
                .as("link to the created expert is NOT displayed")
                .isFalse();
    }

    @Test(priority = 15, dependsOnMethods = "createExpert")
    public void checkPrivateClosedAsTheExpertSecond() {
        printTestHeader("Test Case: check behavior of created expert block as the expert user second time");

        UserProfile user = TestUserData.getTestUserOne();
        ExpertProfile expertProfile = getMainExpertProfile();

        logoutFromAll();
        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = openOverviewPage().openExpertsPage();
        QuestionProfile questionProfile = getMainQAProfile();

        assertThat(
                expertsPage.isCreatedExpertPrefNameDisplayed(expertProfile))
                .as("link to the created expert is displayed")
                .isTrue();

        ExpertsCreatedExpertPage createdExpertPage = expertsPage.openExpertPage(expertProfile);

        assertThat(
                createdExpertPage.getOpenClosedLabelText())
                .as("open/closed label")
                .contains("Closed");

        assertThat(
                createdExpertPage.getPublicPrivateLabelText())
                .as("public/private label")
                .contains("Private");

        ExpertsExpertDashboardPage expertDashboardPage = createdExpertPage.openDashboard();

        assertThat(
                expertDashboardPage.isAnsweredQuestionLinkDisplayed(questionProfile.getExpertQuestion1()))
                .as("question #1 is displayed in Answered Questions list")
                .isTrue();

        assertThat(
                expertDashboardPage.isOpenQuestionLinkDisplayed(questionProfile.getExpertQuestion2()))
                .as("question #2 is displayed in Open Questions list")
                .isTrue();

        expertDashboardPage = expertDashboardPage.openQuestion(questionProfile.getExpertQuestion1());

        assertThat(
                expertDashboardPage.getEnteredQuestionFromForm())
                .as("entered question #1")
                .isEqualTo(questionProfile.getExpertQuestion1());

        assertThat(
                expertDashboardPage.getEnteredAnswerFromForm())
                .as("entered answer #1")
                .isEqualTo(questionProfile.getExpertAnswer1());

        expertDashboardPage = expertDashboardPage.openQuestion(questionProfile.getExpertQuestion2());

        assertThat(
                expertDashboardPage.getEnteredQuestionFromForm())
                .as("entered question #2")
                .isEqualTo(questionProfile.getExpertQuestion2());

        logoutFromAll();
    }

}