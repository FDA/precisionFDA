package precisionFDA.pages.experts;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.ExpertsLocators;
import precisionFDA.pages.AbstractPage;

public class ExpertsQAPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = ExpertsLocators.EXPERT_ANSWERED_QUESTIONS_PAGE_ANSWER)
    private WebElement answerWE;

    public ExpertsQAPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(ExpertsLocators.EXPERT_ANSWERED_QUESTIONS_PAGE_ANSWER));
    }

    public WebElement getAnswerWE() {
        return answerWE;
    }

    public String getAnswerText() {
        return getAnswerWE().getText();
    }
}
