package com.sun.mail.imap.protocol;

import com.sun.mail.iap.ParsingException;
import java.text.FieldPosition;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import javax.mail.internet.MailDateFormat;

public class INTERNALDATE
  implements Item
{
  private static SimpleDateFormat df = new SimpleDateFormat("dd-MMM-yyyy HH:mm:ss ", Locale.US);
  private static MailDateFormat mailDateFormat;
  static final char[] name = { 73, 78, 84, 69, 82, 78, 65, 76, 68, 65, 84, 69 };
  protected Date date;
  public int msgno;

  static
  {
    mailDateFormat = new MailDateFormat();
  }

  public INTERNALDATE(FetchResponse paramFetchResponse)
    throws ParsingException
  {
    this.msgno = paramFetchResponse.getNumber();
    paramFetchResponse.skipSpaces();
    String str = paramFetchResponse.readString();
    if (str == null)
      throw new ParsingException("INTERNALDATE is NIL");
    try
    {
      this.date = mailDateFormat.parse(str);
      return;
    }
    catch (ParseException localParseException)
    {
    }
    throw new ParsingException("INTERNALDATE parse error");
  }

  public static String format(Date paramDate)
  {
    StringBuffer localStringBuffer = new StringBuffer();
    while (true)
    {
      synchronized (df)
      {
        df.format(paramDate, localStringBuffer, new FieldPosition(0));
        int i = -paramDate.getTimezoneOffset();
        if (i < 0)
        {
          localStringBuffer.append('-');
          i = -i;
          int j = i / 60;
          int k = i % 60;
          localStringBuffer.append(Character.forDigit(j / 10, 10));
          localStringBuffer.append(Character.forDigit(j % 10, 10));
          localStringBuffer.append(Character.forDigit(k / 10, 10));
          localStringBuffer.append(Character.forDigit(k % 10, 10));
          return localStringBuffer.toString();
        }
      }
      localStringBuffer.append('+');
    }
  }

  public Date getDate()
  {
    return this.date;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.protocol.INTERNALDATE
 * JD-Core Version:    0.6.2
 */