package com.sun.mail.imap.protocol;

import com.sun.mail.iap.ByteArray;
import com.sun.mail.iap.ParsingException;
import java.io.ByteArrayInputStream;

public class RFC822DATA
  implements Item
{
  static final char[] name = { 82, 70, 67, 56, 50, 50 };
  public ByteArray data;
  public int msgno;

  public RFC822DATA(FetchResponse paramFetchResponse)
    throws ParsingException
  {
    this.msgno = paramFetchResponse.getNumber();
    paramFetchResponse.skipSpaces();
    this.data = paramFetchResponse.readByteArray();
  }

  public ByteArray getByteArray()
  {
    return this.data;
  }

  public ByteArrayInputStream getByteArrayInputStream()
  {
    if (this.data != null)
      return this.data.toByteArrayInputStream();
    return null;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.protocol.RFC822DATA
 * JD-Core Version:    0.6.2
 */