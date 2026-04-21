package com.tq.tencent.android.sdk;

import com.tq.tencent.android.sdk.cp_config.AppInfoConfig;

public class Domain
{
  private static String API_BASE_ENDPOINT = null;
  public static final String ROOT_DOMAIN = "openapi.3g.qq.com";
  private static final String SCHEME_HTTP = "http://";
  public static final String TEST_ROOT_DOMAIN = "openapi.sp0309.3g.qq.com";

  public static String getEndPoint()
  {
    return getQQHallApiEndpoint();
  }

  public static String getQQHallApiEndpoint()
  {
    if (API_BASE_ENDPOINT == null)
      if (!AppInfoConfig.isTestEnvironment())
        break label21;
    label21: for (API_BASE_ENDPOINT = "http://openapi.sp0309.3g.qq.com"; ; API_BASE_ENDPOINT = "http://openapi.3g.qq.com")
      return API_BASE_ENDPOINT;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.Domain
 * JD-Core Version:    0.6.2
 */