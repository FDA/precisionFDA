package precisionFDA.pages.challs;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.ChallsLocators;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.Link;

import static precisionFDA.utils.Utils.sleep;

public class ChallsCreatedChallPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = ChallsLocators.CHALLS_CREATED_CHALL_PAGE_NAME)
    private WebElement createdName;

    @FindBy(xpath = ChallsLocators.CHALLS_CREATED_CHALL_PAGE_DESCR)
    private WebElement createdDescr;

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

    public ChallsCreatedChallPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(ChallsLocators.CHALLS_CREATED_CHALL_INTRO_LINK));
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

    public WebElement getCreatedName() {
        return createdName;
    }

    public WebElement getCreatedDescr() {
        return createdDescr;
    }

    public String getIntroText() {
        return getIntroWE().getText().trim();
    }

    public String getCreatedNameText() {
        return getCreatedName().getText().trim();
    }

    public String getCreatedDescrText() {
        return getCreatedDescr().getText().trim();
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

    public boolean isSubmittedInputFileLinkDisplayed(String fileName) {
        String xpath = ChallsLocators.SUBMITTED_INPUT_FILE_LINK.replace("{FILE_NAME}", fileName);
        return isElementPresent(By.xpath(xpath), 3);
    }

}
