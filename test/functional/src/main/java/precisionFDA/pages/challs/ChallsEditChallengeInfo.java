package precisionFDA.pages.challs;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.ChallsLocators;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.Select;

import static precisionFDA.data.TestDict.getDictDelimiterValue;
import static precisionFDA.utils.Utils.sleep;

public class ChallsEditChallengeInfo extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_CHALL_FORM_STATUS_SELECT)
    private Select editChallStatusSelect;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_INFO_EDIT_CHALLENGE_INFO_LINK)
    private Link challengeInfoLink;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_INFO_EDIT_CHALLENGE_INFO_ACTIVATED_LINK)
    private Link challengeInfoActivatedLink;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_INFO_PENCIL_ICON)
    private WebElement pencilIcon;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_INFO_CONFIRM_ICON)
    private WebElement confirmIcon;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_INFO_EDIT_CHALLENGE_INFO_EDITOR)
    private WebElement editInfoEditor;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_INFO_EDIT_CHALLENGE_RESULTS_LINK)
    private Link challengeResultsLink;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_INFO_EDIT_CHALLENGE_RESULTS_ACTIVATED_LINK)
    private Link challengeResultsActivatedLink;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_INFO_EDIT_CHALLENGE_RESULTS_TITLE_EDITOR)
    private WebElement editResultTitleEditor;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_INFO_EDIT_CHALLENGE_RESULTS_DETAILS_EDITOR)
    private WebElement editResultDetailsEditor;

    @FindBy(xpath = ChallsLocators.CHALLS_EDIT_INFO_EDIT_CHALLENGE_RETURN_BUTTON)
    private Link editChallengeReturnButtonLink;


    public ChallsEditChallengeInfo(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(ChallsLocators.CHALLS_EDIT_INFO_EDIT_CHALLENGE_RETURN_BUTTON));
    }

    public Link getEditChallengeReturnButtonLink() {
        return editChallengeReturnButtonLink;
    }

    public WebElement getEditResultTitleEditor() {
        return editResultTitleEditor;
    }

    public WebElement getEditResultDetailsEditor() {
        return editResultDetailsEditor;
    }

    public Link getChallengeResultsLink() {
        return challengeResultsLink;
    }

    public Link getChallengeResultsActivatedLink() {
        return challengeResultsActivatedLink;
    }

    public WebElement getEditInfoEditor() {
        return editInfoEditor;
    }

    public WebElement getPencilIcon() {
        return pencilIcon;
    }

    public WebElement getConfirmIcon() {
        return confirmIcon;
    }

    public Link getChallengeInfoLink() {
        return challengeInfoLink;
    }

    public Link getChallengeInfoActivatedLink() {
        return challengeInfoActivatedLink;
    }

    public ChallsEditChallengeInfo clickChallengeInfo() {
        log.info("click Challenge Info");
        waitUntilClickable(getChallengeInfoLink());
        getChallengeInfoLink().click();
        waitUntilDisplayed(getChallengeInfoActivatedLink());
        return new ChallsEditChallengeInfo(getDriver());
    }

    public boolean isChallengeInfoLinkActivated() {
        return isElementPresent(getChallengeInfoActivatedLink(), 5);
    }

    public boolean isChallengeResultsLinkActivated() {
        return isElementPresent(getChallengeResultsActivatedLink(), 5);
    }

    public boolean isPencilIconDisplayed() {
        return isElementPresent(getPencilIcon(), 5);
    }

    public boolean isConfirmIconDisplayed() {
        return isElementPresent(getConfirmIcon(), 5);
    }

    public ChallsEditChallengeInfo clickPencilIcon() {
        log.info("click Pencil icon");
        waitUntilDisplayed(getPencilIcon());
        getPencilIcon().click();
        waitUntilDisplayed(getConfirmIcon());
        return new ChallsEditChallengeInfo(getDriver());
    }

    public void writeChallengeInfo(String info) {
        getEditInfoEditor().click();
        sleep(500);
        getEditInfoEditor().sendKeys(info);
    }

    public ChallsEditChallengeInfo clickConfirmIcon() {
        log.info("click Confirm Icon");
        waitUntilDisplayed(getConfirmIcon());
        getConfirmIcon().click();
        waitUntilDisplayed(getPencilIcon());
        return new ChallsEditChallengeInfo(getDriver());
    }

    public ChallsEditChallengeInfo clickChallengeResults() {
        log.info("click Challenge Results");
        waitUntilClickable(getChallengeResultsLink());
        getChallengeResultsLink().click();
        waitUntilDisplayed(getChallengeResultsActivatedLink());
        return new ChallsEditChallengeInfo(getDriver());
    }

    public void writeChallengeResults(String results) {
        String[] res = results.split(getDictDelimiterValue());
        getEditResultTitleEditor().click();
        sleep(500);
        getEditResultTitleEditor().sendKeys(res[0]);
        getEditResultDetailsEditor().click();
        sleep(500);
        getEditResultDetailsEditor().sendKeys(res[1]);
    }

    public ChallsCreatedChallPage clickReturn() {
        log.info("click Return");
        waitUntilClickable(getEditChallengeReturnButtonLink());
        getEditChallengeReturnButtonLink().click();
        return new ChallsCreatedChallPage(getDriver());
    }



}
