package com.tq.tencent.android.sdk.cp_config;

import android.content.Context;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.text.TextUtils;
import com.tq.tencent.android.sdk.Tencent;
import com.tq.tencent.android.sdk.common.CommonUtil;

public class AppInfoConfig
{
  private static String APP_ID = "";
  private static String APP_KEY = "";
  private static String APP_PLATFORM_ID = "1009";
  private static boolean B_LOG_OPEN = false;
  private static boolean B_TEST_ENVIRONMENT = false;
  public static final String ENUM_PLATFORM_ID_QQHALL = "1003";
  public static final String ENUM_PLATFORM_ID_QQHALL_HAVE_LOGIN = "1009";

  public static String createAllAppInfo()
  {
    StringBuilder localStringBuilder = new StringBuilder();
    localStringBuilder.append("APP_ID(接入AppId)=");
    localStringBuilder.append(APP_ID);
    localStringBuilder.append("\n");
    localStringBuilder.append("APP_KEY(接入AppKey) =");
    localStringBuilder.append(APP_KEY);
    localStringBuilder.append("\n");
    localStringBuilder.append("SDK_VERSION (SDK版本)=");
    localStringBuilder.append("Inner_TQ.1.6");
    localStringBuilder.append("\n");
    localStringBuilder.append("B_TEST_ENVIRONMENT (连接服务器环境)=");
    if (B_TEST_ENVIRONMENT)
      localStringBuilder.append("测试环境");
    while (true)
    {
      localStringBuilder.append("\n");
      localStringBuilder.append("B_LOG_OPEN (是否打印调试信息)=");
      localStringBuilder.append(B_LOG_OPEN);
      localStringBuilder.append("\n");
      localStringBuilder.append("PLATFORM_ID (接入平台ID)=");
      localStringBuilder.append(APP_PLATFORM_ID);
      localStringBuilder.append("_大厅版本");
      localStringBuilder.append("\n");
      return localStringBuilder.toString();
      localStringBuilder.append("正式环境");
    }
  }

  public static String getAppId()
  {
    if (TextUtils.isEmpty(APP_ID))
    {
      if (Tencent.getContext() != null)
        CommonUtil.showWaningToast(Tencent.getContext(), "appid没有配置, 请在AppInfoConfig.java文件中进行设置");
    }
    else
      return APP_ID;
    throw new RuntimeException("~~~~~~~~app_id is null,you should set the value.");
  }

  public static String getAppKey()
  {
    if (TextUtils.isEmpty(APP_KEY))
    {
      if (Tencent.getContext() != null)
        CommonUtil.showWaningToast(Tencent.getContext(), "appkey没有配置, 请在AppInfoConfig.java文件中进行设置");
    }
    else
      return APP_KEY;
    throw new RuntimeException("~~~~~~~~app_key is null,you should set the value.");
  }

  public static int getLOGIN_SCREEN_ORIATION()
  {
    if (Tencent.getContext().getResources().getConfiguration().orientation == 1)
      return 1;
    return 0;
  }

  public static String getPLATFORM_ID()
  {
    return APP_PLATFORM_ID;
  }

  public static boolean isLogOpen()
  {
    return B_LOG_OPEN;
  }

  public static boolean isTestEnvironment()
  {
    return B_TEST_ENVIRONMENT;
  }

  public static void setAPP_ID(String paramString)
  {
    APP_ID = paramString;
  }

  public static void setAPP_KEY(String paramString)
  {
    APP_KEY = paramString;
  }

  public static void setAPP_PLATFORM_ID(String paramString)
  {
    APP_PLATFORM_ID = paramString;
  }

  public static void setB_LOG_OPEN(boolean paramBoolean)
  {
    B_LOG_OPEN = paramBoolean;
  }

  public static void setB_TEST_ENVIRONMENT(boolean paramBoolean)
  {
    B_TEST_ENVIRONMENT = paramBoolean;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.cp_config.AppInfoConfig
 * JD-Core Version:    0.6.2
 */