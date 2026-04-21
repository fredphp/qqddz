package com.sun.mail.imap.protocol;

import com.sun.mail.iap.Protocol;
import com.sun.mail.iap.ProtocolException;
import com.sun.mail.iap.Response;
import com.sun.mail.util.ASCIIUtility;
import java.io.IOException;
import java.util.Vector;

public class IMAPResponse extends Response
{
  private String key;
  private int number;

  public IMAPResponse(Protocol paramProtocol)
    throws IOException, ProtocolException
  {
    super(paramProtocol);
    if ((isUnTagged()) && (!isOK()) && (!isNO()) && (!isBAD()) && (!isBYE()))
      this.key = readAtom();
    try
    {
      this.number = Integer.parseInt(this.key);
      this.key = readAtom();
      return;
    }
    catch (NumberFormatException localNumberFormatException)
    {
    }
  }

  public IMAPResponse(IMAPResponse paramIMAPResponse)
  {
    super(paramIMAPResponse);
    this.key = paramIMAPResponse.key;
    this.number = paramIMAPResponse.number;
  }

  public static IMAPResponse readResponse(Protocol paramProtocol)
    throws IOException, ProtocolException
  {
    Object localObject = new IMAPResponse(paramProtocol);
    if (((IMAPResponse)localObject).keyEquals("FETCH"))
      localObject = new FetchResponse((IMAPResponse)localObject);
    return localObject;
  }

  public String getKey()
  {
    return this.key;
  }

  public int getNumber()
  {
    return this.number;
  }

  public boolean keyEquals(String paramString)
  {
    return (this.key != null) && (this.key.equalsIgnoreCase(paramString));
  }

  public String[] readSimpleList()
  {
    skipSpaces();
    if (this.buffer[this.index] != 40)
      return null;
    this.index = (1 + this.index);
    Vector localVector = new Vector();
    int i = this.index;
    while (true)
    {
      if (this.buffer[this.index] == 41)
      {
        if (this.index > i)
          localVector.addElement(ASCIIUtility.toString(this.buffer, i, this.index));
        this.index = (1 + this.index);
        int j = localVector.size();
        if (j <= 0)
          break;
        String[] arrayOfString = new String[j];
        localVector.copyInto(arrayOfString);
        return arrayOfString;
      }
      if (this.buffer[this.index] == 32)
      {
        localVector.addElement(ASCIIUtility.toString(this.buffer, i, this.index));
        i = 1 + this.index;
      }
      this.index = (1 + this.index);
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.protocol.IMAPResponse
 * JD-Core Version:    0.6.2
 */