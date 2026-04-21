package javax.activation;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public abstract interface DataSource
{
  public abstract String getContentType();

  public abstract InputStream getInputStream()
    throws IOException;

  public abstract String getName();

  public abstract OutputStream getOutputStream()
    throws IOException;
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.activation.DataSource
 * JD-Core Version:    0.6.2
 */