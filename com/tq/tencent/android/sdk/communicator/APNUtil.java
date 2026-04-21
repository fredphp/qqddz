package com.tq.tencent.android.sdk.communicator;

import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.util.Log;

public class APNUtil
{
  public static final String ANP_NAME_CMNET = "cmnet";
  public static final String ANP_NAME_CMWAP = "cmwap";
  public static final String ANP_NAME_CTNET = "ctnet";
  public static final String ANP_NAME_CTWAP = "ctwap";
  public static final String ANP_NAME_NET = "net";
  public static final String ANP_NAME_NONE = "none";
  public static final String ANP_NAME_UNINET = "uninet";
  public static final String ANP_NAME_UNIWAP = "uniwap";
  public static final String ANP_NAME_WAP = "wap";
  public static final String ANP_NAME_WIFI = "wifi";
  public static final byte APNTYPE_3GNET = 11;
  public static final byte APNTYPE_3GWAP = 10;
  public static final byte APNTYPE_CMNET = 1;
  public static final byte APNTYPE_CMWAP = 2;
  public static final byte APNTYPE_CTNET = 8;
  public static final byte APNTYPE_CTWAP = 9;
  public static final byte APNTYPE_NET = 6;
  public static final byte APNTYPE_NONE = 0;
  public static final byte APNTYPE_UNINET = 4;
  public static final byte APNTYPE_UNIWAP = 5;
  public static final byte APNTYPE_WAP = 7;
  public static final byte APNTYPE_WIFI = 3;
  public static final String APN_PROP_APN = "apn";
  public static final String APN_PROP_PORT = "port";
  public static final String APN_PROP_PROXY = "proxy";
  public static final int JCE_APNTYPE_CMNET = 2;
  public static final int JCE_APNTYPE_CMWAP = 4;
  public static final int JCE_APNTYPE_CTNET = 256;
  public static final int JCE_APNTYPE_CTWAP = 512;
  public static final int JCE_APNTYPE_DEFAULT = 1;
  public static final int JCE_APNTYPE_NET = 64;
  public static final int JCE_APNTYPE_UNINET = 16;
  public static final int JCE_APNTYPE_UNIWAP = 32;
  public static final int JCE_APNTYPE_UNKNOWN = 0;
  public static final int JCE_APNTYPE_WAP = 128;
  public static final int JCE_APNTYPE_WIFI = 8;
  public static final int MPROXYTYPE_3GNET = 2048;
  public static final int MPROXYTYPE_3GWAP = 1024;
  public static final int MPROXYTYPE_CMNET = 4;
  public static final int MPROXYTYPE_CMWAP = 1;
  public static final int MPROXYTYPE_CTNET = 256;
  public static final int MPROXYTYPE_CTWAP = 512;
  public static final int MPROXYTYPE_DEFAULT = 128;
  public static final int MPROXYTYPE_NET = 32;
  public static final int MPROXYTYPE_UNINET = 8;
  public static final int MPROXYTYPE_UNIWAP = 16;
  public static final int MPROXYTYPE_WAP = 64;
  public static final int MPROXYTYPE_WIFI = 2;
  private static Uri PREFERRED_APN_URI = Uri.parse("content://telephony/carriers/preferapn");
  private static final String TAG = "APNUtil";

  public static String getApn(Context paramContext)
  {
    Cursor localCursor = paramContext.getContentResolver().query(PREFERRED_APN_URI, null, null, null, null);
    localCursor.moveToFirst();
    if (localCursor.isAfterLast())
    {
      localCursor.close();
      return null;
    }
    String str = localCursor.getString(localCursor.getColumnIndex("apn"));
    localCursor.close();
    return str;
  }

  public static String getApnName(Context paramContext)
  {
    int i = getMProxyType(paramContext);
    String str;
    if (i == 2)
      str = "wifi";
    do
    {
      return str;
      if (i == 1)
        return "cmwap";
      if (i == 4)
        return "cmnet";
      if (i == 16)
        return "uniwap";
      if (i == 8)
        return "uninet";
      if (i == 64)
        return "wap";
      if (i == 32)
        return "net";
      if (i == 512)
        return "ctwap";
      if (i == 256)
        return "ctnet";
      str = getApn(paramContext);
    }
    while ((str == null) || (str.length() == 0));
    return "none";
  }

  public static String getApnPort(Context paramContext)
  {
    Cursor localCursor = paramContext.getContentResolver().query(PREFERRED_APN_URI, null, null, null, null);
    localCursor.moveToFirst();
    if (localCursor.isAfterLast())
    {
      localCursor.close();
      return "80";
    }
    String str = localCursor.getString(localCursor.getColumnIndex("port"));
    if (str == null)
    {
      localCursor.close();
      str = "80";
    }
    localCursor.close();
    return str;
  }

  public static int getApnPortInt(Context paramContext)
  {
    Cursor localCursor = paramContext.getContentResolver().query(PREFERRED_APN_URI, null, null, null, null);
    localCursor.moveToFirst();
    if (localCursor.isAfterLast())
    {
      localCursor.close();
      return -1;
    }
    return localCursor.getInt(localCursor.getColumnIndex("port"));
  }

  public static String getApnProxy(Context paramContext)
  {
    Cursor localCursor = paramContext.getContentResolver().query(PREFERRED_APN_URI, null, null, null, null);
    localCursor.moveToFirst();
    if (localCursor.isAfterLast())
    {
      localCursor.close();
      return null;
    }
    String str = localCursor.getString(localCursor.getColumnIndex("proxy"));
    localCursor.close();
    return str;
  }

