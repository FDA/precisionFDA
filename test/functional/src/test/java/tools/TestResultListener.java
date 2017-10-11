package tools;

import org.apache.log4j.Logger;
import org.testng.ITestResult;
import org.testng.TestListenerAdapter;

public class TestResultListener extends TestListenerAdapter {

    private final Logger log = Logger.getLogger(this.getClass());

    @Override
    public void onTestSuccess(ITestResult result) {
        String caseName = result.getName().replace("check", "").replace("CanBeOpen", "");
        String status = "passed";
        String path = CommonActions.casePostActions(status, caseName);
        log.info("screenshot is here: " + path + ".png");
        log.info("pagesource is here: " + path + ".txt");
        log.info("-- PASSED --");
    }

    @Override
    public void onTestFailure(ITestResult result) {
        String caseName = result.getName().replace("check", "").replace("CanBeOpen", "");
        String status = "failed";
        String path = CommonActions.casePostActions(status, caseName);
        log.info("screenshot is here: " + path + ".png");
        log.info("pagesource is here: " + path + ".txt");
        log.info("-- FAILED --");
    }

}
