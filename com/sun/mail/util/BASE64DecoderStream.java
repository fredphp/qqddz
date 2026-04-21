package com.sun.mail.util;

import java.io.EOFException;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;

public class BASE64DecoderStream extends FilterInputStream
{
  private static final char[] pem_array = { 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47 };
  private static final byte[] pem_convert_array = new byte[256];
  private byte[] buffer = new byte[3];
  private int bufsize = 0;
  private boolean ignoreErrors = false;
  private int index = 0;
  private byte[] input_buffer = new byte[8190];
  private int input_len = 0;
  private int input_pos = 0;

  static
  {
    int i = 0;
    if (i >= 255);
    for (int j = 0; ; j++)
    {
      if (j >= pem_array.length)
      {
        return;
        pem_convert_array[i] = -1;
        i++;
        break;
      }
      pem_convert_array[pem_array[j]] = ((byte)j);
    }
  }

  public BASE64DecoderStream(InputStream paramInputStream)
  {
    super(paramInputStream);
    try
    {
      String str = System.getProperty("mail.mime.base64.ignoreerrors");
      boolean bool1 = false;
      if (str != null)
      {
        boolean bool2 = str.equalsIgnoreCase("false");
        bool1 = false;
        if (!bool2)
          bool1 = true;
      }
      this.ignoreErrors = bool1;
      return;
    }
    catch (SecurityException localSecurityException)
    {
    }
  }

  public BASE64DecoderStream(InputStream paramInputStream, boolean paramBoolean)
  {
    super(paramInputStream);
    this.ignoreErrors = paramBoolean;
  }

  private int decode(byte[] paramArrayOfByte, int paramInt1, int paramInt2)
    throws IOException
  {
    int i = paramInt1;
    if (paramInt2 < 3)
      return paramInt1 - i;
    int j = 0;
    int m;
    int i6;
    for (int k = 0; ; k = i6 | m)
    {
      if (j >= 4)
      {
        paramArrayOfByte[(paramInt1 + 2)] = ((byte)(k & 0xFF));
        int i7 = k >> 8;
        paramArrayOfByte[(paramInt1 + 1)] = ((byte)(i7 & 0xFF));
        paramArrayOfByte[paramInt1] = ((byte)(0xFF & i7 >> 8));
        paramInt2 -= 3;
        paramInt1 += 3;
        break;
      }
      m = getByte();
      if ((m == -1) || (m == -2))
      {
        int n;
        int i1;
        int i2;
        int i3;
        if (m == -1)
        {
          if (j == 0)
            return paramInt1 - i;
          if (!this.ignoreErrors)
            throw new IOException("Error in encoded stream: needed 4 valid base64 characters but only got " + j + " before EOF" + recentChars());
          n = 1;
          i1 = j - 1;
          if (i1 == 0)
            i1 = 1;
          i2 = j + 1;
          i3 = k << 6;
        }
        while (true)
        {
          if (i2 >= 4)
          {
            int i5 = i3 >> 8;
            if (i1 == 2)
              paramArrayOfByte[(paramInt1 + 1)] = ((byte)(i5 & 0xFF));
            paramArrayOfByte[paramInt1] = ((byte)(0xFF & i5 >> 8));
            return paramInt1 + i1 - i;
            if ((j < 2) && (!this.ignoreErrors))
              throw new IOException("Error in encoded stream: needed at least 2 valid base64 characters, but only got " + j + " before padding character (=)" + recentChars());
            if (j == 0)
              return paramInt1 - i;
            n = 0;
            break;
          }
          if (n == 0)
          {
            int i4 = getByte();
            if (i4 == -1)
            {
              if (!this.ignoreErrors)
                throw new IOException("Error in encoded stream: hit EOF while looking for padding characters (=)" + recentChars());
            }
            else if ((i4 != -2) && (!this.ignoreErrors))
              throw new IOException("Error in encoded stream: found valid base64 character after a padding character (=)" + recentChars());
          }
          i3 <<= 6;
          i2++;
        }
      }
      i6 = k << 6;
      j++;
    }
  }

