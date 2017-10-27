package staging.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.TextInput;
import staging.locators.AppsLocators;
import staging.model.AppProfile;
import staging.pages.AbstractPage;

public class AppsEditAndRunAppPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = AppsLocators.APPS_EDIT_RUN_APP_JOB_NAME_INPUT)
    private TextInput appsJobNameInput;

    @FindBy(xpath = AppsLocators.APPS_EDIT_RUN_APP_RUN_APP_BUTTON)
    private Button appsRunAppButton;

    public AppsEditAndRunAppPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_EDIT_RUN_APP_JOB_NAME_INPUT));
    }

    public TextInput getAppsJobNameInput() {
        return appsJobNameInput;
    }

    public Button getAppsRunAppButton() {
        return appsRunAppButton;
    }

    public AppsEditAndRunAppPage editJobName(AppProfile appProfile) {
        log.info("edit job name");
        getAppsJobNameInput().clear();
        getAppsJobNameInput().sendKeys(appProfile.getJobNameText());
        return new AppsEditAndRunAppPage(getDriver());
    }

    public AppsSavedAppPage clickRunAppOnEditJobPage(AppProfile appProfile) {
        log.info("click Run App on edit job page");
        getAppsRunAppButton().click();
        appProfile.setJobCreationDateTimeText();
        return new AppsSavedAppPage(getDriver());
    }

}
