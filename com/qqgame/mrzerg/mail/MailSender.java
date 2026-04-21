package com.qqgame.mrzerg.mail;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.Security;
import java.util.Properties;
import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.mail.Authenticator;
import javax.mail.Message.RecipientType;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

public class MailSender extends Authenticator
{
  private String mailhost = "smtp.qq.com";
  private String password = "doudizhu123";
  private Session session;
  private String user = "huanlegame@qq.com";

  static
  {
    Security.addProvider(new JSSEProvider());
  }

  public MailSender()
  {
    Properties localProperties = new Properties();
    localProperties.setProperty("mail.transport.protocol", "smtp");
    localProperties.setProperty("mail.host", this.mailhost);
    localProperties.put("mail.smtp.auth", "true");
    localProperties.put("mail.smtp.port", "465");
    localProperties.put("mail.smtp.socketFactory.port", "465");
    localProperties.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
    localProperties.put("mail.smtp.socketFactory.fallback", "false");
    localProperties.setProperty("mail.smtp.quitwait", "false");
    this.session = Session.getDefaultInstance(localProperties, this);
  }

  protected PasswordAuthentication getPasswordAuthentication()
  {
    return new PasswordAuthentication(this.user, this.password);
  }

  public void sendMail(String paramString1, String paramString2, String paramString3, String paramString4)
    throws Exception
  {
    try
    {
      MimeMessage localMimeMessage = new MimeMessage(this.session);
      DataHandler localDataHandler = new DataHandler(new ByteArrayDataSource(paramString2.getBytes(), "text/plain"));
      localMimeMessage.setSender(new InternetAddress(paramString3));
      localMimeMessage.setSubject(paramString1);
      localMimeMessage.setDataHandler(localDataHandler);
      if (paramString4.indexOf(',') > 0)
        localMimeMessage.setRecipients(Message.RecipientType.TO, InternetAddress.parse(paramString4));
      while (true)
      {
        Transport.send(localMimeMessage);
        return;
        localMimeMessage.setRecipient(Message.RecipientType.TO, new InternetAddress(paramString4));
      }
    }
    finally
    {
    }
  }

  public class ByteArrayDataSource
    implements DataSource
  {
    private byte[] data;
    private String type;

    public ByteArrayDataSource(byte[] arg2)
    {
      Object localObject;
      this.data = localObject;
    }

    public ByteArrayDataSource(byte[] paramString, String arg3)
    {
      this.data = paramString;
      Object localObject;
      this.type = localObject;
    }

    public String getContentType()
    {
      if (this.type == null)
        return "application/octet-stream";
      return this.type;
    }

    public InputStream getInputStream()
      throws IOException
    {
      return new ByteArrayInputStream(this.data);
    }

    public String getName()
    {
      return "ByteArrayDataSource";
    }

    public OutputStream getOutputStream()
      throws IOException
    {
      throw new IOException("Not Supported");
    }

    public void setType(String paramString)
    {
      this.type = paramString;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.qqgame.mrzerg.mail.MailSender
 * JD-Core Version:    0.6.2
 */