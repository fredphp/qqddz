package javax.mail.internet;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.UnknownServiceException;
import javax.activation.DataSource;
import javax.mail.MessageAware;
import javax.mail.MessageContext;
import javax.mail.MessagingException;

public class MimePartDataSource
  implements DataSource, MessageAware
{
  private static boolean ignoreMultipartEncoding;
  private MessageContext context;
  protected MimePart part;

  static
  {
    boolean bool = true;
    ignoreMultipartEncoding = bool;
    try
    {
      String str = System.getProperty("mail.mime.ignoremultipartencoding");
      if ((str != null) && (str.equalsIgnoreCase("false")))
        bool = false;
      ignoreMultipartEncoding = bool;
      return;
    }
    catch (SecurityException localSecurityException)
    {
    }
  }

  public MimePartDataSource(MimePart paramMimePart)
  {
    this.part = paramMimePart;
  }

  private static String restrictEncoding(String paramString, MimePart paramMimePart)
    throws MessagingException
  {
    if ((!ignoreMultipartEncoding) || (paramString == null));
    while (true)
    {
      return paramString;
      if ((!paramString.equalsIgnoreCase("7bit")) && (!paramString.equalsIgnoreCase("8bit")) && (!paramString.equalsIgnoreCase("binary")))
      {
        String str = paramMimePart.getContentType();
        if (str != null)
          try
          {
            ContentType localContentType = new ContentType(str);
            if (!localContentType.match("multipart/*"))
            {
              boolean bool = localContentType.match("message/*");
              if (!bool);
            }
            else
            {
              return null;
            }
          }
          catch (ParseException localParseException)
          {
          }
      }
    }
    return paramString;
  }

  public String getContentType()
  {
    try
    {
      String str = this.part.getContentType();
      return str;
    }
    catch (MessagingException localMessagingException)
    {
    }
    return "application/octet-stream";
  }

  public InputStream getInputStream()
    throws IOException
  {
    InputStream localInputStream;
    try
    {
      if ((this.part instanceof MimeBodyPart));
      for (localInputStream = ((MimeBodyPart)this.part).getContentStream(); ; localInputStream = ((MimeMessage)this.part).getContentStream())
      {
        String str = restrictEncoding(this.part.getEncoding(), this.part);
        if (str == null)
          break label95;
        return MimeUtility.decode(localInputStream, str);
        if (!(this.part instanceof MimeMessage))
          break;
      }
      throw new MessagingException("Unknown part");
    }
    catch (MessagingException localMessagingException)
    {
      throw new IOException(localMessagingException.getMessage());
    }
    label95: return localInputStream;
  }

  public MessageContext getMessageContext()
  {
    try
    {
      if (this.context == null)
        this.context = new MessageContext(this.part);
      MessageContext localMessageContext = this.context;
      return localMessageContext;
    }
    finally
    {
    }
  }

  public String getName()
  {
    try
    {
      if ((this.part instanceof MimeBodyPart))
      {
        String str = ((MimeBodyPart)this.part).getFileName();
        return str;
      }
    }
    catch (MessagingException localMessagingException)
    {
    }
    return "";
  }

  public OutputStream getOutputStream()
    throws IOException
  {
    throw new UnknownServiceException();
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.internet.MimePartDataSource
 * JD-Core Version:    0.6.2
 */