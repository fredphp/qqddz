package com.sun.mail.util;

import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;

public class UUDecoderStream extends FilterInputStream
{
  private byte[] buffer;
  private int bufsize = 0;
  private boolean gotEnd = false;
  private boolean gotPrefix = false;
  private int index = 0;
  private LineInputStream lin;
  private int mode;
  private String name;

  public UUDecoderStream(InputStream paramInputStream)
  {
    super(paramInputStream);
    this.lin = new LineInputStream(paramInputStream);
    this.buffer = new byte[45];
  }

  private boolean decode()
    throws IOException
  {
    if (this.gotEnd)
      return false;
    this.bufsize = 0;
    String str1;
    do
    {
      str1 = this.lin.readLine();
      if (str1 == null)
        throw new IOException("Missing End");
      if (str1.regionMatches(true, 0, "end", 0, 3))
      {
        this.gotEnd = true;
        return false;
      }
    }
    while (str1.length() == 0);
    int i = str1.charAt(0);
    if (i < 32)
      throw new IOException("Buffer format error");
    int j = 0x3F & i - 32;
    if (j == 0)
    {
      String str2 = this.lin.readLine();
      if ((str2 == null) || (!str2.regionMatches(true, 0, "end", 0, 3)))
        throw new IOException("Missing End");
      this.gotEnd = true;
      return false;
    }
    int k = (5 + j * 8) / 6;
    if (str1.length() < k + 1)
      throw new IOException("Short buffer error");
    int m = 1;
    while (true)
    {
      if (this.bufsize >= j)
        return true;
      int n = m + 1;
      int i1 = (byte)(0x3F & '￠' + str1.charAt(m));
      m = n + 1;
      int i2 = (byte)(0x3F & '￠' + str1.charAt(n));
      byte[] arrayOfByte1 = this.buffer;
      int i3 = this.bufsize;
      this.bufsize = (i3 + 1);
      arrayOfByte1[i3] = ((byte)(0xFC & i1 << 2 | 0x3 & i2 >>> 4));
      if (this.bufsize < j)
      {
        int i8 = i2;
        int i9 = m + 1;
        i2 = (byte)(0x3F & '￠' + str1.charAt(m));
        byte[] arrayOfByte3 = this.buffer;
        int i10 = this.bufsize;
        this.bufsize = (i10 + 1);
        arrayOfByte3[i10] = ((byte)(0xF0 & i8 << 4 | 0xF & i2 >>> 2));
        m = i9;
      }
      if (this.bufsize < j)
      {
        int i4 = i2;
        int i5 = m + 1;
        int i6 = (byte)(0x3F & '￠' + str1.charAt(m));
        byte[] arrayOfByte2 = this.buffer;
        int i7 = this.bufsize;
        this.bufsize = (i7 + 1);
        arrayOfByte2[i7] = ((byte)(0xC0 & i4 << 6 | i6 & 0x3F));
        m = i5;
      }
    }
  }

  private void readPrefix()
    throws IOException
  {
    if (this.gotPrefix)
      return;
    String str;
    do
    {
      str = this.lin.readLine();
      if (str == null)
        throw new IOException("UUDecoder error: No Begin");
    }
    while (!str.regionMatches(true, 0, "begin", 0, 5));
    try
    {
      this.mode = Integer.parseInt(str.substring(6, 9));
      this.name = str.substring(10);
      this.gotPrefix = true;
      return;
    }
    catch (NumberFormatException localNumberFormatException)
    {
      throw new IOException("UUDecoder error: " + localNumberFormatException.toString());
    }
  }

  public int available()
    throws IOException
  {
    return 3 * this.in.available() / 4 + (this.bufsize - this.index);
  }

  public int getMode()
    throws IOException
  {
    readPrefix();
    return this.mode;
  }

  public String getName()
    throws IOException
  {
    readPrefix();
    return this.name;
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
      readPrefix();
      if (!decode())
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
    for (int i = 0; ; i++)
    {
      if (i >= paramInt2);
      int j;
      do
      {
        return i;
        j = read();
        if (j != -1)
          break;
      }
      while (i != 0);
      return -1;
      paramArrayOfByte[(paramInt1 + i)] = ((byte)j);
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.util.UUDecoderStream
 * JD-Core Version:    0.6.2
 */