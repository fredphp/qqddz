package javax.mail.event;

import java.util.EventListener;

public abstract interface MessageCountListener extends EventListener
{
  public abstract void messagesAdded(MessageCountEvent paramMessageCountEvent);

  public abstract void messagesRemoved(MessageCountEvent paramMessageCountEvent);
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.event.MessageCountListener
 * JD-Core Version:    0.6.2
 */