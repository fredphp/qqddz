package javax.mail.event;

import javax.mail.Folder;
import javax.mail.Message;

public class MessageCountEvent extends MailEvent
{
  public static final int ADDED = 1;
  public static final int REMOVED = 2;
  private static final long serialVersionUID = -7447022340837897369L;
  protected transient Message[] msgs;
  protected boolean removed;
  protected int type;

  public MessageCountEvent(Folder paramFolder, int paramInt, boolean paramBoolean, Message[] paramArrayOfMessage)
  {
    super(paramFolder);
    this.type = paramInt;
    this.removed = paramBoolean;
    this.msgs = paramArrayOfMessage;
  }

  public void dispatch(Object paramObject)
  {
    if (this.type == 1)
    {
      ((MessageCountListener)paramObject).messagesAdded(this);
      return;
    }
    ((MessageCountListener)paramObject).messagesRemoved(this);
  }

  public Message[] getMessages()
  {
    return this.msgs;
  }

  public int getType()
  {
    return this.type;
  }

  public boolean isRemoved()
  {
    return this.removed;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.event.MessageCountEvent
 * JD-Core Version:    0.6.2
 */