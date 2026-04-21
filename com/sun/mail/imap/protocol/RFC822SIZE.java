package com.sun.mail.imap.protocol;

import com.sun.mail.iap.ParsingException;

public class RFC822SIZE
  implements Item
{
  static final char[] name = { 82, 70, 67, 56, 50, 50, 46, 83, 73, 90, 69 };
  public int msgno;
  public int size;

  public RFC822SIZE(FetchResponse paramFetchResponse)
    throws ParsingException
  {
    this.msgno = paramFetchResponse.getNumber();
    paramFetchResponse.skipSpaces();
    this.size = paramFetchResponse.readNumber();
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.protocol.RFC822SIZE
 * JD-Core Version:    0.6.2
 */