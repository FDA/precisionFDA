package tools;

import org.apache.log4j.Logger;
import org.testng.ITestResult;
import org.testng.TestListenerAdapter;

import static tools.Addons.casePostActions;

public class TestResultListener extends TestListenerAdapter {

    private final Logger log = Logger.getLogger(this.getClass());

    @Override
    public void onTestSuccess(ITestResult result) {
        String caseName = result.getName().replace("check", "").replace("CanBeOpen", "");
        String status = "passed";
        casePostActions(status, caseName);
        log.info("-- PASSED --");
    }


    @Override
    public void onTestFailure(ITestResult result) {
        String caseName = result.getName().replace("check", "").replace("CanBeOpen", "");
        String status = "failed";
        casePostActions(status, caseName);
        log.info("-- FAILED --");
    }

}
