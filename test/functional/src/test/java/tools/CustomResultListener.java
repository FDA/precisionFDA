package tools;

import org.testng.ITestResult;
import org.testng.TestListenerAdapter;

import static staging.data.TestRunData.*;

public class CustomResultListener extends TestListenerAdapter {

    @Override
    public void onTestSuccess(ITestResult result) {
        String suiteName = result.getTestClass().getName().replace("staging.cases.", "");
        String caseName = result.getName().replace("check", "").replace("CanBeOpen", "");
        setFinishedCaseData(CASE_STATUS_PASSED, caseName, suiteName);
    }

    @Override
    public void onTestFailure(ITestResult result) {
        String suiteName = result.getTestClass().getName().replace("staging.cases.", "");
        String caseName = result.getName().replace("check", "").replace("CanBeOpen", "");
        setFinishedCaseData(CASE_STATUS_FAILED, caseName, suiteName);
    }

}
