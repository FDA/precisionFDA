package precisionFDA.model;

public class TimeZoneProfile {

    private String zoneTime;

    private String location;

    private String timeAndLocation;

    private String codeOfLocation;

    public TimeZoneProfile(final String zoneTime,
                           final String location,
                           final String timeAndLocation,
                           final String codeOfLocation) {
        this.zoneTime = zoneTime;
        this.location = location;
        this.timeAndLocation = timeAndLocation;
        this.codeOfLocation = codeOfLocation;
    }

    public String getZoneTime() {
        return zoneTime;
    }

    public String getLocation() {
        return location;
    }

    public String getTimeAndLocation() {
        return timeAndLocation;
    }

    public String getCodeOfLocation() {
        return codeOfLocation;
    }
}


