package com.sun.mail.smtp;

import javax.mail.Session;
import javax.mail.URLName;

public class SMTPSSLTransport extends SMTPTransport
{
  public SMTPSSLTransport(Session paramSession, URLName paramURLName)
  {
    super(paramSession, paramURLName, "smtps", 465, true);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.smtp.SMTPSSLTransport
 * JD-Core Version:    0.6.2
 */