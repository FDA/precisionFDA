package precisionFDA.pages.challs;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.data.TestUserData;
import precisionFDA.locators.ChallsLocators;
import precisionFDA.model.ChallEntryProfile;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;

import static precisionFDA.data.TestDict.getDictChallengeClosed;
import static precisionFDA.data.TestDict.getDictDone;
import static precisionFDA.data.TestDict.getDictPending;
import static precisionFDA.data.TestNewChallEntryData.getMainChallEntryProfile;
import static precisionFDA.data.TestNewChallEntryData.getSecondChallEntryProfile;
import static precisionFDA.utils.Utils.sleep;

public class ChallsCreatedChallPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = ChallsLocators.CHALLS_CREATED_CHALL_PAGE_NAME)
    private WebElement createdChallengeName;

    @FindBy(xpath = ChallsLocators.CHALLS_CREATED_CHALL_PAGE_DESCR)
    private WebElement createdChallengeDescr;

    @FindBy(xpath = ChallsLocators.CHALLS_CREATED_CHALL_PAGE_STARTS_VALUE)
    private WebElement startsWE;

    @FindBy(xpath = ChallsLocators.CHALLS_CREATED_CHALL_PAGE_ENDS_VALUE)
    private WebElement endsWE;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_INFO_EDIT_PAGE_BUTTON)
    private Link editPageButtonLink;

    @FindBy(xpath = ChallsLocators.CHALLS_CREATED_CHALL_INTRO_TEXT)
    private WebElement introWE;

    @FindBy(xpath = ChallsLocators.CHALLS_JOIN_CHALLENGE_BUTTON)
    private Link joinChallengeButtonLink;

    @FindBy(xpath = ChallsLocators.SUBMIT_CHALLENGE_ENTRY_BUTTON)
    private Link submitEntryChallengeButtonLink;

    @FindBy(xpath = ChallsLocators.CHALLS_CREATED_CHALL_SETTINGS_BUTTON)
    private Link settingsButtonLink;

    @FindBy(xpath = ChallsLocators.MY_ENTRIES_LINK)
    private Link myEntriesLink;

    @FindBy(xpath = ChallsLocators.MY_ENTRIES_INPUT_FILE_COLUMN_NAME)
    private WebElement myEntriesInputFileColumnName;

    @FindBy(xpath = ChallsLocators.CHALLS_CREATED_CHALLENGE_CLOSED_BUTTON)
    private Button challengeClosedButton;

    public ChallsCreatedChallPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(ChallsLocators.CHALLS_CREATED_CHALL_INTRO_LINK));
    }

    public Button getChallengeClosedButton() {
        return challengeClosedButton;
    }

    public WebElement getMyEntriesInputFileColumnName() {
        return myEntriesInputFileColumnName;
    }

    public Link getMyEntriesLink() {
        return myEntriesLink;
    }

    public Link getSettingsButtonLink() {
        return settingsButtonLink;
    }

    public Link getJoinChallengeButtonLink() {
        return joinChallengeButtonLink;
    }

    public Link getSubmitEntryChallengeButtonLink() {
        return submitEntryChallengeButtonLink;
    }

    public WebElement getIntroWE() {
        return introWE;
    }

    public Link getEditPageButtonLink() {
        return editPageButtonLink;
    }

    public WebElement getStartsWE() {
        return startsWE;
    }

    public WebElement getEndsWE() {
        return endsWE;
    }

    public WebElement getCreatedChallengeName() {
        return createdChallengeName;
    }

    public WebElement getCreatedChallengeDescr() {
        return createdChallengeDescr;
    }

    public String getIntroText() {
        return getIntroWE().getText().trim();
    }

    public String getCreatedChallengeNameText() {
        return getCreatedChallengeName().getText().trim();
    }

    public String getCreatedChallengeDescrText() {
        return getCreatedChallengeDescr().getText().trim();
    }

    public String getStartsText() {
        return getStartsWE().getText().trim();
    }

    public String getEndsText() {
        return getEndsWE().getText().trim();
    }

    public ChallsEditChallengeInfo clickEditPage() {
        log.info("click Edit Page");
        waitUntilClickable(getEditPageButtonLink());
        getEditPageButtonLink().click();
        return new ChallsEditChallengeInfo(getDriver());
    }

    public boolean isJoinChallengeButtonDisplayed() {
        return isElementPresent(getJoinChallengeButtonLink(), 2);
    }

    public ChallsCreatedChallPage clickJoinChallenge() {
        waitUntilClickable(getJoinChallengeButtonLink());
        getJoinChallengeButtonLink().click();
        return new ChallsCreatedChallPage(getDriver());
    }

    public boolean isSubmitEntryChallengeButtonDisplayed() {
        return isElementPresent(getSubmitEntryChallengeButtonLink());
    }

    public ChallsNewSubmissionPage clickSubmitEntry() {
        waitUntilClickable(getSubmitEntryChallengeButtonLink());
        getSubmitEntryChallengeButtonLink().click();
        return new ChallsNewSubmissionPage(getDriver());
    }

    public ChallsEditChallPage clickSettings() {
        waitUntilDisplayed(getSettingsButtonLink(), 2);
        getSettingsButtonLink().click();
        return new ChallsEditChallPage(getDriver());
    }

    public void waitUntilChallengeActive() {
        int timeoutSec = 120;
        int refreshStepSec = 15;
        int spentTimeSec = 0;
        log.info("waiting for " + timeoutSec + " sec until the challenge is active");
        while ( !isElementPresent(getJoinChallengeButtonLink(), 1) && (spentTimeSec < timeoutSec) ) {
            sleep(refreshStepSec*1000);
            spentTimeSec = spentTimeSec + refreshStepSec;
            log.info("it's been " + spentTimeSec + " seconds");
            getDriver().navigate().refresh();
        }
        if (!isElementPresent(getJoinChallengeButtonLink(), 1)) {
            log.info("[WARNING] the challenge is not active after " + timeoutSec + " seconds");
        }
    }

    public void waitUntilChallengeClosed() {
        int timeoutSec = 180;
        int refreshStepSec = 15;
        int spentTimeSec = 0;
        log.info("waiting for " + timeoutSec + " sec until the challenge is closed");
        while ( !isChallengeClosedButtonDisplayed() && (spentTimeSec < timeoutSec) ) {
            sleep(refreshStepSec*1000);
            spentTimeSec = spentTimeSec + refreshStepSec;
            log.info("it's been " + spentTimeSec + " seconds");
            getDriver().navigate().refresh();
        }
        if (!isElementPresent(getJoinChallengeButtonLink(), 1)) {
            log.info("[WARNING] the challenge is not closed after " + timeoutSec + " seconds");
        }
    }

    public boolean isSubmittedInputFileLinkDisplayed(String fileName) {
        String xpath = ChallsLocators.SUBMITTED_INPUT_FILE_LINK.replace("{FILE_NAME}", fileName);
        return isElementPresent(By.xpath(xpath), 3);
    }

    public ChallsCreatedChallPage clickMyEntries() {
        log.info("click My Entries");
        getMyEntriesLink().click();
        waitUntilDisplayed(getMyEntriesInputFileColumnName(), 10);
        return new ChallsCreatedChallPage(getDriver());
    }

    public boolean isSubmittedEntryNameDisplayed(String entryName) {
        String xpath = ChallsLocators.MY_ENTRIES_ENTRY_NAME_LINK_TEMPLATE.replace("{ENTRY_NAME}", entryName);
        By name = By.xpath(xpath);
        return isElementPresent(name, 1);
    }

    public boolean isSubmittedEntryInputFileNameDisplayed(String fileName, String entryName) {
        String xpath = ChallsLocators.MY_ENTRIES_INPUT_FILE_NAME_LINK_TEMPLATE
                .replace("{ENTRY_NAME}", entryName)
                .replace("{FILE_NAME}", fileName);
        By el = By.xpath(xpath);
        return isElementPresent(el, 1);
    }

    public boolean isEntryStateDone(String entryName) {
        boolean res = false;
        String doneStatus = getDictDone().toUpperCase();
        String pendingStatus = getDictPending().toUpperCase();

        int timeoutSec = 180;
        int refreshStepSec = 30;
        int spentTimeSec = 0;

        log.info("waiting for " + timeoutSec + " sec until the entry is done");
        while ( getEntryStateText(entryName).toUpperCase().contains(pendingStatus) && (spentTimeSec < timeoutSec) ) {
            sleep(refreshStepSec*1000);
            spentTimeSec = spentTimeSec + refreshStepSec;
            log.info("it's been " + spentTimeSec + " seconds");
            getDriver().navigate().refresh();
        }

        String currentStatus = getEntryStateText(entryName).toUpperCase();
        if (!currentStatus.equalsIgnoreCase(doneStatus)) {
            log.error("expected state is [" + doneStatus + "] but actual is [" + currentStatus + "] for entry " + entryName);
        }
        else {
            res = true;
        }

        return res;
    }

    public String getEntryStateText(String entryName) {
        String xpath = ChallsLocators.MY_ENTRIES_ENTRY_STATE_TEMPLATE.replace("{ENTRY_NAME}", entryName);
        By el = By.xpath(xpath);
        isElementPresent(el, 1);
        return getDriver().findElement(el).getText().trim();
    }

    public boolean isChallengeClosedButtonDisplayed() {
        boolean isButton = isElementPresent(getChallengeClosedButton(), 1);
        String source = getDriver().getPageSource();
        boolean isSource = source.contains(getDictChallengeClosed());
        log.info("is button = " + isButton + "; isSource = " + isSource);
        return isButton && isSource;
    }

    public boolean isResultUserOneFullNameDisplayed() {
        return isResultUserFullNameDisplayed(TestUserData.getTestUserOne());
    }

    public boolean isResultUserTwoFullNameDisplayed() {
        return isResultUserFullNameDisplayed(TestUserData.getTestUserTwo());
    }

    public boolean isResultUserFullNameDisplayed(UserProfile user) {
        String xpath = ChallsLocators.RESULT_PAGE_FULL_NAME_TEMPLATE.replace("{FULL_NAME}", user.getApplUserFullName());
        return isElementPresent(By.xpath(xpath), 1);
    }

    public boolean isResultFirstEntryNameDisplayed() {
        return isResultEntryNameDisplayed(getMainChallEntryProfile());
    }

    public boolean isResultSecondEntryNameDisplayed() {
        return isResultEntryNameDisplayed(getSecondChallEntryProfile());
    }

    public boolean isResultEntryNameDisplayed(ChallEntryProfile entry) {
        String xpath = ChallsLocators.RESULT_PAGE_ENTRY_NAME_TEMPLATE.replace("{ENTRY_NAME}", entry.getEntryName());
        return isElementPresent(By.xpath(xpath), 1);
    }

}
