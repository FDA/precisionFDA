package staging.cases;

import org.apache.log4j.Logger;
import org.testng.annotations.Test;
import staging.pages.MainPage;
import staging.pages.PrecisionFDAPage;

import static org.testng.Assert.assertTrue;

public class LoginTest extends AbstractTest {

    private final Logger log = Logger.getLogger(this.getClass());

    @Test
    public void successfulLogin() {
        logTestHeader("Test Case: Successful Login");

        MainPage mainPage = openMainPage();
        PrecisionFDAPage precisionFDAPage = CommonActions.loginToFDA(mainPage);

        log.info("check navigation panel is displayed");
        assertTrue(precisionFDAPage.getNavigationPanelWE().isDisplayed());

        log.info("check correct username is displayed");
        assertTrue(precisionFDAPage.getUsernameLink().getText().equals("Automation Test"));

        log.info("--PASSED--");
    }


}
