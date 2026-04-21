package javax.mail.event;

public class ConnectionEvent extends MailEvent
{
  public static final int CLOSED = 3;
  public static final int DISCONNECTED = 2;
  public static final int OPENED = 1;
  private static final long serialVersionUID = -1855480171284792957L;
  protected int type;

  public ConnectionEvent(Object paramObject, int paramInt)
  {
    super(paramObject);
    this.type = paramInt;
  }

  public void dispatch(Object paramObject)
  {
    if (this.type == 1)
      ((ConnectionListener)paramObject).opened(this);
    do
    {
      return;
      if (this.type == 2)
      {
        ((ConnectionListener)paramObject).disconnected(this);
        return;
      }
    }
    while (this.type != 3);
    ((ConnectionListener)paramObject).closed(this);
  }

  public int getType()
  {
    return this.type;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.event.ConnectionEvent
 * JD-Core Version:    0.6.2
 */