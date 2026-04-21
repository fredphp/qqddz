package com.sun.mail.dsn;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import javax.activation.DataHandler;
import javax.mail.MessagingException;
import javax.mail.internet.InternetHeaders;
import javax.mail.internet.MimeMessage;

public class MessageHeaders extends MimeMessage
{
  public MessageHeaders()
    throws MessagingException
  {
    super(null);
    this.content = new byte[0];
  }

  public MessageHeaders(InputStream paramInputStream)
    throws MessagingException
  {
    super(null, paramInputStream);
    this.content = new byte[0];
  }

  public MessageHeaders(InternetHeaders paramInternetHeaders)
    throws MessagingException
  {
    super(null);
    this.headers = paramInternetHeaders;
    this.content = new byte[0];
  }

  protected InputStream getContentStream()
  {
    return new ByteArrayInputStream(this.content);
  }

  public InputStream getInputStream()
  {
    return new ByteArrayInputStream(this.content);
  }

  public int getSize()
  {
    return 0;
  }

  public void setDataHandler(DataHandler paramDataHandler)
    throws MessagingException
  {
    throw new MessagingException("Can't set content for MessageHeaders");
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.dsn.MessageHeaders
 * JD-Core Version:    0.6.2
 */