package com.sun.mail.iap;

public class LiteralException extends ProtocolException
{
  private static final long serialVersionUID = -6919179828339609913L;

  public LiteralException(Response paramResponse)
  {
    super(paramResponse.toString());
    this.response = paramResponse;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.iap.LiteralException
 * JD-Core Version:    0.6.2
 */