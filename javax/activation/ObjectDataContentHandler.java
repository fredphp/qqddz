package javax.activation;

import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import myjava.awt.datatransfer.DataFlavor;
import myjava.awt.datatransfer.UnsupportedFlavorException;

class ObjectDataContentHandler
  implements DataContentHandler
{
  private DataContentHandler dch = null;
  private String mimeType;
  private Object obj;
  private DataFlavor[] transferFlavors = null;

  public ObjectDataContentHandler(DataContentHandler paramDataContentHandler, Object paramObject, String paramString)
  {
    this.obj = paramObject;
    this.mimeType = paramString;
    this.dch = paramDataContentHandler;
  }

  public Object getContent(DataSource paramDataSource)
  {
    return this.obj;
  }

  public DataContentHandler getDCH()
  {
    return this.dch;
  }

  public Object getTransferData(DataFlavor paramDataFlavor, DataSource paramDataSource)
    throws UnsupportedFlavorException, IOException
  {
    if (this.dch != null)
      return this.dch.getTransferData(paramDataFlavor, paramDataSource);
    if (paramDataFlavor.equals(getTransferDataFlavors()[0]))
      return this.obj;
    throw new UnsupportedFlavorException(paramDataFlavor);
  }

  public DataFlavor[] getTransferDataFlavors()
  {
    try
    {
      if (this.transferFlavors == null)
      {
        if (this.dch == null)
          break label38;
        this.transferFlavors = this.dch.getTransferDataFlavors();
      }
      while (true)
      {
        DataFlavor[] arrayOfDataFlavor = this.transferFlavors;
        return arrayOfDataFlavor;
        label38: this.transferFlavors = new DataFlavor[1];
        this.transferFlavors[0] = new ActivationDataFlavor(this.obj.getClass(), this.mimeType, this.mimeType);
      }
    }
    finally
    {
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
    if ((paramObject instanceof byte[]))
    {
      paramOutputStream.write((byte[])paramObject);
      return;
    }
    if ((paramObject instanceof String))
    {
      OutputStreamWriter localOutputStreamWriter = new OutputStreamWriter(paramOutputStream);
      localOutputStreamWriter.write((String)paramObject);
      localOutputStreamWriter.flush();
      return;
    }
    throw new UnsupportedDataTypeException("no object DCH for MIME type " + this.mimeType);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.activation.ObjectDataContentHandler
 * JD-Core Version:    0.6.2
 */