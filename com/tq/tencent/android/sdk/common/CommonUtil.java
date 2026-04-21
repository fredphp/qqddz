package com.tq.tencent.android.sdk.common;

import android.app.Activity;
import android.app.AlertDialog.Builder;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface.OnClickListener;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.os.Environment;
import android.os.Process;
import android.os.StatFs;
import android.text.TextUtils;
import android.view.View;
import android.widget.Toast;
import com.tq.tencent.android.sdk.SdkCallException;
import com.tq.tencent.android.sdk.Tencent;
import com.tq.tencent.android.sdk.cp_config.AppInfoConfig;
import com.tq.tencent.android.sdk.viewutil.QzoneOAuth;
import java.io.File;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import org.json.JSONException;
import org.json.JSONObject;

public class CommonUtil
{
  public static final String LOGIN_APK_NAME = "qqgame_login.apk";
  public static final String QQ_GAME_PACKAGE = "com.tencent.qqgame";
  public static final String QQ_GAME_URL = "http://qgame.3g.qq.com/?g_f=21979";
  public static final String QQ_LOGIN_DOWNLOADURL = "http://3gimg.qq.com/devwiki/opensdk/qq_game_login.apk";
  public static final String QZONE_ACTIVITY = "com.qzone.ui.activity.QZoneDispathActivity";
  public static final String QZONE_PACKAGE = "com.qzone";
  public static final String QZONE_URL = "http://app40.z.qq.com/sdk_proxy.jsp?";
  public static final String SDCARD_PATH = Environment.getExternalStorageDirectory().getAbsolutePath();
  private static ProgressDialog mProgressDialog;

  public static byte[] QGEncodeSocketMsg(byte[] paramArrayOfByte1, byte[] paramArrayOfByte2)
  {
    return ParseSocketMsg.QGEncodeSocketMsg(paramArrayOfByte1, paramArrayOfByte2);
  }

  public static String bytes2HexString(byte[] paramArrayOfByte)
  {
    StringBuilder localStringBuilder = new StringBuilder("");
    if ((paramArrayOfByte == null) || (paramArrayOfByte.length <= 0))
    {
      Logger.error("on CommonUtil.bytes2HexString _bytes is null !");
      return null;
    }
    for (int i = 0; ; i++)
    {
      if (i >= paramArrayOfByte.length)
        return localStringBuilder.toString();
      String str = Integer.toHexString(0xFF & paramArrayOfByte[i]).toUpperCase();
      if (str.length() < 2)
        localStringBuilder.append(0);
      localStringBuilder.append(str);
    }
  }

  public static boolean checkAppExist(Context paramContext, String paramString)
  {
    try
    {
      PackageInfo localPackageInfo2 = paramContext.getPackageManager().getPackageInfo(paramString, 0);
      localPackageInfo1 = localPackageInfo2;
      if (localPackageInfo1 == null)
        return false;
    }
    catch (PackageManager.NameNotFoundException localNameNotFoundException)
    {
      while (true)
        PackageInfo localPackageInfo1 = null;
    }
    return true;
  }

  public static void closeLodingDialog()
  {
    if ((mProgressDialog != null) && (mProgressDialog.isShowing()))
    {
      mProgressDialog.dismiss();
      mProgressDialog = null;
    }
  }

  public static String encode(String paramString)
  {
    if (paramString == null)
      return "";
    try
    {
      String str = URLEncoder.encode(paramString, "UTF-8").replace("+", "%20").replace("*", "%2A").replace("%7E", "~");
      return str;
    }
    catch (UnsupportedEncodingException localUnsupportedEncodingException)
    {
      throw new RuntimeException(localUnsupportedEncodingException.getMessage(), localUnsupportedEncodingException);
    }
  }

  public static String generateQZoneQueryString(String paramString1, String paramString2, HashMap<String, String> paramHashMap)
  {
    if (paramHashMap == null)
      paramHashMap = new HashMap();
    paramHashMap.put("openid", "");
    paramHashMap.put("openkey", "");
    paramHashMap.put("appid", AppInfoConfig.getAppId());
    paramHashMap.put("platformid", "1009");
    paramHashMap.put("tt", "0");
    paramHashMap.put("pf", "qzone");
    String str = AppInfoConfig.getAppKey();
    try
    {
      paramHashMap.put("sig", QzoneOAuth.getInstance().makeSig(paramString2, paramString1, paramHashMap, str));
      return generateQueryString(paramHashMap);
    }
    catch (Exception localException)
    {
      while (true)
        localException.printStackTrace();
    }
  }

  public static String generateQueryJson(Map paramMap)
  {
    if (paramMap == null)
      return "";
    JSONObject localJSONObject = new JSONObject();
    if ((paramMap != null) && (paramMap.size() > 0))
      try
      {
        Iterator localIterator = paramMap.keySet().iterator();
        while (true)
        {
          boolean bool = localIterator.hasNext();
          if (!bool)
            label53: return localJSONObject.toString();
          String str = (String)localIterator.next();
          localJSONObject.put(str, paramMap.get(str));
        }
      }
      catch (JSONException localJSONException)
      {
        break label53;
      }
    return "";
  }

