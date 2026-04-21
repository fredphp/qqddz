package com.sun.mail.handlers;

import java.io.IOException;
import java.io.OutputStream;
import javax.activation.ActivationDataFlavor;
import javax.activation.DataContentHandler;
import javax.activation.DataSource;
import javax.mail.MessagingException;
import javax.mail.internet.MimeMultipart;
import myjava.awt.datatransfer.DataFlavor;

public class multipart_mixed
  implements DataContentHandler
{
  private ActivationDataFlavor myDF = new ActivationDataFlavor(MimeMultipart.class, "multipart/mixed", "Multipart");

  public Object getContent(DataSource paramDataSource)
    throws IOException
  {
    try
    {
      MimeMultipart localMimeMultipart = new MimeMultipart(paramDataSource);
      return localMimeMultipart;
    }
    catch (MessagingException localMessagingException)
    {
      IOException localIOException = new IOException("Exception while constructing MimeMultipart");
      localIOException.initCause(localMessagingException);
      throw localIOException;
    }
  }

  public Object getTransferData(DataFlavor paramDataFlavor, DataSource paramDataSource)
    throws IOException
  {
    if (this.myDF.equals(paramDataFlavor))
      return getContent(paramDataSource);
    return null;
  }

  public DataFlavor[] getTransferDataFlavors()
  {
    DataFlavor[] arrayOfDataFlavor = new DataFlavor[1];
    arrayOfDataFlavor[0] = this.myDF;
    return arrayOfDataFlavor;
  }

  public void writeTo(Object paramObject, String paramString, OutputStream paramOutputStream)
    throws IOException
  {
    if ((paramObject instanceof MimeMultipart));
    try
    {
      ((MimeMultipart)paramObject).writeTo(paramOutputStream);
      return;
    }
    catch (MessagingException localMessagingException)
    {
      throw new IOException(localMessagingException.toString());
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.handlers.multipart_mixed
 * JD-Core Version:    0.6.2
 */