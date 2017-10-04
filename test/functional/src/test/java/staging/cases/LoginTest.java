package staging.cases;

import org.apache.log4j.Logger;
import org.testng.annotations.Test;
import staging.pages.GrantAccessLoginPage;
import staging.pages.LoginPage;
import staging.pages.MainPage;
import staging.pages.PrecisionFDAPage;

import static org.testng.Assert.assertTrue;

public class LoginTest extends AbstractTest {

    private final Logger log = Logger.getLogger(this.getClass());

    @Test
    public void successfulLogin() {
        logTestHeader("Test Case: Successful Login");
        
        String FDAUsername = config.getString("pfda_test.username");
        String FDAPassword = config.getString("pfda_test.password");

        String basicAuthUser = config.getString("pfda_test.dnx_stage_username");
        String basicAuthPassword = config.getString("pfda_test.dnx_stage_password");

        MainPage mainPage = openMainPage();
        LoginPage loginPage = mainPage.openLoginPage(basicAuthUser, basicAuthPassword);
        GrantAccessLoginPage grantAccessLoginPage = loginPage.loginToPrecisionFDA(FDAUsername, FDAPassword);
        PrecisionFDAPage precisionFDAPage = grantAccessLoginPage.grantAccess();

        log.info("check navigation panel is displayed");
        assertTrue(precisionFDAPage.getNavigationPanelWE().isDisplayed());

        log.info("check correct username is displayed");
        assertTrue(precisionFDAPage.getUsernameLink().getText().equals("Automation Test"));

        log.info("--PASSED--");
    }


}
