package com.sun.mail.iap;

import com.sun.mail.util.ASCIIUtility;
import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;

public class ResponseInputStream
{
  private static final int incrementSlop = 16;
  private static final int maxIncrement = 262144;
  private static final int minIncrement = 256;
  private BufferedInputStream bin;

  public ResponseInputStream(InputStream paramInputStream)
  {
    this.bin = new BufferedInputStream(paramInputStream, 2048);
  }

  public ByteArray readResponse()
    throws IOException
  {
    return readResponse(null);
  }

  public ByteArray readResponse(ByteArray paramByteArray)
    throws IOException
  {
    if (paramByteArray == null)
      paramByteArray = new ByteArray(new byte[''], 0, 128);
    byte[] arrayOfByte = paramByteArray.getBytes();
    int m;
    label167: label184: label203: label342: label355: label361: for (int i = 0; ; i = m)
    {
      int j = 0;
      int k = 0;
      m = i;
      if (k == 0)
      {
        j = this.bin.read();
        if (j != -1);
      }
      else
      {
        if (j != -1)
          break label167;
        throw new IOException();
      }
      switch (j)
      {
      default:
      case 10:
      }
      while (true)
      {
        if (m >= arrayOfByte.length)
        {
          int i9 = arrayOfByte.length;
          if (i9 > 262144)
            i9 = 262144;
          paramByteArray.grow(i9);
          arrayOfByte = paramByteArray.getBytes();
        }
        int i8 = m + 1;
        arrayOfByte[m] = ((byte)j);
        m = i8;
        break;
        if ((m > 0) && (arrayOfByte[(m - 1)] == 13))
          k = 1;
      }
      if ((m < 5) || (arrayOfByte[(m - 3)] != 125));
      int n;
      do
      {
        paramByteArray.setCount(m);
        return paramByteArray;
        n = m - 4;
        if (n >= 0)
          break;
      }
      while (n < 0);
      int i1 = n + 1;
      int i2 = m - 3;
      while (true)
      {
        int i4;
        int i5;
        try
        {
          int i3 = ASCIIUtility.parseInt(arrayOfByte, i1, i2);
          i4 = i3;
          if (i4 <= 0)
            break label361;
          i5 = arrayOfByte.length - m;
          if (i4 + 16 <= i5)
            break label355;
          if (256 <= i4 + 16 - i5)
            break label342;
          i7 = 256;
          paramByteArray.grow(i7);
          arrayOfByte = paramByteArray.getBytes();
          i = m;
          if (i4 <= 0)
            break;
          int i6 = this.bin.read(arrayOfByte, i, i4);
          i4 -= i6;
          i += i6;
          continue;
          if (arrayOfByte[n] == 123)
            break label203;
          n--;
        }
        catch (NumberFormatException localNumberFormatException)
        {
        }
        break label184;
        int i7 = i4 + 16 - i5;
        continue;
        i = m;
      }
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.iap.ResponseInputStream
 * JD-Core Version:    0.6.2
 */