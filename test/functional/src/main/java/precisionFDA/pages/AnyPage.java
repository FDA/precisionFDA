package precisionFDA.pages;

import org.apache.log4j.Logger;
import org.openqa.selenium.WebDriver;

public class AnyPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    public AnyPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
    }

}
