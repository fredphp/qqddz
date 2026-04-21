package com.sun.mail.dsn;

import java.io.IOException;
import java.io.OutputStream;
import javax.activation.ActivationDataFlavor;
import javax.activation.DataContentHandler;
import javax.activation.DataSource;
import javax.mail.MessagingException;
import myjava.awt.datatransfer.DataFlavor;

public class message_deliverystatus
  implements DataContentHandler
{
  ActivationDataFlavor ourDataFlavor = new ActivationDataFlavor(DeliveryStatus.class, "message/delivery-status", "Delivery Status");

  public Object getContent(DataSource paramDataSource)
    throws IOException
  {
    try
    {
      DeliveryStatus localDeliveryStatus = new DeliveryStatus(paramDataSource.getInputStream());
      return localDeliveryStatus;
    }
    catch (MessagingException localMessagingException)
    {
      throw new IOException("Exception creating DeliveryStatus in message/devliery-status DataContentHandler: " + localMessagingException.toString());
    }
  }

  public Object getTransferData(DataFlavor paramDataFlavor, DataSource paramDataSource)
    throws IOException
  {
    if (this.ourDataFlavor.equals(paramDataFlavor))
      return getContent(paramDataSource);
    return null;
  }

  public DataFlavor[] getTransferDataFlavors()
  {
    DataFlavor[] arrayOfDataFlavor = new DataFlavor[1];
    arrayOfDataFlavor[0] = this.ourDataFlavor;
    return arrayOfDataFlavor;
  }

  public void writeTo(Object paramObject, String paramString, OutputStream paramOutputStream)
    throws IOException
  {
    if ((paramObject instanceof DeliveryStatus))
    {
      DeliveryStatus localDeliveryStatus = (DeliveryStatus)paramObject;
      try
      {
        localDeliveryStatus.writeTo(paramOutputStream);
        return;
      }
      catch (MessagingException localMessagingException)
      {
        throw new IOException(localMessagingException.toString());
      }
    }
    throw new IOException("unsupported object");
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.dsn.message_deliverystatus
 * JD-Core Version:    0.6.2
 */