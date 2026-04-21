package com.sun.mail.imap.protocol;

import com.sun.mail.iap.ByteArray;
import com.sun.mail.iap.ParsingException;
import java.io.ByteArrayInputStream;

public class BODY
  implements Item
{
  static final char[] name = { 66, 79, 68, 89 };
  public ByteArray data;
  public int msgno;
  public int origin = 0;
  public String section;

  public BODY(FetchResponse paramFetchResponse)
    throws ParsingException
  {
    this.msgno = paramFetchResponse.getNumber();
    paramFetchResponse.skipSpaces();
    int i;
    do
    {
      i = paramFetchResponse.readByte();
      if (i == 93)
      {
        if (paramFetchResponse.readByte() == 60)
        {
          this.origin = paramFetchResponse.readNumber();
          paramFetchResponse.skip(1);
        }
        this.data = paramFetchResponse.readByteArray();
        return;
      }
    }
    while (i != 0);
    throw new ParsingException("BODY parse error: missing ``]'' at section end");
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
 * Qualified Name:     com.sun.mail.imap.protocol.BODY
 * JD-Core Version:    0.6.2
 */