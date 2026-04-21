package javax.mail.search;

import javax.mail.Message;

public final class MessageNumberTerm extends IntegerComparisonTerm
{
  private static final long serialVersionUID = -5379625829658623812L;

  public MessageNumberTerm(int paramInt)
  {
    super(3, paramInt);
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof MessageNumberTerm))
      return false;
    return super.equals(paramObject);
  }

  public boolean match(Message paramMessage)
  {
    try
    {
      int i = paramMessage.getMessageNumber();
      return super.match(i);
    }
    catch (Exception localException)
    {
    }
    return false;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.search.MessageNumberTerm
 * JD-Core Version:    0.6.2
 */