package com.sun.mail.smtp;

import javax.mail.MessagingException;
import javax.mail.internet.InternetAddress;

public class SMTPAddressSucceededException extends MessagingException
{
  private static final long serialVersionUID = -1168335848623096749L;
  protected InternetAddress addr;
  protected String cmd;
  protected int rc;

  public SMTPAddressSucceededException(InternetAddress paramInternetAddress, String paramString1, int paramInt, String paramString2)
  {
    super(paramString2);
    this.addr = paramInternetAddress;
    this.cmd = paramString1;
    this.rc = paramInt;
  }

  public InternetAddress getAddress()
  {
    return this.addr;
  }

  public String getCommand()
  {
    return this.cmd;
  }

  public int getReturnCode()
  {
    return this.rc;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.smtp.SMTPAddressSucceededException
 * JD-Core Version:    0.6.2
 */