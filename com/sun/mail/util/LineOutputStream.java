package com.sun.mail.util;

import java.io.FilterOutputStream;
import java.io.OutputStream;
import javax.mail.MessagingException;

public class LineOutputStream extends FilterOutputStream
{
  private static byte[] newline = new byte[2];

  static
  {
    newline[0] = 13;
    newline[1] = 10;
  }

  public LineOutputStream(OutputStream paramOutputStream)
  {
    super(paramOutputStream);
  }

  public void writeln()
    throws MessagingException
  {
    try
    {
      this.out.write(newline);
      return;
    }
    catch (Exception localException)
    {
      throw new MessagingException("IOException", localException);
    }
  }

  public void writeln(String paramString)
    throws MessagingException
  {
    try
    {
      byte[] arrayOfByte = ASCIIUtility.getBytes(paramString);
      this.out.write(arrayOfByte);
      this.out.write(newline);
      return;
    }
    catch (Exception localException)
    {
      throw new MessagingException("IOException", localException);
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.util.LineOutputStream
 * JD-Core Version:    0.6.2
 */