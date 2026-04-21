package javax.activation;

import java.io.IOException;
import java.io.OutputStream;
import myjava.awt.datatransfer.DataFlavor;
import myjava.awt.datatransfer.UnsupportedFlavorException;

public abstract interface DataContentHandler
{
  public abstract Object getContent(DataSource paramDataSource)
    throws IOException;

  public abstract Object getTransferData(DataFlavor paramDataFlavor, DataSource paramDataSource)
    throws UnsupportedFlavorException, IOException;

  public abstract DataFlavor[] getTransferDataFlavors();

  public abstract void writeTo(Object paramObject, String paramString, OutputStream paramOutputStream)
    throws IOException;
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.activation.DataContentHandler
 * JD-Core Version:    0.6.2
 */