package com.tq.tencent.android.sdk.ad;

import android.graphics.Bitmap;
import com.tq.tencent.android.sdk.viewutil.FaceUtil;
import java.io.File;

public class AdInfo
{
  public static final String AD_FOLDER = "AD";
  public static final int TYPE_DOWNLOAD = 1;
  public static final int TYPE_WEBVIEW;
  public Bitmap adBitmap;
  public int adTime;
  public String adUrl;
  public int id;
  public String picUrl;
  public int urlType;

  public static String getAdBasePath()
  {
    return FaceUtil.USERFACEFILE_DIRECTORY + File.separator + "AD";
  }

  public static String getAdSDCardFilePath(String paramString)
  {
    String str = paramString.substring(1 + paramString.lastIndexOf(File.separator));
    return getAdBasePath() + File.separator + str;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.ad.AdInfo
 * JD-Core Version:    0.6.2
 */