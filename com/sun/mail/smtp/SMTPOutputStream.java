package com.sun.mail.smtp;

import com.sun.mail.util.CRLFOutputStream;
import java.io.IOException;
import java.io.OutputStream;

public class SMTPOutputStream extends CRLFOutputStream
{
  public SMTPOutputStream(OutputStream paramOutputStream)
  {
    super(paramOutputStream);
  }

  public void ensureAtBOL()
    throws IOException
  {
    if (!this.atBOL)
      super.writeln();
  }

  public void flush()
  {
  }

  public void write(int paramInt)
    throws IOException
  {
    if (((this.lastb == 10) || (this.lastb == 13) || (this.lastb == -1)) && (paramInt == 46))
      this.out.write(46);
    super.write(paramInt);
  }

  public void write(byte[] paramArrayOfByte, int paramInt1, int paramInt2)
    throws IOException
  {
    int i;
    int j;
    int k;
    if (this.lastb == -1)
    {
      i = 10;
      j = paramInt1;
      k = paramInt2 + paramInt1;
    }
    for (int m = paramInt1; ; m++)
    {
      if (m >= k)
      {
        if (k - j > 0)
          super.write(paramArrayOfByte, j, k - j);
        return;
        i = this.lastb;
        break;
      }
      if (((i == 10) || (i == 13)) && (paramArrayOfByte[m] == 46))
      {
        super.write(paramArrayOfByte, j, m - j);
        this.out.write(46);
        j = m;
      }
      i = paramArrayOfByte[m];
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.smtp.SMTPOutputStream
 * JD-Core Version:    0.6.2
 */