package staging.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.TextInput;
import staging.locators.AppsLocators;
import staging.pages.AbstractPage;

import static staging.data.TestConstants.getAppJobName;
import static staging.utils.Utils.getCurrentDateTimeUTCValue;

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

    public AppsEditAndRunAppPage editAppBeforeRun() {
        appsJobNameInput.clear();
        appsJobNameInput.sendKeys(getAppJobName());
        return new AppsEditAndRunAppPage(getDriver());
    }

    public AppsSavedAppPage runAppFromEditPage() {
        appsRunAppButton.click();
        jobRunTimeUTC = getCurrentDateTimeUTCValue();
        return new AppsSavedAppPage(getDriver());
    }

}
