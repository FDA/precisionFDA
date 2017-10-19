package staging.utils;

import org.apache.log4j.Logger;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

public class Utils {

    private final Logger log = Logger.getLogger(this.getClass());

    public static String getCurrentDateTimeUTCValue() {
        Date d = new Date();
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        dateFormat.setTimeZone(TimeZone.getTimeZone("GMT"));
        String date = dateFormat.format(d);
        return date;
    }

    public static String getFileNameUniqueValue() {
        Date d = new Date();
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd_MM_HHmmssS");
        String salt = dateFormat.format(d);
        return salt;
    }

    public static String getTimeStamp() {
        Date d = new Date();
        SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm:ss");
        String stamp = "[" + dateFormat.format(d) + "]";
        return stamp;
    }

    public static void createFolder(String folderPath) {
        File file = new File(folderPath);
        if (!file.exists()) {
            file.mkdir();
        }
    }

    public static void createFile(String folderPath, String content) throws IOException {
        File file = new File(folderPath);
        file.createNewFile();
        FileWriter fw = new FileWriter(file.getAbsoluteFile());
        BufferedWriter bw = new BufferedWriter(fw);
        bw.write(content);
        bw.close();
    }

    public static boolean contains(String whereString, String whatString) {
        Logger log = Logger.getLogger("TEST");
        if (whereString.contains(whatString)) {
            return true;
        }
        else {
            log.info("[" + whereString + "] does not contain [" + whatString + "]");
            return false;
        }
    }

    public static boolean equals(String actualString, String expectedString) {
        Logger log = Logger.getLogger("TEST");
        if (actualString.equals(expectedString)) {
            return true;
        }
        else {
            log.info("expected is [" + expectedString + "] but actual is [" + actualString + "]");
            return false;
        }
    }

}
