package com.tq.tencent.android.sdk;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Build.VERSION;
import android.os.Handler;
import android.os.Message;
import com.tq.tencent.android.sdk.common.CommonUtil;
import com.tq.tencent.android.sdk.common.Logger;
import com.tq.tencent.android.sdk.common.ReportInfoManager;
import com.tq.tencent.android.sdk.communicator.APNUtil;
import com.tq.tencent.android.sdk.communicator.AsyncHttpConnection;
import com.tq.tencent.android.sdk.cp_config.AppInfoConfig;
import com.tq.tencent.android.sdk.view.WebBaseActivity;
import java.io.File;
import java.util.HashMap;
import org.apache.http.HttpHost;
import org.apache.http.client.HttpClient;
import org.apache.http.params.HttpParams;

public class Tencent
{
  public static final int MIN_LOGGER_VERSION = 27;
  public static final String TQ_TENCENT_SDK_VERSION = "Inner_TQ.1.6";
  private static Context mContext = null;
  private static Tencent mInstance = null;

  public static Context getContext()
  {
    if (mContext == null)
      throw new RuntimeException("请先通过Tencent.setContext(context)设置上下文！");
    return mContext;
  }

  public static String getHTTPUAString()
  {
    StringBuilder localStringBuilder = new StringBuilder();
    localStringBuilder.append("TQSDK_V:");
    localStringBuilder.append("Inner_TQ.1.6");
    localStringBuilder.append(";DeV:");
    localStringBuilder.append(Build.MODEL);
    localStringBuilder.append(";AndroidV:");
    localStringBuilder.append(Build.VERSION.RELEASE);
    return localStringBuilder.toString();
  }

  public static Tencent getInstance()
  {
    if (mInstance == null)
      mInstance = new Tencent();
    return mInstance;
  }

  public static int getTimeoutForHTTPConnection()
  {
    return 10000;
  }

  public static String getVersion()
  {
    return "Inner_TQ.1.6";
  }

  public static void init(Context paramContext)
  {
    if (mContext != null)
      mContext = null;
    mContext = paramContext;
  }

  private boolean requestActionAsync(String paramString1, String paramString2, String paramString3, HashMap<String, String> paramHashMap, HashMap<String, File> paramHashMap1, Handler paramHandler)
  {
    if (paramString3.toLowerCase().equals("get"))
    {
      String str3 = CommonUtil.generateQZoneQueryString(paramString2, paramString3.toLowerCase(), paramHashMap);
      new AsyncHttpConnection(paramHandler).get(paramString1 + paramString2 + "?" + str3);
    }
    while (true)
    {
      return true;
      if (paramString3.toLowerCase().equals("post"))
      {
        String str2 = CommonUtil.generateQZoneQueryString(paramString2, paramString3.toLowerCase(), paramHashMap);
        new AsyncHttpConnection(paramHandler).post(paramString1 + paramString2, str2, paramHashMap1);
      }
      else if (paramString3.toLowerCase().equals("post_json"))
      {
        String str1 = CommonUtil.generateQueryJson(paramHashMap);
        new AsyncHttpConnection(paramHandler).postJson(paramString1 + paramString2, str1);
      }
    }
  }

  public static void reset()
  {
    mInstance = null;
  }

  public static void setContext(Context paramContext)
  {
    if (mContext != null)
      mContext = null;
    mContext = paramContext;
  }

  public void checkProxySetting(HttpClient paramHttpClient)
  {
    if (APNUtil.hasProxy(getContext()))
    {
      Logger.debug("need getApnProxy = " + APNUtil.getApnProxy(getContext()));
      Logger.debug("need getApnPortInt = " + APNUtil.getApnPortInt(getContext()));
      HttpHost localHttpHost = new HttpHost(APNUtil.getApnProxy(getContext()), APNUtil.getApnPortInt(getContext()));
      paramHttpClient.getParams().setParameter("http.route.default-proxy", localHttpHost);
    }
  }

