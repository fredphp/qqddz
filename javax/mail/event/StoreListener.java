package javax.mail.event;

import java.util.EventListener;

public abstract interface StoreListener extends EventListener
{
  public abstract void notification(StoreEvent paramStoreEvent);
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.event.StoreListener
 * JD-Core Version:    0.6.2
 */