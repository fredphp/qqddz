package com.sun.mail.handlers;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Properties;
import javax.activation.ActivationDataFlavor;
import javax.activation.DataContentHandler;
import javax.activation.DataSource;
import javax.mail.Message;
import javax.mail.MessageAware;
import javax.mail.MessageContext;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.internet.MimeMessage;
import myjava.awt.datatransfer.DataFlavor;

public class message_rfc822
  implements DataContentHandler
{
  ActivationDataFlavor ourDataFlavor = new ActivationDataFlavor(Message.class, "message/rfc822", "Message");

  public Object getContent(DataSource paramDataSource)
    throws IOException
  {
    try
    {
      if ((paramDataSource instanceof MessageAware));
      Session localSession;
      for (Object localObject = ((MessageAware)paramDataSource).getMessageContext().getSession(); ; localObject = localSession)
      {
        return new MimeMessage((Session)localObject, paramDataSource.getInputStream());
        localSession = Session.getDefaultInstance(new Properties(), null);
      }
    }
    catch (MessagingException localMessagingException)
    {
      throw new IOException("Exception creating MimeMessage in message/rfc822 DataContentHandler: " + localMessagingException.toString());
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
    if ((paramObject instanceof Message))
    {
      Message localMessage = (Message)paramObject;
      try
      {
        localMessage.writeTo(paramOutputStream);
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
 * Qualified Name:     com.sun.mail.handlers.message_rfc822
 * JD-Core Version:    0.6.2
 */