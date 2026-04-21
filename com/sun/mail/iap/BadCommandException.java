package com.sun.mail.iap;

public class BadCommandException extends ProtocolException
{
  private static final long serialVersionUID = 5769722539397237515L;

  public BadCommandException()
  {
  }

  public BadCommandException(Response paramResponse)
  {
    super(paramResponse);
  }

  public BadCommandException(String paramString)
  {
    super(paramString);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.iap.BadCommandException
 * JD-Core Version:    0.6.2
 */