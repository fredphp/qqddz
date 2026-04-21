package javax.mail.event;

import java.util.EventListener;

public abstract interface TransportListener extends EventListener
{
  public abstract void messageDelivered(TransportEvent paramTransportEvent);

  public abstract void messageNotDelivered(TransportEvent paramTransportEvent);

  public abstract void messagePartiallyDelivered(TransportEvent paramTransportEvent);
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.event.TransportListener
 * JD-Core Version:    0.6.2
 */