package staging.pages;

import org.openqa.selenium.WebDriver;
import staging.utils.SettingsProperties;

public class OpenMainPage extends AbstractPage {

    public OpenMainPage(final WebDriver driver) {
        super(driver);
    }

    public MainPage openMainPage() {
        getDriver().get(SettingsProperties.getProperty("startURL"));
        return new MainPage(getDriver());
    }

}
