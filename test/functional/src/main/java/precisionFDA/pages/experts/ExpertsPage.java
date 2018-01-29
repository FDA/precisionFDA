package precisionFDA.pages.experts;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.ExpertsLocators;
import precisionFDA.model.ExpertProfile;
import precisionFDA.pages.AbstractPage;

import java.util.List;

public class ExpertsPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = ExpertsLocators.EXPERTS_MAIN_DIV)
    private Link notesMyNotesLink;

    @FindBy(xpath = ExpertsLocators.EXPERTS_ACTIVATED_ICON)
    private Link expertsActivatedLink;

    @FindBy(xpath = ExpertsLocators.CREATE_EXPERT_BUTTON_ON_EXPERTS_PAGE)
    private Link createExpertButtonLink;

    @FindBy(xpath = ExpertsLocators.CREATE_EXPERT_ALERT_SUCCESS)
    private WebElement expertCreatedSuccessAlert;

    @FindBy(xpath = ExpertsLocators.CREATED_EXPERT_COMMON_IMAGE)
    private WebElement createdExpertImage;

    public ExpertsPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(ExpertsLocators.EXPERTS_MAIN_DIV));
    }

    public WebElement getCreatedExpertImage() {
        return createdExpertImage;
    }

    public WebElement getExpertCreatedSuccessAlertWE() {
        return expertCreatedSuccessAlert;
    }

    public Link getExpertsActivatedLink() {
        return expertsActivatedLink;
    }

    public boolean isExpertsIconDisplayed() {
        return isElementPresent(getExpertsActivatedLink());
    }

    public Link getCreateExpertButtonLink() {
        return createExpertButtonLink;
    }

    public boolean isCreateExpertButtonDisplayed() {
        return isElementPresent(getCreateExpertButtonLink());
    }

    public String getExpertCreatedSuccessAlertText() {
        return getExpertCreatedSuccessAlertWE().getText();
    }

    public boolean isExpertCreatedSuccessAlertDisplayed() {
        return isElementPresent(getExpertCreatedSuccessAlertWE());
    }

    public ExpertsEditExpertPage clickCreateExpertButton() {
        log.info("open new expert form");
        getCreateExpertButtonLink().click();
        return new ExpertsEditExpertPage(getDriver());
    }

    public WebElement getCreatedExpertImage(String imageFileName) {
        String xpath = ExpertsLocators.CREATED_EXPERT_COMMON_IMAGE.replace("{EXPERT_IMAGE_FILE_NAME}", imageFileName);
        return getDriver().findElement(By.xpath(xpath));
    }

    public boolean isCreatedExpertPrefNameDisplayed(ExpertProfile expertProfile) {
        if (getCreatedExpertLink(expertProfile) == null) {
            return false;
        }
        else {
            return isElementPresent(getCreatedExpertLink(expertProfile), 3);
        }
    }

    public WebElement getCreatedExpertLink(ExpertProfile expertProfile) {
        WebElement prefName = null;
        List<WebElement> allNames = getDriver().findElements(By.xpath(ExpertsLocators.CREATED_EXPERT_COMMON_LINK));
        for (WebElement we : allNames) {
            if (we.getText().contains(expertProfile.getExpertPreferredName())) {
                prefName = we;
                break;
            }
        }
        return prefName;
    }

    public boolean isCreatedExpertImageDisplayed(ExpertProfile expertProfile) {
        return isElementPresent(getCreatedExpertImage(expertProfile.getExpertImage()), 10);
    }

    public ExpertsCreatedExpertPage openExpertPage(ExpertProfile expertProfile) {
        log.info("open expert page");
        WebElement expert = getCreatedExpertLink(expertProfile);
        waitUntilClickable(expert);
        expert.click();
        return new ExpertsCreatedExpertPage(getDriver());
    }
}
