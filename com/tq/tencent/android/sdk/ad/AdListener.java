package com.tq.tencent.android.sdk.ad;

public abstract interface AdListener
{
  public static final int ERROR_CONNECTION_FAILED = 0;
  public static final int ERROR_GET_IMAGE_FAILED = 1;
  public static final int ERROR_GIF_DECODE_FAILED = 3;
  public static final int ERROR_NO_AVAILABLE_ADS = 2;
  public static final int ERROR_SERVER_DATA_EXCEPTION = 4;
  public static final int ERROR_SERVER_NO_DATA = 5;

  public abstract void onReceiveAdSucceed();

  public abstract void onReceiveFailed(int paramInt);
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.ad.AdListener
 * JD-Core Version:    0.6.2
 */