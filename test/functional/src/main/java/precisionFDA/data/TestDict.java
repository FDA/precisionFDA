package precisionFDA.data;

public class TestDict {

    public static final String DICT_STRING = "STRING";

    public static final String TRUE_RESULT = "true";

    public static final String CASE_STATUS_PASSED = "passed";

    public static final String CASE_STATUS_FAILED = "failed";

    public static final String DICT_PRIVATE = "Private";

    public static final String DICT_MY_FILES = "My files";

    public static final String DICT_COMMON_FILTER_PHRASE = "filter";

    public static final String DICT_1ST_FILTER_PHRASE = DICT_COMMON_FILTER_PHRASE + "#1";

    public static final String DICT_2ND_FILTER_PHRASE = DICT_COMMON_FILTER_PHRASE + "#2";

    public static String getDictString() {
        return DICT_STRING;
    }

    public static String getTrueResult() {
        return TRUE_RESULT;
    }

    public static String getCaseStatusPassed() {
        return CASE_STATUS_PASSED;
    }

    public static String getCaseStatusFailed() {
        return CASE_STATUS_FAILED;
    }

    public static String getDictPrivate() { return DICT_PRIVATE; }

    public static String getDictMyFiles() {
        return DICT_MY_FILES;
    }

    public static String getDictFirstFilterPhrase() {
        return DICT_1ST_FILTER_PHRASE;
    }

    public static String getDictSecondFilterPhrase() {
        return DICT_2ND_FILTER_PHRASE;
    }

    public static String getDictCommonFilterPhrase() {
        return DICT_COMMON_FILTER_PHRASE;
    }

}
