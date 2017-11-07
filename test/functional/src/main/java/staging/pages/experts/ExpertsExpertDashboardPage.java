package staging.pages.experts;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.ExpertsLocators;
import staging.pages.AbstractPage;

public class ExpertsExpertDashboardPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = ExpertsLocators.CREATED_EXPERT_DASHBOARD_EDIT_LINK)
    private Link editExpert;


    public ExpertsExpertDashboardPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(ExpertsLocators.CREATED_EXPERT_DASHBOARD_EDIT_LINK));
    }

    public Link getEditExpert() {
        return editExpert;
    }

    public ExpertsEditExpertPage clickEdit() {
        log.info("click edit");
        getEditExpert().click();
        return new ExpertsEditExpertPage(getDriver());
    }










}
