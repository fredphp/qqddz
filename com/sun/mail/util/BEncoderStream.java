package com.sun.mail.util;

import java.io.OutputStream;

public class BEncoderStream extends BASE64EncoderStream
{
  public BEncoderStream(OutputStream paramOutputStream)
  {
    super(paramOutputStream, 2147483647);
  }

  public static int encodedLength(byte[] paramArrayOfByte)
  {
    return 4 * ((2 + paramArrayOfByte.length) / 3);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.util.BEncoderStream
 * JD-Core Version:    0.6.2
 */