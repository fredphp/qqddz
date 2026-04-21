package javax.mail.internet;

import java.io.EOFException;
import java.io.IOException;
import java.io.OutputStream;

class AsciiOutputStream extends OutputStream
{
  private int ascii = 0;
  private boolean badEOL = false;
  private boolean breakOnNonAscii;
  private boolean checkEOL = false;
  private int lastb = 0;
  private int linelen = 0;
  private boolean longLine = false;
  private int non_ascii = 0;
  private int ret = 0;

  public AsciiOutputStream(boolean paramBoolean1, boolean paramBoolean2)
  {
    this.breakOnNonAscii = paramBoolean1;
    boolean bool = false;
    if (paramBoolean2)
    {
      bool = false;
      if (paramBoolean1)
        bool = true;
    }
    this.checkEOL = bool;
  }

  private final void check(int paramInt)
    throws IOException
  {
    int i = paramInt & 0xFF;
    if ((this.checkEOL) && (((this.lastb == 13) && (i != 10)) || ((this.lastb != 13) && (i == 10))))
      this.badEOL = true;
    if ((i == 13) || (i == 10))
      this.linelen = 0;
    while (MimeUtility.nonascii(i))
    {
      this.non_ascii = (1 + this.non_ascii);
      if (!this.breakOnNonAscii)
        break label140;
      this.ret = 3;
      throw new EOFException();
      this.linelen = (1 + this.linelen);
      if (this.linelen > 998)
        this.longLine = true;
    }
    this.ascii = (1 + this.ascii);
    label140: this.lastb = i;
  }

  public int getAscii()
  {
    int i = 3;
    if (this.ret != 0)
      i = this.ret;
    do
    {
      do
        return i;
      while (this.badEOL);
      if (this.non_ascii == 0)
      {
        if (this.longLine)
          return 2;
        return 1;
      }
    }
    while (this.ascii <= this.non_ascii);
    return 2;
  }

  public void write(int paramInt)
    throws IOException
  {
    check(paramInt);
  }

  public void write(byte[] paramArrayOfByte)
    throws IOException
  {
    write(paramArrayOfByte, 0, paramArrayOfByte.length);
  }

  public void write(byte[] paramArrayOfByte, int paramInt1, int paramInt2)
    throws IOException
  {
    int i = paramInt2 + paramInt1;
    for (int j = paramInt1; ; j++)
    {
      if (j >= i)
        return;
      check(paramArrayOfByte[j]);
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.internet.AsciiOutputStream
 * JD-Core Version:    0.6.2
 */