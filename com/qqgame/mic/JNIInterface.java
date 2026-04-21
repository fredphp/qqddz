package com.qqgame.mic;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.database.Cursor;
import android.database.SQLException;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.telephony.TelephonyManager;
import android.util.Log;
import java.text.DecimalFormat;
import java.util.Random;

public class JNIInterface
{
  private static final int APNTYPE_CMNET = 2;
  private static final int APNTYPE_CMWAP = 4;
  private static final int APNTYPE_CMWIFI = 1024;
  private static final int APNTYPE_CTNET = 256;
  private static final int APNTYPE_CTWAP = 512;
  private static final int APNTYPE_CTWIFI = 4096;
  private static final int APNTYPE_DEFAULT = 1;
  private static final int APNTYPE_HKWIFI = 32768;
  private static final int APNTYPE_NET = 64;
  private static final int APNTYPE_UNI3GNET = 8192;
  private static final int APNTYPE_UNI3GWAP = 16384;
  private static final int APNTYPE_UNINET = 16;
  private static final int APNTYPE_UNIWAP = 32;
  private static final int APNTYPE_UNIWIFI = 2048;
  private static final int APNTYPE_UNKNOWN = 0;
  private static final int APNTYPE_WAP = 128;
  private static final int APNTYPE_WIFI = 8;
  public static final String APN_PROP_PROXY = "proxy";
  private static Uri APN_URI = Uri.parse("content://telephony/carriers");
  static final String First_Start_From_Downloader = "First_Start_From_Downloader";
  public static final String GAME_NOTIFICATION_ACTION = "com.qqgame.gamenotification";
  private static Uri PREFERRED_APN_URI = Uri.parse("content://telephony/carriers/preferapn");
  public static final String QUIT_ID = "QUIT_ID";
  public static boolean isFirst_Start_From_Downloader = false;
  public byte[] A8;
  public byte[] MB_D3_GTKEY_ST;
  public byte[] MB_D3_ST;
  public byte[] MB_ENCRYPT_A8_AUTH;
  public byte[] MB_ENCRYPT_D3_AUTH;
  public byte[] PC_D3_GTKEY_ST;
  public byte[] PC_D3_ST;
  public String SID;
  public long mAccount;
  Activity mActivity;
  public byte[] mMd5Pwd = null;
  public boolean mStartedFromHall = false;

  public JNIInterface(Activity paramActivity)
  {
    this.mActivity = paramActivity;
    this.mStartedFromHall = this.mActivity.getIntent().getBooleanExtra("KEY_START_FROM_HALL", false);
    Log.i("hlddz", "mStartedFromHall=" + this.mStartedFromHall);
    if (this.mStartedFromHall)
    {
      this.mAccount = this.mActivity.getIntent().getLongExtra("KEY_CURACCOUNT", 0L);
      this.mMd5Pwd = this.mActivity.getIntent().getByteArrayExtra("KEY_CUR_PWD");
      String str = "";
      if (this.mMd5Pwd != null)
        str = new String(this.mMd5Pwd);
      Log.i("hlddz", "mAccount=" + this.mAccount + " strMd5Pwd=" + str + " mMd5Pwd=" + this.mMd5Pwd);
      this.SID = this.mActivity.getIntent().getStringExtra("sid");
      this.A8 = this.mActivity.getIntent().getByteArrayExtra("a8");
      this.PC_D3_GTKEY_ST = this.mActivity.getIntent().getByteArrayExtra("d3_gtkey_st");
      Log.i("hlddz", "PC_D3_GTKEY_ST=" + this.PC_D3_GTKEY_ST);
      this.PC_D3_ST = this.mActivity.getIntent().getByteArrayExtra("d3_st");
      Log.i("hlddz", "PC_D3_ST=" + this.PC_D3_ST);
      this.MB_D3_GTKEY_ST = this.mActivity.getIntent().getByteArrayExtra("d3a_gtkey_st");
      Log.i("hlddz", "MB_D3_GTKEY_ST=" + this.MB_D3_GTKEY_ST);
      this.MB_D3_ST = this.mActivity.getIntent().getByteArrayExtra("d3a_st");
      Log.i("hlddz", "MB_D3_ST=" + this.MB_D3_ST);
      this.MB_ENCRYPT_A8_AUTH = this.mActivity.getIntent().getByteArrayExtra("encrypt_auth");
      Log.i("hlddz", "MB_ENCRYPT_A8_AUTH=" + this.MB_ENCRYPT_A8_AUTH);
      this.MB_ENCRYPT_D3_AUTH = this.mActivity.getIntent().getByteArrayExtra("encrypt_d3_auth");
      Log.i("hlddz", "MB_ENCRYPT_D3_AUTH=" + this.MB_ENCRYPT_D3_AUTH);
    }
  }

