package precisionFDA.pages.challs;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.model.ChallProfile;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.ChallsLocators;
import precisionFDA.pages.AbstractPage;

import java.util.List;

public class ChallsPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = ChallsLocators.CHALLS_PREV_CHALLS_TEXT)
    private WebElement challsPrevChallsText;

    @FindBy(xpath = ChallsLocators.CHALLS_ACTIVATED_ICON)
    private Link challsActivatedIconLink;

    @FindBy(xpath = ChallsLocators.CHALLS_CREATE_NEW_CHALL_LINK)
    private Link createNewChallLink;

    @FindBy(xpath = ChallsLocators.CHALLS_CREATED_CHALL_NAME_COMMON)
    private WebElement createdNameCommon;

    @FindBy(xpath = ChallsLocators.CHALLS_CREATED_CHALL_DESCR_COMMON)
    private WebElement createdDescrCommon;

    public ChallsPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(ChallsLocators.CHALLS_PREV_CHALLS_TEXT));
    }

    public Link getChallsActivatedIconLink() {
        return challsActivatedIconLink;
    }

    public Link getCreateNewChallLink() {
        return createNewChallLink;
    }

    public WebElement getChallsPrevChallsText() {
        return challsPrevChallsText;
    }

    public boolean isChallengesIconDisplayed() {
        return isElementPresent(getChallsActivatedIconLink());
    }

    public boolean isCreateNewChallLinkDisplayed() {
        return isElementPresent(getCreateNewChallLink());
    }

    public ChallsEditChallPage clickCreateNewChall() {
        log.info("click Create New Challenge");
        waitUntilClickable(getCreateNewChallLink());
        getCreateNewChallLink().click();
        return new ChallsEditChallPage(getDriver());
    }

    public boolean isCreatedChallNameDisplayed(String name) {
        boolean isDisplayed = false;
        List<WebElement> names = getDriver().findElements(By.xpath(ChallsLocators.CHALLS_CREATED_CHALL_NAME_COMMON));
        if (names.size() > 0) {
            for (WebElement we : names) {
                if (we.getText().contains(name)) {
                    isDisplayed = true;
                    break;
                }
            }
        }
        return isDisplayed;
    }

    public boolean isCreatedChallDescriptionDisplayed(String descr) {
        boolean isDisplayed = false;
        List<WebElement> names = getDriver().findElements(By.xpath(ChallsLocators.CHALLS_CREATED_CHALL_DESCR_COMMON));
        if (names.size() > 0) {
            for (WebElement we : names) {
                if (we.getText().contains(descr)) {
                    isDisplayed = true;
                    break;
                }
            }
        }
        return isDisplayed;
    }

    public String getCreatedChallStartsValue(ChallProfile challProfile) {
        String xpath = ChallsLocators.CHALLS_CREATED_CHALL_STARTS_VALUE_PARAMS.replace("{CHALL_DESCRIPTION}", challProfile.getChallDescr());
        WebElement startsWE = getDriver().findElement(By.xpath(xpath));
        return startsWE.getText().trim();
    }

    public String getCreatedChallEndsValue(ChallProfile challProfile) {
        String xpath = ChallsLocators.CHALLS_CREATED_CHALL_ENDS_VALUE_PARAMS.replace("{CHALL_DESCRIPTION}", challProfile.getChallDescr());
        WebElement endsWE = getDriver().findElement(By.xpath(xpath));
        return endsWE.getText().trim();
    }

    public ChallsCreatedChallPage viewChallenge(ChallProfile challProfile) {
        log.info("click View Challenge");
        String xpath = ChallsLocators.CHALLS_VIEW_CHALL_BUTTON_PARAM.replace("{CHALL_DESCRIPTION}", challProfile.getChallDescr());
        WebElement viewButton = getDriver().findElement(By.xpath(xpath));
        waitUntilClickable(viewButton);
        viewButton.click();
        return new ChallsCreatedChallPage(getDriver());
    }

    public boolean isAnnouncedResultDisplayed(ChallProfile challProfile) {
        return isElementPresent(getChallengeCardBy(challProfile), 5);
    }

    public By getChallengeCardBy(ChallProfile challProfile) {
        String xpath = ChallsLocators.CHALLS_PAGE_CHALLENGE_CARD_LINK_TEMPLATE.replace("{CHALL_NAME}", challProfile.getChallName());
        return By.xpath(xpath);
    }

    public ChallsCreatedChallPage clickOnChallengeCard(ChallProfile challProfile) {
        log.info("click on Challenge card");
        isElementPresent(getChallengeCardBy(challProfile), 1);
        getDriver().findElement(getChallengeCardBy(challProfile)).click();
        return new ChallsCreatedChallPage(getDriver());
    }




}
