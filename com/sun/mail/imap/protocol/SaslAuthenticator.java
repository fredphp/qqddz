package com.sun.mail.imap.protocol;

import com.sun.mail.iap.ProtocolException;

public abstract interface SaslAuthenticator
{
  public abstract boolean authenticate(String[] paramArrayOfString, String paramString1, String paramString2, String paramString3, String paramString4)
    throws ProtocolException;
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.protocol.SaslAuthenticator
 * JD-Core Version:    0.6.2
 */