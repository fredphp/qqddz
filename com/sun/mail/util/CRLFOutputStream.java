package com.sun.mail.util;

import java.io.FilterOutputStream;
import java.io.IOException;
import java.io.OutputStream;

public class CRLFOutputStream extends FilterOutputStream
{
  private static final byte[] newline = { 13, 10 };
  protected boolean atBOL = true;
  protected int lastb = -1;

  public CRLFOutputStream(OutputStream paramOutputStream)
  {
    super(paramOutputStream);
  }

  public void write(int paramInt)
    throws IOException
  {
    if (paramInt == 13)
      writeln();
    while (true)
    {
      this.lastb = paramInt;
      return;
      if (paramInt == 10)
      {
        if (this.lastb != 13)
          writeln();
      }
      else
      {
        this.out.write(paramInt);
        this.atBOL = false;
      }
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
    int i = paramInt1;
    int j = paramInt2 + paramInt1;
    int k = i;
    if (k >= j)
    {
      if (j - i > 0)
      {
        this.out.write(paramArrayOfByte, i, j - i);
        this.atBOL = false;
      }
      return;
    }
    if (paramArrayOfByte[k] == 13)
    {
      this.out.write(paramArrayOfByte, i, k - i);
      writeln();
      i = k + 1;
    }
    while (true)
    {
      this.lastb = paramArrayOfByte[k];
      k++;
      break;
      if (paramArrayOfByte[k] == 10)
      {
        if (this.lastb != 13)
        {
          this.out.write(paramArrayOfByte, i, k - i);
          writeln();
        }
        i = k + 1;
      }
    }
  }

  public void writeln()
    throws IOException
  {
    this.out.write(newline);
    this.atBOL = true;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.util.CRLFOutputStream
 * JD-Core Version:    0.6.2
 */