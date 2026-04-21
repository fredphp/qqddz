package com.tq.tencent.android.sdk.common;

import android.util.Log;
import com.tq.tencent.android.sdk.cp_config.AppInfoConfig;

public class Logger
{
  public static final String TQ_TENCENT_SDK = "TQ_SDK";

  public static void debug(String paramString)
  {
    if (!AppInfoConfig.isLogOpen())
      return;
    Log.d("TQ_SDK", paramString);
  }

  public static void debug(String paramString1, String paramString2)
  {
    if (!AppInfoConfig.isLogOpen())
      return;
    Log.d(paramString1, paramString2);
  }

  public static void error(String paramString)
  {
    if (!AppInfoConfig.isLogOpen())
      return;
    Log.e("TQ_SDK", paramString);
  }

  public static void error(String paramString1, String paramString2)
  {
    if (!AppInfoConfig.isLogOpen())
      return;
    Log.e(paramString1, paramString2);
  }

  public static void sysLog(String paramString)
  {
    Log.d("TQ_SDK", paramString);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.common.Logger
 * JD-Core Version:    0.6.2
 */