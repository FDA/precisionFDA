package tools;

import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;
import precisionFDA.cases.AbstractTest;

import static precisionFDA.data.TestDict.*;
import static precisionFDA.data.TestRunData.*;
import static precisionFDA.utils.Utils.printCaseStatus;

public class CustomResultListener extends AbstractTest implements ITestListener {

    @Override
    public void onTestSuccess(ITestResult result) {
        String suiteName = result.getTestClass().getName().replace("precisionFDA.cases.", "");
        String caseName = result.getName();
        setFinishedCaseData(getDictPassed(), caseName, suiteName);

        printCaseStatus(getDictPassed(), caseName, suiteName);
    }

    @Override
    public void onTestFailure(ITestResult result) {
        String suiteName = result.getTestClass().getName().replace("precisionFDA.cases.", "");
        String caseName = result.getName();
        setFinishedCaseData(getDictFailed(), caseName, suiteName);

        printCaseStatus(getDictFailed(), caseName, suiteName);
    }

    @Override
    public void onTestStart(ITestResult iTestResult) {
        //
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        //
    }

    @Override
    public void onTestFailedButWithinSuccessPercentage(ITestResult iTestResult) {
        //
    }

    @Override
    public void onStart(ITestContext iTestContext) {
        //
    }

    @Override
    public void onFinish(ITestContext iTestContext) {
        //
    }

}
