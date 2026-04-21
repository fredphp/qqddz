package com.tq.tencent.android.sdk;

public class SdkCallException extends RuntimeException
{
  public static final int ERRO_RET_OAUTH_SIGNATURE = -9030;
  public static final int ERRO_RET_TOKEN_CHANGED = -9035;
  public static final int ERRO_RET_TOKEN_OVERDUE = -9033;
  public static String ERR_MSG_PARAMATER = "参数错误";
  public static final int INPUT_DATA_ERR = -9000;
  public static final int JSON_DATA_ERR = -8000;
  private final int errorCode;
  private final String errorMessage;
  private final int internalErrorCode;

  public SdkCallException(int paramInt1, int paramInt2, String paramString)
  {
    super(paramString);
    this.errorCode = paramInt1;
    this.internalErrorCode = paramInt2;
    this.errorMessage = paramString;
  }

  public boolean bTokenInvalid()
  {
    return (this.internalErrorCode == -9030) || (this.internalErrorCode == -9035) || (this.internalErrorCode == -9033);
  }

  public int getErrorCode()
  {
    return this.errorCode;
  }

  public String getErrorMessage()
  {
    return this.errorMessage;
  }

  public int getInternalErrorCode()
  {
    return this.internalErrorCode;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.SdkCallException
 * JD-Core Version:    0.6.2
 */