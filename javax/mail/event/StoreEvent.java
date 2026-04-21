package javax.mail.event;

import javax.mail.Store;

public class StoreEvent extends MailEvent
{
  public static final int ALERT = 1;
  public static final int NOTICE = 2;
  private static final long serialVersionUID = 1938704919992515330L;
  protected String message;
  protected int type;

  public StoreEvent(Store paramStore, int paramInt, String paramString)
  {
    super(paramStore);
    this.type = paramInt;
    this.message = paramString;
  }

  public void dispatch(Object paramObject)
  {
    ((StoreListener)paramObject).notification(this);
  }

  public String getMessage()
  {
    return this.message;
  }

  public int getMessageType()
  {
    return this.type;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.event.StoreEvent
 * JD-Core Version:    0.6.2
 */