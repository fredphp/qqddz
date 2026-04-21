package com.sun.mail.iap;

public class ConnectionException extends ProtocolException
{
  private static final long serialVersionUID = 5749739604257464727L;
  private transient Protocol p;

  public ConnectionException()
  {
  }

  public ConnectionException(Protocol paramProtocol, Response paramResponse)
  {
    super(paramResponse);
    this.p = paramProtocol;
  }

  public ConnectionException(String paramString)
  {
    super(paramString);
  }

  public Protocol getProtocol()
  {
    return this.p;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.iap.ConnectionException
 * JD-Core Version:    0.6.2
 */