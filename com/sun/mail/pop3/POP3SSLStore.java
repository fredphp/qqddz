package com.sun.mail.pop3;

import javax.mail.Session;
import javax.mail.URLName;

public class POP3SSLStore extends POP3Store
{
  public POP3SSLStore(Session paramSession, URLName paramURLName)
  {
    super(paramSession, paramURLName, "pop3s", 995, true);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.pop3.POP3SSLStore
 * JD-Core Version:    0.6.2
 */