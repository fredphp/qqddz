package javax.activation;

import java.io.IOException;
import java.io.OutputStream;
import myjava.awt.datatransfer.DataFlavor;
import myjava.awt.datatransfer.UnsupportedFlavorException;

class DataSourceDataContentHandler
  implements DataContentHandler
{
  private DataContentHandler dch = null;
  private DataSource ds = null;
  private DataFlavor[] transferFlavors = null;

  public DataSourceDataContentHandler(DataContentHandler paramDataContentHandler, DataSource paramDataSource)
  {
    this.ds = paramDataSource;
    this.dch = paramDataContentHandler;
  }

  public Object getContent(DataSource paramDataSource)
    throws IOException
  {
    if (this.dch != null)
      return this.dch.getContent(paramDataSource);
    return paramDataSource.getInputStream();
  }

  public Object getTransferData(DataFlavor paramDataFlavor, DataSource paramDataSource)
    throws UnsupportedFlavorException, IOException
  {
    if (this.dch != null)
      return this.dch.getTransferData(paramDataFlavor, paramDataSource);
    if (paramDataFlavor.equals(getTransferDataFlavors()[0]))
      return paramDataSource.getInputStream();
    throw new UnsupportedFlavorException(paramDataFlavor);
  }

  public DataFlavor[] getTransferDataFlavors()
  {
    if (this.transferFlavors == null)
    {
      if (this.dch == null)
        break label32;
      this.transferFlavors = this.dch.getTransferDataFlavors();
    }
    while (true)
    {
      return this.transferFlavors;
      label32: this.transferFlavors = new DataFlavor[1];
      this.transferFlavors[0] = new ActivationDataFlavor(this.ds.getContentType(), this.ds.getContentType());
    }
  }

  public void writeTo(Object paramObject, String paramString, OutputStream paramOutputStream)
    throws IOException
  {
    if (this.dch != null)
    {
      this.dch.writeTo(paramObject, paramString, paramOutputStream);
      return;
    }
    throw new UnsupportedDataTypeException("no DCH for content type " + this.ds.getContentType());
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.activation.DataSourceDataContentHandler
 * JD-Core Version:    0.6.2
 */