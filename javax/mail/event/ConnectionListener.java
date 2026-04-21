package javax.mail.event;

import java.util.EventListener;

public abstract interface ConnectionListener extends EventListener
{
  public abstract void closed(ConnectionEvent paramConnectionEvent);

  public abstract void disconnected(ConnectionEvent paramConnectionEvent);

  public abstract void opened(ConnectionEvent paramConnectionEvent);
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.event.ConnectionListener
 * JD-Core Version:    0.6.2
 */