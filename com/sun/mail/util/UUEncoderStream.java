package com.sun.mail.util;

import java.io.FilterOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintStream;

public class UUEncoderStream extends FilterOutputStream
{
  private byte[] buffer;
  private int bufsize = 0;
  protected int mode;
  protected String name;
  private boolean wrotePrefix = false;

  public UUEncoderStream(OutputStream paramOutputStream)
  {
    this(paramOutputStream, "encoder.buf", 644);
  }

  public UUEncoderStream(OutputStream paramOutputStream, String paramString)
  {
    this(paramOutputStream, paramString, 644);
  }

  public UUEncoderStream(OutputStream paramOutputStream, String paramString, int paramInt)
  {
    super(paramOutputStream);
    this.name = paramString;
    this.mode = paramInt;
    this.buffer = new byte[45];
  }

  private void encode()
    throws IOException
  {
    int i = 0;
    this.out.write(32 + (0x3F & this.bufsize));
    if (i >= this.bufsize)
    {
      this.out.write(10);
      return;
    }
    byte[] arrayOfByte1 = this.buffer;
    int j = i + 1;
    int k = arrayOfByte1[i];
    int m;
    int n;
    if (j < this.bufsize)
    {
      byte[] arrayOfByte2 = this.buffer;
      i = j + 1;
      m = arrayOfByte2[j];
      if (i < this.bufsize)
      {
        byte[] arrayOfByte3 = this.buffer;
        int i5 = i + 1;
        n = arrayOfByte3[i];
        i = i5;
      }
    }
    while (true)
    {
      int i1 = 0x3F & k >>> 2;
      int i2 = 0x30 & k << 4 | 0xF & m >>> 4;
      int i3 = 0x3C & m << 2 | 0x3 & n >>> 6;
      int i4 = n & 0x3F;
      this.out.write(i1 + 32);
      this.out.write(i2 + 32);
      this.out.write(i3 + 32);
      this.out.write(i4 + 32);
      break;
      n = 1;
      continue;
      m = 1;
      n = 1;
      i = j;
    }
  }

  private void writePrefix()
    throws IOException
  {
    if (!this.wrotePrefix)
    {
      PrintStream localPrintStream = new PrintStream(this.out);
      localPrintStream.println("begin " + this.mode + " " + this.name);
      localPrintStream.flush();
      this.wrotePrefix = true;
    }
  }

  private void writeSuffix()
    throws IOException
  {
    PrintStream localPrintStream = new PrintStream(this.out);
    localPrintStream.println(" \nend");
    localPrintStream.flush();
  }

  public void close()
    throws IOException
  {
    flush();
    this.out.close();
  }

  public void flush()
    throws IOException
  {
    if (this.bufsize > 0)
    {
      writePrefix();
      encode();
    }
    writeSuffix();
    this.out.flush();
  }

  public void setNameMode(String paramString, int paramInt)
  {
    this.name = paramString;
    this.mode = paramInt;
  }

  public void write(int paramInt)
    throws IOException
  {
    byte[] arrayOfByte = this.buffer;
    int i = this.bufsize;
    this.bufsize = (i + 1);
    arrayOfByte[i] = ((byte)paramInt);
    if (this.bufsize == 45)
    {
      writePrefix();
      encode();
      this.bufsize = 0;
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
 * Qualified Name:     com.sun.mail.util.UUEncoderStream
 * JD-Core Version:    0.6.2
 */