package tools;

import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;
import precisionFDA.cases.AbstractTest;

import static precisionFDA.data.TestDict.*;
import static precisionFDA.data.TestRunData.*;

public class CustomResultListener extends AbstractTest implements ITestListener {

    @Override
    public void onTestSuccess(ITestResult result) {
        String suiteName = result.getTestClass().getName().replace("precisionFDA.cases.", "");
        String caseName = result.getName();
        setFinishedCaseData(getDictPassed(), caseName, suiteName);

        logAfterCaseData(
                getDictPassed(),
                caseName,
                suiteName,
                isGetScreenshotOnPass(),
                isGetPageSourceOnPass());
    }

    @Override
    public void onTestFailure(ITestResult result) {
        String suiteName = result.getTestClass().getName().replace("precisionFDA.cases.", "");
        String caseName = result.getName();
        setFinishedCaseData(getDictFailed(), caseName, suiteName);

        logAfterCaseData(
                getDictFailed(),
                caseName,
                suiteName,
                isGetScreenshotOnFail(),
                isGetPageSourceOnFail());
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