  public static byte[] decode(byte[] paramArrayOfByte)
  {
    int i = 3 * (paramArrayOfByte.length / 4);
    if (i == 0)
      return paramArrayOfByte;
    if (paramArrayOfByte[(-1 + paramArrayOfByte.length)] == 61)
    {
      i--;
      if (paramArrayOfByte[(-2 + paramArrayOfByte.length)] == 61)
        i--;
    }
    byte[] arrayOfByte1 = new byte[i];
    int j = 0;
    int k = paramArrayOfByte.length;
    int m = 0;
    if (k <= 0)
      return arrayOfByte1;
    int n = 3;
    byte[] arrayOfByte2 = pem_convert_array;
    int i1 = m + 1;
    int i2 = arrayOfByte2[(0xFF & paramArrayOfByte[m])] << 6;
    byte[] arrayOfByte3 = pem_convert_array;
    int i3 = i1 + 1;
    int i4 = (i2 | arrayOfByte3[(0xFF & paramArrayOfByte[i1])]) << 6;
    int i5;
    label158: int i6;
    if (paramArrayOfByte[i3] != 61)
    {
      byte[] arrayOfByte5 = pem_convert_array;
      i5 = i3 + 1;
      i4 |= arrayOfByte5[(0xFF & paramArrayOfByte[i3])];
      i6 = i4 << 6;
      if (paramArrayOfByte[i5] == 61)
        break label286;
      byte[] arrayOfByte4 = pem_convert_array;
      int i8 = i5 + 1;
      i6 |= arrayOfByte4[(0xFF & paramArrayOfByte[i5])];
      i5 = i8;
    }
    while (true)
    {
      if (n > 2)
        arrayOfByte1[(j + 2)] = ((byte)(i6 & 0xFF));
      int i7 = i6 >> 8;
      if (n > 1)
        arrayOfByte1[(j + 1)] = ((byte)(i7 & 0xFF));
      arrayOfByte1[j] = ((byte)(0xFF & i7 >> 8));
      j += n;
      k -= 4;
      m = i5;
      break;
      n--;
      i5 = i3;
      break label158;
      label286: n--;
    }
  }

  private int getByte()
    throws IOException
  {
    int k;
    do
    {
      if (this.input_pos >= this.input_len)
      {
        try
        {
          this.input_len = this.in.read(this.input_buffer);
          if (this.input_len <= 0)
            return -1;
        }
        catch (EOFException localEOFException)
        {
          return -1;
        }
        this.input_pos = 0;
      }
      byte[] arrayOfByte = this.input_buffer;
      int i = this.input_pos;
      this.input_pos = (i + 1);
      int j = 0xFF & arrayOfByte[i];
      if (j == 61)
        return -2;
      k = pem_convert_array[j];
    }
    while (k == -1);
    return k;
  }

  private String recentChars()
  {
    int i = 10;
    String str1 = "";
    if (this.input_pos > i);
    String str2;
    int j;
    while (true)
    {
      if (i > 0)
      {
        str2 = str1 + ", the " + i + " most recent characters were: \"";
        j = this.input_pos - i;
        if (j < this.input_pos)
          break;
        str1 = str2 + "\"";
      }
      return str1;
      i = this.input_pos;
    }
    char c = (char)(0xFF & this.input_buffer[j]);
    switch (c)
    {
    case '\013':
    case '\f':
    default:
      if ((c >= ' ') && (c < ''))
        str2 = str2 + c;
      break;
    case '\r':
    case '\n':
    case '\t':
    }
    while (true)
    {
      j++;
      break;
      str2 = str2 + "\\r";
      continue;
      str2 = str2 + "\\n";
      continue;
      str2 = str2 + "\\t";
      continue;
      str2 = str2 + "\\" + c;
    }
  }

  public int available()
    throws IOException
  {
    return 3 * this.in.available() / 4 + (this.bufsize - this.index);
  }

  public boolean markSupported()
  {
    return false;
  }

  public int read()
    throws IOException
  {
    if (this.index >= this.bufsize)
    {
      this.bufsize = decode(this.buffer, 0, this.buffer.length);
      if (this.bufsize <= 0)
        return -1;
      this.index = 0;
    }
    byte[] arrayOfByte = this.buffer;
    int i = this.index;
    this.index = (i + 1);
    return 0xFF & arrayOfByte[i];
  }

  public int read(byte[] paramArrayOfByte, int paramInt1, int paramInt2)
    throws IOException
  {
    int i = paramInt1;
    while (true)
    {
      if ((this.index >= this.bufsize) || (paramInt2 <= 0))
      {
        if (this.index >= this.bufsize)
        {
          this.index = 0;
          this.bufsize = 0;
        }
        int j = 3 * (paramInt2 / 3);
        if (j <= 0)
          break label197;
        int i2 = decode(paramArrayOfByte, paramInt1, j);
        paramInt1 += i2;
        paramInt2 -= i2;
        if (i2 == j)
          break label197;
        if (paramInt1 != i)
          break;
        return -1;
      }
      int i3 = paramInt1 + 1;
      byte[] arrayOfByte = this.buffer;
      int i4 = this.index;
      this.index = (i4 + 1);
      paramArrayOfByte[paramInt1] = arrayOfByte[i4];
      paramInt2--;
      paramInt1 = i3;
    }
    return paramInt1 - i;
    label197: label201: 
    while (true)
    {
      int n = read();
      int i1;
      if (n == -1)
      {
        if (k == i)
          return -1;
      }
      else
      {
        i1 = k + 1;
        paramArrayOfByte[k] = ((byte)n);
        paramInt2--;
      }
      for (int k = i1; ; k = paramInt1)
      {
        if (paramInt2 > 0)
          break label201;
        break;
        int m = k - i;
        return m;
      }
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.util.BASE64DecoderStream
 * JD-Core Version:    0.6.2
 */