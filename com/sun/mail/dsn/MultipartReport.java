package com.sun.mail.dsn;

import java.io.IOException;
import java.util.Vector;
import javax.activation.DataSource;
import javax.mail.BodyPart;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.internet.ContentType;
import javax.mail.internet.InternetHeaders;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;

public class MultipartReport extends MimeMultipart
{
  protected boolean constructed;

  public MultipartReport()
    throws MessagingException
  {
    super("report");
    setBodyPart(new MimeBodyPart(), 0);
    setBodyPart(new MimeBodyPart(), 1);
    this.constructed = true;
  }

  public MultipartReport(String paramString, DeliveryStatus paramDeliveryStatus)
    throws MessagingException
  {
    super("report");
    ContentType localContentType = new ContentType(this.contentType);
    localContentType.setParameter("report-type", "delivery-status");
    this.contentType = localContentType.toString();
    MimeBodyPart localMimeBodyPart1 = new MimeBodyPart();
    localMimeBodyPart1.setText(paramString);
    setBodyPart(localMimeBodyPart1, 0);
    MimeBodyPart localMimeBodyPart2 = new MimeBodyPart();
    localMimeBodyPart2.setContent(paramDeliveryStatus, "message/delivery-status");
    setBodyPart(localMimeBodyPart2, 1);
    this.constructed = true;
  }

  public MultipartReport(String paramString, DeliveryStatus paramDeliveryStatus, InternetHeaders paramInternetHeaders)
    throws MessagingException
  {
    this(paramString, paramDeliveryStatus);
    if (paramInternetHeaders != null)
    {
      MimeBodyPart localMimeBodyPart = new MimeBodyPart();
      localMimeBodyPart.setContent(new MessageHeaders(paramInternetHeaders), "text/rfc822-headers");
      setBodyPart(localMimeBodyPart, 2);
    }
  }

  public MultipartReport(String paramString, DeliveryStatus paramDeliveryStatus, MimeMessage paramMimeMessage)
    throws MessagingException
  {
    this(paramString, paramDeliveryStatus);
    if (paramMimeMessage != null)
    {
      MimeBodyPart localMimeBodyPart = new MimeBodyPart();
      localMimeBodyPart.setContent(paramMimeMessage, "message/rfc822");
      setBodyPart(localMimeBodyPart, 2);
    }
  }

  public MultipartReport(DataSource paramDataSource)
    throws MessagingException
  {
    super(paramDataSource);
    parse();
    this.constructed = true;
  }

  private void setBodyPart(BodyPart paramBodyPart, int paramInt)
    throws MessagingException
  {
    try
    {
      if (this.parts == null)
        this.parts = new Vector();
      if (paramInt < this.parts.size())
        super.removeBodyPart(paramInt);
      super.addBodyPart(paramBodyPart, paramInt);
      return;
    }
    finally
    {
    }
  }

  public void addBodyPart(BodyPart paramBodyPart)
    throws MessagingException
  {
    try
    {
      if (!this.constructed)
      {
        super.addBodyPart(paramBodyPart);
        return;
      }
      throw new MessagingException("Can't add body parts to multipart/report 1");
    }
    finally
    {
    }
  }

  public void addBodyPart(BodyPart paramBodyPart, int paramInt)
    throws MessagingException
  {
    try
    {
      throw new MessagingException("Can't add body parts to multipart/report 2");
    }
    finally
    {
    }
  }

  public DeliveryStatus getDeliveryStatus()
    throws MessagingException
  {
    try
    {
      int i = getCount();
      DeliveryStatus localDeliveryStatus = null;
      if (i < 2);
      while (true)
      {
        return localDeliveryStatus;
        BodyPart localBodyPart = getBodyPart(1);
        boolean bool = localBodyPart.isMimeType("message/delivery-status");
        localDeliveryStatus = null;
        if (!bool)
          continue;
        try
        {
          localDeliveryStatus = (DeliveryStatus)localBodyPart.getContent();
        }
        catch (IOException localIOException)
        {
          throw new MessagingException("IOException getting DeliveryStatus", localIOException);
        }
      }
    }
    finally
    {
    }
  }

