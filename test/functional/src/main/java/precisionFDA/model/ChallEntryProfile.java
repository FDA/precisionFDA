package precisionFDA.model;

public class ChallEntryProfile {

    private String entryName;

    private String entryDescr;

    public ChallEntryProfile(final String entryName,
                             final String entryDescr) {
        this.entryName = entryName;
        this.entryDescr = entryDescr;
    }

    public String getEntryName() {
        return entryName;
    }

    public String getEntryDescr() {
        return entryDescr;
    }
}