  public long getAccount()
  {
    return this.mAccount;
  }

  public String getApnProxy()
  {
    Cursor localCursor = this.mActivity.getContentResolver().query(PREFERRED_APN_URI, null, null, null, null);
    localCursor.moveToFirst();
    if (localCursor.isAfterLast())
      return null;
    return localCursor.getString(localCursor.getColumnIndex("proxy"));
  }

  public int getApnType()
  {
    try
    {
      NetworkInfo localNetworkInfo = ((ConnectivityManager)this.mActivity.getSystemService("connectivity")).getActiveNetworkInfo();
      if (localNetworkInfo == null)
        return 0;
      if (localNetworkInfo.getTypeName().toUpperCase().equals("WIFI"))
        return 8;
      String str1 = localNetworkInfo.getExtraInfo().toLowerCase();
      if (str1.startsWith("cmwap"))
        return 4;
      if ((str1.startsWith("cmnet")) || (str1.startsWith("epc.tmobile.com")))
        break label233;
      if (str1.startsWith("uniwap"))
        return 32;
      if (str1.startsWith("uninet"))
        return 16;
      if (str1.startsWith("wap"))
        return 128;
      if (str1.startsWith("net"))
        return 64;
      if (str1.startsWith("#777"))
      {
        String str2 = getApnProxy();
        if ((str2 == null) || (str2.length() <= 0))
          break label235;
        return 512;
      }
      if (str1.startsWith("ctwap"))
        return 512;
      if (str1.startsWith("ctnet"))
        return 256;
      if (str1.startsWith("3gwap"))
        return 16384;
      boolean bool = str1.startsWith("3gnet");
      if (bool)
        return 8192;
    }
    catch (Exception localException)
    {
    }
    return 0;
    label233: return 2;
    label235: return 256;
  }

  public byte[] getByteArray(int paramInt)
  {
    switch (paramInt)
    {
    default:
      return null;
    case 0:
      return this.A8;
    case 1:
      return this.PC_D3_GTKEY_ST;
    case 2:
      return this.PC_D3_ST;
    case 3:
      return this.MB_D3_GTKEY_ST;
    case 4:
      return this.MB_D3_ST;
    case 5:
      return this.MB_ENCRYPT_A8_AUTH;
    case 6:
    }
    return this.MB_ENCRYPT_D3_AUTH;
  }

  public String getDeviceIMEI()
  {
    StringBuffer localStringBuffer = new StringBuffer("");
    TelephonyManager localTelephonyManager = (TelephonyManager)this.mActivity.getSystemService("phone");
    if (localTelephonyManager != null)
    {
      String str = localTelephonyManager.getDeviceId();
      if (str != null)
        localStringBuffer.append(str);
    }
    if (localStringBuffer.equals(""))
    {
      Random localRandom = new Random(System.currentTimeMillis());
      localStringBuffer.append(String.valueOf(new DecimalFormat("0").format(Math.abs((float)localRandom.nextLong() % 1.0E+016F))));
      for (int i = localStringBuffer.length(); i < 16; i++)
        localStringBuffer.insert(0, '0');
    }
    return localStringBuffer.toString();
  }

  public String getDeviceIMSI()
  {
    StringBuffer localStringBuffer = new StringBuffer("");
    TelephonyManager localTelephonyManager = (TelephonyManager)this.mActivity.getSystemService("phone");
    if (localTelephonyManager != null)
    {
      String str = localTelephonyManager.getSubscriberId();
      if (str != null)
        localStringBuffer.append(str);
    }
    if (localStringBuffer.equals(""))
    {
      Random localRandom = new Random(System.currentTimeMillis());
      localStringBuffer.append(String.valueOf(new DecimalFormat("0").format(Math.abs((float)localRandom.nextLong() % 1.0E+016F))));
      for (int i = localStringBuffer.length(); i < 16; i++)
        localStringBuffer.insert(0, '0');
    }
    return localStringBuffer.toString();
  }

