package tools;

import org.apache.log4j.Logger;
import staging.cases.AbstractTest;
import staging.pages.login.GrantAccessLoginPage;
import staging.pages.login.LoginPage;
import staging.pages.MainPage;
import staging.pages.PrecisionFDAPage;

import java.io.IOException;

import static staging.data.Creds.*;

public class Addons extends AbstractTest {

    public static void casePostActions(String status, String caseName) {

        final Logger log = Logger.getLogger("[INFO]");

        String currentSalt = getCurrentDateSalt();

        String path = System.getProperty("user.dir") + "/target/debug-log/" + globalSalt + "/" +
                status + "_" + caseName + "_" + currentSalt;

        //take screenshot
        takeScreenshot(path + ".png");
        log.info("screenshot is here: " + path + ".png");

        //save page source
        String source = getPageSource();
        try {
            createFile(path + ".txt", source);
            log.info("page Source is here: " + path + ".txt");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static PrecisionFDAPage loginToFDA(MainPage mainPage) {
        LoginPage loginPage = mainPage.openLoginPage(getDNXusername(), getDNXpassword());
        GrantAccessLoginPage grantAccessLoginPage = loginPage.loginToPrecisionFDA(getPFDAusername(), getPFDApassword());
        PrecisionFDAPage precisionFDAPage = grantAccessLoginPage.grantAccess();
        return precisionFDAPage;
    }



}



