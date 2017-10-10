package staging.cases;

import org.apache.log4j.Logger;
import staging.pages.login.GrantAccessLoginPage;
import staging.pages.login.LoginPage;
import staging.pages.MainPage;
import staging.pages.PrecisionFDAPage;

import static staging.data.Creds.*;

public class CommonActions extends AbstractTest {

    private final Logger log = Logger.getLogger(this.getClass());

    public static PrecisionFDAPage loginToFDA(MainPage mainPage) {
        LoginPage loginPage = mainPage.openLoginPage(getDNXusername(), getDNXpassword());
        GrantAccessLoginPage grantAccessLoginPage = loginPage.loginToPrecisionFDA(getPFDAusername(), getPFDApassword());
        PrecisionFDAPage precisionFDAPage = grantAccessLoginPage.grantAccess();
        return precisionFDAPage;
    }

}