  public static String getApnProxyIp(Context paramContext)
  {
    int i = getApnType(paramContext);
    if ((i == 2) || (i == 5) || (i == 10))
      return "10.0.0.172";
    if (i == 9)
      return "10.0.0.200";
    return getApnProxy(paramContext);
  }

  public static byte getApnType(Context paramContext)
  {
    int i = 2;
    int j = getMProxyType(paramContext);
    if (j == i)
      i = 3;
    while (j == 1)
      return i;
    if (j == 4)
      return 1;
    if (j == 16)
      return 5;
    if (j == 8)
      return 4;
    if (j == 64)
      return 7;
    if (j == 32)
      return 6;
    if (j == 512)
      return 9;
    if (j == 256)
      return 8;
    if (j == 1024)
      return 10;
    if (j == 2048)
      return 11;
    return 0;
  }

  public static int getJceApnType(Context paramContext)
  {
    int i = getMProxyType(paramContext);
    if (i == 2)
      return 8;
    if (i == 1)
      return 4;
    if (i == 4)
      return 2;
    if (i == 16)
      return 32;
    if (i == 8)
      return 16;
    if (i == 64)
      return 128;
    if (i == 32)
      return 64;
    if (i == 512)
      return 512;
    if (i == 256)
      return 256;
    return 1;
  }

  public static int getMProxyType(Context paramContext)
  {
    try
    {
      ConnectivityManager localConnectivityManager = (ConnectivityManager)paramContext.getSystemService("connectivity");
      if (localConnectivityManager == null)
        return 128;
      NetworkInfo localNetworkInfo = localConnectivityManager.getActiveNetworkInfo();
      if (localNetworkInfo != null)
      {
        String str1 = localNetworkInfo.getTypeName();
        Log.d("APNUtil", "typeName:" + str1);
        if (str1.toUpperCase().equals("WIFI"))
          return 2;
        String str2 = localNetworkInfo.getExtraInfo().toLowerCase();
        Log.d("APNUtil", "extraInfo:" + str2);
        if (str2.startsWith("cmwap"))
          return 1;
        if ((str2.startsWith("cmnet")) || (str2.startsWith("epc.tmobile.com")))
          break label298;
        if (str2.startsWith("uniwap"))
          return 16;
        if (str2.startsWith("uninet"))
          return 8;
        if (str2.startsWith("wap"))
          return 64;
        if (str2.startsWith("net"))
          return 32;
        if (str2.startsWith("ctwap"))
          return 512;
        if (str2.startsWith("ctnet"))
          return 256;
        if (str2.startsWith("3gwap"))
          return 1024;
        if (str2.startsWith("3gnet"))
          return 2048;
        if (str2.startsWith("#777"))
        {
          String str3 = getApnProxy(paramContext);
          if (str3 != null)
          {
            int i = str3.length();
            if (i > 0)
              return 512;
          }
          return 256;
        }
      }
    }
    catch (Exception localException)
    {
      localException.printStackTrace();
    }
    return 128;
    label298: return 4;
  }

  public static String getNetWorkName(Context paramContext)
  {
    ConnectivityManager localConnectivityManager = (ConnectivityManager)paramContext.getSystemService("connectivity");
    if (localConnectivityManager == null)
      return "MOBILE";
    NetworkInfo localNetworkInfo = localConnectivityManager.getActiveNetworkInfo();
    if (localNetworkInfo != null)
      return localNetworkInfo.getTypeName();
    return "MOBILE";
  }

  public static boolean hasProxy(Context paramContext)
  {
    int i = getMProxyType(paramContext);
    Log.d("APNUtil", "netType:" + i);
    return (i == 1) || (i == 16) || (i == 64) || (i == 512) || (i == 1024);
  }

  public static boolean isActiveNetworkAvailable(Context paramContext)
  {
    NetworkInfo localNetworkInfo = ((ConnectivityManager)paramContext.getSystemService("connectivity")).getActiveNetworkInfo();
    if (localNetworkInfo != null)
      return localNetworkInfo.isAvailable();
    return false;
  }

  public static boolean isNetworkAvailable(Context paramContext)
  {
    ConnectivityManager localConnectivityManager = (ConnectivityManager)paramContext.getSystemService("connectivity");
    if (localConnectivityManager == null);
    NetworkInfo localNetworkInfo;
    do
    {
      return false;
      localNetworkInfo = localConnectivityManager.getActiveNetworkInfo();
    }
    while ((localNetworkInfo == null) || (!localNetworkInfo.isAvailable()));
    return true;
  }

  public static byte jceApnTypeToNormalapnType(int paramInt)
  {
    if (paramInt == 0);
    do
    {
      return 0;
      if (paramInt == 1)
        return 4;
      if (paramInt == 2)
        return 1;
      if (paramInt == 4)
        return 2;
      if (paramInt == 8)
        return 3;
      if (paramInt == 16)
        return 4;
      if (paramInt == 32)
        return 5;
      if (paramInt == 64)
        return 6;
      if (paramInt == 128)
        return 7;
      if (paramInt == 512)
        return 8;
    }
    while (paramInt != 256);
    return 9;
  }

  public static int normalApnTypeToJceApnType(byte paramByte)
  {
    if (paramByte == 0);
    do
    {
      return 0;
      if (paramByte == 4)
        return 1;
      if (paramByte == 1)
        return 2;
      if (paramByte == 2)
        return 4;
      if (paramByte == 3)
        return 8;
      if (paramByte == 4)
        return 16;
      if (paramByte == 5)
        return 32;
      if (paramByte == 6)
        return 64;
      if (paramByte == 7)
        return 128;
      if (paramByte == 9)
        return 512;
    }
    while (paramByte != 8);
    return 256;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.communicator.APNUtil
 * JD-Core Version:    0.6.2
 */