package staging.cases;

import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import ru.yandex.qatools.htmlelements.annotations.Name;
import staging.data.TestUserData;
import staging.model.ExpertProfile;
import staging.model.QuestionProfile;
import staging.model.User;
import staging.pages.StartPage;
import staging.pages.experts.*;
import staging.pages.overview.OverviewPage;

import static org.assertj.core.api.Assertions.assertThat;
import static staging.data.TestExpertsData.getMainProfile;
import static staging.data.TestQuestionsData.getMainQAProfile;

@Name("Experts test suite")
public class ExpertsTest extends AbstractTest {

    @BeforeMethod
    @Override
    public void beforeCase() {
        callBeforeCase();
        setUp();
    }

    @AfterMethod
    @Override
    public void afterCase() {
        callAfterCase();
        closeBrowser();
    }

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
                startPage.isCreatedExpertBlogTitleDisplayed(expertProfile))
                .as("expert's blog title is displayed on start page")
                .isFalse();

        SoftAssert.assertAll();
    }

    @Test(priority = 2)
    public void checkPrivateClosedAsTheExpertFirst() {
        printTestHeader("Test Case: check behavior of the just created expert block as the expert user");

        User user = TestUserData.getTestUser();
        ExpertProfile expertProfile = getMainProfile();

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
    }

    @Test(priority = 3)
    public void checkPrivateClosedAsAnotherUserFirst() {
        printTestHeader("Test Case: check behavior of the created expert block as another user");

        User user = TestUserData.getAnotherTestUser();
        ExpertProfile expertProfile = getMainProfile();

        openLoginPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = getCommonPage().openExpertsPage();

        assertThat(
                expertsPage.isCreatedExpertPrefNameDisplayed(expertProfile))
                .as("link to the created expert is NOT displayed")
                .isFalse();
    }

    @Test(priority = 4)
    public void setPublicVisibility() {
        printTestHeader("Test Case: set visibility as Public");

        User user = TestUserData.getAdminUser();
        ExpertProfile expertProfile = getMainProfile();

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

        SoftAssert.assertAll();
    }

    @Test(priority = 5)
    public void checkPublicClosedAsAnotherUserFirst() {
        printTestHeader("Test Case: check behavior of the public closed expert as another user");

        User user = TestUserData.getAnotherTestUser();
        ExpertProfile expertProfile = getMainProfile();

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
    }

    @Test(priority = 6)
    public void setStatusOpen() {
        printTestHeader("Test Case: set status as Open");

        User user = TestUserData.getTestUser();
        ExpertProfile expertProfile = getMainProfile();

        openLoginPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = getCommonPage().openExpertsPage();
        ExpertsCreatedExpertPage createdExpertPage = expertsPage.openExpertPage(expertProfile);

        SoftAssert.assertThat(
                createdExpertPage.getOpenClosedLabelText())
                .as("open/closed label")
                .contains("Closed");

        SoftAssert.assertThat(
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

    @Test(priority = 7)
    public void checkPublicOpenAsAnotherUser() {
        printTestHeader("Test Case: check behavior of the public open expert as another user");

        User user = TestUserData.getAnotherTestUser();
        ExpertProfile expertProfile = getMainProfile();

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
                .contains("Open");

        SoftAssert.assertThat(
                createdExpertPage.isAskQuestionButtonDisplayed())
                .as("Ask Question button is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(priority = 8)
    public void askQuestionAsAnotherUser() {
        printTestHeader("Test Case: submit a question to expert");

        User user = TestUserData.getAnotherTestUser();
        ExpertProfile expertProfile = getMainProfile();
        QuestionProfile questionProfile = getMainQAProfile();

        openLoginPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = getCommonPage().openExpertsPage();
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

    @Test(priority = 9)
    public void answerQuestionAsExpert() {
        printTestHeader("Test Case: answer the question as the expert");

        User user = TestUserData.getTestUser();
        ExpertProfile expertProfile = getMainProfile();
        QuestionProfile questionProfile = getMainQAProfile();

        openLoginPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = getCommonPage().openExpertsPage();
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

        SoftAssert.assertThat(
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

    @Test(priority = 10)
    public void checkAnswerAsAnotherUser() {
        printTestHeader("Test Case: check the answer as the question author");

        User user = TestUserData.getAnotherTestUser();
        ExpertProfile expertProfile = getMainProfile();
        QuestionProfile questionProfile = getMainQAProfile();

        openLoginPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = getCommonPage().openExpertsPage();
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

    @Test(priority = 11)
    public void setStatusClosed() {
        printTestHeader("Test Case: set status as Closed");

        User user = TestUserData.getTestUser();
        ExpertProfile expertProfile = getMainProfile();

        openLoginPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = getCommonPage().openExpertsPage();
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

    @Test(priority = 12)
    public void checkPublicClosedAsAnotherUserSecond() {
        printTestHeader("Test Case: check behavior of the public closed expert as another user second time");

        User user = TestUserData.getAnotherTestUser();
        ExpertProfile expertProfile = getMainProfile();
        QuestionProfile questionProfile = getMainQAProfile();

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

        assertThat(
                createdExpertPage.isQuestionAnswered(questionProfile.getExpertQuestion1()))
                .as("question #1 is displayed as answered")
                .isTrue();

        SoftAssert.assertThat(
                createdExpertPage.isYourQuestionDisplayed(questionProfile.getExpertQuestion1()))
                .as("question #1 is displayed in Your questions list")
                .isTrue();

        SoftAssert.assertThat(
                createdExpertPage.isYourQuestionDisplayed(questionProfile.getExpertQuestion2()))
                .as("question #2 is displayed in Your questions list")
                .isTrue();

        ExpertsQAPage expertsQAPage = createdExpertPage.openQAPage(questionProfile.getExpertQuestion1());

        assertThat(
                expertsQAPage.getAnswerText())
                .as("answer #1 is displayed correctly")
                .isEqualTo(questionProfile.getExpertAnswer1());

        SoftAssert.assertAll();
    }

    @Test(priority = 13)
    public void setPrivateVisibility() {
        printTestHeader("Test Case: set visibility as Private");

        User user = TestUserData.getAdminUser();
        ExpertProfile expertProfile = getMainProfile();

        openLoginPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = getCommonPage().openExpertsPage();
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

    @Test(priority = 14)
    public void checkPrivateClosedAsAnotherUserSecond() {
        printTestHeader("Test Case: check behavior of the created expert block as another user second time");

        User user = TestUserData.getAnotherTestUser();
        ExpertProfile expertProfile = getMainProfile();

        openLoginPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = getCommonPage().openExpertsPage();

        assertThat(
                expertsPage.isCreatedExpertPrefNameDisplayed(expertProfile))
                .as("link to the created expert is NOT displayed")
                .isFalse();
    }

    @Test(priority = 15)
    public void checkPrivateClosedAsTheExpertSecond() {
        printTestHeader("Test Case: check behavior of created expert block as the expert user second time");

        User user = TestUserData.getTestUser();
        ExpertProfile expertProfile = getMainProfile();

        openLoginPage(user).correctLogin(user).grantAccess();
        ExpertsPage expertsPage = getCommonPage().openExpertsPage();
        QuestionProfile questionProfile = getMainQAProfile();

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

        SoftAssert.assertThat(
                expertDashboardPage.getEnteredQuestionFromForm())
                .as("entered question #1")
                .isEqualTo(questionProfile.getExpertQuestion1());

        SoftAssert.assertThat(
                expertDashboardPage.getEnteredAnswerFromForm())
                .as("entered answer #1")
                .isEqualTo(questionProfile.getExpertAnswer1());

        expertDashboardPage = expertDashboardPage.openQuestion(questionProfile.getExpertQuestion2());

        SoftAssert.assertThat(
                expertDashboardPage.getEnteredQuestionFromForm())
                .as("entered question #2")
                .isEqualTo(questionProfile.getExpertQuestion2());

        SoftAssert.assertAll();
    }

}