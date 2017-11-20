package precisionFDA.cases;

import org.testng.annotations.Test;
import precisionFDA.data.TestChallsData;
import precisionFDA.data.TestUserData;
import precisionFDA.model.ChallProfile;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.challs.ChallsCreatedChallPage;
import precisionFDA.pages.challs.ChallsEditChallPage;
import precisionFDA.pages.challs.ChallsEditChallengeInfo;
import precisionFDA.pages.challs.ChallsPage;
import precisionFDA.pages.overview.OverviewPage;
import ru.yandex.qatools.htmlelements.annotations.Name;

import static org.assertj.core.api.Assertions.assertThat;
import static precisionFDA.data.TestChallsData.getExpectedChallDateTimeValue;
import static precisionFDA.data.TestChallsData.getMainChallProfile;
import static precisionFDA.utils.Utils.printTestHeader;

@Name("Challenges test suite")
public class ChallsTest extends AbstractTest {

    @Test(priority = 0)
    public void createChallenge() {
        printTestHeader("Test Case: create a challenge as admin and verify");

        UserProfile user = TestUserData.getAdminUser();
        ChallProfile challProfile = getMainChallProfile();

        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        ChallsPage challsPage = overviewPage.openChallsPage();

        assertThat(
                challsPage.isCreateNewChallLinkDisplayed())
                .as("Create new challenge link is displayed")
                .isTrue();

        ChallsEditChallPage editChallPage = challsPage.clickCreateNewChall();
        editChallPage.fillChallForm(challProfile);

        ChallsCreatedChallPage createdChallPage = editChallPage.clickCreate();

        assertThat(
                createdChallPage.getCreatedNameText())
                .as("Name of the created challenge")
                .contains(challProfile.getChallName());

        SoftAssert.assertThat(
                createdChallPage.getCreatedDescrText())
                .as("Description of the created challenge")
                .isEqualTo(challProfile.getChallDescr());

        SoftAssert.assertThat(
                createdChallPage.getStartsText())
                .as("Starts value")
                .isEqualTo(getExpectedChallDateTimeValue(challProfile.getChallStartsAt()));

        SoftAssert.assertThat(
                createdChallPage.getEndsText())
                .as("Ends value")
                .isEqualTo(getExpectedChallDateTimeValue(challProfile.getChallEndsAt()));

        challsPage = overviewPage.openChallsPage();

        SoftAssert.assertThat(
                challsPage.isCreatedChallNameDisplayed(challProfile.getChallName()))
                .as("Correct Name of the created challenge is displayed on the Challenges page")
                .isTrue();

        SoftAssert.assertThat(
                challsPage.isCreatedChallDescriptionDisplayed(challProfile.getChallDescr()))
                .as("Correct Description of the created challenge is displayed on the Challenges page")
                .isTrue();

        SoftAssert.assertThat(
                challsPage.getCreatedChallStartsValue(challProfile))
                .as("Starts value on the Challenges page")
                .isEqualTo(getExpectedChallDateTimeValue(challProfile.getChallStartsAt()));

        SoftAssert.assertThat(
                challsPage.getCreatedChallEndsValue(challProfile))
                .as("Ends value on the Challenges page")
                .isEqualTo(getExpectedChallDateTimeValue(challProfile.getChallEndsAt()));

        SoftAssert.assertAll();
    }

    @Test(priority = 1)
    public void editChallengePage() {
        printTestHeader("Test Case: edit the created challenge page");

        ChallProfile challProfile = getMainChallProfile();

        ChallsPage challsPage = openOverviewPage().openChallsPage();
        ChallsCreatedChallPage createdChallPage = challsPage.viewChallenge(challProfile);
        ChallsEditChallengeInfo editChallengeInfo = createdChallPage.clickEditPage();
        editChallengeInfo = editChallengeInfo.clickChallengeInfo();

        assertThat(
                editChallengeInfo.isChallengeInfoLinkActivated())
                .as("Challenge info link is activated")
                .isTrue();

        assertThat(
                editChallengeInfo.isPencilIconDisplayed())
                .as("Pencil Icon is displayed")
                .isTrue();

        editChallengeInfo = editChallengeInfo.clickPencilIcon();

        assertThat(
                editChallengeInfo.isConfirmIconDisplayed())
                .as("Confirm Icon is displayed")
                .isTrue();

        editChallengeInfo.writeChallengeInfo(challProfile.getChallInfo());
        editChallengeInfo = editChallengeInfo.clickConfirmIcon();

        editChallengeInfo = editChallengeInfo.clickChallengeResults();

        assertThat(
                editChallengeInfo.isChallengeResultsLinkActivated())
                .as("Challenge results link is activated")
                .isTrue();

        assertThat(
                editChallengeInfo.isPencilIconDisplayed())
                .as("Pencil Icon is displayed")
                .isTrue();

        editChallengeInfo = editChallengeInfo.clickPencilIcon();

        assertThat(
                editChallengeInfo.isConfirmIconDisplayed())
                .as("Confirm Icon is displayed")
                .isTrue();

        editChallengeInfo.writeChallengeResults(challProfile.getChallResults());
        editChallengeInfo = editChallengeInfo.clickConfirmIcon();
        createdChallPage = editChallengeInfo.clickReturn();

        assertThat(
                createdChallPage.getIntroText())
                .as("Introduction text")
                .isEqualTo(challProfile.getChallInfo());
    }


}
