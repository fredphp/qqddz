package com.sun.mail.util;

import java.io.IOException;
import java.io.OutputStream;

public class QEncoderStream extends QPEncoderStream
{
  private static String TEXT_SPECIALS = "=_?";
  private static String WORD_SPECIALS = "=_?\"#$%&'(),.:;<>@[\\]^`{|}~";
  private String specials;

  public QEncoderStream(OutputStream paramOutputStream, boolean paramBoolean)
  {
    super(paramOutputStream, 2147483647);
    if (paramBoolean);
    for (String str = WORD_SPECIALS; ; str = TEXT_SPECIALS)
    {
      this.specials = str;
      return;
    }
  }

  public static int encodedLength(byte[] paramArrayOfByte, boolean paramBoolean)
  {
    int i = 0;
    if (paramBoolean);
    int j;
    for (String str = WORD_SPECIALS; ; str = TEXT_SPECIALS)
    {
      j = 0;
      if (j < paramArrayOfByte.length)
        break;
      return i;
    }
    int k = 0xFF & paramArrayOfByte[j];
    if ((k < 32) || (k >= 127) || (str.indexOf(k) >= 0))
      i += 3;
    while (true)
    {
      j++;
      break;
      i++;
    }
  }

  public void write(int paramInt)
    throws IOException
  {
    int i = paramInt & 0xFF;
    if (i == 32)
    {
      output(95, false);
      return;
    }
    if ((i < 32) || (i >= 127) || (this.specials.indexOf(i) >= 0))
    {
      output(i, true);
      return;
    }
    output(i, false);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.util.QEncoderStream
 * JD-Core Version:    0.6.2
 */