package javax.mail;

import java.io.IOException;
import java.io.InputStream;

abstract interface StreamLoader
{
  public abstract void load(InputStream paramInputStream)
    throws IOException;
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.StreamLoader
 * JD-Core Version:    0.6.2
 */