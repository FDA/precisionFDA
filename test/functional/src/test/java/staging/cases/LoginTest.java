package staging.cases;

import org.apache.log4j.Logger;
import org.testng.annotations.Test;
import staging.pages.CommonPage;
import staging.pages.StartPage;

import static org.testng.Assert.assertTrue;

public class LoginTest extends AbstractTest {

    private final Logger log = Logger.getLogger(this.getClass());

    @Test
    public void successfulLogin() {
        logTestHeader("Test Case: Successful Login");

        StartPage startPage = openStartPage();
        CommonPage commonPage = loginToFDA(startPage);

        log.info("check navigation panel is displayed");
        assertTrue(commonPage.isNavigationPanelDisplayed());

        log.info("check correct username is displayed");
        assertTrue(commonPage.isCorrectUserNameDisplayed());
    }


}
