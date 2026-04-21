package com.sun.mail.util;

import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public class TraceInputStream extends FilterInputStream
{
  private boolean quote = false;
  private boolean trace = false;
  private OutputStream traceOut;

  public TraceInputStream(InputStream paramInputStream, OutputStream paramOutputStream)
  {
    super(paramInputStream);
    this.traceOut = paramOutputStream;
  }

  private final void writeByte(int paramInt)
    throws IOException
  {
    int i = paramInt & 0xFF;
    if (i > 127)
    {
      this.traceOut.write(77);
      this.traceOut.write(45);
      i &= 127;
    }
    if (i == 13)
    {
      this.traceOut.write(92);
      this.traceOut.write(114);
      return;
    }
    if (i == 10)
    {
      this.traceOut.write(92);
      this.traceOut.write(110);
      this.traceOut.write(10);
      return;
    }
    if (i == 9)
    {
      this.traceOut.write(92);
      this.traceOut.write(116);
      return;
    }
    if (i < 32)
    {
      this.traceOut.write(94);
      this.traceOut.write(i + 64);
      return;
    }
    this.traceOut.write(i);
  }

  public int read()
    throws IOException
  {
    int i = this.in.read();
    if ((this.trace) && (i != -1))
    {
      if (this.quote)
        writeByte(i);
    }
    else
      return i;
    this.traceOut.write(i);
    return i;
  }

  public int read(byte[] paramArrayOfByte, int paramInt1, int paramInt2)
    throws IOException
  {
    int i = this.in.read(paramArrayOfByte, paramInt1, paramInt2);
    if ((this.trace) && (i != -1))
    {
      if (!this.quote);
    }
    else
      for (int j = 0; ; j++)
      {
        if (j >= i)
          return i;
        writeByte(paramArrayOfByte[(paramInt1 + j)]);
      }
    this.traceOut.write(paramArrayOfByte, paramInt1, i);
    return i;
  }

  public void setQuote(boolean paramBoolean)
  {
    this.quote = paramBoolean;
  }

  public void setTrace(boolean paramBoolean)
  {
    this.trace = paramBoolean;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.util.TraceInputStream
 * JD-Core Version:    0.6.2
 */