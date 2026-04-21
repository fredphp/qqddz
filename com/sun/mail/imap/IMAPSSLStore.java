package com.sun.mail.imap;

import javax.mail.Session;
import javax.mail.URLName;

public class IMAPSSLStore extends IMAPStore
{
  public IMAPSSLStore(Session paramSession, URLName paramURLName)
  {
    super(paramSession, paramURLName, "imaps", 993, true);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.IMAPSSLStore
 * JD-Core Version:    0.6.2
 */