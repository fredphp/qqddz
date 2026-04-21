package com.sun.mail.imap.protocol;

import com.sun.mail.iap.ParsingException;
import com.sun.mail.iap.Response;
import java.util.Vector;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;

class IMAPAddress extends InternetAddress
{
  private static final long serialVersionUID = -3835822029483122232L;
  private boolean group = false;
  private InternetAddress[] grouplist;
  private String groupname;

  IMAPAddress(Response paramResponse)
    throws ParsingException
  {
    paramResponse.skipSpaces();
    if (paramResponse.readByte() != 40)
      throw new ParsingException("ADDRESS parse error");
    this.encodedPersonal = paramResponse.readString();
    paramResponse.readString();
    String str1 = paramResponse.readString();
    String str2 = paramResponse.readString();
    if (paramResponse.readByte() != 41)
      throw new ParsingException("ADDRESS parse error");
    if (str2 == null)
    {
      this.group = true;
      this.groupname = str1;
      if (this.groupname == null)
        return;
      StringBuffer localStringBuffer = new StringBuffer();
      localStringBuffer.append(this.groupname).append(':');
      Vector localVector = new Vector();
      while (true)
      {
        if (paramResponse.peekByte() == 41);
        IMAPAddress localIMAPAddress;
        do
        {
          localStringBuffer.append(';');
          this.address = localStringBuffer.toString();
          this.grouplist = new IMAPAddress[localVector.size()];
          localVector.copyInto(this.grouplist);
          return;
          localIMAPAddress = new IMAPAddress(paramResponse);
        }
        while (localIMAPAddress.isEndOfGroup());
        if (localVector.size() != 0)
          localStringBuffer.append(',');
        localStringBuffer.append(localIMAPAddress.toString());
        localVector.addElement(localIMAPAddress);
      }
    }
    if ((str1 == null) || (str1.length() == 0))
    {
      this.address = str2;
      return;
    }
    if (str2.length() == 0)
    {
      this.address = str1;
      return;
    }
    this.address = (str1 + "@" + str2);
  }

  public InternetAddress[] getGroup(boolean paramBoolean)
    throws AddressException
  {
    if (this.grouplist == null)
      return null;
    return (InternetAddress[])this.grouplist.clone();
  }

  boolean isEndOfGroup()
  {
    return (this.group) && (this.groupname == null);
  }

  public boolean isGroup()
  {
    return this.group;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.protocol.IMAPAddress
 * JD-Core Version:    0.6.2
 */