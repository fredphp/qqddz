package com.sun.mail.util;

import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PushbackInputStream;

public class QPDecoderStream extends FilterInputStream
{
  protected byte[] ba = new byte[2];
  protected int spaces = 0;

  public QPDecoderStream(InputStream paramInputStream)
  {
    super(new PushbackInputStream(paramInputStream, 2));
  }

  public int available()
    throws IOException
  {
    return this.in.available();
  }

  public boolean markSupported()
  {
    return false;
  }

  public int read()
    throws IOException
  {
    int i;
    if (this.spaces > 0)
    {
      this.spaces = (-1 + this.spaces);
      i = 32;
    }
    do
    {
      return i;
      i = this.in.read();
      if (i == 32)
      {
        int n;
        while (true)
        {
          n = this.in.read();
          if (n != 32)
          {
            if ((n != 13) && (n != 10) && (n != -1))
              break;
            this.spaces = 0;
            return n;
          }
          this.spaces = (1 + this.spaces);
        }
        ((PushbackInputStream)this.in).unread(n);
        return 32;
      }
    }
    while (i != 61);
    int j = this.in.read();
    if (j == 10)
      return read();
    if (j == 13)
    {
      int m = this.in.read();
      if (m != 10)
        ((PushbackInputStream)this.in).unread(m);
      return read();
    }
    if (j == -1)
      return -1;
    this.ba[0] = ((byte)j);
    this.ba[1] = ((byte)this.in.read());
    try
    {
      int k = ASCIIUtility.parseInt(this.ba, 0, 2, 16);
      return k;
    }
    catch (NumberFormatException localNumberFormatException)
    {
      ((PushbackInputStream)this.in).unread(this.ba);
    }
    return i;
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
 * Qualified Name:     com.sun.mail.util.QPDecoderStream
 * JD-Core Version:    0.6.2
 */