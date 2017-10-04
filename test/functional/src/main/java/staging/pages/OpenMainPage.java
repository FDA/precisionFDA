package staging.pages;

import org.apache.log4j.Logger;
import org.openqa.selenium.WebDriver;
import staging.utils.SettingsProperties;

public class OpenMainPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    public OpenMainPage(final WebDriver driver) {
        super(driver);
    }

    public MainPage openMainPage() {
        getDriver().get(SettingsProperties.getProperty("startURL"));
        return new MainPage(getDriver());
    }

}