  public MimeMessage getReturnedMessage()
    throws MessagingException
  {
    try
    {
      int i = getCount();
      MimeMessage localMimeMessage = null;
      if (i < 3);
      while (true)
      {
        return localMimeMessage;
        BodyPart localBodyPart = getBodyPart(2);
        if (!localBodyPart.isMimeType("message/rfc822"))
        {
          boolean bool = localBodyPart.isMimeType("text/rfc822-headers");
          localMimeMessage = null;
          if (!bool)
            continue;
        }
        try
        {
          localMimeMessage = (MimeMessage)localBodyPart.getContent();
        }
        catch (IOException localIOException)
        {
          throw new MessagingException("IOException getting ReturnedMessage", localIOException);
        }
      }
    }
    finally
    {
    }
  }

  public String getText()
    throws MessagingException
  {
    while (true)
    {
      try
      {
        BodyPart localBodyPart1 = getBodyPart(0);
        String str;
        if (localBodyPart1.isMimeType("text/plain"))
        {
          str = (String)localBodyPart1.getContent();
          return str;
        }
        if (localBodyPart1.isMimeType("multipart/alternative"))
        {
          Multipart localMultipart = (Multipart)localBodyPart1.getContent();
          int i = 0;
          if (i < localMultipart.getCount())
          {
            BodyPart localBodyPart2 = localMultipart.getBodyPart(i);
            if (localBodyPart2.isMimeType("text/plain"))
            {
              str = (String)localBodyPart2.getContent();
              continue;
            }
            i++;
            continue;
          }
        }
      }
      catch (IOException localIOException)
      {
        throw new MessagingException("Exception getting text content", localIOException);
      }
      finally
      {
      }
      str = null;
    }
  }

  public MimeBodyPart getTextBodyPart()
    throws MessagingException
  {
    try
    {
      MimeBodyPart localMimeBodyPart = (MimeBodyPart)getBodyPart(0);
      return localMimeBodyPart;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void removeBodyPart(int paramInt)
    throws MessagingException
  {
    throw new MessagingException("Can't remove body parts from multipart/report");
  }

  public boolean removeBodyPart(BodyPart paramBodyPart)
    throws MessagingException
  {
    throw new MessagingException("Can't remove body parts from multipart/report");
  }

  public void setDeliveryStatus(DeliveryStatus paramDeliveryStatus)
    throws MessagingException
  {
    try
    {
      MimeBodyPart localMimeBodyPart = new MimeBodyPart();
      localMimeBodyPart.setContent(paramDeliveryStatus, "message/delivery-status");
      setBodyPart(localMimeBodyPart, 2);
      ContentType localContentType = new ContentType(this.contentType);
      localContentType.setParameter("report-type", "delivery-status");
      this.contentType = localContentType.toString();
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void setReturnedMessage(MimeMessage paramMimeMessage)
    throws MessagingException
  {
    if (paramMimeMessage == null);
    while (true)
    {
      MimeBodyPart localMimeBodyPart;
      try
      {
        ((BodyPart)this.parts.elementAt(2));
        super.removeBodyPart(2);
        return;
        localMimeBodyPart = new MimeBodyPart();
        if ((paramMimeMessage instanceof MessageHeaders))
        {
          localMimeBodyPart.setContent(paramMimeMessage, "text/rfc822-headers");
          setBodyPart(localMimeBodyPart, 2);
          continue;
        }
      }
      finally
      {
      }
      localMimeBodyPart.setContent(paramMimeMessage, "message/rfc822");
    }
  }

  public void setSubType(String paramString)
    throws MessagingException
  {
    try
    {
      throw new MessagingException("Can't change subtype of MultipartReport");
    }
    finally
    {
    }
  }

  public void setText(String paramString)
    throws MessagingException
  {
    try
    {
      MimeBodyPart localMimeBodyPart = new MimeBodyPart();
      localMimeBodyPart.setText(paramString);
      setBodyPart(localMimeBodyPart, 0);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void setTextBodyPart(MimeBodyPart paramMimeBodyPart)
    throws MessagingException
  {
    try
    {
      setBodyPart(paramMimeBodyPart, 0);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.dsn.MultipartReport
 * JD-Core Version:    0.6.2
 */