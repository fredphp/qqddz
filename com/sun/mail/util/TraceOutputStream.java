package com.sun.mail.util;

import java.io.FilterOutputStream;
import java.io.IOException;
import java.io.OutputStream;

public class TraceOutputStream extends FilterOutputStream
{
  private boolean quote = false;
  private boolean trace = false;
  private OutputStream traceOut;

  public TraceOutputStream(OutputStream paramOutputStream1, OutputStream paramOutputStream2)
  {
    super(paramOutputStream1);
    this.traceOut = paramOutputStream2;
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

  public void setQuote(boolean paramBoolean)
  {
    this.quote = paramBoolean;
  }

  public void setTrace(boolean paramBoolean)
  {
    this.trace = paramBoolean;
  }

  public void write(int paramInt)
    throws IOException
  {
    if (this.trace)
    {
      if (!this.quote)
        break label28;
      writeByte(paramInt);
    }
    while (true)
    {
      this.out.write(paramInt);
      return;
      label28: this.traceOut.write(paramInt);
    }
  }

  public void write(byte[] paramArrayOfByte, int paramInt1, int paramInt2)
    throws IOException
  {
    int i;
    if (this.trace)
    {
      if (!this.quote)
        break label50;
      i = 0;
      if (i < paramInt2)
        break label34;
    }
    while (true)
    {
      this.out.write(paramArrayOfByte, paramInt1, paramInt2);
      return;
      label34: writeByte(paramArrayOfByte[(paramInt1 + i)]);
      i++;
      break;
      label50: this.traceOut.write(paramArrayOfByte, paramInt1, paramInt2);
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.util.TraceOutputStream
 * JD-Core Version:    0.6.2
 */