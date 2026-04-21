package javax.mail.internet;

import java.io.InputStream;

public abstract interface SharedInputStream
{
  public abstract long getPosition();

  public abstract InputStream newStream(long paramLong1, long paramLong2);
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.internet.SharedInputStream
 * JD-Core Version:    0.6.2
 */