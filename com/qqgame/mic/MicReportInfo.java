package com.qqgame.mic;

import android.app.Activity;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Build.VERSION;
import android.os.Bundle;
import android.os.Environment;
import android.telephony.TelephonyManager;
import android.util.Log;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;

public class MicReportInfo
{
  static int Channel = 0;
  static String ChannelFile;
  private static final int E_REPORTINFO_NETTYPE_CHINAMOBILE = 3;
  private static final int E_REPORTINFO_NETTYPE_CHINATELECOM = 4;
  private static final int E_REPORTINFO_NETTYPE_CHINAUNICOM = 2;
  private static final int E_REPORTINFO_NETTYPE_UNKNOWN = 0;
  private static final int E_REPORTINFO_NETTYPE_WIFI = 1;
  static String tag = "hlddz";

  public static int getChannel(Context paramContext)
  {
    Channel = 0;
    try
    {
      Object localObject = paramContext.getPackageManager().getApplicationInfo(paramContext.getPackageName(), 128).metaData.get("CHANNEL");
      if (localObject != null);
      try
      {
        Channel = Integer.parseInt(localObject.toString());
        return Channel;
      }
      catch (Exception localException2)
      {
        return 0;
      }
    }
    catch (Exception localException1)
    {
      while (true)
        Channel = 0;
    }
  }

  public static void getChannelFile()
  {
    String str = getSDPath() + "/Tencent/QQGame/hlddz/";
    Log.i(tag, "filePath:" + str);
    File localFile = new File(str);
    if (!localFile.exists())
    {
      Log.i(tag, "channelfile:" + localFile + "mkdirs");
      localFile.mkdirs();
    }
    ChannelFile = str + "Channelid";
    Log.i(tag, "ChannelFile:" + ChannelFile);
  }

  public static int getNetworkType(Activity paramActivity)
  {
    if (paramActivity == null);
    String str;
    do
    {
      do
      {
        Context localContext;
        NetworkInfo localNetworkInfo;
        do
        {
          do
          {
            return 0;
            localContext = paramActivity.getApplicationContext();
            localNetworkInfo = ((ConnectivityManager)localContext.getSystemService("connectivity")).getActiveNetworkInfo();
          }
          while (localNetworkInfo == null);
          if (localNetworkInfo.getType() == 1)
            return 1;
        }
        while (localNetworkInfo.getType() != 0);
        str = ((TelephonyManager)localContext.getSystemService("phone")).getSubscriberId();
      }
      while (str == null);
      if ((str.startsWith("46000")) || (str.startsWith("46002")) || (str.startsWith("46007")))
        return 3;
      if (str.startsWith("46001"))
        return 2;
    }
    while (!str.startsWith("46003"));
    return 4;
  }

  public static String getSDPath()
  {
    Log.i(tag, "getSDPath :");
    if (Environment.getExternalStorageState().equals("mounted"))
    {
      File localFile = Environment.getExternalStorageDirectory();
      Log.i(tag, "sdDir :" + localFile.toString());
      return localFile.toString();
    }
    return "";
  }

  public static int getSystemVersion()
  {
    return Build.VERSION.SDK_INT;
  }

  public static void writeChannel()
  {
    Log.i(tag, "writeChannel");
    File localFile = new File(ChannelFile);
    if (localFile.exists())
    {
      Log.i(tag, "channelfile: delete");
      localFile.delete();
    }
    if (Environment.getExternalStorageState().equals("mounted"));
    try
    {
      FileWriter localFileWriter = new FileWriter(ChannelFile, true);
      BufferedWriter localBufferedWriter = new BufferedWriter(localFileWriter);
      localBufferedWriter.write(String.valueOf(Channel));
      localBufferedWriter.flush();
      localFileWriter.flush();
      localBufferedWriter.close();
      localFileWriter.close();
      Log.i(tag, "Channel:" + Channel);
      return;
    }
    catch (Exception localException)
    {
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.qqgame.mic.MicReportInfo
 * JD-Core Version:    0.6.2
 */