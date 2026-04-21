package com.tq.tencent.android.sdk.download;

import android.content.Context;
import com.tq.tencent.android.sdk.Tencent;
import com.tq.tencent.android.sdk.communicator.APNUtil;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class Http
{
  public static final int CON_TIME_OUT = 10000;
  public static final int FILE_BUFFER_SIZE = 5120;
  public static final int READ_TIME_OUT = 8000;
  public static final String TYPE_WML = "text/vnd.wap.wml";
  public static final String TYPE_WMLC = "application/vnd.wap.wmlc";
  public static Context mContext;

  private static void disConnect(HttpURLConnection paramHttpURLConnection)
  {
    if (paramHttpURLConnection != null);
    try
    {
      paramHttpURLConnection.disconnect();
      return;
    }
    catch (Exception localException)
    {
      localException.printStackTrace();
    }
  }

  public static byte[] getByte(HttpURLConnection paramHttpURLConnection)
    throws IOException
  {
    int i = paramHttpURLConnection.getContentLength();
    InputStream localInputStream = paramHttpURLConnection.getInputStream();
    byte[] arrayOfByte1 = new byte[i];
    byte[] arrayOfByte2 = new byte[5120];
    int j = 0;
    while (true)
    {
      int k = localInputStream.read(arrayOfByte2);
      if (k == -1)
      {
        if (localInputStream != null)
          localInputStream.close();
        return arrayOfByte1;
      }
      System.arraycopy(arrayOfByte2, 0, arrayOfByte1, j, k);
      j += k;
    }
  }

  public static HttpURLConnection getHttpConnection(String paramString1, boolean paramBoolean1, boolean paramBoolean2, int paramInt1, int paramInt2, String paramString2, boolean paramBoolean3)
  {
    HttpURLConnection localHttpURLConnection = null;
    int i;
    label327: String str2;
    String str3;
    while (true)
    {
      try
      {
        URL localURL1;
        if (APNUtil.hasProxy(Tencent.getContext()))
        {
          int k = "http://".length();
          String str4 = APNUtil.getApnProxyIp(Tencent.getContext());
          String str5 = APNUtil.getApnPort(Tencent.getContext());
          int m = paramString1.indexOf('/', k);
          String str6;
          String str7;
          if (m < 0)
          {
            str6 = paramString1.substring(k);
            str7 = "";
            URL localURL2 = new URL("http://" + str4 + ":" + str5 + str7);
            localHttpURLConnection = (HttpURLConnection)localURL2.openConnection();
            localHttpURLConnection.setRequestProperty("X-Online-Host", str6);
            localHttpURLConnection.setRequestMethod("GET");
            localHttpURLConnection.setDoInput(paramBoolean1);
            localHttpURLConnection.setAllowUserInteraction(paramBoolean2);
            localHttpURLConnection.setRequestProperty("Cache-Control", "no-cache");
            if (paramBoolean3)
              localHttpURLConnection.setRequestProperty("Connection", "keep-alive");
            if (paramInt1 <= 0)
            {
              localHttpURLConnection.setConnectTimeout(60000);
              if (paramInt2 > 0)
                break label327;
              localHttpURLConnection.setReadTimeout(60000);
              if (paramString2 != null)
                localHttpURLConnection.setRequestProperty("Range", paramString2);
              i = localHttpURLConnection.getResponseCode();
              if ((i != 302) && (i != 301))
                break label426;
              String str1 = localHttpURLConnection.getHeaderField("Location");
              disConnect(localHttpURLConnection);
              localHttpURLConnection = null;
              if (str1 == null)
                break label423;
              localHttpURLConnection = getHttpConnection(str1, paramBoolean1, paramBoolean2, paramInt1, paramInt2, paramString2, paramBoolean3);
              break label423;
            }
          }
          else
          {
            str6 = paramString1.substring(k, m);
            str7 = paramString1.substring(m);
            continue;
          }
        }
        else
        {
          localURL1 = new URL(paramString1);
          localHttpURLConnection = (HttpURLConnection)localURL1.openConnection();
          continue;
        }
        localHttpURLConnection.setConnectTimeout(paramInt1);
        continue;
      }
      catch (Exception localException)
      {
        disConnect(localHttpURLConnection);
        return null;
      }
      localHttpURLConnection.setReadTimeout(paramInt2);
      continue;
      str2 = localHttpURLConnection.getContentType();
      if (str2 == null)
      {
        str3 = "";
        label353: if ((str3.indexOf("text/vnd.wap.wml") != -1) || (str3.indexOf("application/vnd.wap.wmlc") != -1) || (str3.indexOf("text") != -1))
          break label445;
      }
    }
    label423: label426: label445: for (int j = 0; ; j = 1)
    {
      if (j != 0)
      {
        disConnect(localHttpURLConnection);
        localHttpURLConnection = null;
        break label423;
        str3 = str2.toLowerCase();
        break label353;
      }
      do
      {
        disConnect(localHttpURLConnection);
        localHttpURLConnection = null;
        return localHttpURLConnection;
        if (i == 200)
          break;
      }
      while (i != 206);
      break;
    }
  }

  public static void setContext(Context paramContext)
  {
    mContext = paramContext;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.download.Http
 * JD-Core Version:    0.6.2
 */