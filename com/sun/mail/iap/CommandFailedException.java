package com.sun.mail.iap;

public class CommandFailedException extends ProtocolException
{
  private static final long serialVersionUID = 793932807880443631L;

  public CommandFailedException()
  {
  }

  public CommandFailedException(Response paramResponse)
  {
    super(paramResponse);
  }

  public CommandFailedException(String paramString)
  {
    super(paramString);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.iap.CommandFailedException
 * JD-Core Version:    0.6.2
 */