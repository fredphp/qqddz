package com.tq.tencent.android.sdk.communicator;

import android.os.Handler;
import android.os.Message;
import com.tq.tencent.android.sdk.Tencent;
import com.tq.tencent.android.sdk.common.CommonUtil;
import com.tq.tencent.android.sdk.common.Logger;
import com.tq.tencent.android.sdk.common.PostImageUtility;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.StatusLine;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;

public class AsyncHttpConnection
  implements Runnable
{
  public static final int DID_ERROR = 1;
  public static final int DID_OAUTH_ERROR = 3;
  public static final int DID_START = 0;
  public static final int DID_SUCCEED = 2;
  public static final String ERR_MSG_REQ = "请求异常";
  public static final String GET_METHOD = "get";
  private static final int GET_METHOD_INDEX = 0;
  public static final int GET_SUCCEED_STATUS = 200;
  public static final int OAUTH_ERROR_STATUS = 400;
  public static final String POST_JSON_METHOD = "post_json";
  private static final int POST_JSON_METHOD_INDEX = 2;
  public static final String POST_METHOD = "post";
  private static final int POST_METHOD_INDEX = 1;
  public static final int POST_SUCCEED_STATUS = 201;
  public static final int PROCESSING_SUCCEED_STATUS = 202;
  private Handler handler;
  private HttpClient httpClient;
  private int method;
  private HashMap<String, File> postFile;
  private String strData;
  private String url;

  public AsyncHttpConnection(Handler paramHandler)
  {
    this.handler = paramHandler;
  }

  private void processEntity(HttpEntity paramHttpEntity, int paramInt)
    throws IllegalStateException, IOException
  {
    BufferedReader localBufferedReader = new BufferedReader(new InputStreamReader(paramHttpEntity.getContent()));
    StringBuilder localStringBuilder = new StringBuilder("");
    String str1 = localBufferedReader.readLine();
    String[] arrayOfString;
    Message localMessage;
    if (str1 == null)
    {
      String str2 = localStringBuilder.toString();
      arrayOfString = new String[2];
      arrayOfString[0] = paramInt;
      arrayOfString[1] = str2;
      Logger.debug("statusCode = " + arrayOfString[0] + ",result = " + arrayOfString[1]);
      if ((paramInt == 200) || (paramInt == 201))
        break label173;
      localMessage = Message.obtain(this.handler, 3, arrayOfString);
      label140: if (this.handler == null)
        break label188;
      this.handler.sendMessage(localMessage);
    }
    while (true)
    {
      localBufferedReader.close();
      return;
      localStringBuilder.append(str1);
      break;
      label173: localMessage = Message.obtain(this.handler, 2, arrayOfString);
      break label140;
      label188: Logger.debug("AsyncHttpConnection_processEntity()", "handler was null.");
    }
  }

  public void create(int paramInt, String paramString1, String paramString2, HashMap<String, File> paramHashMap)
  {
    this.method = paramInt;
    this.url = paramString1;
    this.strData = paramString2;
    this.postFile = paramHashMap;
    AsyncHttpConnectionManager.getInstance().submit(this);
  }

  public void get(String paramString)
  {
    create(0, paramString, null, null);
  }

  public void post(String paramString1, String paramString2)
  {
    create(1, paramString1, paramString2, null);
  }

  public void post(String paramString1, String paramString2, HashMap<String, File> paramHashMap)
  {
    create(1, paramString1, paramString2, paramHashMap);
  }

  public void postJson(String paramString1, String paramString2)
  {
    create(2, paramString1, paramString2, null);
  }

  public void run()
  {
    if (this.handler != null)
      this.handler.sendMessage(Message.obtain(this.handler, 0));
    while (true)
    {
      this.httpClient = new DefaultHttpClient();
      HttpConnectionParams.setConnectionTimeout(this.httpClient.getParams(), Tencent.getTimeoutForHTTPConnection());
      Tencent.getInstance().checkProxySetting(this.httpClient);
      this.httpClient.getParams().setParameter("http.useragent", Tencent.getHTTPUAString());
      try
      {
        Logger.debug("Http url= " + this.url);
        int i = this.method;
        localObject = null;
        switch (i)
        {
        default:
        case 0:
          while (true)
          {
            if (this.method <= 2)
              processEntity(((HttpResponse)localObject).getEntity(), ((HttpResponse)localObject).getStatusLine().getStatusCode());
            return;
            Logger.debug("AsyncHttpConnection_run()", "Could not call handler to post DID_START message because it was null.");
            break;
            HttpGet localHttpGet = new HttpGet(this.url);
            localObject = this.httpClient.execute(localHttpGet);
          }
        case 1:
          HttpPost localHttpPost2 = new HttpPost(this.url);
          Logger.debug("Http post strData= " + this.strData);
          if ((this.postFile == null) || (this.postFile.size() <= 0))
          {
            localHttpPost2.setHeader("Content-Type", "application/x-www-form-urlencoded");
            localHttpPost2.setEntity(new StringEntity(this.strData, "utf-8"));
          }
          while (true)
          {
            localHttpPost2.getParams().setBooleanParameter("http.protocol.expect-continue", false);
            localObject = this.httpClient.execute(localHttpPost2);
            break;
            localHttpPost2.setHeader("Content-Type", "multipart/form-data; boundary=c9152e99a2d6487fb0bfd02adec3aa16");
            ByteArrayOutputStream localByteArrayOutputStream = new ByteArrayOutputStream(102400);
            PostImageUtility.paramToUpload(localByteArrayOutputStream, CommonUtil.getParameters(this.strData));
            PostImageUtility.imageContentToUpload(localByteArrayOutputStream, this.postFile);
            localHttpPost2.setEntity(new ByteArrayEntity(localByteArrayOutputStream.toByteArray()));
          }
        case 2:
        }
      }
      catch (Exception localException)
      {
        Object localObject;
        while (this.handler != null)
        {
          localException.printStackTrace();
          Message localMessage = Message.obtain(this.handler, 1, localException);
          this.handler.sendMessage(localMessage);
          return;
          HttpPost localHttpPost1 = new HttpPost(this.url);
          Logger.debug("Http post json strData= " + this.strData);
          localHttpPost1.setHeader("Content-Type", "multipart/form-data");
          localHttpPost1.setEntity(new StringEntity(this.strData, "utf-8"));
          localHttpPost1.getParams().setBooleanParameter("http.protocol.expect-continue", false);
          HttpResponse localHttpResponse = this.httpClient.execute(localHttpPost1);
          localObject = localHttpResponse;
        }
        Logger.debug("AsyncHttpConnection_run()", "handler post DID_ERROR because it was null.");
        Logger.debug("AsyncHttpConnection_run()", localException.toString());
      }
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.communicator.AsyncHttpConnection
 * JD-Core Version:    0.6.2
 */