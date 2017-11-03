package staging.data;

import staging.model.AppProfile;

import static staging.data.TestRunData.getOutputNameFieldName;
import static staging.data.TestRunData.getTestRunUniqueFinalValue;
import static staging.utils.Utils.getRunTimeLocalUniqueValue;

public class TestAppData {

    public static AppProfile mainProfile = new AppProfile(
            getMainAppName(),
            "",

            getMainAppTitle(),
            "",

            getMainAppJobScriptBody(),
            "",

            getMainAppReadMeRawText(),
            "",
            "",

            getMainAppReadMeRichText(),
            "",
            "",

            "",
            "",

            getMainAppJobName(),
            "",
            getMainAppExpJobOutput(),

            ""
    );

    public static AppProfile getRunJobProfile() {
        return new AppProfile(
                getAppForJobName(),
                "",

                getAppForJobTitle(),
                "",

                getMainAppJobScriptBody(),
                "",

                getMainAppReadMeRawText(),
                "",
                "",

                getMainAppReadMeRichText(),
                "",
                "",

                "",
                "",

                getAppForJobName(),
                "",
                getMainAppExpJobOutput(),

                ""
        );
    }

    public static AppProfile getCheckRevisionProfile() {
        return new AppProfile(
                getCheckRevAppName(),
                "",

                getCheckRevAppTitle(),
                "",

                getCheckRevAppJobScriptBody(),
                "",

                getCheckRevAppReadMeRawText(),
                "",
                "",

                getCheckRevAppReadMeRichText(),
                "",
                "",

                "",
                "",

                getCheckRevAppJobName(),
                "",
                getAppJobCheckRevScriptOutput(),

                ""
        );
    }

    public static AppProfile getCheckTimeZoneProfile() {
        return new AppProfile(
                getTimeZoneAppName(),
                "",

                getTimeZoneAppTitle(),
                "",

                "",
                "",

                "",
                "",
                "",

                "",
                "",
                "",

                "",
                "",

                getCheckRevAppJobName(),
                "",
                "",

                ""
        );
    }

    public static AppProfile getMainProfile() {
        return mainProfile;
    }

    public static final String DEFAULT_TIME_ZONE = "GMT";

    static final String CREATE_APP_NAME_PREFIX = "autotest_app_name_";

    static final String CREATE_APP_TITLE_PREFIX = "autotest_app_title_";

    static final String CREATE_APP_NAME_FOR_JOB_PREFIX = "job_run_app_name_";

    static final String CREATE_APP_TITLE_FOR_JOB_PREFIX = "job_run_app_title_";

    static final String CREATE_APP_JOB_NAME_PREFIX = "autotest_app_job_";

    static final String CREATE_APP_SCRIPT_BODY_PREFIX_1 = "echo ";

    static final String CREATE_APP_SCRIPT_BODY_PART1 = "emit ";

    static final String CREATE_APP_PREFIX_CHECK_REV = "check rev ";

    public static final String CREATE_APP_SCRIPT_BODY_PREFIX_2 = "auto__";

    public static final String EDIT_APP_README_RAW_PREFIX = "# __Auto__ *readme* app ";

    public static final String EDIT_APP_README_RICH_PREFIX = "Auto readme app ";

    public static final String EDIT_APP_COMMENT_PREFIX = "Auto test app comment ";

    //--------------------------

    public static final String getCheckRevAppName() {
        return CREATE_APP_PREFIX_CHECK_REV + CREATE_APP_NAME_PREFIX + getTestRunUniqueFinalValue();
    }

    public static final String getCheckRevAppTitle() {
        return CREATE_APP_PREFIX_CHECK_REV + CREATE_APP_TITLE_PREFIX + getTestRunUniqueFinalValue();
    }

    public static final String getCheckRevAppJobScriptBody() {
        return CREATE_APP_SCRIPT_BODY_PREFIX_1 + getAppJobCheckRevScriptOutput();
    }

    public static final String getAppJobCheckRevScriptOutput() {
        return CREATE_APP_SCRIPT_BODY_PREFIX_2 + getTestRunUniqueFinalValue() + "check_rev";
    }

    public static final String getCheckRevAppReadMeRawText() {
        return EDIT_APP_README_RAW_PREFIX + getTestRunUniqueFinalValue() + "check_rev";
    }

    public static final String getCheckRevAppReadMeRichText() {
        return EDIT_APP_README_RICH_PREFIX + getTestRunUniqueFinalValue() + "check_rev";
    }

    public static final String getCheckRevAppJobName() {
        return CREATE_APP_PREFIX_CHECK_REV + CREATE_APP_JOB_NAME_PREFIX + getTestRunUniqueFinalValue();
    }

    public static final String getCheckRevAppExpJobOutput() {
        return getAppJobCheckRevScriptOutput();
    }

    //--------------------------

    public static final String getAppJobScriptExpectedOutput() {
        return getTestRunUniqueFinalValue();
    }

    public static final String getMainAppJobScriptBody() {
        return CREATE_APP_SCRIPT_BODY_PART1 + getOutputNameFieldName() + " " + getAppJobScriptExpectedOutput();
    }

    public static final String getMainAppJobName() {
        return CREATE_APP_JOB_NAME_PREFIX + getTestRunUniqueFinalValue();
    }

    public static final String getMainAppName() {
        return CREATE_APP_NAME_PREFIX + getTestRunUniqueFinalValue();
    }

    public static final String getMainAppTitle() {
        return CREATE_APP_TITLE_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getMainAppReadMeRawText() {
        return EDIT_APP_README_RAW_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getMainAppReadMeRichText() {
        return EDIT_APP_README_RICH_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getMainAppExpJobOutput() {
        return getAppJobScriptExpectedOutput();
    }

    public static String getAppCommentText() {
        return EDIT_APP_COMMENT_PREFIX + getTestRunUniqueFinalValue();
    }

    public static final String getAppForJobName() {
        return CREATE_APP_NAME_FOR_JOB_PREFIX + getTestRunUniqueFinalValue();
    }

    public static final String getAppForJobTitle() {
        return CREATE_APP_TITLE_FOR_JOB_PREFIX + getTestRunUniqueFinalValue();
    }

    // ---------------------

    public static final String getTimeZoneAppName() {
        return CREATE_APP_NAME_PREFIX + " " + getRunTimeLocalUniqueValue() + " " + TestRunData.getCurrentTimezone();
    }

    public static final String getTimeZoneAppTitle() {
        return CREATE_APP_TITLE_PREFIX + " " + getRunTimeLocalUniqueValue() + " " + TestRunData.getCurrentTimezone();
    }
}
