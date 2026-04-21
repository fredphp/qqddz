package javax.mail;

public class MessageContext
{
  private Part part;

  public MessageContext(Part paramPart)
  {
    this.part = paramPart;
  }

  private static Message getMessage(Part paramPart)
    throws MessagingException
  {
    while (true)
    {
      if (paramPart == null)
        return null;
      if ((paramPart instanceof Message))
        return (Message)paramPart;
      Multipart localMultipart = ((BodyPart)paramPart).getParent();
      if (localMultipart == null)
        return null;
      paramPart = localMultipart.getParent();
    }
  }

  public Message getMessage()
  {
    try
    {
      Message localMessage = getMessage(this.part);
      return localMessage;
    }
    catch (MessagingException localMessagingException)
    {
    }
    return null;
  }

  public Part getPart()
  {
    return this.part;
  }

  public Session getSession()
  {
    Message localMessage = getMessage();
    if (localMessage != null)
      return localMessage.session;
    return null;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.MessageContext
 * JD-Core Version:    0.6.2
 */