  public static String generateQueryString(Map paramMap)
  {
    String str1;
    if (paramMap == null)
      str1 = "";
    do
    {
      return str1;
      str1 = "";
    }
    while (paramMap.size() <= 0);
    Iterator localIterator = paramMap.keySet().iterator();
    while (true)
    {
      if (!localIterator.hasNext())
        return str1.substring(0, -1 + str1.length());
      String str2 = (String)localIterator.next();
      String str3 = encode((String)paramMap.get(str2));
      str1 = str1 + str2 + "=" + str3 + "&";
    }
  }

  public static OpSdkParams getParameters(String paramString)
  {
    int i = 0;
    OpSdkParams localOpSdkParams;
    if (TextUtils.isEmpty(paramString))
    {
      Logger.debug("on getParamesters paramString is null !!");
      localOpSdkParams = null;
    }
    while (true)
    {
      return localOpSdkParams;
      if (paramString.startsWith("?"))
        paramString = paramString.substring(1);
      localOpSdkParams = new OpSdkParams();
      if (paramString != null)
        try
        {
          if (!paramString.equals(""))
          {
            String[] arrayOfString1 = paramString.split("&");
            int j = arrayOfString1.length;
            while (i < j)
            {
              String str = arrayOfString1[i];
              if ((str != null) && (!str.equals("")) && (str.indexOf('=') > -1))
              {
                String[] arrayOfString2 = str.split("=");
                if (arrayOfString2.length >= 2)
                  localOpSdkParams.add(arrayOfString2[0], arrayOfString2[1]);
              }
              i++;
            }
          }
        }
        catch (Exception localException)
        {
          Logger.error("on CommonUtil.getParameters exception happened,msg:" + localException.getMessage());
        }
    }
    return localOpSdkParams;
  }

  public static long getSDCardAvailableCount()
  {
    StatFs localStatFs = new StatFs(SDCARD_PATH);
    return localStatFs.getAvailableBlocks() * localStatFs.getBlockSize();
  }

  public static int getSceneOrientation(Context paramContext)
  {
    return paramContext.getResources().getConfiguration().orientation;
  }

  public static byte[] handleGetSocketHeadRequest(int paramInt1, int paramInt2, String paramString)
  {
    return ParseSocketMsg.handleGetSocketHeadRequest(paramInt1, 0, paramInt2, paramString);
  }

  public static String htmlDecode(String paramString)
  {
    if (paramString == null)
      return null;
    try
    {
      String str = URLDecoder.decode(paramString, "UTF-8");
      return str;
    }
    catch (UnsupportedEncodingException localUnsupportedEncodingException)
    {
      localUnsupportedEncodingException.printStackTrace();
    }
    return paramString;
  }

  public static void killApplication()
  {
    Tencent.reset();
    Process.killProcess(Process.myPid());
  }

  public static SdkCallException parseErrRsp(int paramInt, String paramString)
  {
    if ((paramString == null) || (paramString.length() == 0))
      return new SdkCallException(paramInt, -1, "");
    String[] arrayOfString = paramString.split("&");
    if (arrayOfString.length > 1)
      return new SdkCallException(paramInt, Integer.valueOf(arrayOfString[1]).intValue(), arrayOfString[0]);
    if (arrayOfString.length == 1)
      return new SdkCallException(paramInt, -1, arrayOfString[0]);
    return new SdkCallException(paramInt, -1, "");
  }

  public static AlertDialog.Builder showAlertDialog(Context paramContext, String paramString1, String paramString2, String paramString3, DialogInterface.OnClickListener paramOnClickListener1, String paramString4, DialogInterface.OnClickListener paramOnClickListener2, View paramView)
  {
    if (paramContext == null)
    {
      Logger.error("on showAlertDialog context is null ....");
      return null;
    }
    try
    {
      AlertDialog.Builder localBuilder = new AlertDialog.Builder(paramContext);
      localBuilder.setTitle(paramString1);
      localBuilder.setMessage(paramString2);
      localBuilder.setPositiveButton(paramString3, paramOnClickListener1);
      localBuilder.setNegativeButton(paramString4, paramOnClickListener2);
      if (paramView != null)
        localBuilder.setView(paramView);
      localBuilder.create();
      localBuilder.show();
      return localBuilder;
    }
    catch (Exception localException)
    {
      Logger.error("on showAlertDialog exception happened, msg:" + localException.getMessage());
    }
    return null;
  }

  public static void showLoadingDialog(Context paramContext, String paramString)
  {
    try
    {
      if (((paramContext instanceof Activity)) && (mProgressDialog == null))
      {
        mProgressDialog = new ProgressDialog(paramContext);
        mProgressDialog.setMessage(paramString);
        mProgressDialog.setProgressStyle(0);
      }
      if (!mProgressDialog.isShowing())
        mProgressDialog.show();
      return;
    }
    catch (Exception localException)
    {
      showWaningToast(paramContext, paramString);
    }
  }

  public static void showWaningToast(Context paramContext, String paramString)
  {
    if (paramContext == null)
      return;
    try
    {
      Toast.makeText(paramContext, paramString, 1).show();
      return;
    }
    catch (Exception localException)
    {
      Logger.error("on showWaningToast exception happened, msg:" + localException.getMessage());
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.common.CommonUtil
 * JD-Core Version:    0.6.2
 */