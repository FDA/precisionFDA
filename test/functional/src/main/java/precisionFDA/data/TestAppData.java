package precisionFDA.data;

import precisionFDA.model.AppProfile;

import static precisionFDA.data.TestChallsData.getTestChallAppOutputFileFieldName1;
import static precisionFDA.data.TestChallsData.getTestChallAppOutputFileFieldName2;
import static precisionFDA.data.TestChallsData.getTestChallAppOutputStrFieldName1;
import static precisionFDA.data.TestRunData.getDebugLogFolder;
import static precisionFDA.data.TestRunData.getOutputNameFieldName;
import static precisionFDA.data.TestRunData.getTestRunUniqueFinalValue;
import static precisionFDA.utils.Utils.getRunTimeLocalUniqueValue;

public class TestAppData {

    public static final String DEFAULT_TIME_ZONE = "GMT";

    static final String CREATE_APP_NAME_PREFIX = "autotest_app_name_";

    static final String CREATE_APP_TITLE_PREFIX = "autotest_app_title_";

    static final String CREATE_APP_NAME_FOR_JOB_PREFIX = "job_run_app_name_";

    static final String CREATE_APP_TITLE_FOR_JOB_PREFIX = "job_run_app_title_";

    static final String CREATE_APP_JOB_NAME_PREFIX = "autotest_app_job_";

    static final String CREATE_APP_SCRIPT_BODY_PREFIX_1 = "echo ";

    static final String CREATE_APP_SCRIPT_BODY_PART1 = "emit ";

    static final String CREATE_APP_PREFIX_CHECK_REV = "check rev ";

    static final String CREATE_APP_SCRIPT_BODY_PREFIX_2 = "auto__";

    static final String EDIT_APP_README_RAW_PREFIX = "# __Auto__ *readme* app ";

    static final String EDIT_APP_README_RICH_PREFIX = "Auto readme app ";

    static final String EDIT_APP_COMMENT_PREFIX = "Auto test app comment ";

    static final String CREATE_APP_CHALL_NAME_PREFIX = "at_challenge_test_name_";

    static final String CREATE_APP_CHALL_TITLE_PREFIX = "at_challenge_test_title_";

    static final String CREATE_APP_JOB_CHALL_NAME_PREFIX = "at_job_challenge_test_";

    static String CREATE_CHALL_APP_SCRIPT_BODY =
            "emit " + getTestChallAppOutputStrFieldName1() + " 'foo bar str 1'\n" +
            "echo 'some test text 1' > output_file1.txt\n" +
            "echo 'some test text 2' > output_file2.txt\n" +
            "emit " + getTestChallAppOutputFileFieldName1() + " output_file1.txt\n" +
            "emit " + getTestChallAppOutputFileFieldName2() + " output_file2.txt";

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

    public static final String getMainAppReadMeRawText() {
        return EDIT_APP_README_RAW_PREFIX + getTestRunUniqueFinalValue();
    }

    public static final String getMainAppReadMeRichText() {
        return EDIT_APP_README_RICH_PREFIX + getTestRunUniqueFinalValue();
    }

    public static final String getMainAppExpJobOutput() {
        return getAppJobScriptExpectedOutput();
    }

    public static final String getAppCommentText() {
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

    // ---------------------

    public static final String getChallAppName() {
        return CREATE_APP_CHALL_NAME_PREFIX + getTestRunUniqueFinalValue();
    }

    public static final String getChallAppTitle() {
        return CREATE_APP_CHALL_TITLE_PREFIX + getTestRunUniqueFinalValue();
    }

    public static final String getChallAppJobName() {
        return CREATE_APP_JOB_CHALL_NAME_PREFIX + getTestRunUniqueFinalValue();
    }

    public static final String getChallAppJobScriptBody() {
        return CREATE_CHALL_APP_SCRIPT_BODY;
    }

    // ---------------------
    // ---------------------

    public static AppProfile mainAppProfile = new AppProfile(
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

    public static AppProfile challAppProfile = new AppProfile(
            getChallAppName(),
            "",

            getChallAppTitle(),
            "",

            getChallAppJobScriptBody(),
            "",

            "",
            "",
            "",

            "",
            "",
            "",

            "",
            "",

            getChallAppJobName(),
            "",
            "",

            ""
    );

    public static AppProfile runJobAppProfile = new AppProfile(
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

    public static AppProfile getCheckRevisionAppProfile() {
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

    public static AppProfile getCheckTimeZoneAppProfile() {
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

    public static AppProfile getMainAppProfile() {
        return mainAppProfile;
    }

    public static AppProfile getRunJobAppProfile() {
        return runJobAppProfile;
    }

    public static AppProfile getChallAppProfile() {
        return challAppProfile;
    }


}
