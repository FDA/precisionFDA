package precisionFDA.data;

import precisionFDA.model.ChallEntryProfile;
import static precisionFDA.utils.Utils.getRunTimeLocalUniqueValue;

public class TestNewChallEntryData {

    static final String MAIN_ENTRY_NAME_PREFIX = "AT entry ";

    static final String MAIN_ENTRY_DESCR_PREFIX = "AT description ";

    static final String SECOND_ENTRY_NAME_PREFIX = "AT second entry ";

    static final String SECOND_ENTRY_DESCR_PREFIX = "AT second description ";

    static final String getMainEntryName() {
        return MAIN_ENTRY_NAME_PREFIX + getRunTimeLocalUniqueValue();
    }

    static final String getMainEntryDescr() {
        return MAIN_ENTRY_DESCR_PREFIX + getRunTimeLocalUniqueValue();
    }

    static final String getSecondEntryName() {
        return SECOND_ENTRY_NAME_PREFIX + getRunTimeLocalUniqueValue();
    }

    static final String getSecondEntryDescr() {
        return SECOND_ENTRY_DESCR_PREFIX + getRunTimeLocalUniqueValue();
    }

    public static ChallEntryProfile mainChallEntryProfile = new ChallEntryProfile(
            getMainEntryName(),
            getMainEntryDescr()
    );

    public static ChallEntryProfile getMainChallEntryProfile() {
        return mainChallEntryProfile;
    }

    public static ChallEntryProfile secondChallEntryProfile = new ChallEntryProfile(
            getSecondEntryName(),
            getSecondEntryDescr()
    );

    public static ChallEntryProfile getSecondChallEntryProfile() {
        return secondChallEntryProfile;
    }

}
