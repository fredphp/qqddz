package javax.mail.event;

import javax.mail.Message;

public class MessageChangedEvent extends MailEvent
{
  public static final int ENVELOPE_CHANGED = 2;
  public static final int FLAGS_CHANGED = 1;
  private static final long serialVersionUID = -4974972972105535108L;
  protected transient Message msg;
  protected int type;

  public MessageChangedEvent(Object paramObject, int paramInt, Message paramMessage)
  {
    super(paramObject);
    this.msg = paramMessage;
    this.type = paramInt;
  }

  public void dispatch(Object paramObject)
  {
    ((MessageChangedListener)paramObject).messageChanged(this);
  }

  public Message getMessage()
  {
    return this.msg;
  }

  public int getMessageChangeType()
  {
    return this.type;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.event.MessageChangedEvent
 * JD-Core Version:    0.6.2
 */