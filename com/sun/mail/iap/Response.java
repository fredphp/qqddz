package com.sun.mail.iap;

import com.sun.mail.util.ASCIIUtility;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Vector;

public class Response
{
  public static final int BAD = 12;
  public static final int BYE = 16;
  public static final int CONTINUATION = 1;
  public static final int NO = 8;
  public static final int OK = 4;
  public static final int SYNTHETIC = 32;
  public static final int TAGGED = 2;
  public static final int TAG_MASK = 3;
  public static final int TYPE_MASK = 28;
  public static final int UNTAGGED = 3;
  private static final int increment = 100;
  protected byte[] buffer = null;
  protected int index;
  protected int pindex;
  protected int size;
  protected String tag = null;
  protected int type = 0;

  public Response(Protocol paramProtocol)
    throws IOException, ProtocolException
  {
    ByteArray localByteArray1 = paramProtocol.getResponseBuffer();
    ByteArray localByteArray2 = paramProtocol.getInputStream().readResponse(localByteArray1);
    this.buffer = localByteArray2.getBytes();
    this.size = (-2 + localByteArray2.getCount());
    parse();
  }

  public Response(Response paramResponse)
  {
    this.index = paramResponse.index;
    this.size = paramResponse.size;
    this.buffer = paramResponse.buffer;
    this.type = paramResponse.type;
    this.tag = paramResponse.tag;
  }

  public Response(String paramString)
  {
    this.buffer = ASCIIUtility.getBytes(paramString);
    this.size = this.buffer.length;
    parse();
  }

  public static Response byeResponse(Exception paramException)
  {
    Response localResponse = new Response(("* BYE JavaMail Exception: " + paramException.toString()).replace('\r', ' ').replace('\n', ' '));
    localResponse.type = (0x20 | localResponse.type);
    return localResponse;
  }

  private void parse()
  {
    this.index = 0;
    if (this.buffer[this.index] == 43)
    {
      this.type = (0x1 | this.type);
      this.index = (1 + this.index);
      return;
    }
    int i;
    String str;
    if (this.buffer[this.index] == 42)
    {
      this.type = (0x3 | this.type);
      this.index = (1 + this.index);
      i = this.index;
      str = readAtom();
      if (str == null)
        str = "";
      if (!str.equalsIgnoreCase("OK"))
        break label140;
      this.type = (0x4 | this.type);
    }
    while (true)
    {
      this.pindex = this.index;
      return;
      this.type = (0x2 | this.type);
      this.tag = readAtom();
      break;
      label140: if (str.equalsIgnoreCase("NO"))
        this.type = (0x8 | this.type);
      else if (str.equalsIgnoreCase("BAD"))
        this.type = (0xC | this.type);
      else if (str.equalsIgnoreCase("BYE"))
        this.type = (0x10 | this.type);
      else
        this.index = i;
    }
  }

  private Object parseString(boolean paramBoolean1, boolean paramBoolean2)
  {
    skipSpaces();
    int i = this.buffer[this.index];
    int i1;
    int i2;
    int i3;
    String str;
    if (i == 34)
    {
      this.index = (1 + this.index);
      i1 = this.index;
      i2 = this.index;
      i3 = this.buffer[this.index];
      if (i3 == 34)
      {
        this.index = (1 + this.index);
        if (!paramBoolean2)
          break label148;
        str = ASCIIUtility.toString(this.buffer, i1, i2);
      }
    }
    label148: label323: 
    do
    {
      int j;
      do
      {
        return str;
        if (i3 == 92)
          this.index = (1 + this.index);
        if (this.index != i2)
          this.buffer[i2] = this.buffer[this.index];
        i2++;
        this.index = (1 + this.index);
        break;
        return new ByteArray(this.buffer, i1, i2 - i1);
        if (i == 123)
        {
          int k = 1 + this.index;
          this.index = k;
          int m;
          int n;
          while (true)
          {
            if (this.buffer[this.index] == 125);
            try
            {
              m = ASCIIUtility.parseInt(this.buffer, k, this.index);
              n = 3 + this.index;
              this.index = (n + m);
              if (paramBoolean2)
              {
                return ASCIIUtility.toString(this.buffer, n, n + m);
                this.index = (1 + this.index);
              }
            }
            catch (NumberFormatException localNumberFormatException)
            {
              return null;
            }
          }
          return new ByteArray(this.buffer, n, m);
        }
        if (!paramBoolean1)
          break label323;
        j = this.index;
        str = readAtom();
      }
      while (paramBoolean2);
      return new ByteArray(this.buffer, j, this.index);
      if (i == 78)
        break label338;
      str = null;
    }
    while (i != 110);
    label338: this.index = (3 + this.index);
    return null;
  }

  public String getRest()
  {
    skipSpaces();
    return ASCIIUtility.toString(this.buffer, this.index, this.size);
  }

  public String getTag()
  {
    return this.tag;
  }

