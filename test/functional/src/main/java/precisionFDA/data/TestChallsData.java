package precisionFDA.data;

import precisionFDA.model.ChallProfile;
import precisionFDA.model.TimeZoneProfile;

import java.text.SimpleDateFormat;
import java.util.Date;

import static precisionFDA.data.TestDict.getDictDelimiterValue;
import static precisionFDA.data.TestDict.getDictSetup;
import static precisionFDA.utils.TestRunConfig.getTestImageHttpsUrl;
import static precisionFDA.data.TestCommonData.getText1000Symbols;
import static precisionFDA.utils.Utils.getRunTimeLocalUniqueValue;

public class TestChallsData {

    public static final String TEST_NEW_CHALL_NAME_PREFIX = "AT Challenge ";

    public static final String TEST_NEW_CHALL_DESCR_PREFIX = "AT Description ";

    public static final String TEST_NEW_CHALL_INFO_PREFIX = "AT Information ";

    public static final String TEST_NEW_CHALL_RESULTS_PREFIX = "AT Result ";

    public static final String TEST_CHALL_APP_INPUT_FILE_FIELD_NAME_1 = "in_file_1";

    public static final String TEST_CHALL_APP_INPUT_FILE_FIELD_NAME_2 = "in_file_2";

    public static final String TEST_CHALL_APP_OUTPUT_FILE_FIELD_NAME_1 = "out_file_1";

    public static final String TEST_CHALL_APP_OUTPUT_FILE_FIELD_NAME_2 = "out_file_2";

    public static final String TEST_CHALL_APP_OUTPUT_STR_FIELD_NAME_1 = "out_str_1";

    public static final String TEST_WF_APP_INPUT_FILE_FIELD_NAME_1 = "in_file_1";

    public static String getTestChallAppInputFileFieldName1() {
        return TEST_CHALL_APP_INPUT_FILE_FIELD_NAME_1;
    }

    public static String getTestWFAppInputFileFieldName1() {
        return TEST_WF_APP_INPUT_FILE_FIELD_NAME_1;
    }

    public static String getTestChallAppInputFileFieldName2() {
        return TEST_CHALL_APP_INPUT_FILE_FIELD_NAME_2;
    }

    public static String getTestChallAppOutputFileFieldName1() {
        return TEST_CHALL_APP_OUTPUT_FILE_FIELD_NAME_1;
    }

    public static String getTestChallAppOutputFileFieldName2() {
        return TEST_CHALL_APP_OUTPUT_FILE_FIELD_NAME_2;
    }

    public static String getTestChallAppOutputStrFieldName1() {
        return TEST_CHALL_APP_OUTPUT_STR_FIELD_NAME_1;
    }

    public static String getTestNewChallNamePrefix() {
        return TEST_NEW_CHALL_NAME_PREFIX;
    }

    public static String getTestNewChallDescrPrefix() {
        return TEST_NEW_CHALL_DESCR_PREFIX;
    }

    public static String getTestNewChallInfoPrefix() { return TEST_NEW_CHALL_INFO_PREFIX; }

    public static String getTestNewChallResultsPrefix() { return TEST_NEW_CHALL_RESULTS_PREFIX; }

    public static String getMainChallName() {
        return getTestNewChallNamePrefix() + getRunTimeLocalUniqueValue();
    }

    public static String getMainChallDescr() {
        return getRunTimeLocalUniqueValue() + getText1000Symbols();
    }

    public static String getMainChallScoringUser() {
        return TestUserData.getTestUserTwo().getApplUsername();
    }

    public static String getChallCardImage() {
        return getTestImageHttpsUrl();
    }

    public static String getMainChallInfo() {
        return getRunTimeLocalUniqueValue() + getText1000Symbols();
    }

    public static String getMainChallResults() {
        return getTestNewChallResultsPrefix() + getRunTimeLocalUniqueValue() + "1 " + getDictDelimiterValue() +
                getTestNewChallResultsPrefix() + getRunTimeLocalUniqueValue() + "2";
    }

    public static String getChallAtDateTime(int delayMin) {
        Date d = new Date(System.currentTimeMillis() + delayMin * 60 * 1000);
        // SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
        SimpleDateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy hh:mm a");
        String string = dateFormat.format(d);
        return string;
    }

    public static String getExpectedChallDateTimeValue(String initDateTime, TimeZoneProfile timeZone) {
        String[] init = initDateTime.split(" ");
        String time = init[1];

        if (init[2].toUpperCase().equalsIgnoreCase("PM")) {
            String[] timeArray = time.split(":");
            String hours = timeArray[0];
            hours = "" + (Integer.parseInt(hours) + 12);
            time = hours + ":" + timeArray[1] + ":" + timeArray[2];
        }

        return init[0] + " " + time + " " + timeZone.getCodeOfLocation();
    }

    public static ChallProfile mainChallProfile = new ChallProfile(
            getMainChallName(),
            getMainChallDescr(),
            getMainChallScoringUser(),
            1,
            4,
            "",
            "",
            getChallCardImage(),
            getDictSetup(),
            getMainChallInfo(),
            getMainChallResults()
    );

    public static ChallProfile getMainChallProfile() {
        return mainChallProfile;
    }



}