  public boolean httpAsynSend(String paramString1, String paramString2, String paramString3, HashMap<String, String> paramHashMap, SdkCallbackHandler paramSdkCallbackHandler)
  {
    return httpAsynSend(paramString1, paramString2, paramString3, paramHashMap, null, paramSdkCallbackHandler);
  }

  public boolean httpAsynSend(String paramString1, String paramString2, String paramString3, HashMap<String, String> paramHashMap, HashMap<String, File> paramHashMap1, SdkCallbackHandler paramSdkCallbackHandler)
  {
    // Byte code:
    //   0: new 175	com/tq/tencent/android/sdk/Tencent$1
    //   3: dup
    //   4: aload_0
    //   5: aconst_null
    //   6: invokespecial 178	com/tq/tencent/android/sdk/Tencent$1:<init>	(Lcom/tq/tencent/android/sdk/Tencent;Landroid/os/Handler;)V
    //   9: astore 7
    //   11: aload 7
    //   13: aload 6
    //   15: invokevirtual 184	com/tq/tencent/android/sdk/Tencent$InternalHandler:setSdkHandler	(Lcom/tq/tencent/android/sdk/SdkCallbackHandler;)V
    //   18: invokestatic 186	com/tq/tencent/android/sdk/Tencent:getInstance	()Lcom/tq/tencent/android/sdk/Tencent;
    //   21: aload_1
    //   22: aload_2
    //   23: aload_3
    //   24: aload 4
    //   26: aload 5
    //   28: aload 7
    //   30: invokespecial 188	com/tq/tencent/android/sdk/Tencent:requestActionAsync	(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/util/HashMap;Ljava/util/HashMap;Landroid/os/Handler;)Z
    //   33: ireturn
  }

  public void returnToQQGameHall(Context paramContext)
  {
    if ((AppInfoConfig.getPLATFORM_ID() == "1003") || (AppInfoConfig.getPLATFORM_ID() == "1009"))
    {
      ReportInfoManager.getInstance().addReportAdInfo(0, "backHall", 1);
      if (CommonUtil.checkAppExist(paramContext, "com.tencent.qqgame"))
        try
        {
          paramContext.startActivity(paramContext.getPackageManager().getLaunchIntentForPackage("com.tencent.qqgame"));
          ReportInfoManager.getInstance().addReportAdInfo(0, "startHall", 1);
          return;
        }
        catch (Exception localException)
        {
          CommonUtil.showWaningToast(paramContext, "启动游戏大厅失败");
          showWebViewActivity(paramContext, "http://qgame.3g.qq.com/?g_f=21979&appid=" + AppInfoConfig.getAppId());
          return;
        }
      showWebViewActivity(paramContext, "http://qgame.3g.qq.com/?g_f=21979&appid=" + AppInfoConfig.getAppId());
      return;
    }
    CommonUtil.showWaningToast(paramContext, "你配置的APP_PLATFORM_ID非游戏大厅平台");
  }

  public void showWebViewActivity(Context paramContext, String paramString)
  {
    Intent localIntent = new Intent();
    localIntent.putExtra("url", paramString);
    localIntent.setClass(paramContext, WebBaseActivity.class);
    paramContext.startActivity(localIntent);
  }

  class InternalHandler extends Handler
  {
    private Handler mParentHandler = null;
    private SdkCallbackHandler sdkHandler = null;

    public InternalHandler(Handler arg2)
    {
      Object localObject;
      this.mParentHandler = localObject;
    }

    public Handler getParentHandler()
    {
      return this.mParentHandler;
    }

    public SdkCallbackHandler getSdkHandler()
    {
      return this.sdkHandler;
    }

    public void setSdkHandler(SdkCallbackHandler paramSdkCallbackHandler)
    {
      this.sdkHandler = paramSdkCallbackHandler;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.Tencent
 * JD-Core Version:    0.6.2
 */