  public byte[] getMbEncryptData()
  {
    return this.MB_ENCRYPT_D3_AUTH;
  }

  public byte[] getMbSt()
  {
    return this.MB_D3_ST;
  }

  public byte[] getMd5Pwd()
  {
    return this.mMd5Pwd;
  }

  public boolean isStartedFromHall()
  {
    return this.mStartedFromHall;
  }

  public void notifyDownloaderQuit()
  {
    Intent localIntent = new Intent("com.qqgame.gamenotification");
    localIntent.putExtra("QUIT_ID", 1);
    this.mActivity.sendBroadcast(localIntent);
    Log.i("hlddz", "notifyDownloaderQuit=" + localIntent);
  }

  public void notifyHallLoginSuc()
  {
    if ((this.mStartedFromHall) && (this.mAccount != 0L) && (this.mMd5Pwd != null) && (this.mMd5Pwd.length > 0))
    {
      Intent localIntent = new Intent("com.tencent.qqgame.gamenotification");
      localIntent.putExtra("KEY_ID", 1);
      localIntent.putExtra("KEY_LOGIN_ACCOUNT", this.mAccount);
      localIntent.putExtra("KEY_LOGIN_PWD", this.mMd5Pwd);
      localIntent.putExtra("KEY_SAVE_PWD", true);
      localIntent.putExtra("KEY_AUTO_LOGIN", true);
      this.mActivity.sendBroadcast(localIntent);
      Log.i("hlddz", "notifyHallLoginSuc:sendBroadcast=" + localIntent);
    }
  }

  public void notifyHallStartSuc()
  {
    Intent localIntent = new Intent("com.tencent.qqgame.gamenotification");
    localIntent.putExtra("KEY_ID", 3);
    localIntent.putExtra("KEY_GAME_ID", 105);
    this.mActivity.sendBroadcast(localIntent);
    Log.i("hlddz", "notifyHallStartSuc:sendBroadcast=" + localIntent);
  }

  public boolean setApnType(int paramInt)
  {
    String str1 = null;
    switch (paramInt)
    {
    default:
    case 2:
    case 4:
    case 16:
    case 32:
    case 256:
    case 512:
    case 8192:
    case 16384:
    }
    while (true)
    {
      Cursor localCursor;
      if (str1 != null)
        localCursor = null;
      try
      {
        ContentResolver localContentResolver = this.mActivity.getContentResolver();
        Uri localUri = APN_URI;
        String[] arrayOfString = new String[1];
        arrayOfString[0] = str1.toLowerCase();
        localCursor = localContentResolver.query(localUri, null, " apn = ? and current = 1", arrayOfString, null);
        String str2 = null;
        if (localCursor != null)
        {
          boolean bool = localCursor.moveToFirst();
          str2 = null;
          if (bool)
            str2 = localCursor.getString(localCursor.getColumnIndex("_id"));
        }
        localCursor.close();
        if (str2 != null)
        {
          ContentValues localContentValues = new ContentValues();
          localContentValues.put("apn_id", str2);
          int i = localContentResolver.update(PREFERRED_APN_URI, localContentValues, null, null);
          if (i > 0)
          {
            return true;
            str1 = "cmnet";
            continue;
            str1 = "cmwap";
            continue;
            str1 = "uninet";
            continue;
            str1 = "uniwap";
            continue;
            str1 = "ctnet";
            continue;
            str1 = "ctwap";
            continue;
            str1 = "3gnet";
            continue;
            str1 = "3gwap";
            continue;
          }
        }
        return false;
      }
      catch (SQLException localSQLException)
      {
        while (true)
          if (localCursor != null)
            localCursor.close();
      }
      finally
      {
        if (localCursor != null)
          localCursor.close();
      }
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.qqgame.mic.JNIInterface
 * JD-Core Version:    0.6.2
 */