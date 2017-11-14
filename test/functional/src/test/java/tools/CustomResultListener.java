package tools;

import org.testng.ITestResult;
import org.testng.TestListenerAdapter;

import static precisionFDA.data.TestDict.getCaseStatusFailed;
import static precisionFDA.data.TestDict.getCaseStatusPassed;
import static precisionFDA.data.TestRunData.*;

public class CustomResultListener extends TestListenerAdapter {

    @Override
    public void onTestSuccess(ITestResult result) {
        String suiteName = result.getTestClass().getName().replace("precisionFDA.cases.", "");
        String caseName = result.getName();
        setFinishedCaseData(getCaseStatusPassed(), caseName, suiteName);
    }

    @Override
    public void onTestFailure(ITestResult result) {
        String suiteName = result.getTestClass().getName().replace("precisionFDA.cases.", "");
        String caseName = result.getName();
        setFinishedCaseData(getCaseStatusFailed(), caseName, suiteName);
    }

}