  public int getType()
  {
    return this.type;
  }

  public boolean isBAD()
  {
    return (0x1C & this.type) == 12;
  }

  public boolean isBYE()
  {
    return (0x1C & this.type) == 16;
  }

  public boolean isContinuation()
  {
    return (0x3 & this.type) == 1;
  }

  public boolean isNO()
  {
    return (0x1C & this.type) == 8;
  }

  public boolean isOK()
  {
    return (0x1C & this.type) == 4;
  }

  public boolean isSynthetic()
  {
    return (0x20 & this.type) == 32;
  }

  public boolean isTagged()
  {
    return (0x3 & this.type) == 2;
  }

  public boolean isUnTagged()
  {
    return (0x3 & this.type) == 3;
  }

  public byte peekByte()
  {
    if (this.index < this.size)
      return this.buffer[this.index];
    return 0;
  }

  public String readAtom()
  {
    return readAtom('\000');
  }

  public String readAtom(char paramChar)
  {
    skipSpaces();
    if (this.index >= this.size)
      return null;
    int i = this.index;
    while (true)
    {
      if (this.index < this.size)
      {
        char c = this.buffer[this.index];
        if ((c > ' ') && (c != '(') && (c != ')') && (c != '%') && (c != '*') && (c != '"') && (c != '\\') && (c != '') && ((paramChar == 0) || (c != paramChar)));
      }
      else
      {
        return ASCIIUtility.toString(this.buffer, i, this.index);
      }
      this.index = (1 + this.index);
    }
  }

  public String readAtomString()
  {
    return (String)parseString(true, true);
  }

  public byte readByte()
  {
    if (this.index < this.size)
    {
      byte[] arrayOfByte = this.buffer;
      int i = this.index;
      this.index = (i + 1);
      return arrayOfByte[i];
    }
    return 0;
  }

  public ByteArray readByteArray()
  {
    if (isContinuation())
    {
      skipSpaces();
      return new ByteArray(this.buffer, this.index, this.size - this.index);
    }
    return (ByteArray)parseString(false, false);
  }

  public ByteArrayInputStream readBytes()
  {
    ByteArray localByteArray = readByteArray();
    if (localByteArray != null)
      return localByteArray.toByteArrayInputStream();
    return null;
  }

  public long readLong()
  {
    skipSpaces();
    int i = this.index;
    while (((this.index < this.size) && (Character.isDigit((char)this.buffer[this.index]))) || (this.index > i))
      try
      {
        long l = ASCIIUtility.parseLong(this.buffer, i, this.index);
        return l;
        this.index = (1 + this.index);
      }
      catch (NumberFormatException localNumberFormatException)
      {
      }
    return -1L;
  }

  public int readNumber()
  {
    skipSpaces();
    int i = this.index;
    while (((this.index < this.size) && (Character.isDigit((char)this.buffer[this.index]))) || (this.index > i))
      try
      {
        int j = ASCIIUtility.parseInt(this.buffer, i, this.index);
        return j;
        this.index = (1 + this.index);
      }
      catch (NumberFormatException localNumberFormatException)
      {
      }
    return -1;
  }

  public String readString()
  {
    return (String)parseString(false, true);
  }

  public String readString(char paramChar)
  {
    skipSpaces();
    if (this.index >= this.size)
      return null;
    int i = this.index;
    while (true)
    {
      if ((this.index >= this.size) || (this.buffer[this.index] == paramChar))
        return ASCIIUtility.toString(this.buffer, i, this.index);
      this.index = (1 + this.index);
    }
  }

  public String[] readStringList()
  {
    skipSpaces();
    if (this.buffer[this.index] != 40);
    Vector localVector;
    int j;
    do
    {
      return null;
      this.index = (1 + this.index);
      localVector = new Vector();
      byte[] arrayOfByte;
      int i;
      do
      {
        localVector.addElement(readString());
        arrayOfByte = this.buffer;
        i = this.index;
        this.index = (i + 1);
      }
      while (arrayOfByte[i] != 41);
      j = localVector.size();
    }
    while (j <= 0);
    String[] arrayOfString = new String[j];
    localVector.copyInto(arrayOfString);
    return arrayOfString;
  }

  public void reset()
  {
    this.index = this.pindex;
  }

  public void skip(int paramInt)
  {
    this.index = (paramInt + this.index);
  }

  public void skipSpaces()
  {
    while (true)
    {
      if ((this.index >= this.size) || (this.buffer[this.index] != 32))
        return;
      this.index = (1 + this.index);
    }
  }

  public void skipToken()
  {
    while (true)
    {
      if ((this.index >= this.size) || (this.buffer[this.index] == 32))
        return;
      this.index = (1 + this.index);
    }
  }

  public String toString()
  {
    return ASCIIUtility.toString(this.buffer, 0, this.size);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.iap.Response
 * JD-Core Version:    0.6.2
 */