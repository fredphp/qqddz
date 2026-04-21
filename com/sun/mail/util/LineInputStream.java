package com.sun.mail.util;

import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PushbackInputStream;

public class LineInputStream extends FilterInputStream
{
  private char[] lineBuffer = null;

  public LineInputStream(InputStream paramInputStream)
  {
    super(paramInputStream);
  }

  public String readLine()
    throws IOException
  {
    Object localObject = this.in;
    char[] arrayOfChar = this.lineBuffer;
    if (arrayOfChar == null)
    {
      arrayOfChar = new char[''];
      this.lineBuffer = arrayOfChar;
    }
    int i = arrayOfChar.length;
    int m;
    for (int j = 0; ; j = m)
    {
      int k = ((InputStream)localObject).read();
      if (k == -1);
      while (true)
      {
        if ((k != -1) || (j != 0))
          break label195;
        return null;
        if (k != 10)
        {
          if (k != 13)
            break;
          int n = ((InputStream)localObject).read();
          if (n == 13)
            n = ((InputStream)localObject).read();
          if (n != 10)
          {
            if (!(localObject instanceof PushbackInputStream))
            {
              PushbackInputStream localPushbackInputStream = new PushbackInputStream((InputStream)localObject);
              this.in = localPushbackInputStream;
              localObject = localPushbackInputStream;
            }
            ((PushbackInputStream)localObject).unread(n);
          }
        }
      }
      i--;
      if (i < 0)
      {
        arrayOfChar = new char[j + 128];
        i = -1 + (arrayOfChar.length - j);
        System.arraycopy(this.lineBuffer, 0, arrayOfChar, 0, j);
        this.lineBuffer = arrayOfChar;
      }
      m = j + 1;
      arrayOfChar[j] = ((char)k);
    }
    label195: return String.copyValueOf(arrayOfChar, 0, j);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.util.LineInputStream
 * JD-Core Version:    0.6.2
 */