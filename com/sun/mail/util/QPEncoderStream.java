package com.sun.mail.util;

import java.io.FilterOutputStream;
import java.io.IOException;
import java.io.OutputStream;

public class QPEncoderStream extends FilterOutputStream
{
  private static final char[] hex = { 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70 };
  private int bytesPerLine;
  private int count = 0;
  private boolean gotCR = false;
  private boolean gotSpace = false;

  public QPEncoderStream(OutputStream paramOutputStream)
  {
    this(paramOutputStream, 76);
  }

  public QPEncoderStream(OutputStream paramOutputStream, int paramInt)
  {
    super(paramOutputStream);
    this.bytesPerLine = (paramInt - 1);
  }

  private void outputCRLF()
    throws IOException
  {
    this.out.write(13);
    this.out.write(10);
    this.count = 0;
  }

  public void close()
    throws IOException
  {
    this.out.close();
  }

  public void flush()
    throws IOException
  {
    this.out.flush();
  }

  protected void output(int paramInt, boolean paramBoolean)
    throws IOException
  {
    if (paramBoolean)
    {
      int j = 3 + this.count;
      this.count = j;
      if (j > this.bytesPerLine)
      {
        this.out.write(61);
        this.out.write(13);
        this.out.write(10);
        this.count = 3;
      }
      this.out.write(61);
      this.out.write(hex[(paramInt >> 4)]);
      this.out.write(hex[(paramInt & 0xF)]);
      return;
    }
    int i = 1 + this.count;
    this.count = i;
    if (i > this.bytesPerLine)
    {
      this.out.write(61);
      this.out.write(13);
      this.out.write(10);
      this.count = 1;
    }
    this.out.write(paramInt);
  }

  public void write(int paramInt)
    throws IOException
  {
    int i = paramInt & 0xFF;
    if (this.gotSpace)
    {
      if ((i != 13) && (i != 10))
        break label53;
      output(32, true);
    }
    while (true)
    {
      this.gotSpace = false;
      if (i != 13)
        break;
      this.gotCR = true;
      outputCRLF();
      return;
      label53: output(32, false);
    }
    if (i == 10)
      if (!this.gotCR);
    while (true)
    {
      this.gotCR = false;
      return;
      outputCRLF();
      continue;
      if (i == 32)
        this.gotSpace = true;
      else if ((i < 32) || (i >= 127) || (i == 61))
        output(i, true);
      else
        output(i, false);
    }
  }

  public void write(byte[] paramArrayOfByte)
    throws IOException
  {
    write(paramArrayOfByte, 0, paramArrayOfByte.length);
  }

  public void write(byte[] paramArrayOfByte, int paramInt1, int paramInt2)
    throws IOException
  {
    for (int i = 0; ; i++)
    {
      if (i >= paramInt2)
        return;
      write(paramArrayOfByte[(paramInt1 + i)]);
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.util.QPEncoderStream
 * JD-Core Version:    0.6.2
 */