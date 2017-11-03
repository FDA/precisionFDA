package staging.utils;

import org.apache.log4j.Logger;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

import static staging.data.TestDict.getTrueResult;
import static staging.data.TestRunData.getTestPngTemplateFileName;
import static staging.data.TestRunData.getTestTextTemplateFileName;

public class Utils {

    public static String getCurrentDateTimeUTCValue() {
        Date d = new Date();
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        dateFormat.setTimeZone(TimeZone.getTimeZone("GMT"));
        String date = dateFormat.format(d);
        return date;
    }

    public static String getCurrentDateTimeValue(String timeZone) {
        Date d = new Date();
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        dateFormat.setTimeZone(TimeZone.getTimeZone(timeZone));
        String date = dateFormat.format(d);
        return date;
    }

    public static String getRunTimeLocalUniqueValue() {
        Date d = new Date();
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd_MM_HHmmssSSS");
        String salt = dateFormat.format(d);
        return salt;
    }

    public static String applyTimezoneToDate(String dateString, String timezoneOfTheDate, String desiredTimezone) {
        Logger log = Logger.getLogger("INFO");

        SimpleDateFormat dateFormatOld = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        dateFormatOld.setTimeZone(TimeZone.getTimeZone(timezoneOfTheDate));

        SimpleDateFormat dateFormatNew = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        dateFormatNew.setTimeZone(TimeZone.getTimeZone(desiredTimezone));

        Date oldDate;
        String newDateString = "";
        try {
            oldDate = dateFormatOld.parse(dateString);
            newDateString = dateFormatNew.format(oldDate);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        log.info("date was converted from [" + dateString + "] to [" + newDateString + "]");
        return newDateString;
    }

    public static String getTimeStamp() {
        Date d = new Date();
        SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm:ss");
        String stamp = "[" + dateFormat.format(d) + "]";
        return stamp;
    }

    public static void createFolder(String folderPath) {
        Logger log = Logger.getLogger("INFO");
        File file = new File(folderPath);
        if (!file.exists()) {
            file.mkdir();
            log.info("folder created: " + folderPath);
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

    public static void takeScreenshot(String filePath, WebDriver driver) {
        File scrFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
        try {
            org.apache.commons.io.FileUtils.copyFile(scrFile, new File(filePath));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static String getPageSource(WebDriver driver) {
        return driver.getPageSource();
    }

    public static boolean doesContain(String whereString, String whatString) {
        if (whereString.contains(whatString)) {
            return true;
        }
        else {
            final Logger log = Logger.getLogger("TEST");
            log.info("[" + whereString + "] does not contain [" + whatString + "]");
            return false;
        }
    }

    public static boolean areTheyEqual(String actualString, String expectedString) {
        if (actualString.equals(expectedString)) {
            return true;
        }
        else {
            final Logger log = Logger.getLogger("TEST");
            log.info("expected is [" + expectedString + "] but actual is [" + actualString + "]");
            return false;
        }
    }

    public static long getDifferenceBetweenDateTime(String dateTime1, String dateTime2) {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

        Date d1 = null;
        Date d2 = null;
        long diffSec = 999;

        try {
            d1 = format.parse(dateTime1);
            d2 = format.parse(dateTime2);
            long diffMsec = d2.getTime() - d1.getTime();
            diffSec = Math.abs(diffMsec/1000);
        } catch (Exception e) {
            e.printStackTrace();
            diffSec = 1000;
        }
        return diffSec;
    }

    public static String isDateTimeCorrect(String actTime, String expTime) {
        final Logger log = Logger.getLogger("");
        long possibleDelta = 10;
        String textResult = "";
        Long delta = Utils.getDifferenceBetweenDateTime(actTime, expTime);
        if (delta <= possibleDelta) {
            textResult = getTrueResult();
        }
        else {
            textResult = "Too big difference between displayed [" + actTime + "] and expected [" + expTime + "] | delta is: " + delta + " seconds";
            log.error(textResult);
        }
        return textResult;
    }

    public static String getGeneratedTestFileName(String type) {
        final Logger log = Logger.getLogger("");
        String commonPart = getRunTimeLocalUniqueValue();
        String testFilesPath = System.getProperty("user.dir") + SettingsProperties.getProperty("pathToTestFiles");
        String tempFilesPath = System.getProperty("user.dir") + SettingsProperties.getProperty("pathToTempFiles");
        String newFileName = commonPart;
        String templateFileName = "";

        if (type.equals("txt")) {
            newFileName = "textFile_" + commonPart + ".txt";
            templateFileName = getTestTextTemplateFileName();
        }

        if (type.equals("png")) {
            newFileName = "pngFile_" + commonPart + ".png";
            templateFileName = getTestPngTemplateFileName();
        }

        InputStream oInStream = null;
        OutputStream oOutStream = null;

        try {
            oInStream = new FileInputStream(testFilesPath + templateFileName);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        try {
            oOutStream = new FileOutputStream(tempFilesPath + newFileName);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }

        byte[] oBytes = new byte[1024];
        int nLength;
        BufferedInputStream oBuffInputStream = new BufferedInputStream( oInStream );
        try {
            while ((nLength = oBuffInputStream.read(oBytes)) > 0)
            {
                oOutStream.write(oBytes, 0, nLength);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        try {
            oInStream.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        try {
            oOutStream.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        log.info("created file: " + newFileName);
        return newFileName;
    }

    public static void deleteTempFiles() {
        deleteFilesByExt(".txt");
        deleteFilesByExt(".png");
    }

    public static void deleteFilesByExt(String ext) {
        GenericExtFilter filter = new GenericExtFilter(ext);
        String stringFileDir = System.getProperty("user.dir") + SettingsProperties.getProperty("pathToTempFiles");
        File fileDir = new File(stringFileDir);

        //list out all the file name with .txt extension
        String[] list = fileDir.list(filter);

        if (list.length == 0) return;

        File fileDelete;

        for (String file : list){
            String temp = new StringBuffer(stringFileDir)
                    .append(File.separator)
                    .append(file).toString();
            fileDelete = new File(temp);
            fileDelete.delete();
        }
    }

    public static class GenericExtFilter implements FilenameFilter {

        private String ext;

        public GenericExtFilter(String ext) {
            this.ext = ext;
        }

        public boolean accept(File dir, String name) {
            return (name.endsWith(ext));
        }
    }

}
