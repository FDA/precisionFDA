package precisionFDA.pages.dashboard;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.DashboardLocators;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.TextInput;

import static precisionFDA.utils.Utils.*;

public class ActivityReportsPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_USERS_VIEW_CHART)
    private WebElement usersViewChart;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_USERS_ACCESS_REQUEST_CHART)
    private WebElement usersAccessRequestChart;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_USERS_LOGINS_CHART)
    private WebElement usersLoginsChart;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_DATA_UPLOAD_CHART)
    private WebElement usersUploadChart;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_DATA_DOWNLOAD_CHART)
    private WebElement usersDownloadChart;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_DATA_GENERATED_CHART)
    private WebElement usersGeneratedChart;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_APPS_CREATED_CHART)
    private WebElement appsCreatedChart;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_APPS_PUBLISHED_CHART)
    private WebElement appsPublishedChart;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_APPS_RUN_CHART)
    private WebElement appsRunChart;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_JOBS_RUN_CHART)
    private WebElement jobsRunChart;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_CHALLENGES_SIGNUP_CHART)
    private WebElement challengesSignupChart;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_CHALLENGES_SUBMISSIONS_CHART)
    private WebElement challengesSubmissionsChart;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_APPS_TOTAL)
    private WebElement appsTotal;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_NUMBER_OF_FILES_TOTAL)
    private WebElement numberOfFilesTotal;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_PUBLIC_APPS_TOTAL)
    private WebElement publicAppsTotal;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_DATA_STORAGE_TOTAL)
    private WebElement dataStorageTotal;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_RUNTIME_TOTAL)
    private WebElement runtimeTotal;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_FROM_DATE_INPUT_VISIBLE)
    private WebElement fromDateInputVisible;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_TO_DATE_INPUT_VISIBLE)
    private WebElement toDateInputVisible;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_SUBMIT_BUTTON)
    private Button submitButton;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_WRONG_PERIOD_ERROR)
    private WebElement wrongPeriodError;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_FROM_DATE_INPUT)
    private TextInput fromDateInput;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_TO_DATE_INPUT)
    private TextInput toDateInput;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_BOOTSTRAP_CALENDAR_POPUP)
    private WebElement popupCalendar;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_BOOTSTRAP_CALENDAR_POPUP_NEXT_MONTH_ARROW)
    private WebElement popupCalendarNextMonthArrow;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_BOOTSTRAP_CALENDAR_POPUP_FIRST_DAY)
    private WebElement popupCalendarFirstDay;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_DATE_RANGE_DAY_BUTTON)
    private Button dayDateRangeButton;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_DATE_RANGE_WEEK_BUTTON)
    private Button weekDateRangeButton;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_DATE_RANGE_MONTH_BUTTON)
    private Button monthDateRangeButton;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_DATE_RANGE_YEAR_BUTTON)
    private Button yearDateRangeButton;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_TO_DATE_WITH_VALUE)
    private WebElement toDateWithValue;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_FROM_DATE_WITH_VALUE)
    private WebElement fromDateWithValue;

    public ActivityReportsPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(DashboardLocators.ACTIVITY_REPORTS_SELECT_PERIOD_BUTTONS));
    }

    public WebElement getFromDateWithValue() {
        return fromDateWithValue;
    }

    public WebElement getToDateWithValue() {
        return toDateWithValue;
    }

    public Button getDayDateRangeButton() {
        return dayDateRangeButton;
    }

    public Button getMonthDateRangeButton() {
        return monthDateRangeButton;
    }

    public Button getWeekDateRangeButton() {
        return weekDateRangeButton;
    }

    public Button getYearDateRangeButton() {
        return yearDateRangeButton;
    }

    public WebElement getPopupCalendarFirstDay() {
        return popupCalendarFirstDay;
    }

    public WebElement getPopupCalendarNextMonthArrow() {
        return popupCalendarNextMonthArrow;
    }

    public WebElement getPopupCalendar() {
        return popupCalendar;
    }

    public TextInput getToDateInput() {
        return toDateInput;
    }

    public TextInput getFromDateInput() {
        return fromDateInput;
    }

    public WebElement getWrongPeriodError() {
        return wrongPeriodError;
    }

    public Button getSubmitButton() {
        return submitButton;
    }

    public WebElement getFromDateInputVisible() {
        return fromDateInputVisible;
    }

    public WebElement getToDateInputVisible() {
        return toDateInputVisible;
    }

    public WebElement getAppsTotal() {
        return appsTotal;
    }

    public WebElement getDataStorageTotal() {
        return dataStorageTotal;
    }

    public WebElement getNumberOfFilesTotal() {
        return numberOfFilesTotal;
    }

    public WebElement getPublicAppsTotal() {
        return publicAppsTotal;
    }

    public WebElement getRuntimeTotal() {
        return runtimeTotal;
    }

    public WebElement getAppsCreatedChart() {
        return appsCreatedChart;
    }

    public WebElement getAppsPublishedChart() {
        return appsPublishedChart;
    }

    public WebElement getAppsRunChart() {
        return appsRunChart;
    }

    public WebElement getChallengesSignupChart() {
        return challengesSignupChart;
    }

    public WebElement getChallengesSubmissionsChart() {
        return challengesSubmissionsChart;
    }

    public WebElement getJobsRunChart() {
        return jobsRunChart;
    }

    public WebElement getUsersAccessRequestChart() {
        return usersAccessRequestChart;
    }

    public WebElement getUsersDownloadChart() {
        return usersDownloadChart;
    }

    public WebElement getUsersGeneratedChart() {
        return usersGeneratedChart;
    }

    public WebElement getUsersLoginsChart() {
        return usersLoginsChart;
    }

    public WebElement getUsersUploadChart() {
        return usersUploadChart;
    }

    public WebElement getUsersViewChart() {
        return usersViewChart;
    }

    public boolean areChartsDisplayed() {
        WebElement[] array = { getUsersViewChart(), getUsersUploadChart(), getUsersLoginsChart(),
                getUsersGeneratedChart(), getUsersDownloadChart(), getUsersAccessRequestChart(),
                getJobsRunChart(), getChallengesSubmissionsChart(), getChallengesSignupChart(),
                getAppsRunChart(), getAppsPublishedChart(), getAppsCreatedChart(),
                getAppsTotal(), getDataStorageTotal(), getNumberOfFilesTotal(),
                getPublicAppsTotal(), getRuntimeTotal() };

        String absent = "";
        boolean areDisplayed = false;

        for (int i = 0; i <= array.length - 1; i++) {
            if (!isElementPresent(array[i], 1)) {
                log.warn("[fail]: chart is not displayed but expected: " + array[i]);
                absent = absent + "; " + array[i];
            }
            else {
                log.info("[pass]: chart is displayed: " + array[i]);
            }
        }

        if (absent.length() == 0) {
            areDisplayed = true;
        }
        else {
            areDisplayed = false;
            log.warn("the following charts are absent: " + absent);
        }

        return areDisplayed;
    }

    public boolean isToDateInputDisplayed() {
        return isElementPresent(getToDateInputVisible(), 2);
    }

    public boolean isFromDateInputDisplayed() {
        return isElementPresent(getFromDateInputVisible(), 2);
    }

    public void setFromDateAsFirstDayNextMonth() {
        log.info("set From Date as the first day of next month");
        getFromDateInputVisible().click();
        waitUntilDisplayed(getPopupCalendar(), 5);
        sleep(500);
        waitUntilDisplayed(getPopupCalendarNextMonthArrow(), 10);
        getPopupCalendarNextMonthArrow().click();
        sleep(500);
        waitUntilDisplayed(getPopupCalendarFirstDay(), 10);
        getPopupCalendarFirstDay().click();
    }

    public void clickSubmitDatePeriod() {
        log.info("click Submit Date Period");
        isElementPresent(getSubmitButton(), 2);
        getSubmitButton().click();
    }

    public boolean isWrongPeriodErrorDisplayed() {
        return isElementPresent(getWrongPeriodError(), 5);
    }

    public boolean isDayDateRangeButtonDisplayed() {
        return isElementPresent(getDayDateRangeButton(), 5);
    }

    public boolean isWeekDateRangeButtonDisplayed() {
        return isElementPresent(getWeekDateRangeButton(), 5);
    }

    public boolean isMonthDateRangeButtonDisplayed() {
        return isElementPresent(getMonthDateRangeButton(), 5);
    }

    public boolean isYearDateRangeButtonDisplayed() {
        return isElementPresent(getYearDateRangeButton(), 5);
    }

    public boolean toDateEqualsToday() {
        String current = getCurrentDate_MM_dd_YYYY_Slashes();
        String displayed = getValueToDate();
        boolean equals = false;
        if (current.equals(displayed)) {
            equals = true;
            log.info("To Date field displays correct value: " + displayed);
        }
        else {
            equals = false;
            log.warn("Today is [" + current + "] but the To Date field displays [" + displayed + "]");
        }
        return equals;
    }

    public boolean fromDateEqualsYesterday() {
        String yesterday = getYesterdayDate_MM_dd_YYYY_Slashes();
        String displayed = getValueFromDate();
        boolean equals = false;
        if (yesterday.equals(displayed)) {
            equals = true;
            log.info("From Date field displays correct value: " + displayed);
        }
        else {
            equals = false;
            log.warn("Yesterday is [" + yesterday + "] but the From Date field displays [" + displayed + "]");
        }
        return equals;
    }

    public boolean fromDateEqualsLastSunday() {
        String lastSunday = getLastSundayDate_MM_dd_YYYY_Slashes();
        String displayed = getValueFromDate();
        boolean equals = false;
        if (lastSunday.equals(displayed)) {
            equals = true;
            log.info("From Date field displays correct value: " + displayed);
        }
        else {
            equals = false;
            log.warn("Last sunday is [" + lastSunday + "] but the From Date field displays [" + displayed + "]");
        }
        return equals;
    }

    public boolean fromDateEqualsFirstDayOfCurrentMonth() {
        String firstMonthDay = getFirstDayOfCurrentMonth_MM_dd_YYYY_Slashes();
        String displayed = getValueFromDate();
        boolean equals = false;
        if (firstMonthDay.equals(displayed)) {
            equals = true;
            log.info("From Date field displays correct value: " + displayed);
        }
        else {
            equals = false;
            log.warn("First day of current month is [" + firstMonthDay + "] but the From Date field displays [" + displayed + "]");
        }
        return equals;
    }

    public boolean fromDateEqualsFirstDayOfCurrentYear() {
        String firstYearDay = getFirstDayOfCurrentYear_MM_dd_YYYY_Slashes();
        String displayed = getValueFromDate();
        boolean equals = false;
        if (firstYearDay.equals(displayed)) {
            equals = true;
            log.info("From Date field displays correct value: " + displayed);
        }
        else {
            equals = false;
            log.warn("First day of current year is [" + firstYearDay + "] but the From Date field displays [" + displayed + "]");
        }
        return equals;
    }

    public String getValueFromDate() {
        return getFromDateWithValue().getText().trim();
    }

    public String getValueToDate() {
        return getToDateWithValue().getText().trim();
    }

    public void clickDayRangeButton() {
        log.info("click Day");
        getDayDateRangeButton().click();
        sleep(200);
    }

    public void clickWeekRangeButton() {
        log.info("click Week");
        getWeekDateRangeButton().click();
        sleep(200);
    }

    public void clickMonthRangeButton() {
        log.info("click Month");
        getMonthDateRangeButton().click();
        sleep(200);
    }

    public void clickYearRangeButton() {
        log.info("click Year");
        getYearDateRangeButton().click();
        sleep(200);
    }
}
