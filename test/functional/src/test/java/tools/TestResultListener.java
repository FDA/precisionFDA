package tools;

import org.apache.log4j.Logger;
import org.testng.ITestResult;
import org.testng.TestListenerAdapter;
import staging.utils.SettingsProperties;

import static staging.cases.AbstractTest.casePostActions;

public class TestResultListener extends TestListenerAdapter {

    private final Logger log = Logger.getLogger(this.getClass());

    @Override
    public void onTestSuccess(ITestResult result) {
        String screenshotOnPass = SettingsProperties.getProperty("screenshotOnPass");
        String htmlSourceOnPass = SettingsProperties.getProperty("htmlSourceOnPass");
        String caseName = result.getName().replace("check", "").replace("CanBeOpen", "");
        String status = "passed";
        casePostActions(status, caseName, screenshotOnPass, htmlSourceOnPass);
        log.info("----------------------");
        log.info("--      PASSED      --");
        log.info("----------------------");
    }


    @Override
    public void onTestFailure(ITestResult result) {
        String screenshotOnFail = SettingsProperties.getProperty("screenshotOnFail");
        String htmlSourceOnFail = SettingsProperties.getProperty("htmlSourceOnFail");
        String caseName = result.getName().replace("check", "").replace("CanBeOpen", "");
        String status = "failed";
        casePostActions(status, caseName, screenshotOnFail, htmlSourceOnFail);
        log.info("----------------------");
        log.info("--      FAILED      --");
        log.info("----------------------");
    }

}
