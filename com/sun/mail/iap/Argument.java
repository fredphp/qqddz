package com.sun.mail.iap;

import com.sun.mail.util.ASCIIUtility;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.util.Vector;

public class Argument
{
  protected Vector items = new Vector(1);

  private void astring(byte[] paramArrayOfByte, Protocol paramProtocol)
    throws IOException, ProtocolException
  {
    DataOutputStream localDataOutputStream = (DataOutputStream)paramProtocol.getOutputStream();
    int i = paramArrayOfByte.length;
    if (i > 1024)
      literal(paramArrayOfByte, paramProtocol);
    label259: label265: 
    while (true)
    {
      return;
      int j;
      int k;
      int m;
      label41: int i1;
      if (i == 0)
      {
        j = 1;
        k = 0;
        m = 0;
        if (m < i)
          break label92;
        if (j != 0)
          localDataOutputStream.write(34);
        if (k == 0)
          break label259;
        i1 = 0;
        label67: if (i1 < i)
          break label221;
      }
      while (true)
      {
        if (j == 0)
          break label265;
        localDataOutputStream.write(34);
        return;
        j = 0;
        break;
        label92: int n = paramArrayOfByte[m];
        if ((n == 0) || (n == 13) || (n == 10) || ((n & 0xFF) > 127))
        {
          literal(paramArrayOfByte, paramProtocol);
          return;
        }
        if ((n == 42) || (n == 37) || (n == 40) || (n == 41) || (n == 123) || (n == 34) || (n == 92) || ((n & 0xFF) <= 32))
        {
          j = 1;
          if ((n == 34) || (n == 92))
            k = 1;
        }
        m++;
        break label41;
        label221: int i2 = paramArrayOfByte[i1];
        if ((i2 == 34) || (i2 == 92))
          localDataOutputStream.write(92);
        localDataOutputStream.write(i2);
        i1++;
        break label67;
        localDataOutputStream.write(paramArrayOfByte);
      }
    }
  }

  private void literal(Literal paramLiteral, Protocol paramProtocol)
    throws IOException, ProtocolException
  {
    paramLiteral.writeTo(startLiteral(paramProtocol, paramLiteral.size()));
  }

  private void literal(ByteArrayOutputStream paramByteArrayOutputStream, Protocol paramProtocol)
    throws IOException, ProtocolException
  {
    paramByteArrayOutputStream.writeTo(startLiteral(paramProtocol, paramByteArrayOutputStream.size()));
  }

  private void literal(byte[] paramArrayOfByte, Protocol paramProtocol)
    throws IOException, ProtocolException
  {
    startLiteral(paramProtocol, paramArrayOfByte.length).write(paramArrayOfByte);
  }

  private OutputStream startLiteral(Protocol paramProtocol, int paramInt)
    throws IOException, ProtocolException
  {
    DataOutputStream localDataOutputStream = (DataOutputStream)paramProtocol.getOutputStream();
    boolean bool = paramProtocol.supportsNonSyncLiterals();
    localDataOutputStream.write(123);
    localDataOutputStream.writeBytes(Integer.toString(paramInt));
    if (bool)
    {
      localDataOutputStream.writeBytes("+}\r\n");
      localDataOutputStream.flush();
      if (bool);
    }
    Response localResponse;
    do
    {
      localResponse = paramProtocol.readResponse();
      if (localResponse.isContinuation())
      {
        return localDataOutputStream;
        localDataOutputStream.writeBytes("}\r\n");
        break;
      }
    }
    while (!localResponse.isTagged());
    throw new LiteralException(localResponse);
  }

  public void append(Argument paramArgument)
  {
    this.items.ensureCapacity(this.items.size() + paramArgument.items.size());
    for (int i = 0; ; i++)
    {
      if (i >= paramArgument.items.size())
        return;
      this.items.addElement(paramArgument.items.elementAt(i));
    }
  }

  public void write(Protocol paramProtocol)
    throws IOException, ProtocolException
  {
    if (this.items != null);
    DataOutputStream localDataOutputStream;
    int j;
    for (int i = this.items.size(); ; i = 0)
    {
      localDataOutputStream = (DataOutputStream)paramProtocol.getOutputStream();
      j = 0;
      if (j < i)
        break;
      return;
    }
    if (j > 0)
      localDataOutputStream.write(32);
    Object localObject = this.items.elementAt(j);
    if ((localObject instanceof Atom))
      localDataOutputStream.writeBytes(((Atom)localObject).string);
    while (true)
    {
      j++;
      break;
      if ((localObject instanceof Number))
      {
        localDataOutputStream.writeBytes(((Number)localObject).toString());
      }
      else if ((localObject instanceof AString))
      {
        astring(((AString)localObject).bytes, paramProtocol);
      }
      else if ((localObject instanceof byte[]))
      {
        literal((byte[])localObject, paramProtocol);
      }
      else if ((localObject instanceof ByteArrayOutputStream))
      {
        literal((ByteArrayOutputStream)localObject, paramProtocol);
      }
      else if ((localObject instanceof Literal))
      {
        literal((Literal)localObject, paramProtocol);
      }
      else if ((localObject instanceof Argument))
      {
        localDataOutputStream.write(40);
        ((Argument)localObject).write(paramProtocol);
        localDataOutputStream.write(41);
      }
    }
  }

  public void writeArgument(Argument paramArgument)
  {
    this.items.addElement(paramArgument);
  }

  public void writeAtom(String paramString)
  {
    this.items.addElement(new Atom(paramString));
  }

  public void writeBytes(Literal paramLiteral)
  {
    this.items.addElement(paramLiteral);
  }

  public void writeBytes(ByteArrayOutputStream paramByteArrayOutputStream)
  {
    this.items.addElement(paramByteArrayOutputStream);
  }

  public void writeBytes(byte[] paramArrayOfByte)
  {
    this.items.addElement(paramArrayOfByte);
  }

  public void writeNumber(int paramInt)
  {
    this.items.addElement(new Integer(paramInt));
  }

  public void writeNumber(long paramLong)
  {
    this.items.addElement(new Long(paramLong));
  }

  public void writeString(String paramString)
  {
    this.items.addElement(new AString(ASCIIUtility.getBytes(paramString)));
  }

  public void writeString(String paramString1, String paramString2)
    throws UnsupportedEncodingException
  {
    if (paramString2 == null)
    {
      writeString(paramString1);
      return;
    }
    this.items.addElement(new AString(paramString1.getBytes(paramString2)));
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.iap.Argument
 * JD-Core Version:    0.6.2
 */