package precisionFDA.pages.challs;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.ChallsLocators;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.Link;

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

    public ChallsCreatedChallPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(ChallsLocators.CHALLS_CREATED_CHALL_INTRO_LINK));
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

}
