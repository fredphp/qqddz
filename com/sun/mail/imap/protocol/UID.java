package com.sun.mail.imap.protocol;

import com.sun.mail.iap.ParsingException;

public class UID
  implements Item
{
  static final char[] name = { 85, 73, 68 };
  public int seqnum;
  public long uid;

  public UID(FetchResponse paramFetchResponse)
    throws ParsingException
  {
    this.seqnum = paramFetchResponse.getNumber();
    paramFetchResponse.skipSpaces();
    this.uid = paramFetchResponse.readLong();
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.protocol.UID
 * JD-Core Version:    0.6.2
 */