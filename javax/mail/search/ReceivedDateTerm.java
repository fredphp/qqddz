package javax.mail.search;

import java.util.Date;
import javax.mail.Message;

public final class ReceivedDateTerm extends DateTerm
{
  private static final long serialVersionUID = -2756695246195503170L;

  public ReceivedDateTerm(int paramInt, Date paramDate)
  {
    super(paramInt, paramDate);
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof ReceivedDateTerm))
      return false;
    return super.equals(paramObject);
  }

  public boolean match(Message paramMessage)
  {
    Date localDate;
    try
    {
      localDate = paramMessage.getReceivedDate();
      if (localDate == null)
        return false;
    }
    catch (Exception localException)
    {
      return false;
    }
    return super.match(localDate);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.search.ReceivedDateTerm
 * JD-Core Version:    0.6.2
 */