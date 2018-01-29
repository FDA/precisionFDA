package precisionFDA.pages.experts;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.TextInput;
import precisionFDA.locators.ExpertsLocators;
import precisionFDA.pages.AbstractPage;

import java.util.List;

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

    @FindBy(xpath = ExpertsLocators.EXPERT_QUESTION_POPUP_TEXTAREA)
    private TextInput questionPopupTextarea;

    @FindBy(xpath = ExpertsLocators.EXPERT_QUESTION_POPUP_SUBMIT_BUTTON)
    private Button questionPopupSubmitButton;

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

    public TextInput getQuestionPopupTextarea() {
        return questionPopupTextarea;
    }

    public Button getQuestionPopupSubmitButton() {
        return questionPopupSubmitButton;
    }

    public ExpertsExpertDashboardPage openDashboard() {
        log.info("open dashboard");
        waitUntilClickable(getViewDashboardLink());
        getViewDashboardLink().click();
        return new ExpertsExpertDashboardPage(getDriver());
    }

    public boolean isAskQuestionButtonDisplayed() {
        return isElementPresent(getAskQuestionButton(), 5);
    }

    public ExpertsCreatedExpertPage submitQuestion(String question) {
        log.info("submit question");
        waitUntilClickable(getAskQuestionButton());
        getAskQuestionButton().click();
        waitUntilDisplayed(getQuestionPopupTextarea(), 5);
        getQuestionPopupTextarea().sendKeys(question);
        getQuestionPopupSubmitButton().click();
        return new ExpertsCreatedExpertPage(getDriver());
    }

    public boolean isYourQuestionDisplayed(String question) {
        if (getYourQuestionWE(question) == null) {
            return false;
        }
        else {
            return isElementPresent(getYourQuestionWE(question), 3);
        }
    }

    public WebElement getYourQuestionWE(String question) {
        WebElement q = null;
        List<WebElement> allQuestions = getDriver().findElements(By.xpath(ExpertsLocators.EXPERT_YOUR_QUESTIONS_COMMON));
        for (WebElement we : allQuestions) {
            if (we.getText().contains(question)) {
                q = we;
                break;
            }
        }
        return q;
    }

    public boolean isQuestionAnswered(String question) {
        if (getAnsweredQuestionForSubmitter(question) == null) {
            return false;
        }
        else {
            return isElementPresent(getAnsweredQuestionForSubmitter(question), 3);
        }
    }

    public WebElement getAnsweredQuestionForSubmitter(String question) {
        WebElement q = null;
        List<WebElement> allQuestions = getDriver().findElements(By.xpath(ExpertsLocators.EXPERT_ANSWERED_QUESTIONS_LINKS_FOR_SUBMITTER_COMMON));
        for (WebElement we : allQuestions) {
            if (we.getText().equals(question)) {
                q = we;
                break;
            }
        }
        return q;
    }

    public ExpertsQAPage openQAPage(String question) {
        log.info("open answered question");
        WebElement link = getAnsweredQuestionForSubmitter(question);
        waitUntilClickable(link);
        link.click();
        return new ExpertsQAPage(getDriver());
    }

}
