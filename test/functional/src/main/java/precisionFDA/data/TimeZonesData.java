package precisionFDA.data;

import precisionFDA.model.TimeZoneProfile;

import java.util.TimeZone;

public class TimeZonesData {

    public static TimeZoneProfile moscowTimeZone = new TimeZoneProfile(
            "GMT+3",
            "Moscow",
            "(GMT+03:00) Moscow",
            "MSK"
    );

    public static TimeZoneProfile pacificTimeZone = new TimeZoneProfile(
            "GMT-8",
            "Pacific Time (US & Canada)",
            "(GMT-08:00) Pacific Time (US & Canada)",
            "PST"
    );

    public static TimeZoneProfile chathamTimeZone = new TimeZoneProfile(
            "GMT+13:45",
            "Chatham Is.",
            "(GMT+13:45) Chatham Is.",
            "CHADT"
    );

    public static TimeZoneProfile utcTimeZone = new TimeZoneProfile(
            "GMT",
            "UTC",
            "(GMT+00:00) UTC",
            "UTC"
    );

    public static TimeZoneProfile getMoscowTimeZone() {
        return moscowTimeZone;
    }

    public static TimeZoneProfile getChathamTimeZone() { return chathamTimeZone; }

    public static TimeZoneProfile getPacificTimeZone() { return pacificTimeZone; }

    public static TimeZoneProfile getUtcTimeZone() { return utcTimeZone; }

}
