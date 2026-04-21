package javax.mail.search;

import java.util.Date;
import javax.mail.Message;

public final class SentDateTerm extends DateTerm
{
  private static final long serialVersionUID = 5647755030530907263L;

  public SentDateTerm(int paramInt, Date paramDate)
  {
    super(paramInt, paramDate);
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof SentDateTerm))
      return false;
    return super.equals(paramObject);
  }

  public boolean match(Message paramMessage)
  {
    Date localDate;
    try
    {
      localDate = paramMessage.getSentDate();
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
 * Qualified Name:     javax.mail.search.SentDateTerm
 * JD-Core Version:    0.6.2
 */