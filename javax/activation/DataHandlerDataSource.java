package javax.activation;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

class DataHandlerDataSource
  implements DataSource
{
  DataHandler dataHandler = null;

  public DataHandlerDataSource(DataHandler paramDataHandler)
  {
    this.dataHandler = paramDataHandler;
  }

  public String getContentType()
  {
    return this.dataHandler.getContentType();
  }

  public InputStream getInputStream()
    throws IOException
  {
    return this.dataHandler.getInputStream();
  }

  public String getName()
  {
    return this.dataHandler.getName();
  }

  public OutputStream getOutputStream()
    throws IOException
  {
    return this.dataHandler.getOutputStream();
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.activation.DataHandlerDataSource
 * JD-Core Version:    0.6.2
 */