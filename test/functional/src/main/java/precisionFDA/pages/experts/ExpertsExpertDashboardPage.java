package precisionFDA.pages.experts;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.utils.Utils;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.TextInput;
import precisionFDA.locators.ExpertsLocators;
import precisionFDA.pages.AbstractPage;

import java.util.List;

import static precisionFDA.utils.Utils.sleep;

public class ExpertsExpertDashboardPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = ExpertsLocators.CREATED_EXPERT_DASHBOARD_EDIT_LINK)
    private Link editExpert;

    @FindBy(xpath = ExpertsLocators.EXPERT_PAGE_OPENCLOSED_BUTTON)
    private Button openClosedButton;

    @FindBy(xpath = ExpertsLocators.EXPERT_PAGE_OPEN_EXPERT_ITEM)
    private Link openExpertItem;

    @FindBy(xpath = ExpertsLocators.EXPERT_PAGE_CLOSE_EXPERT_ITEM)
    private Link closeExpertItem;

    @FindBy(xpath = ExpertsLocators.EXPERT_QA_FORM_ANSWER_TEXTAREA)
    private TextInput qaFormAnswerTextarea;

    @FindBy(xpath = ExpertsLocators.EXPERT_QA_FORM_QUESTION_TEXTAREA)
    private TextInput qaFormQuestionTextarea;

    @FindBy(xpath = ExpertsLocators.EXPERT_ANSWER_QUESTION_SUBMIT_ANSWER_BUTTON)
    private WebElement answerQuestionSubmitButton;

    @FindBy(xpath = ExpertsLocators.EXPERT_QUESTION_POPUP_UPDATE_BUTTON)
    private WebElement answerQuestionUpdateButton;

    @FindBy(xpath = ExpertsLocators.EXPERT_OPEN_QUESTIONS_LIST_TITLE)
    private WebElement openQuestionsListTitle;

    @FindBy(xpath = ExpertsLocators.EXPERT_ANSWERED_QUESTIONS_LIST_TITLE)
    private WebElement answeredQuestionsListTitle;

    public Button getOpenClosedButton() {
        return openClosedButton;
    }

    public Link getOpenExpertItem() {
        return openExpertItem;
    }

    public Link getCloseExpertItem() {
        return closeExpertItem;
    }

    public TextInput getQaFormAnswerTextarea() {
        return qaFormAnswerTextarea;
    }

    public TextInput getQaFormQuestionTextarea() {
        return qaFormQuestionTextarea;
    }

    public ExpertsExpertDashboardPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(ExpertsLocators.CREATED_EXPERT_DASHBOARD_EDIT_LINK));
    }

    public Link getEditExpert() {
        return editExpert;
    }

    public WebElement getAnswerQuestionSubmitButton() {
        return answerQuestionSubmitButton;
    }

    public WebElement getAnswerQuestionUpdateButton() {
        return answerQuestionUpdateButton;
    }

    public WebElement getOpenQuestionsListTitle() {
        return openQuestionsListTitle;
    }

    public WebElement getAnsweredQuestionsListTitle() {
        return answeredQuestionsListTitle;
    }

    public ExpertsEditExpertPage clickEdit() {
        log.info("click edit");
        waitUntilClickable(getEditExpert());
        getEditExpert().click();
        return new ExpertsEditExpertPage(getDriver());
    }

    public ExpertsExpertDashboardPage setStatusOpen() {
        log.info("set Open");
        waitUntilClickable(getOpenClosedButton());
        getOpenClosedButton().click();
        waitUntilDisplayed(getOpenExpertItem(), 5);
        getOpenExpertItem().click();
        return new ExpertsExpertDashboardPage(getDriver());
    }

    public ExpertsExpertDashboardPage setStatusClosed() {
        log.info("set Closed");
        waitUntilClickable(getOpenClosedButton());
        getOpenClosedButton().click();
        waitUntilDisplayed(getCloseExpertItem(), 5);
        getCloseExpertItem().click();
        return new ExpertsExpertDashboardPage(getDriver());
    }

    public boolean isOpenQuestionLinkDisplayed(String question) {
        WebElement link = getOpenQuestionLink(question);
        if (link == null) {
            return false;
        }
        else {
            return isElementPresent(link, 1);
        }
    }

    public WebElement getOpenQuestionLink(String question) {
        String xpath;
        if (isAnsweredQuestionsTitleDisplayed()) {
            xpath = ExpertsLocators.EXPERT_OPEN_QUESTION_LINK_COMMON_WHEN_ANSWERED;
        }
        else {
            xpath = ExpertsLocators.EXPERT_OPEN_QUESTION_LINK_COMMON_WHEN_NO_ANSWERED;
        }

        WebElement q = null;
        List<WebElement> allQuestions = getDriver().findElements(By.xpath(xpath));
        for (WebElement we : allQuestions) {
            if (we.getText().equals(question)) {
                q = we;
                break;
            }
        }
        return q;
    }

    public boolean isAnsweredQuestionLinkDisplayed(String question) {
        WebElement link = getAnsweredQuestionLink(question);
        if (link == null) {
            return false;
        }
        else {
            return isElementPresent(link, 1);
        }
    }

    public WebElement getAnsweredQuestionLink(String question) {
        WebElement q = null;
        List<WebElement> allQuestions = getDriver().findElements(By.xpath(ExpertsLocators.EXPERT_ANSWERED_QUESTION_LINK_COMMON));
        for (WebElement we : allQuestions) {
            if (we.getText().equals(question)) {
                q = we;
                break;
            }
        }
        return q;
    }

    public ExpertsExpertDashboardPage openOpenQuestion(String question) {
        log.info("open Open question");
        getOpenQuestionLink(question).click();
        waitUntilDisplayed(getQaFormAnswerTextarea(), 10);
        return new ExpertsExpertDashboardPage(getDriver());
    }

    public ExpertsExpertDashboardPage openAnsweredQuestion(String question) {
        log.info("open Answered question");
        getAnsweredQuestionLink(question).click();
        waitUntilDisplayed(getQaFormAnswerTextarea(), 10);
        return new ExpertsExpertDashboardPage(getDriver());
    }

    public ExpertsExpertDashboardPage answerQuestion(String answer) {
        log.info("answer the question");
        getQaFormAnswerTextarea().sendKeys(answer);
        waitUntilClickable(getAnswerQuestionSubmitButton());
        getAnswerQuestionSubmitButton().click();
        waitUntilDisplayed(getAnswerQuestionUpdateButton(), 10);
        return new ExpertsExpertDashboardPage(getDriver());
    }

    public String getEnteredQuestionFromForm() {
        return getQaFormQuestionTextarea().getEnteredText();
    }

    public String getEnteredAnswerFromForm() {
        return getQaFormAnswerTextarea().getEnteredText();
    }

    public boolean isAnsweredQuestionsTitleDisplayed() {
        return isElementPresent(getAnsweredQuestionsListTitle(), 1);
    }

    public boolean isOpenQuestionsTitleDisplayed() {
        return isElementPresent(getOpenQuestionsListTitle(), 1);
    }

    public ExpertsExpertDashboardPage openQuestion(String question) {
        log.info("open question");
        WebElement link = getCommonQuestionLink(question);
        link.click();
        waitUntilDisplayed(getCommonQuestionActiveLink(question), 10);
        sleep(500);
        return new ExpertsExpertDashboardPage(getDriver());
    }

    public WebElement getCommonQuestionLink(String question) {
        String xpath = ExpertsLocators.EXPERT_COMMON_QUESTION_LINK_DASHBOARD.replace("{QUESTION}", question);
        return findByXpath(xpath);
    }

    public WebElement getCommonQuestionActiveLink(String question) {
        String xpath = ExpertsLocators.EXPERT_COMMON_QUESTION_ACTIVE_LINK_DASHBOARD.replace("{QUESTION}", question);
        return findByXpath(xpath);
    }
}
