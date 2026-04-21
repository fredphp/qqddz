package com.sun.mail.pop3;

import javax.mail.Flags;
import javax.mail.Folder;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.MethodNotSupportedException;
import javax.mail.Store;

public class DefaultFolder extends Folder
{
  DefaultFolder(POP3Store paramPOP3Store)
  {
    super(paramPOP3Store);
  }

  public void appendMessages(Message[] paramArrayOfMessage)
    throws MessagingException
  {
    throw new MethodNotSupportedException("Append not supported");
  }

  public void close(boolean paramBoolean)
    throws MessagingException
  {
    throw new MethodNotSupportedException("close");
  }

  public boolean create(int paramInt)
    throws MessagingException
  {
    return false;
  }

  public boolean delete(boolean paramBoolean)
    throws MessagingException
  {
    throw new MethodNotSupportedException("delete");
  }

  public boolean exists()
  {
    return true;
  }

  public Message[] expunge()
    throws MessagingException
  {
    throw new MethodNotSupportedException("expunge");
  }

  public Folder getFolder(String paramString)
    throws MessagingException
  {
    if (!paramString.equalsIgnoreCase("INBOX"))
      throw new MessagingException("only INBOX supported");
    return getInbox();
  }

  public String getFullName()
  {
    return "";
  }

  protected Folder getInbox()
    throws MessagingException
  {
    return getStore().getFolder("INBOX");
  }

  public Message getMessage(int paramInt)
    throws MessagingException
  {
    throw new MethodNotSupportedException("getMessage");
  }

  public int getMessageCount()
    throws MessagingException
  {
    return 0;
  }

  public String getName()
  {
    return "";
  }

  public Folder getParent()
  {
    return null;
  }

  public Flags getPermanentFlags()
  {
    return new Flags();
  }

  public char getSeparator()
  {
    return '/';
  }

  public int getType()
  {
    return 2;
  }

  public boolean hasNewMessages()
    throws MessagingException
  {
    return false;
  }

  public boolean isOpen()
  {
    return false;
  }

  public Folder[] list(String paramString)
    throws MessagingException
  {
    Folder[] arrayOfFolder = new Folder[1];
    arrayOfFolder[0] = getInbox();
    return arrayOfFolder;
  }

  public void open(int paramInt)
    throws MessagingException
  {
    throw new MethodNotSupportedException("open");
  }

  public boolean renameTo(Folder paramFolder)
    throws MessagingException
  {
    throw new MethodNotSupportedException("renameTo");
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.pop3.DefaultFolder
 * JD-Core Version:    0.6.2
 */