package javax.mail.search;

import javax.mail.Message;

public final class SizeTerm extends IntegerComparisonTerm
{
  private static final long serialVersionUID = -2556219451005103709L;

  public SizeTerm(int paramInt1, int paramInt2)
  {
    super(paramInt1, paramInt2);
  }

  public boolean equals(Object paramObject)
  {
    if (!(paramObject instanceof SizeTerm))
      return false;
    return super.equals(paramObject);
  }

  public boolean match(Message paramMessage)
  {
    int i;
    try
    {
      i = paramMessage.getSize();
      if (i == -1)
        return false;
    }
    catch (Exception localException)
    {
      return false;
    }
    return super.match(i);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.search.SizeTerm
 * JD-Core Version:    0.6.2
 */