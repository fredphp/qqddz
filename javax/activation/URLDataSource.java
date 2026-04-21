package javax.activation;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;

public class URLDataSource
  implements DataSource
{
  private URL url = null;
  private URLConnection url_conn = null;

  public URLDataSource(URL paramURL)
  {
    this.url = paramURL;
  }

  public String getContentType()
  {
    try
    {
      if (this.url_conn == null)
        this.url_conn = this.url.openConnection();
      label18: URLConnection localURLConnection = this.url_conn;
      String str = null;
      if (localURLConnection != null)
        str = this.url_conn.getContentType();
      if (str == null)
        str = "application/octet-stream";
      return str;
    }
    catch (IOException localIOException)
    {
      break label18;
    }
  }

  public InputStream getInputStream()
    throws IOException
  {
    return this.url.openStream();
  }

  public String getName()
  {
    return this.url.getFile();
  }

  public OutputStream getOutputStream()
    throws IOException
  {
    this.url_conn = this.url.openConnection();
    if (this.url_conn != null)
    {
      this.url_conn.setDoOutput(true);
      return this.url_conn.getOutputStream();
    }
    return null;
  }

  public URL getURL()
  {
    return this.url;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.activation.URLDataSource
 * JD-Core Version:    0.6.2
 */