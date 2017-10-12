package staging.pages;

import org.openqa.selenium.WebDriver;
import staging.utils.SettingsProperties;

public class OpenStartPage extends AbstractPage {

    public OpenStartPage(final WebDriver driver) {
        super(driver);
    }

    public StartPage openStartPage() {
        getDriver().get(SettingsProperties.getProperty("startURL"));
        return new StartPage(getDriver());
    }

}
