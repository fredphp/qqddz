package com.sun.mail.imap.protocol;

import com.sun.mail.iap.ParsingException;
import com.sun.mail.iap.Response;
import java.util.Date;
import java.util.Vector;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MailDateFormat;

public class ENVELOPE
  implements Item
{
  private static MailDateFormat mailDateFormat = new MailDateFormat();
  static final char[] name = { 69, 78, 86, 69, 76, 79, 80, 69 };
  public InternetAddress[] bcc;
  public InternetAddress[] cc;
  public Date date = null;
  public InternetAddress[] from;
  public String inReplyTo;
  public String messageId;
  public int msgno;
  public InternetAddress[] replyTo;
  public InternetAddress[] sender;
  public String subject;
  public InternetAddress[] to;

  public ENVELOPE(FetchResponse paramFetchResponse)
    throws ParsingException
  {
    this.msgno = paramFetchResponse.getNumber();
    paramFetchResponse.skipSpaces();
    if (paramFetchResponse.readByte() != 40)
      throw new ParsingException("ENVELOPE parse error");
    String str = paramFetchResponse.readString();
    if (str != null);
    try
    {
      this.date = mailDateFormat.parse(str);
      label60: this.subject = paramFetchResponse.readString();
      this.from = parseAddressList(paramFetchResponse);
      this.sender = parseAddressList(paramFetchResponse);
      this.replyTo = parseAddressList(paramFetchResponse);
      this.to = parseAddressList(paramFetchResponse);
      this.cc = parseAddressList(paramFetchResponse);
      this.bcc = parseAddressList(paramFetchResponse);
      this.inReplyTo = paramFetchResponse.readString();
      this.messageId = paramFetchResponse.readString();
      if (paramFetchResponse.readByte() != 41)
        throw new ParsingException("ENVELOPE parse error");
      return;
    }
    catch (Exception localException)
    {
      break label60;
    }
  }

  private InternetAddress[] parseAddressList(Response paramResponse)
    throws ParsingException
  {
    paramResponse.skipSpaces();
    int i = paramResponse.readByte();
    if (i == 40)
    {
      Vector localVector = new Vector();
      do
      {
        IMAPAddress localIMAPAddress = new IMAPAddress(paramResponse);
        if (!localIMAPAddress.isEndOfGroup())
          localVector.addElement(localIMAPAddress);
      }
      while (paramResponse.peekByte() != 41);
      paramResponse.skip(1);
      InternetAddress[] arrayOfInternetAddress = new InternetAddress[localVector.size()];
      localVector.copyInto(arrayOfInternetAddress);
      return arrayOfInternetAddress;
    }
    if ((i == 78) || (i == 110))
    {
      paramResponse.skip(2);
      return null;
    }
    throw new ParsingException("ADDRESS parse error");
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.protocol.ENVELOPE
 * JD-Core Version:    0.6.2
 */