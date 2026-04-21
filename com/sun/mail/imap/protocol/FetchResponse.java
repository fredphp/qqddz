package com.sun.mail.imap.protocol;

import com.sun.mail.iap.ParsingException;
import com.sun.mail.iap.Protocol;
import com.sun.mail.iap.ProtocolException;
import com.sun.mail.iap.Response;
import java.io.IOException;
import java.util.Vector;

public class FetchResponse extends IMAPResponse
{
  private static final char[] HEADER = { 46, 72, 69, 65, 68, 69, 82 };
  private static final char[] TEXT = { 46, 84, 69, 88, 84 };
  private Item[] items;

  public FetchResponse(Protocol paramProtocol)
    throws IOException, ProtocolException
  {
    super(paramProtocol);
    parse();
  }

  public FetchResponse(IMAPResponse paramIMAPResponse)
    throws IOException, ProtocolException
  {
    super(paramIMAPResponse);
    parse();
  }

  public static Item getItem(Response[] paramArrayOfResponse, int paramInt, Class paramClass)
  {
    if (paramArrayOfResponse == null)
      return null;
    int i = 0;
    if (i >= paramArrayOfResponse.length)
      return null;
    if ((paramArrayOfResponse[i] == null) || (!(paramArrayOfResponse[i] instanceof FetchResponse)) || (((FetchResponse)paramArrayOfResponse[i]).getNumber() != paramInt));
    while (true)
    {
      i++;
      break;
      FetchResponse localFetchResponse = (FetchResponse)paramArrayOfResponse[i];
      for (int j = 0; j < localFetchResponse.items.length; j++)
        if (paramClass.isInstance(localFetchResponse.items[j]))
          return localFetchResponse.items[j];
    }
  }

  private boolean match(char[] paramArrayOfChar)
  {
    int i = paramArrayOfChar.length;
    int j = this.index;
    int i1;
    for (int k = 0; ; k = i1)
    {
      if (k >= i)
        return true;
      byte[] arrayOfByte = this.buffer;
      int m = j + 1;
      int n = Character.toUpperCase((char)arrayOfByte[j]);
      i1 = k + 1;
      if (n != paramArrayOfChar[k])
        return false;
      j = m;
    }
  }

  private void parse()
    throws ParsingException
  {
    skipSpaces();
    if (this.buffer[this.index] != 40)
      throw new ParsingException("error in FETCH parsing, missing '(' at index " + this.index);
    Vector localVector = new Vector();
    Object localObject = null;
    this.index = (1 + this.index);
    if (this.index >= this.size)
      throw new ParsingException("error in FETCH parsing, ran off end of buffer, size " + this.size);
    switch (this.buffer[this.index])
    {
    default:
    case 69:
    case 70:
    case 73:
    case 66:
    case 82:
    case 85:
    }
    while (true)
    {
      if (localObject != null)
        localVector.addElement(localObject);
      if (this.buffer[this.index] != 41)
        break;
      this.index = (1 + this.index);
      this.items = new Item[localVector.size()];
      localVector.copyInto(this.items);
      return;
      if (match(ENVELOPE.name))
      {
        this.index += ENVELOPE.name.length;
        localObject = new ENVELOPE(this);
        continue;
        if (match(FLAGS.name))
        {
          this.index += FLAGS.name.length;
          localObject = new FLAGS(this);
          continue;
          if (match(INTERNALDATE.name))
          {
            this.index += INTERNALDATE.name.length;
            localObject = new INTERNALDATE(this);
            continue;
            if (match(BODY.name))
              if (this.buffer[(4 + this.index)] == 91)
              {
                this.index += BODY.name.length;
                localObject = new BODY(this);
              }
              else
              {
                if (match(BODYSTRUCTURE.name));
                for (this.index += BODYSTRUCTURE.name.length; ; this.index += BODY.name.length)
                {
                  localObject = new BODYSTRUCTURE(this);
                  break;
                }
                if (match(RFC822SIZE.name))
                {
                  this.index += RFC822SIZE.name.length;
                  localObject = new RFC822SIZE(this);
                }
                else if (match(RFC822DATA.name))
                {
                  this.index += RFC822DATA.name.length;
                  if (match(HEADER))
                    this.index += HEADER.length;
                  while (true)
                  {
                    localObject = new RFC822DATA(this);
                    break;
                    if (match(TEXT))
                      this.index += TEXT.length;
                  }
                  if (match(UID.name))
                  {
                    this.index += UID.name.length;
                    localObject = new UID(this);
                  }
                }
              }
          }
        }
      }
    }
  }

  public Item getItem(int paramInt)
  {
    return this.items[paramInt];
  }

  public Item getItem(Class paramClass)
  {
    for (int i = 0; ; i++)
    {
      if (i >= this.items.length)
        return null;
      if (paramClass.isInstance(this.items[i]))
        return this.items[i];
    }
  }

  public int getItemCount()
  {
    return this.items.length;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.protocol.FetchResponse
 * JD-Core Version:    0.6.2
 */