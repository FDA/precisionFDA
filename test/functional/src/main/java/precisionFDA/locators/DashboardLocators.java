package precisionFDA.locators;

public class DashboardLocators {

    public static final String SITE_ACTIVITY_TITLE = "//*[text()='Site Activity']";

    public static final String ACTIVE_USERS_LINK = "//a[contains(@href, 'active_users')]/i/..";

    public static final String ACTIVITY_REPORTS_LINK = "//a[contains(@href, 'activity_reports')]/i/..";

    public static final String ACTIVITY_REPORTS_SELECT_PERIOD_BUTTONS = "//*[@id='select_date_range']";

    public static final String ACTIVITY_REPORTS_USERS_VIEW_CHART = "//*[@id='users_views_chart']";

    public static final String ACTIVITY_REPORTS_USERS_ACCESS_REQUEST_CHART = "//*[@id='users_access_request_chart']";

    public static final String ACTIVITY_REPORTS_USERS_LOGINS_CHART = "//*[@id='users_logins_chart']";

    public static final String ACTIVITY_REPORTS_DATA_UPLOAD_CHART = "//*[@id='data_upload_chart']";

    public static final String ACTIVITY_REPORTS_DATA_DOWNLOAD_CHART = "//*[@id='data_download_chart']";

    public static final String ACTIVITY_REPORTS_DATA_GENERATED_CHART = "//*[@id='data_generated_chart']";

    public static final String ACTIVITY_REPORTS_APPS_CREATED_CHART = "//*[@id='apps_created_chart']";

    public static final String ACTIVITY_REPORTS_APPS_PUBLISHED_CHART = "//*[@id='apps_published_chart']";

    public static final String ACTIVITY_REPORTS_APPS_RUN_CHART = "//*[@id='apps_run_chart']";

    public static final String ACTIVITY_REPORTS_JOBS_RUN_CHART = "//*[@id='apps_jobs_run_chart']";

    public static final String ACTIVITY_REPORTS_CHALLENGES_SIGNUP_CHART = "//*[@id='challenges_signup_chart']";

    public static final String ACTIVITY_REPORTS_CHALLENGES_SUBMISSIONS_CHART = "//*[@id='challenges_submissions_chart']";

    public static final String ACTIVITY_REPORTS_DATA_STORAGE_TOTAL = "//*[@class='total']//*[text()='data storage']";

    public static final String ACTIVITY_REPORTS_NUMBER_OF_FILES_TOTAL = "//*[@class='total']//*[text()='number of files']";

    public static final String ACTIVITY_REPORTS_APPS_TOTAL = "//*[@class='total']//*[text()='total apps']";

    public static final String ACTIVITY_REPORTS_PUBLIC_APPS_TOTAL = "//*[@class='total']//*[text()='public apps']";

    public static final String ACTIVITY_REPORTS_RUNTIME_TOTAL = "//*[@class='total']//*[text()='total runtime']";

    public static final String ACTIVITY_REPORTS_FROM_DATE_INPUT_VISIBLE = "//*[contains(@class, 'datetimepicker')]/input[@name='date_at']/..";

    public static final String ACTIVITY_REPORTS_TO_DATE_INPUT_VISIBLE = "//*[contains(@class, 'datetimepicker')]/input[@name='date_to']/..";

    public static final String ACTIVITY_REPORTS_FROM_DATE_INPUT = "//input[@name='date_at']";

    public static final String ACTIVITY_REPORTS_TO_DATE_INPUT = "//input[@name='date_to']";

    public static final String ACTIVITY_REPORTS_SUBMIT_BUTTON = "//button[text()='Submit']";

    public static final String ACTIVITY_REPORTS_WRONG_PERIOD_ERROR = "//*[contains(@class, 'alert-danger')][contains(text(), 'greater')]";

    public static final String ACTIVITY_REPORTS_BOOTSTRAP_CALENDAR_POPUP = "//*[contains(@class, 'bootstrap-datetimepicker-widget')]";

    public static final String ACTIVITY_REPORTS_BOOTSTRAP_CALENDAR_POPUP_NEXT_MONTH_ARROW = "//*[@class='datepicker-days']//th[@data-action='next']";

    public static final String ACTIVITY_REPORTS_BOOTSTRAP_CALENDAR_POPUP_FIRST_DAY = "//*[@class='datepicker-days']//td[@data-action='selectDay'][text()='1']";

    public static final String ACTIVITY_REPORTS_DATE_RANGE_DAY_BUTTON = "//*[@id='select_date_range']/button[text()='Day']";

    public static final String ACTIVITY_REPORTS_DATE_RANGE_WEEK_BUTTON = "//*[@id='select_date_range']/button[text()='Week']";

    public static final String ACTIVITY_REPORTS_DATE_RANGE_MONTH_BUTTON = "//*[@id='select_date_range']/button[text()='Month']";

    public static final String ACTIVITY_REPORTS_DATE_RANGE_YEAR_BUTTON = "//*[@id='select_date_range']/button[text()='Year']";

    public static final String ACTIVITY_REPORTS_TO_DATE_WITH_VALUE = "//*[contains(@class, 'datetimepicker')]/input[@name='date_to']/../span";

    public static final String ACTIVITY_REPORTS_FROM_DATE_WITH_VALUE = "//*[contains(@class, 'datetimepicker')]/input[@name='date_at']/../span";

    public static final String USERS_AND_USAGE_LINK = "//a[contains(@href, 'usage_reports')]/i/..";

    public static final String USERS_AND_USAGE_CURRENT_STORAGE_COLUMN_LINK = "//a[text()='Current storage usage']";

    public static final String USERS_AND_USAGE_EXPORT_TO_CSV_BUTTON = "//*[contains(@class, 'csv-export-button')]";

}
