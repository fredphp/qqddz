package com.sun.mail.util;

import java.io.IOException;
import java.io.InputStream;

public class QDecoderStream extends QPDecoderStream
{
  public QDecoderStream(InputStream paramInputStream)
  {
    super(paramInputStream);
  }

  public int read()
    throws IOException
  {
    int i = this.in.read();
    if (i == 95)
      i = 32;
    while (i != 61)
      return i;
    this.ba[0] = ((byte)this.in.read());
    this.ba[1] = ((byte)this.in.read());
    try
    {
      int j = ASCIIUtility.parseInt(this.ba, 0, 2, 16);
      return j;
    }
    catch (NumberFormatException localNumberFormatException)
    {
      throw new IOException("Error in QP stream " + localNumberFormatException.getMessage());
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.util.QDecoderStream
 * JD-Core Version:    0.6.2
 */