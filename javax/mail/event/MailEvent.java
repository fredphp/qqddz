package javax.mail.event;

import java.util.EventObject;

public abstract class MailEvent extends EventObject
{
  private static final long serialVersionUID = 1846275636325456631L;

  public MailEvent(Object paramObject)
  {
    super(paramObject);
  }

  public abstract void dispatch(Object paramObject);
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.event.MailEvent
 * JD-Core Version:    0.6.2
 */