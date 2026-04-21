package com.tq.tencent.android.sdk.viewutil;

import com.tq.tencent.android.sdk.common.Base64Encoder;
import com.tq.tencent.android.sdk.common.CommonUtil;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Set;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class QzoneOAuth
{
  private static final String MAC_NAME = "HmacSHA1";
  private static QzoneOAuth instance;

  public static QzoneOAuth getInstance()
  {
    if (instance == null)
      instance = new QzoneOAuth();
    return instance;
  }

  public String base64Encode(byte[] paramArrayOfByte)
  {
    return new String(Base64Encoder.encode(paramArrayOfByte));
  }

  public String makeSig(String paramString1, String paramString2, HashMap<String, String> paramHashMap, String paramString3)
    throws Exception
  {
    try
    {
      SecretKeySpec localSecretKeySpec = new SecretKeySpec((paramString3 + '&').getBytes("UTF-8"), "HmacSHA1");
      Mac localMac = Mac.getInstance("HmacSHA1");
      localMac.init(localSecretKeySpec);
      String str = base64Encode(localMac.doFinal(makeSource(paramString1, paramString2, paramHashMap).getBytes("UTF-8"))).trim();
      return str;
    }
    catch (Exception localException)
    {
      throw new Exception(localException);
    }
  }

  public String makeSource(String paramString1, String paramString2, HashMap<String, String> paramHashMap)
  {
    Object[] arrayOfObject = paramHashMap.keySet().toArray();
    Arrays.sort(arrayOfObject);
    StringBuilder localStringBuilder1 = new StringBuilder(256);
    localStringBuilder1.append(paramString1.toUpperCase()).append("&").append(URLEncoder.encode(paramString2)).append("&");
    StringBuilder localStringBuilder2 = new StringBuilder();
    for (int i = 0; ; i++)
    {
      if (i >= arrayOfObject.length)
      {
        localStringBuilder1.append(CommonUtil.encode(localStringBuilder2.toString()));
        return localStringBuilder1.toString();
      }
      localStringBuilder2.append(arrayOfObject[i]).append("=").append((String)paramHashMap.get(arrayOfObject[i]));
      if (i != -1 + arrayOfObject.length)
        localStringBuilder2.append("&");
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.viewutil.QzoneOAuth
 * JD-Core Version:    0.6.2
 */