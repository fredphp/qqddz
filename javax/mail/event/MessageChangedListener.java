package javax.mail.event;

import java.util.EventListener;

public abstract interface MessageChangedListener extends EventListener
{
  public abstract void messageChanged(MessageChangedEvent paramMessageChangedEvent);
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.event.MessageChangedListener
 * JD-Core Version:    0.6.2
 */