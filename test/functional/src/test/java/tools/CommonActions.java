package tools;

import org.apache.log4j.Logger;
import staging.cases.AbstractTest;
import staging.pages.login.GrantAccessLoginPage;
import staging.pages.login.LoginPage;
import staging.pages.MainPage;
import staging.pages.PrecisionFDAPage;
import staging.utils.Utils;

import java.io.IOException;

import static staging.data.Creds.*;

public class CommonActions extends AbstractTest {

    private final Logger log = Logger.getLogger(this.getClass());

    public static PrecisionFDAPage loginToFDA(MainPage mainPage) {
        LoginPage loginPage = mainPage.openLoginPage(getDNXusername(), getDNXpassword());
        GrantAccessLoginPage grantAccessLoginPage = loginPage.loginToPrecisionFDA(getPFDAusername(), getPFDApassword());
        PrecisionFDAPage precisionFDAPage = grantAccessLoginPage.grantAccess();
        return precisionFDAPage;
    }

    public static String casePostActions(String status, String caseName) {
        //take screenshot
        String currentSalt = Utils.getCurrentDateSalt();

        String path = System.getProperty("user.dir") + "/target/debug-log/" + Utils.globalSalt + "/" +
                status + "_" + caseName + "_" + currentSalt;

        Utils.takeScreenshot(path + ".png", getDriver());

        //save page source
        String source = getDriver().getPageSource();
        try {
            Utils.createFile(path + ".txt", source);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return path;
    }

}



