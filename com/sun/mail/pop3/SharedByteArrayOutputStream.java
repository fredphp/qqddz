package com.sun.mail.pop3;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import javax.mail.util.SharedByteArrayInputStream;

class SharedByteArrayOutputStream extends ByteArrayOutputStream
{
  public SharedByteArrayOutputStream(int paramInt)
  {
    super(paramInt);
  }

  public InputStream toStream()
  {
    return new SharedByteArrayInputStream(this.buf, 0, this.count);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.pop3.SharedByteArrayOutputStream
 * JD-Core Version:    0.6.2
 */