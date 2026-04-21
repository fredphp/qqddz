package com.sun.mail.iap;

public class ProtocolException extends Exception
{
  private static final long serialVersionUID = -4360500807971797439L;
  protected transient Response response = null;

  public ProtocolException()
  {
  }

  public ProtocolException(Response paramResponse)
  {
    super(paramResponse.toString());
    this.response = paramResponse;
  }

  public ProtocolException(String paramString)
  {
    super(paramString);
  }

  public Response getResponse()
  {
    return this.response;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.iap.ProtocolException
 * JD-Core Version:    0.6.2
 */