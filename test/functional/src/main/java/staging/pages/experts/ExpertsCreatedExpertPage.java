package staging.pages.experts;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.ExpertsLocators;
import staging.pages.AbstractPage;

public class ExpertsCreatedExpertPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = ExpertsLocators.CREATED_EXPERT_PAGE_VIEW_DASHBOARD)
    private Link viewDashboardLink;

    @FindBy(xpath = ExpertsLocators.CREATED_EXPERT_PAGE_OPENCLOSED_LABEL)
    private WebElement openClosedLabelWE;

    @FindBy(xpath = ExpertsLocators.CREATED_EXPERT_PAGE_PUBLICPRIVATE_LABEL)
    private WebElement publicPrivateLabelWE;

    @FindBy(xpath = ExpertsLocators.CREATED_EXPERT_PAGE_ABOUT)
    private WebElement aboutWE;

    @FindBy(xpath = ExpertsLocators.EXPERT_PAGE_ASK_QUESTION_BUTTON)
    private Link askQuestionButton;

    public ExpertsCreatedExpertPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(ExpertsLocators.CREATED_EXPERT_PAGE_ABOUT));
    }

    public Link getViewDashboardLink() {
        return viewDashboardLink;
    }

    public WebElement getOpenClosedLabelWE() {
        return openClosedLabelWE;
    }

    public WebElement getPublicPrivateLabelWE() {
        return publicPrivateLabelWE;
    }

    public WebElement getAboutWE() {
        return aboutWE;
    }

    public String getOpenClosedLabelText() {
        return getOpenClosedLabelWE().getText();
    }

    public String getPublicPrivateLabelText() {
        return getPublicPrivateLabelWE().getText();
    }

    public String getAboutDisplayedText() {
        return getAboutWE().getText();
    }

    public Link getAskQuestionButton() {
        return askQuestionButton;
    }

    public ExpertsExpertDashboardPage openDashboard() {
        log.info("open dashboard");
        getViewDashboardLink().click();
        return new ExpertsExpertDashboardPage(getDriver());
    }

    public boolean isAskQuestionButtonDisplayed() {
        return isElementPresent(getAskQuestionButton(), 2);
    }
}
