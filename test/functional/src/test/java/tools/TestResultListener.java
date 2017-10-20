package tools;

import org.testng.ITestResult;
import org.testng.TestListenerAdapter;
import staging.data.TestConstants;
import static staging.data.TestVariables.*;

public class TestResultListener extends TestListenerAdapter {

    @Override
    public void onTestSuccess(ITestResult result) {
        String caseName = result.getName().replace("check", "").replace("CanBeOpen", "");
        setFinishedCaseData(TestConstants.CASE_STATUS_PASSED, caseName);
    }

    @Override
    public void onTestFailure(ITestResult result) {
        String caseName = result.getName().replace("check", "").replace("CanBeOpen", "");
        setFinishedCaseData(TestConstants.CASE_STATUS_FAILED, caseName);
    }

}
