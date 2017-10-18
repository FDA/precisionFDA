package staging.data;

import static staging.pages.AbstractPage.testRunUniqueFinalValue;

public class TestConstants {

    static final String CREATE_APP_NAME_PREFIX = "autotest_app_name_";

    static final String CREATE_APP_TITLE_PREFIX = "autotest_app_title_";

    static final String CREATE_APP_JOB_NAME_PREFIX = "autotest_app_job_";

    static final String CREATE_APP_SCRIPT_BODY_PREFIX_1 = "echo ";

    static final String CREATE_APP_SCRIPT_BODY_PREFIX_2 = "auto__";

    public static final String getAppJobScriptOutput() {
        return CREATE_APP_SCRIPT_BODY_PREFIX_2 + testRunUniqueFinalValue;
    }

    public static final String getAppJobScriptBody() {
        return CREATE_APP_SCRIPT_BODY_PREFIX_1 + getAppJobScriptOutput();
    }

    public static final String getAppJobName() {
        return CREATE_APP_JOB_NAME_PREFIX + testRunUniqueFinalValue;
    }

    public static final String getAppName() {
        return CREATE_APP_NAME_PREFIX + testRunUniqueFinalValue;
    }

    public static final String getAppTitle() {
        return CREATE_APP_TITLE_PREFIX + testRunUniqueFinalValue;
    }



}
